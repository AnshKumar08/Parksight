package com.parksight.dto;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.List;

public record DispatchResponse(
        @JsonProperty("timestamp") String timestamp,
        @JsonProperty("recommended_dispatch_zones") List<HotspotZone> recommendedDispatchZones) {
    @JsonCreator
    public DispatchResponse(
            @JsonProperty("timestamp") String timestamp,
            @JsonProperty("recommended_dispatch_zones") List<HotspotZone> recommendedDispatchZones) {
        this.timestamp = timestamp;
        this.recommendedDispatchZones = recommendedDispatchZones;
    }
}
