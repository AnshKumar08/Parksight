package com.parksight.controller;

import com.parksight.dto.DispatchRequest;
import com.parksight.dto.DispatchResponse;
import com.parksight.service.ParkingService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/dispatch")
@CrossOrigin(origins = "*")
public class ParkingController {

    private final ParkingService parkingService;

    public ParkingController(ParkingService parkingService) {
        this.parkingService = parkingService;
    }

    @GetMapping("/health")
    public String healthCheck() {
        return "Parksight Backend is up and running!";
    }

    @PostMapping("/predict")
    public DispatchResponse predictCongestionZones(@RequestBody DispatchRequest request) {
        return parkingService.getRequiredDispatchZones(request);
    }
}
