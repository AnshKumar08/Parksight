package com.parksight.service;

import com.parksight.dto.DispatchRequest;
import com.parksight.dto.DispatchResponse;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;

@Service
public class ParkingService {

    private static final String PYTHON_API_URL = "http://localhost:8000/predict_hotspots";
    private final RestTemplate restTemplate;

    public ParkingService() {
        this.restTemplate = new RestTemplate();
    }

    public DispatchResponse getRequiredDispatchZones(DispatchRequest request) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        HttpEntity<DispatchRequest> entity = new HttpEntity<>(request, headers);

        ResponseEntity<DispatchResponse> response = restTemplate.postForEntity(
                PYTHON_API_URL,
                entity,
                DispatchResponse.class
        );

        return response.getBody();
    }
}
