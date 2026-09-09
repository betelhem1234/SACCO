package com.example.ngrxcrud.api.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.ToString;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "members")
@Data
@AllArgsConstructor
@NoArgsConstructor
@ToString(exclude = {"beneficiaries", "referrals"})
public class Member {
    @Id
    @GeneratedValue(strategy = jakarta.persistence.GenerationType.UUID)
    private java.util.UUID id;

    @JsonProperty("memberid")
    private String idNumbe;
    private String fullName;
    private String email;
    private String phone;
    private Long birthDate;
    @JsonProperty("is_male")
    private Boolean isMale;
    @JsonProperty("member_type")
    private Integer memberType;
    private Integer membersipStatus;
    @JsonProperty("branch_id")
    private java.util.UUID branchId;
    @JsonProperty("registrationDate")
    private Long registrationDate;

    private String mother_name;
    private String telephone;
    private String home_phone_number;
    private String address;
    private Long membership_date;
    private Long reg_date;
    private java.util.UUID state_id;
    private java.util.UUID subcity;
    private String woreda;
    private String house_no;
    private String kebele;
    private String job_field;
    private String work_address;
    private String fayda_id_no;
    private String id_no;
    private java.util.UUID education_id;
    private Boolean is_company;
    private Boolean is_employee;
    private Boolean is_member;
    private java.util.UUID parent_id;
    private Integer family_size;
    private Integer age;
    private String nationality;
    private String immediate_contact_full_name;
    private String immediate_contact_firstname;
    private String immediate_contact_middlename;
    private String immediate_contact_lastname;
    private String immediate_contact_phone;
    private String immediate_contact_subcity;
    private String immediate_contact_region;
    private String immediate_contact_email;
    private String immediate_contact_house_no;
    private String immediate_contact_woreda;
    private Integer status;
    private String reason;
    private Integer monthly_income;
    private String saving_book_no;
    private Integer membership_type;
    private Integer marital_status;
    private String login_id;
    private java.util.UUID referral;

    @OneToMany(mappedBy = "member", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @JsonProperty("beneficiaries")
    private List<MemberBeneficiary> beneficiaries = new ArrayList<>();

    @OneToMany(mappedBy = "member", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @JsonProperty("referal_members")
    private List<MemberReferral> referrals = new ArrayList<>();
}
