package com.example.ngrxcrud.api.controller;

import com.example.ngrxcrud.api.model.Saving;
import com.example.ngrxcrud.api.repository.SavingRepository;
import com.example.ngrxcrud.api.service.SavingService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.core.Authentication;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/savings")
@CrossOrigin(origins = "*")
public class SavingController {

    @Autowired
    private SavingRepository savingRepository;
    @Autowired
    private SavingService savingService;

    @GetMapping
    public List<Saving> getAllSavings() {
        return savingRepository.findAll();
    }

    @PostMapping
    public Saving addSaving(@RequestBody Saving saving) {
        return savingService.createSaving(saving);
    }

    /**
     * Approve a PENDING saving and post it to the ledger.
     * Body (optional): { "approvedBy": "<uuid>" }
     */
    @PostMapping("/{id}/approve")
    public Saving approveSaving(@PathVariable UUID id, @RequestBody(required = false) Map<String, String> body) {
        UUID approvedBy = body != null && body.containsKey("approvedBy")
                ? UUID.fromString(body.get("approvedBy"))
                : currentUserId();
        return savingService.approveSaving(id, approvedBy);
    }

    /**
     * Reject a PENDING saving. PENDING → REJECTED, no ledger posting.
     */
    @PostMapping("/{id}/reject")
    public Saving rejectSaving(@PathVariable UUID id) {
        return savingService.rejectSaving(id);
    }

    @PutMapping("/{id}")
    public Saving updateSaving(@PathVariable UUID id, @RequestBody Saving incoming) {
        return savingService.updateSaving(id, incoming);
    }

    @DeleteMapping("/{id}")
    public void deleteSaving(@PathVariable UUID id) {
        savingService.deleteSaving(id);
    }

    /**
     * Returns the per-month mandatory saving tracker for a member.
     * Each row: { yearMonth, label, requiredAmount, paidAmount, remaining, status }.
     */
    @GetMapping("/{id}/tracker")
    public List<Map<String, Object>> getTracker(@PathVariable UUID id) {
        return savingService.getTracker(id);
    }

    private UUID currentUserId() {
        Authentication auth = org.springframework.security.core.context.SecurityContextHolder
                .getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof com.example.ngrxcrud.api.security.UserDetailsImpl user) {
            return user.getId();
        }
        return null;
    }
}
