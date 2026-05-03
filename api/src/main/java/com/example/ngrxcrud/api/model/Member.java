package com.example.ngrxcrud.api.model;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "members")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class Member {
    @Id
    @GeneratedValue(strategy = jakarta.persistence.GenerationType.UUID)
    private java.util.UUID id;

    private String idNumbe;
    private String fullName;
    private String email;
    private String phone;
    private Long birthDate;
    private Boolean isMale;
    private Integer memberType;
    private Integer membersipStatus;
    private java.util.UUID branchId;
    private Long registrationDate;
}
