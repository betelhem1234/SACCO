package com.example.ngrxcrud.api.repository;

import com.example.ngrxcrud.api.model.Saving;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SavingRepository extends JpaRepository<Saving, java.util.UUID> {
}
