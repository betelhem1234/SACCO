package com.example.ngrxcrud.api.controller;

import com.example.ngrxcrud.api.model.LoanType;
import com.example.ngrxcrud.api.repository.LoanTypeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/loan-types")
@CrossOrigin(origins = "http://localhost:4200")
public class LoanTypeController {

    @Autowired
    private LoanTypeRepository loanTypeRepository;

    @GetMapping
    public List<LoanType> getAllLoanTypes() {
        return loanTypeRepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<LoanType> getLoanTypeById(@PathVariable(value = "id") UUID loanTypeId) {
        LoanType loanType = loanTypeRepository.findById(loanTypeId)
                .orElse(null);
        if (loanType == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok().body(loanType);
    }

    @PostMapping
    public LoanType createLoanType(@RequestBody LoanType loanType) {
        if (loanType.getCreatedAt() == null) {
            loanType.setCreatedAt(Instant.now().toEpochMilli());
        }
        return loanTypeRepository.save(loanType);
    }

    @PutMapping("/{id}")
    public ResponseEntity<LoanType> updateLoanType(@PathVariable(value = "id") UUID loanTypeId,
            @RequestBody LoanType loanTypeDetails) {
        LoanType loanType = loanTypeRepository.findById(loanTypeId)
                .orElse(null);
        if (loanType == null) {
            return ResponseEntity.notFound().build();
        }

        loanType.setName(loanTypeDetails.getName());
        loanType.setRequiredMonths(loanTypeDetails.getRequiredMonths());
        loanType.setRequiredSavingPercentage(loanTypeDetails.getRequiredSavingPercentage());
        loanType.setRequiredSharePercentage(loanTypeDetails.getRequiredSharePercentage());
        loanType.setMaleInterestAmount(loanTypeDetails.getMaleInterestAmount());
        loanType.setFemaleInterestAmount(loanTypeDetails.getFemaleInterestAmount());
        loanType.setRequiredMaximumAmount(loanTypeDetails.getRequiredMaximumAmount());
        loanType.setMaximumRepaymentMonths(loanTypeDetails.getMaximumRepaymentMonths());
        loanType.setRequiredShareUnitCount(loanTypeDetails.getRequiredShareUnitCount());
        loanType.setInterestCollectiveAccount(loanTypeDetails.getInterestCollectiveAccount());
        loanType.setLateInterestCollectiveAccount(loanTypeDetails.getLateInterestCollectiveAccount());
        loanType.setLateInterestPayableAccount(loanTypeDetails.getLateInterestPayableAccount());
        loanType.setLongTermPrincipalAccount(loanTypeDetails.getLongTermPrincipalAccount());
        loanType.setShortTermPrincipalAccount(loanTypeDetails.getShortTermPrincipalAccount());
        loanType.setPenaltyCollectiveAccount(loanTypeDetails.getPenaltyCollectiveAccount());
        loanType.setTransferFeeCollectiveAccount(loanTypeDetails.getTransferFeeCollectiveAccount());
        loanType.setServiceFeeCollectiveAccount(loanTypeDetails.getServiceFeeCollectiveAccount());
        loanType.setInsuranceFeeCollectiveAccount(loanTypeDetails.getInsuranceFeeCollectiveAccount());
        loanType.setDescription(loanTypeDetails.getDescription());
        loanType.setLoanCode(loanTypeDetails.getLoanCode());
        loanType.setLoanTerm(loanTypeDetails.getLoanTerm());

        final LoanType updatedLoanType = loanTypeRepository.save(loanType);
        return ResponseEntity.ok(updatedLoanType);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteLoanType(@PathVariable(value = "id") UUID loanTypeId) {
        LoanType loanType = loanTypeRepository.findById(loanTypeId)
                .orElse(null);
        if (loanType == null) {
            return ResponseEntity.notFound().build();
        }

        loanTypeRepository.delete(loanType);
        return ResponseEntity.noContent().build();
    }
}
