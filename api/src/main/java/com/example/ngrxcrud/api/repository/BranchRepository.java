package com.example.ngrxcrud.api.repository;

import com.example.ngrxcrud.api.model.Branch;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface BranchRepository extends JpaRepository<Branch, java.util.UUID> {
}
