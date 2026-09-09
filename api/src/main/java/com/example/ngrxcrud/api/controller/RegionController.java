package com.example.ngrxcrud.api.controller;

import com.example.ngrxcrud.api.model.Region;
import com.example.ngrxcrud.api.repository.RegionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/regions")
@CrossOrigin(origins = "*")
public class RegionController {

    @Autowired
    private RegionRepository regionRepository;

    @GetMapping
    public List<Region> getAllRegions() {
        return regionRepository.findAll();
    }

    @PostMapping
    public Region addRegion(@RequestBody Region region) {
        return regionRepository.save(region);
    }

    @PutMapping("/{id}")
    public Region updateRegion(@PathVariable UUID id, @RequestBody Region region) {
        region.setId(id);
        return regionRepository.save(region);
    }

    @DeleteMapping("/{id}")
    public void deleteRegion(@PathVariable UUID id) {
        regionRepository.deleteById(id);
    }
}
