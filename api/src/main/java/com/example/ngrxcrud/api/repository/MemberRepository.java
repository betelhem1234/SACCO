package com.example.ngrxcrud.api.repository;

import com.example.ngrxcrud.api.model.Member;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface MemberRepository extends JpaRepository<Member, java.util.UUID> {
}
