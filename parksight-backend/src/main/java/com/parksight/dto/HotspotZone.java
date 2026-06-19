package com.parksight.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

public record HotspotZone(
    String geohash,
    @JsonProperty("predicted_violations") double predictedViolations,
    @JsonProperty("choke_score") double chokeScore
) {}
