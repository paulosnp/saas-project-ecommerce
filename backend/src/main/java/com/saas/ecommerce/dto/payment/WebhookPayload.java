package com.saas.ecommerce.dto.payment;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

import java.time.OffsetDateTime;

@Data
public class WebhookPayload {
    private Long id;

    @JsonProperty("live_mode")
    private Boolean liveMode;

    private String type;

    @JsonProperty("date_created")
    private OffsetDateTime dateCreated;

    @JsonProperty("user_id")
    private Long userId;

    @JsonProperty("api_version")
    private String apiVersion;

    private String action;

    private Data data;

    @lombok.Data
    public static class Data {
        private String id;
    }
}
