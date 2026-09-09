package com.example.ngrxcrud.api.controller;

import com.example.ngrxcrud.api.model.Setting;
import com.example.ngrxcrud.api.repository.SettingRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

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
}
