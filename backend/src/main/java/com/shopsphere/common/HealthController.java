package com.shopsphere.common;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.DatabaseMetaData;
import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/health")
public class HealthController {

    private final DataSource dataSource;

    public HealthController(DataSource dataSource) {
        this.dataSource = dataSource;
    }

    @GetMapping
    public ResponseEntity<HealthResponse> checkHealth() {
        Map<String, Object> details = new LinkedHashMap<>();
        boolean dbHealthy = false;

        try (Connection connection = dataSource.getConnection()) {
            DatabaseMetaData metaData = connection.getMetaData();
            details.put("database", "CONNECTED");
            details.put("dbProductName", metaData.getDatabaseProductName());
            details.put("dbProductVersion", metaData.getDatabaseProductVersion());
            dbHealthy = true;
        } catch (Exception e) {
            details.put("database", "DISCONNECTED");
            details.put("dbError", e.getMessage());
        }

        String overallStatus = dbHealthy ? "UP" : "DEGRADED";
        HealthResponse response = new HealthResponse(
                overallStatus,
                "ShopSphere Backend",
                "0.0.1-SNAPSHOT",
                Instant.now(),
                details
        );

        HttpStatus httpStatus = dbHealthy ? HttpStatus.OK : HttpStatus.SERVICE_UNAVAILABLE;
        return ResponseEntity.status(httpStatus).body(response);
    }
}
