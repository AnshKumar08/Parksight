package com.parksight.service;

import org.springframework.beans.factory.annotation.Value;
import com.parksight.dto.DispatchRequest;
import com.parksight.dto.DispatchResponse;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;

import java.util.ArrayList;

@Service
public class ParkingService {

    @Value("${python.api.url}")
    private String pythonApiUrl;

    private final RestTemplate restTemplate;

    public ParkingService() {
        this.restTemplate = new RestTemplate();
    }

    public DispatchResponse getRequiredDispatchZones(DispatchRequest request) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        HttpEntity<DispatchRequest> entity = new HttpEntity<>(request, headers);

        try {
            ResponseEntity<DispatchResponse> response = restTemplate.postForEntity(
                    pythonApiUrl,
                    entity,
                    DispatchResponse.class);
            return response.getBody();

        } catch (RestClientException e) {
            System.err.println("CRITICAL: Python ML Engine failed to respond - " + e.getMessage());
            return new DispatchResponse(request.targetTime(), new ArrayList<>());
        }
    }
}
