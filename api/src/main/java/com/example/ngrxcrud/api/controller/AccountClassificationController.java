package com.example.ngrxcrud.api.controller;

import com.example.ngrxcrud.api.model.AccountType;
import com.example.ngrxcrud.api.model.AccountClassification;
import com.example.ngrxcrud.api.repository.AccountClassificationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/account-classifications")
@CrossOrigin(origins = "*")
public class AccountClassificationController {

    @Autowired
    private AccountClassificationRepository repository;

    @GetMapping
    public List<AccountClassification> list(
            @RequestParam(required = false) Integer accountType) {
        if (accountType != null) {
            return repository.findByAccountType(AccountType.fromCode(accountType));
        }
        return repository.findAll();
    }

    @PostMapping
    public AccountClassification add(@RequestBody AccountClassification lookup) {
        return repository.save(lookup);
    }

    @PutMapping("/{id}")
    public AccountClassification update(@PathVariable UUID id, @RequestBody AccountClassification incoming) {
        AccountClassification existing = repository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Account classification not found"));
        existing.setName(incoming.getName());
        existing.setDescription(incoming.getDescription());
        existing.setAccountType(incoming.getAccountType());
        return repository.save(existing);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable UUID id) {
        repository.deleteById(id);
    }
}
