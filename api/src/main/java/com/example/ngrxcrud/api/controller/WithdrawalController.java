package com.example.ngrxcrud.api.controller;

import com.example.ngrxcrud.api.model.Withdrawal;
import com.example.ngrxcrud.api.repository.WithdrawalRepository;
import com.example.ngrxcrud.api.service.WithdrawalService;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/withdrawals")
@CrossOrigin(origins = "*")
public class WithdrawalController {

    @Autowired
    private WithdrawalRepository withdrawalRepository;
    @Autowired
    private WithdrawalService withdrawalService;

    @GetMapping
    public List<Withdrawal> getAllWithdrawals() {
        return withdrawalRepository.findAll();
    }

    @PostMapping
    @Transactional
    public Withdrawal addWithdrawal(@RequestBody Withdrawal withdrawal) {
        return withdrawalService.createWithdrawal(withdrawal);
    }

    @PostMapping("/{id}/approve")
    @Transactional
    public Withdrawal approveWithdrawal(@PathVariable UUID id,
                                       @RequestBody(required = false) Withdrawal req) {
        UUID approvedBy = req != null ? req.getApprovedBy() : null;
        return withdrawalService.approveWithdrawal(id, approvedBy);
    }

    @PostMapping("/{id}/reject")
    @Transactional
    public Withdrawal rejectWithdrawal(@PathVariable UUID id) {
        return withdrawalService.rejectWithdrawal(id);
    }

    @PutMapping("/{id}")
    @Transactional
    public Withdrawal updateWithdrawal(@PathVariable UUID id, @RequestBody Withdrawal withdrawal) {
        return withdrawalService.updateWithdrawal(id, withdrawal);
    }

    @DeleteMapping("/{id}")
    @Transactional
    public void deleteWithdrawal(@PathVariable UUID id) {
        withdrawalService.deleteWithdrawal(id);
    }
}
