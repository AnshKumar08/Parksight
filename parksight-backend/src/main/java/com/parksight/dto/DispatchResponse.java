// src/main/java/com/parksight/dto/DispatchResponse.java
package com.parksight.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.List;

public record DispatchResponse(
    String timestamp,
    @JsonProperty("recommended_dispatch_zones") List<HotspotZone> recommendedDispatchZones
) {}
