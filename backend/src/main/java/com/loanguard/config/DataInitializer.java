package com.loanguard.config;

import com.loanguard.model.User;
import com.loanguard.model.UserRole;
import com.loanguard.repository.UserRepository;
import com.loanguard.service.KnowledgeService;
import org.mindrot.jbcrypt.BCrypt;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class DataInitializer {

    @Bean
    CommandLineRunner initData(UserRepository userRepository, KnowledgeService knowledgeService) {
        return args -> {
            // ── Ensure default admin user exists ──
            String adminEmail = "admin@loanguard.local";
            if (userRepository.existsByEmail(adminEmail)) {
                userRepository.findByEmail(adminEmail).ifPresent(existing -> {
                    if (existing.getRole() != UserRole.ADMIN) {
                        existing.setRole(UserRole.ADMIN);
                        userRepository.save(existing);
                    }
                });
            } else {
                User admin = new User();
                admin.setFullName("RiskPilot AI Admin");
                admin.setEmail(adminEmail);
                admin.setPassword(BCrypt.hashpw("Admin@123", BCrypt.gensalt(12)));
                admin.setRole(UserRole.ADMIN);
                admin.setIsActive(true);
                userRepository.save(admin);
                System.out.println("[DataInitializer] Created default admin user: " + adminEmail + " / Admin@123");
            }

            // ── Seed knowledge base if empty ──
            knowledgeService.seedIfEmpty();
        };
    }
}