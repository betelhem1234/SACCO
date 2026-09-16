package com.example.ngrxcrud.api.controller;

import com.example.ngrxcrud.api.model.Setting;
import com.example.ngrxcrud.api.repository.SettingRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/settings")
@CrossOrigin(origins = "*")
public class SettingController {

    @Autowired
    private SettingRepository settingRepository;

    @GetMapping
    public Map<String, String> getAllSettings() {
        return settingRepository.findAll().stream()
                .collect(Collectors.toMap(Setting::getKey, Setting::getValue));
    }

    @PutMapping
    public Map<String, String> updateSettings(@RequestBody Map<String, String> settings) {
        validateAndFixTransferFeeSettings(settings);
        for (Map.Entry<String, String> entry : settings.entrySet()) {
            Setting existing = settingRepository.findByKey(entry.getKey()).orElse(null);
            Setting s = existing != null ? existing : new Setting();
            s.setKey(entry.getKey());
            s.setValue(entry.getValue());
            s.setUpdatedAt(System.currentTimeMillis());
            settingRepository.save(s);
        }
        return getAllSettings();
    }

    /**
     * A company charges either a flat service fee or a percentage, not both.
     * Rejects conflicting/negative fees and clears the fee settings entirely
     * when the service fee is switched off. Also requires a revenue account
     * whenever a fee is due.
     */
    private void validateAndFixTransferFeeSettings(Map<String, String> s) {
        boolean includesFeeKeys = s.containsKey("transfer_requires_service_fee")
                || s.containsKey("transfer_service_fee_flat")
                || s.containsKey("transfer_service_fee_percentage")
                || s.containsKey("transfer_service_fee_account_id");
        if (!includesFeeKeys) return;

        boolean feeOn = s.containsKey("transfer_requires_service_fee")
                ? Boolean.parseBoolean(s.get("transfer_requires_service_fee").trim())
                : Boolean.parseBoolean(settingRepository.findByKey("transfer_requires_service_fee")
                        .map(Setting::getValue).orElse("false").trim());
        if (!feeOn) {
            s.put("transfer_service_fee_flat", "0");
            s.put("transfer_service_fee_percentage", "0");
            s.put("transfer_service_fee_account_id", "");
            return;
        }

        double flat = parse(s.getOrDefault("transfer_service_fee_flat", "0"));
        double pct = parse(s.getOrDefault("transfer_service_fee_percentage", "0"));
        String account = s.getOrDefault("transfer_service_fee_account_id", "");
        if (flat < 0 || pct < 0) {
            throw badRequest("Service fee values cannot be negative");
        }
        if (flat > 0 && pct > 0) {
            throw badRequest("Choose either a flat service fee or a percentage, not both");
        }
        if (flat <= 0 && pct <= 0) {
            throw badRequest("Set a flat service fee or a percentage when service fees are required");
        }
        if (account == null || account.isBlank()) {
            throw badRequest("Select the revenue account credited for transfer service fees");
        }
    }

    private double parse(String v) {
        if (v == null || v.isBlank()) return 0;
        try {
            return Double.parseDouble(v.trim());
        } catch (NumberFormatException e) {
            return 0;
        }
    }

    private ResponseStatusException badRequest(String message) {
        return new ResponseStatusException(HttpStatus.BAD_REQUEST, message);
    }
}
