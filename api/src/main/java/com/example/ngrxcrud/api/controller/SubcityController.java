package com.example.ngrxcrud.api.controller;

import com.example.ngrxcrud.api.model.Subcity;
import com.example.ngrxcrud.api.repository.SubcityRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/subcities")
@CrossOrigin(origins = "*")
public class SubcityController {

    @Autowired
    private SubcityRepository subcityRepository;

    @GetMapping
    public List<Subcity> getAllSubcities() {
        return subcityRepository.findAll();
    }

    @GetMapping("/region/{stateId}")
    public List<Subcity> getSubcitiesByRegion(@PathVariable UUID stateId) {
        return subcityRepository.findByStateId(stateId);
    }

    @PostMapping
    public Subcity addSubcity(@RequestBody Subcity subcity) {
        return subcityRepository.save(subcity);
    }

    @PutMapping("/{id}")
    public Subcity updateSubcity(@PathVariable UUID id, @RequestBody Subcity subcity) {
        subcity.setId(id);
        return subcityRepository.save(subcity);
    }

    @DeleteMapping("/{id}")
    public void deleteSubcity(@PathVariable UUID id) {
        subcityRepository.deleteById(id);
    }
}
