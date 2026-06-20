package com.parksight.dto;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;

public record HotspotZone(
    @JsonProperty("geohash") String geohash,
    @JsonProperty("predicted_violations") double predictedViolations,
    @JsonProperty("choke_score") double chokeScore
) {
    @JsonCreator
    public HotspotZone(
        @JsonProperty("geohash") String geohash,
        @JsonProperty("predicted_violations") double predictedViolations,
        @JsonProperty("choke_score") double chokeScore
    ) {
        this.geohash = geohash;
        this.predictedViolations = predictedViolations;
        this.chokeScore = chokeScore;
    }
}
