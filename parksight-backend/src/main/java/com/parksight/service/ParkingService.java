package com.parksight.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
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

    private static final Logger log = LoggerFactory.getLogger(ParkingService.class);

    private final String pythonApiUrl;
    private final RestTemplate restTemplate;

    public ParkingService(
            @Value("${python.api.url}") String pythonApiUrl,
            @Value("${python.api.connect-timeout:5000}") int connectTimeout,
            @Value("${python.api.read-timeout:30000}") int readTimeout) {
        this.pythonApiUrl = pythonApiUrl;

        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(connectTimeout);
        factory.setReadTimeout(readTimeout);
        this.restTemplate = new RestTemplate(factory);
    }

    public DispatchResponse getRequiredDispatchZones(DispatchRequest request) {
        if (request == null) {
            log.warn("Received null DispatchRequest");
            return new DispatchResponse("", new ArrayList<>());
        }

        String safeTimestamp = request.targetTime() != null ? request.targetTime() : "";

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        HttpEntity<DispatchRequest> entity = new HttpEntity<>(request, headers);

        try {
            ResponseEntity<DispatchResponse> response = restTemplate.postForEntity(
                    pythonApiUrl,
                    entity,
                    DispatchResponse.class);

            if (response.getBody() != null) {
                return response.getBody();
            } else {
                log.warn("Python ML Engine returned empty response body");
                return new DispatchResponse(safeTimestamp, new ArrayList<>());
            }
        } catch (RestClientException e) {
            log.error("CRITICAL: Python ML Engine failed to respond - {}", e.getMessage());
            return new DispatchResponse(safeTimestamp, new ArrayList<>());
        }
    }
}

