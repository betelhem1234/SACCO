package com.example.ngrxcrud.api.controller;

import com.example.ngrxcrud.api.model.Education;
import com.example.ngrxcrud.api.repository.EducationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/educations")
@CrossOrigin(origins = "*")
public class EducationController {

    @Autowired
    private EducationRepository educationRepository;

    @GetMapping
    public List<Education> getAllEducations() {
        return educationRepository.findAll();
    }

    @PostMapping
    public Education addEducation(@RequestBody Education education) {
        return educationRepository.save(education);
    }

    @PutMapping("/{id}")
    public Education updateEducation(@PathVariable UUID id, @RequestBody Education education) {
        education.setId(id);
        return educationRepository.save(education);
    }

    @DeleteMapping("/{id}")
    public void deleteEducation(@PathVariable UUID id) {
        educationRepository.deleteById(id);
    }
}
