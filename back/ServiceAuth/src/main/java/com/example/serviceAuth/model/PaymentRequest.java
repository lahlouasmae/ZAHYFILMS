package com.example.serviceAuth.model;

public class PaymentRequest {
    private Integer abonnementId;
    private String cancelUrl;
    private String successUrl;

    // Getters et setters
    public Integer getAbonnementId() { return abonnementId; }
    public void setAbonnementId(Integer abonnementId) { this.abonnementId = abonnementId; }

    public String getCancelUrl() { return cancelUrl; }
    public void setCancelUrl(String cancelUrl) { this.cancelUrl = cancelUrl; }

    public String getSuccessUrl() { return successUrl; }
    public void setSuccessUrl(String successUrl) { this.successUrl = successUrl; }
}
