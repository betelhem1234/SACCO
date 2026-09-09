package com.example.ngrxcrud.api.repository;

import com.example.ngrxcrud.api.model.Withdrawal;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface WithdrawalRepository extends JpaRepository<Withdrawal, UUID> {

    Optional<Withdrawal> findFirstByMemberIdOrderByDateDesc(UUID memberId);

    List<Withdrawal> findByMemberId(UUID memberId);
}
