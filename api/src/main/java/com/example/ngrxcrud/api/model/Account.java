package com.example.ngrxcrud.api.model;

import com.example.ngrxcrud.api.jpa.AccountCategoryConverter;
import com.example.ngrxcrud.api.jpa.AccountTypeConverter;
import jakarta.persistence.Column;
import jakarta.persistence.Convert;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Entity
@Table(name = "accounts")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class Account {
    @Id
    @GeneratedValue(strategy = jakarta.persistence.GenerationType.UUID)
    private UUID id;

    private String name;
    private String description;

    @Column(name = "account_number")
    private String accountNumber;

    @Convert(converter = AccountTypeConverter.class)
    @Column(name = "account_type", nullable = false)
    private AccountType accountType;

    @Column(nullable = false)
    private Long date;

    @Column(name = "is_active", nullable = false)
    private Boolean isActive;

    @Column(name = "is_parent", nullable = false)
    private Boolean isParent;

    @Convert(converter = AccountCategoryConverter.class)
    @Column(name = "account_category", nullable = false)
    private AccountCategory accountCategory;
}
