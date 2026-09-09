package com.example.ngrxcrud.api.controller;

import com.example.ngrxcrud.api.model.Account;
import com.example.ngrxcrud.api.model.AccountCategory;
import com.example.ngrxcrud.api.model.AccountType;
import com.example.ngrxcrud.api.repository.AccountRepository;
import com.example.ngrxcrud.api.repository.SavingRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/accounts")
@CrossOrigin(origins = "*")
public class AccountController {

    @Autowired
    private AccountRepository accountRepository;

    @Autowired
    private SavingRepository savingRepository;

    @GetMapping
    public List<Account> list(
            @RequestParam(required = false) Integer accountType,
            @RequestParam(required = false) Integer accountCategory) {
        try {
            if (accountType != null && accountCategory != null) {
                return accountRepository.findByAccountTypeAndAccountCategory(
                        AccountType.fromCode(accountType),
                        AccountCategory.fromCode(accountCategory));
            }
            if (accountType != null) {
                return accountRepository.findByAccountType(AccountType.fromCode(accountType));
            }
            if (accountCategory != null) {
                return accountRepository.findByAccountCategory(AccountCategory.fromCode(accountCategory));
            }
            return accountRepository.findAll();
        } catch (IllegalArgumentException ex) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, ex.getMessage());
        }
    }

    @PostMapping
    public Account add(@RequestBody Account account) {
        return accountRepository.save(account);
    }

    @PutMapping("/{id}")
    public Account update(@PathVariable UUID id, @RequestBody Account incoming) {
        Account existing = accountRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Account not found"));
        existing.setName(incoming.getName());
        existing.setDescription(incoming.getDescription());
        existing.setAccountNumber(incoming.getAccountNumber());
        existing.setAccountType(incoming.getAccountType());
        existing.setDate(incoming.getDate());
        existing.setIsActive(incoming.getIsActive());
        existing.setIsParent(incoming.getIsParent());
        existing.setAccountCategory(incoming.getAccountCategory());
        existing.setClassificationId(incoming.getClassificationId());
        return accountRepository.save(existing);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable UUID id) {
        if (savingRepository.existsByAccountId(id)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Cannot delete this account: one or more savings records still reference it.");
        }
        accountRepository.deleteById(id);
    }
}
