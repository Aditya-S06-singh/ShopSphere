package com.shopsphere;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;

@SpringBootApplication
public class ShopSphereApplication {

    public static void main(String[] args) {
        loadDotEnvIfPresent();
        SpringApplication.run(ShopSphereApplication.class, args);
    }

    /**
     * Automatically loads key-value pairs from .env into JVM System properties
     * if the file exists at project root or working directory.
     * Keeps secrets local and avoids needing manual shell export scripts.
     */
    private static void loadDotEnvIfPresent() {
        Path[] candidatePaths = new Path[] {
                Paths.get(".env"),
                Paths.get("..", ".env"),
                Paths.get("C:", "dev", "ShopSphere", ".env")
        };

        for (Path path : candidatePaths) {
            if (Files.isRegularFile(path)) {
                try {
                    List<String> lines = Files.readAllLines(path);
                    for (String line : lines) {
                        String trimmed = line.trim();
                        if (trimmed.isEmpty() || trimmed.startsWith("#")) continue;
                        int eq = trimmed.indexOf('=');
                        if (eq > 0) {
                            String key = trimmed.substring(0, eq).trim();
                            String val = trimmed.substring(eq + 1).trim();
                            if (System.getProperty(key) == null && System.getenv(key) == null) {
                                System.setProperty(key, val);
                            }
                        }
                    }
                    System.out.println("[ShopSphere] Auto-detected local .env file from: " + path.normalize().toAbsolutePath());
                    return;
                } catch (Exception ignored) {
                }
            }
        }
    }
}

