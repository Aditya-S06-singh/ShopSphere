package com.shopsphere.config;

import com.shopsphere.user.Role;
import com.shopsphere.user.User;
import com.shopsphere.user.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataInitializer.class);

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        if (userRepository.count() == 0) {
            log.info("No users found in database. Seeding demo accounts...");

            User admin = new User(
                    "admin@shopsphere.com",
                    passwordEncoder.encode("Admin@12345"),
                    "Platform",
                    "Admin",
                    Role.ROLE_ADMIN
            );
            userRepository.save(admin);
            log.info("Default ADMIN created: admin@shopsphere.com / Admin@12345");

            User customer = new User(
                    "customer@shopsphere.com",
                    passwordEncoder.encode("Customer@12345"),
                    "Jane",
                    "Customer",
                    Role.ROLE_CUSTOMER
            );
            userRepository.save(customer);
            log.info("Default CUSTOMER created: customer@shopsphere.com / Customer@12345");
        }
    }
}
