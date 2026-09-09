package com.example.ngrxcrud.api.controller;

import com.example.ngrxcrud.api.model.Branch;
import com.example.ngrxcrud.api.repository.BranchRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/branches")
@CrossOrigin(origins = "*")
public class BranchController {

    @Autowired
    private BranchRepository branchRepository;

    @GetMapping
    public List<Branch> getAllBranches() {
        return branchRepository.findAll();
    }

    @PostMapping
    public Branch addBranch(@RequestBody Branch branch) {
        return branchRepository.save(branch);
    }

    @PutMapping("/{id}")
    public Branch updateBranch(@PathVariable UUID id, @RequestBody Branch branch) {
        branch.setId(id);
        return branchRepository.save(branch);
    }

    @DeleteMapping("/{id}")
    public void deleteBranch(@PathVariable UUID id) {
        branchRepository.deleteById(id);
    }
}
