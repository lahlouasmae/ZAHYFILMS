package com.example.serviceAuth.model;

public class PaymentRequestDto {
    private Integer abonnementId;
    private String cancelUrl;
    private String successUrl;

    public Integer getAbonnementId() {
        return abonnementId;
    }

    public void setAbonnementId(Integer abonnementId) {
        this.abonnementId = abonnementId;
    }

    public String getCancelUrl() {
        return cancelUrl;
    }

    public void setCancelUrl(String cancelUrl) {
        this.cancelUrl = cancelUrl;
    }

    public String getSuccessUrl() {
        return successUrl;
    }

    public void setSuccessUrl(String successUrl) {
        this.successUrl = successUrl;
    }

    // Getters et Setters
}

