package com.loanguard.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

@JsonIgnoreProperties(ignoreUnknown = true)
public record MLPredictionResponse(
        @JsonProperty("default_probability") double defaultProbability
) {}