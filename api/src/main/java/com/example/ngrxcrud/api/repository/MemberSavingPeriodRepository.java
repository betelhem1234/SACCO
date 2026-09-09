package com.example.ngrxcrud.api.repository;

import com.example.ngrxcrud.api.model.MemberSavingPeriod;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface MemberSavingPeriodRepository extends JpaRepository<MemberSavingPeriod, UUID> {

    Optional<MemberSavingPeriod> findByMemberIdAndSavingTypeIdAndYearMonth(
            UUID memberId, UUID savingTypeId, int yearMonth);

    List<MemberSavingPeriod> findByMemberIdAndSavingTypeIdOrderByYearMonthAsc(
            UUID memberId, UUID savingTypeId);

    List<MemberSavingPeriod> findBySavingTypeIdAndYearMonthGreaterThanEqualOrderByYearMonthAsc(
            UUID savingTypeId, int yearMonth);

    List<MemberSavingPeriod> findByMemberIdAndSavingTypeId(
            UUID memberId, UUID savingTypeId);

    void deleteByMemberIdAndSavingTypeIdAndYearMonth(
            UUID memberId, UUID savingTypeId, int yearMonth);
}
