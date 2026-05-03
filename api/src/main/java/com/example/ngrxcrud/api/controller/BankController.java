package com.example.ngrxcrud.api.controller;

import com.example.ngrxcrud.api.model.Bank;
import com.example.ngrxcrud.api.repository.BankRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/banks")
@CrossOrigin(origins = "*")
public class BankController {

    @Autowired
    private BankRepository bankRepository;

    @GetMapping
    public List<Bank> getAllBanks() {
        return bankRepository.findAll();
    }

    @PostMapping
    public Bank addBank(@RequestBody Bank bank) {
        return bankRepository.save(bank);
    }

    @PutMapping("/{id}")
    public Bank updateBank(@PathVariable UUID id, @RequestBody Bank bank) {
        bank.setId(id);
        return bankRepository.save(bank);
    }

    @DeleteMapping("/{id}")
    public void deleteBank(@PathVariable UUID id) {
        bankRepository.deleteById(id);
    }
}
