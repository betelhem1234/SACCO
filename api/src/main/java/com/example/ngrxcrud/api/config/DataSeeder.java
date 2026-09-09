package com.example.ngrxcrud.api.config;

import com.example.ngrxcrud.api.model.*;
import com.example.ngrxcrud.api.repository.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.UUID;

@Configuration
public class DataSeeder {

    @Bean
    CommandLineRunner initDatabase(UserRepository userRepository, RoleRepository roleRepository,
                                   RegionRepository regionRepository, SubcityRepository subcityRepository,
                                   EducationRepository educationRepository,
                                   BranchRepository branchRepository,
                                   PasswordEncoder passwordEncoder) {
        return args -> {
            // Seed Admin Role
            Role adminRole = roleRepository.findByName(RoleType.SUPER_ADMIN)
                    .orElseGet(() -> {
                        Role newRole = new Role();
                        newRole.setName(RoleType.SUPER_ADMIN);
                        newRole.setDescription("System Administrator");
                        return roleRepository.save(newRole);
                    });

            // Seed USER Role
            roleRepository.findByName(RoleType.ACCOUNTANT)
                    .orElseGet(() -> {
                        Role newRole = new Role();
                        newRole.setName(RoleType.ACCOUNTANT);
                        newRole.setDescription("Accountant");
                        return roleRepository.save(newRole);
                    });

            // Seed Default Admin User
            if (!userRepository.existsByEmail("admin@company.com")) {
                User admin = new User();
                admin.setUsername("admin");
                admin.setEmail("admin@company.com");
                admin.setPasswordHash(passwordEncoder.encode("Admin@1234"));
                admin.setFullName("Super Administrator");
                admin.setStatus(UserStatus.ACTIVE);
                admin.setRole(adminRole);
                userRepository.save(admin);
                System.out.println("Seeded Default Admin User: admin@company.com / Admin@1234");
            }

            // Seed Regions
            if (regionRepository.count() == 0) {
                Region r1 = regionRepository.save(new Region(null, "Addis Ababa", "Capital city"));
                Region r2 = regionRepository.save(new Region(null, "Oromia", "Oromia regional state"));
                Region r3 = regionRepository.save(new Region(null, "Amhara", "Amhara regional state"));
                Region r4 = regionRepository.save(new Region(null, "SNNPR", "Southern Nations, Nationalities, and Peoples' Region"));
                Region r5 = regionRepository.save(new Region(null, "Tigray", "Tigray regional state"));
                System.out.println("Seeded Ethiopian regions");

                // Seed Subcities for Addis Ababa
                if (subcityRepository.count() == 0) {
                    subcityRepository.save(new Subcity(null, "Bole", "Bole subcity", r1.getId()));
                    subcityRepository.save(new Subcity(null, "Kirkos", "Kirkos subcity", r1.getId()));
                    subcityRepository.save(new Subcity(null, "Yeka", "Yeka subcity", r1.getId()));
                    subcityRepository.save(new Subcity(null, "Lideta", "Lideta subcity", r1.getId()));
                    subcityRepository.save(new Subcity(null, "Arada", "Arada subcity", r1.getId()));
                    subcityRepository.save(new Subcity(null, "Gullele", "Gullele subcity", r1.getId()));
                    System.out.println("Seeded Addis Ababa subcities");
                }
            }

            // Seed Branches
            if (branchRepository.count() == 0) {
                branchRepository.save(new Branch(null, "Head Office", "Main headquarters branch"));
                branchRepository.save(new Branch(null, "Bole Branch", "Bole area branch"));
                branchRepository.save(new Branch(null, "Merkato Branch", "Merkato area branch"));
                branchRepository.save(new Branch(null, "Piassa Branch", "Piassa area branch"));
                System.out.println("Seeded branches");
            }

            // Seed Educations
            if (educationRepository.count() == 0) {
                educationRepository.save(new Education(null, "No formal education", "No formal education"));
                educationRepository.save(new Education(null, "Primary school", "Grade 1-8"));
                educationRepository.save(new Education(null, "Secondary school", "Grade 9-12"));
                educationRepository.save(new Education(null, "Diploma", "TVET / Diploma"));
                educationRepository.save(new Education(null, "Bachelor's degree", "Undergraduate degree"));
                educationRepository.save(new Education(null, "Master's degree", "Postgraduate degree"));
                educationRepository.save(new Education(null, "Doctorate (PhD)", "Doctoral degree"));
                System.out.println("Seeded education levels");
            }
        };
    }
}
