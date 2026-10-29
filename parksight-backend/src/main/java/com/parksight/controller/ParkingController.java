package com.parksight.controller;

import com.parksight.dto.DispatchRequest;
import com.parksight.dto.DispatchResponse;
import com.parksight.service.ParkingService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.regex.Pattern;

@RestController
@RequestMapping("/api/v1/dispatch")
@CrossOrigin(origins = "${cors.allowed-origins:*}")
public class ParkingController {

    private static final Pattern TIMESTAMP_PATTERN = 
            Pattern.compile("^\\d{4}-\\d{2}-\\d{2}[ T]\\d{2}:\\d{2}(:\\d{2})?$");

    private final ParkingService parkingService;

    public ParkingController(ParkingService parkingService) {
        this.parkingService = parkingService;
    }

    @GetMapping("/health")
    public String healthCheck() {
        return "Parksight Backend is up and running!";
    }

    @PostMapping("/predict")
    public ResponseEntity<?> predictCongestionZones(@RequestBody(required = false) DispatchRequest request) {
        if (request == null || request.targetTime() == null || request.targetTime().trim().isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Missing required field: target_time (or targetTime).");
        }

        String targetTime = request.targetTime().trim();
        if (targetTime.length() > 30 || !TIMESTAMP_PATTERN.matcher(targetTime).matches()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Invalid timestamp format. Expected format: YYYY-MM-DD HH:MM:SS or YYYY-MM-DDTHH:MM");
        }

        DispatchResponse response = parkingService.getRequiredDispatchZones(request);
        return ResponseEntity.ok(response);
    }
}

