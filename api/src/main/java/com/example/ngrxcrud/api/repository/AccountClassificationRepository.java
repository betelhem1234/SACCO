package com.example.ngrxcrud.api.repository;

import com.example.ngrxcrud.api.model.AccountType;
import com.example.ngrxcrud.api.model.AccountClassification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface AccountClassificationRepository extends JpaRepository<AccountClassification, UUID> {

    List<AccountClassification> findByAccountType(AccountType accountType);
}
