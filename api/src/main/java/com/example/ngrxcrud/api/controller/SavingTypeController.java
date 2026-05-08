package com.example.ngrxcrud.api.controller;

import com.example.ngrxcrud.api.model.SavingType;
import com.example.ngrxcrud.api.repository.SavingRepository;
import com.example.ngrxcrud.api.repository.SavingTypeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/saving-types")
@CrossOrigin(origins = "*")
public class SavingTypeController {

    @Autowired
    private SavingTypeRepository savingTypeRepository;

    @Autowired
    private SavingRepository savingRepository;

    @GetMapping
    public List<SavingType> getAllSavingTypes() {
        return savingTypeRepository.findAll();
    }

    @PostMapping
    public SavingType addSavingType(@RequestBody SavingType savingType) {
        return savingTypeRepository.save(savingType);
    }

    @PutMapping("/{id}")
    public SavingType updateSavingType(@PathVariable UUID id, @RequestBody SavingType savingType) {
        savingType.setId(id);
        return savingTypeRepository.save(savingType);
    }

    @DeleteMapping("/{id}")
    public void deleteSavingType(@PathVariable UUID id) {
        if (savingRepository.existsBySavingType(id)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Cannot delete this saving type: one or more savings records still use it.");
        }
        savingTypeRepository.deleteById(id);
    }
}
