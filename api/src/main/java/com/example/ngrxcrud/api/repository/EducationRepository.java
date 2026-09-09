package com.example.ngrxcrud.api.repository;

import com.example.ngrxcrud.api.model.Education;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface EducationRepository extends JpaRepository<Education, java.util.UUID> {
}
