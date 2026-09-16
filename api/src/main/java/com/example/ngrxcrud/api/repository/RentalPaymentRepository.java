package com.example.ngrxcrud.api.repository;

import com.example.ngrxcrud.api.model.RentalPayment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface RentalPaymentRepository extends JpaRepository<RentalPayment, UUID> {

    List<RentalPayment> findByContractId(UUID contractId);
}