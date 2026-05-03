package com.example.ngrxcrud.api.service;

import com.example.ngrxcrud.api.model.Member;
import com.example.ngrxcrud.api.model.Saving;
import com.example.ngrxcrud.api.repository.MemberRepository;
import com.example.ngrxcrud.api.repository.SavingRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.stereotype.Service;

@Service
public class DataInitializer {

    @Bean
    public CommandLineRunner initData(MemberRepository memberRepository, SavingRepository savingRepository,
            com.example.ngrxcrud.api.repository.BankRepository bankRepository,
            com.example.ngrxcrud.api.repository.SavingTypeRepository savingTypeRepository) {
        return args -> {
            Member m1 = new Member();
            m1.setIdNumbe("M-001");
            m1.setFullName("Betelemasss Lemma");
            m1.setEmail("betelhem@example.com");
            m1.setPhone("0912345678");
            m1.setBranchId(java.util.UUID.randomUUID());
            m1.setRegistrationDate(System.currentTimeMillis());
            m1.setMembersipStatus(1);
            m1 = memberRepository.save(m1);

            com.example.ngrxcrud.api.model.Bank bank = new com.example.ngrxcrud.api.model.Bank();
            bank.setName("Commercial Bank of Ethiopia");
            bank.setCode("CBE");
            bank = bankRepository.save(bank);

            com.example.ngrxcrud.api.model.SavingType st = new com.example.ngrxcrud.api.model.SavingType();
            st.setName("Monthly");
            st.setDescription("Standard monthly contribution");
            st = savingTypeRepository.save(st);

            Saving s1 = new Saving();
            s1.setMemberId(m1.getId());
            s1.setSavingAmount(5000.0);
            s1.setSavingDate(System.currentTimeMillis());
            s1.setFtp("FTP001");
            s1.setSavingType(st.getId());
            s1.setBankId(bank.getId());
            s1.setRemark("Initial saving");
            s1.setCreatedAt(System.currentTimeMillis());
            savingRepository.save(s1);

            System.out.println("Data initialized!");
        };
    }
}
