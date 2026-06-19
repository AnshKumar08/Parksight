// src/main/java/com/parksight/dto/DispatchRequest.java
package com.parksight.dto;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.annotation.JsonProperty;

public record DispatchRequest(
    @JsonProperty("target_time")
    @JsonAlias("targetTime")
    String targetTime
) {}
