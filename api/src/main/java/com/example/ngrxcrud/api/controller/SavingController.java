package com.example.ngrxcrud.api.controller;

import com.example.ngrxcrud.api.model.Saving;
import com.example.ngrxcrud.api.repository.SavingRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/savings")
@CrossOrigin(origins = "*")
public class SavingController {

    @Autowired
    private SavingRepository savingRepository;

    @GetMapping
    public List<Saving> getAllSavings() {
        return savingRepository.findAll();
    }

    @PostMapping
    public Saving addSaving(@RequestBody Saving saving) {
        return savingRepository.save(saving);
    }

    @DeleteMapping("/{id}")
    public void deleteSaving(@PathVariable java.util.UUID id) {
        savingRepository.deleteById(id);
    }
}
