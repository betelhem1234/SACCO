package com.example.ngrxcrud.api.repository;

import com.example.ngrxcrud.api.model.Subcity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SubcityRepository extends JpaRepository<Subcity, java.util.UUID> {
    List<Subcity> findByStateId(java.util.UUID stateId);
}
