package com.example.ngrxcrud.api.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.ToString;

import java.util.UUID;

@Entity
@Table(name = "member_beneficiaries")
@Data
@NoArgsConstructor
@AllArgsConstructor
@ToString(exclude = "member")
public class MemberBeneficiary {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    private String name;
    @JsonProperty("is_male")
    private Boolean isMale;
    @JsonProperty("relation_type")
    private Integer relationType;
    @JsonProperty("birth_date")
    private Long birthDate;
    private String remark;
    @JsonProperty("unique_relation")
    private String uniqueRelation;
    @JsonProperty("house_no")
    private String houseNo;
    @JsonProperty("state_id")
    private UUID stateId;
    private String woreda;
    private String subcity;
    private String kebele;
    private String telephone;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "member_id")
    @JsonIgnore
    private Member member;
}
