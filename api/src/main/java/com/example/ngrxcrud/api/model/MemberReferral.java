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
@Table(name = "member_referrals")
@Data
@NoArgsConstructor
@AllArgsConstructor
@ToString(exclude = "member")
public class MemberReferral {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @JsonProperty("first_name")
    private String firstName;
    @JsonProperty("middle_name")
    private String middleName;
    @JsonProperty("last_name")
    private String lastName;
    @JsonProperty("mother_name")
    private String motherName;
    @JsonProperty("family_size")
    private Integer familySize;
    @JsonProperty("job_field")
    private String jobField;
    @JsonProperty("work_address")
    private String workAddress;
    @JsonProperty("fayda_id_no")
    private String faydaIdNo;
    @JsonProperty("birth_date")
    private Long birthDate;
    private Integer age;
    @JsonProperty("is_male")
    private Boolean isMale;
    private String telephone;
    private String email;
    @JsonProperty("state_id")
    private UUID stateId;
    private String subcity;
    private String woreda;
    @JsonProperty("house_no")
    private String houseNo;
    @JsonProperty("immediate_contact_full_name")
    private String immediateContactFullName;
    @JsonProperty("immediate_contact_phone")
    private String immediateContactPhone;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "member_id")
    @JsonIgnore
    private Member member;
}
