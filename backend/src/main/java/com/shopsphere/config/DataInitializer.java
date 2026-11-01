package com.shopsphere.config;

import com.shopsphere.product.Category;
import com.shopsphere.product.CategoryRepository;
import com.shopsphere.product.Product;
import com.shopsphere.product.ProductRepository;
import com.shopsphere.user.Role;
import com.shopsphere.user.User;
import com.shopsphere.user.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.List;

@Component
public class DataInitializer implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataInitializer.class);

    private final UserRepository userRepository;
    private final CategoryRepository categoryRepository;
    private final ProductRepository productRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(
            UserRepository userRepository,
            CategoryRepository categoryRepository,
            ProductRepository productRepository,
            PasswordEncoder passwordEncoder
    ) {
        this.userRepository = userRepository;
        this.categoryRepository = categoryRepository;
        this.productRepository = productRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        seedUsers();
        seedCatalog();
    }

    private void seedUsers() {
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

    private void seedCatalog() {
        if (categoryRepository.count() == 0) {
            log.info("Seeding sample product categories...");

            Category audio = new Category(
                    "Audio & Acoustics",
                    "audio-acoustics",
                    "Audiophile-grade studio monitors, noise-canceling headphones, and wireless earbuds.",
                    "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80"
            );

            Category wearables = new Category(
                    "Wearables & Fitness",
                    "wearables-fitness",
                    "Next-generation fitness trackers, biometric smartwatches, and smart accessories.",
                    "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80"
            );

            Category tech = new Category(
                    "Smart Tech & Gadgets",
                    "smart-tech",
                    "High-efficiency GaN chargers, AI webcams, and cutting-edge desktop peripherals.",
                    "https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=800&auto=format&fit=crop&q=80"
            );

            Category home = new Category(
                    "Home & Modern Living",
                    "home-lifestyle",
                    "Ergonomic workspace essentials, smart ambient lighting, and minimalist desk gear.",
                    "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800&auto=format&fit=crop&q=80"
            );

            categoryRepository.saveAll(List.of(audio, wearables, tech, home));

            if (productRepository.count() == 0) {
                log.info("Seeding sample catalog products...");

                List<Product> products = List.of(
                        new Product(
                                "QuantumSound ANC Wireless Headphones",
                                "quantumsound-anc-wireless-headphones",
                                "Flagship active noise-canceling over-ear headphones with custom 40mm beryllium drivers, 38-hour battery endurance, and spatial audio support.",
                                new BigDecimal("299.99"),
                                45,
                                "AUDIO-QS-01",
                                "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80",
                                audio
                        ),
                        new Product(
                                "AuraWatch Pro Biometric Smartwatch",
                                "aurawatch-pro-biometric-smartwatch",
                                "Aerospace-grade titanium chassis with continuous ECG, SpO2 tracking, dual-frequency GPS, and 7-day battery life with always-on AMOLED.",
                                new BigDecimal("349.00"),
                                30,
                                "WEAR-AURA-02",
                                "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80",
                                wearables
                        ),
                        new Product(
                                "OmniCharge 100W GaN Charging Station",
                                "omnicharge-100w-gan-charging-station",
                                "Ultra-compact Gallium Nitride multi-port charger with 3x USB-C Power Delivery and 1x USB-A ports, capable of charging two laptops simultaneously.",
                                new BigDecimal("79.99"),
                                120,
                                "TECH-GAN-03",
                                "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=800&auto=format&fit=crop&q=80",
                                tech
                        ),
                        new Product(
                                "EchoSphere Studio Smart Speaker",
                                "echosphere-studio-smart-speaker",
                                "High-fidelity room-calibrating 360-degree wireless speaker with dual passive radiators, lossless Wi-Fi streaming, and voice assistant integration.",
                                new BigDecimal("199.50"),
                                60,
                                "AUDIO-ECHO-04",
                                "https://images.unsplash.com/photo-1545454675-3531b543be5d?w=800&auto=format&fit=crop&q=80",
                                audio
                        ),
                        new Product(
                                "Lumina Glow Ergonomic Desk Lamp",
                                "lumina-glow-ergonomic-desk-lamp",
                                "Precision desk light bar with auto-dimming ambient optical sensors, CRI 95 color rendering, capacitive touch controls, and zero screen glare.",
                                new BigDecimal("89.00"),
                                75,
                                "HOME-LUM-05",
                                "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800&auto=format&fit=crop&q=80",
                                home
                        ),
                        new Product(
                                "PulseFit Ultra GPS Fitness Tracker",
                                "pulsefit-ultra-gps-fitness-tracker",
                                "Waterproof 5ATM fitness band featuring 30+ dedicated sports tracking modes, sleep staging analysis, and stress monitoring in a featherlight form.",
                                new BigDecimal("129.99"),
                                15,
                                "WEAR-PULSE-06",
                                "https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?w=800&auto=format&fit=crop&q=80",
                                wearables
                        ),
                        new Product(
                                "NovaBook Stand Pro Aluminium",
                                "novabook-stand-pro-aluminium",
                                "CNC-machined aluminum laptop riser with heat-dissipating airflow channels, dual pivoting hinges, and silicone grip pads supporting up to 17-inch devices.",
                                new BigDecimal("49.99"),
                                110,
                                "HOME-NOVA-07",
                                "https://images.unsplash.com/photo-1616353071588-708dcff912e2?w=800&auto=format&fit=crop&q=80",
                                home
                        ),
                        new Product(
                                "CyberVision 4K AI Webcam",
                                "cybervision-4k-ai-webcam",
                                "Sony STARVIS sensor with AI face tracking, HDR auto-exposure, dual stereo noise-canceling microphones, and physical magnetic privacy shutter.",
                                new BigDecimal("149.00"),
                                0, // Deliberately out of stock to test inStock filters
                                "TECH-CAM-08",
                                "https://images.unsplash.com/photo-1588508065123-287b28e013da?w=800&auto=format&fit=crop&q=80",
                                tech
                        )
                );

                productRepository.saveAll(products);
                log.info("Successfully seeded 8 sample products into ShopSphere catalog.");
            }
        }
    }
}
