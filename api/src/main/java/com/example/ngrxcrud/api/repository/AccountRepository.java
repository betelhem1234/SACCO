package com.example.ngrxcrud.api.repository;

import com.example.ngrxcrud.api.model.Account;
import com.example.ngrxcrud.api.model.AccountCategory;
import com.example.ngrxcrud.api.model.AccountType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface AccountRepository extends JpaRepository<Account, UUID> {

    List<Account> findByAccountType(AccountType accountType);

    List<Account> findByAccountCategory(AccountCategory accountCategory);

    List<Account> findByAccountTypeAndAccountCategory(AccountType accountType, AccountCategory accountCategory);
}
