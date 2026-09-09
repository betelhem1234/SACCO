package com.example.ngrxcrud.api.repository;

import com.example.ngrxcrud.api.model.MemberGroup;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface MemberGroupRepository extends JpaRepository<MemberGroup, UUID> {
    List<MemberGroup> findByMember_Id(UUID memberId);
    void deleteByMember_Id(UUID memberId);
}
