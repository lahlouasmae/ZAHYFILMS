package com.example.serviceAuth.request;

import lombok.Data;

@Data
public class PaymentRequest {
    private Integer abonnementId;
    private String cancelUrl;
    private String successUrl;
}