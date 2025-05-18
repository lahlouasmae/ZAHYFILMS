package com.example.serviceAuth.request;

public class UpdateProfileRequest {
    private String username;
    private String email;
    private String nom;
    private String prenom;
    private String image;
    private Integer typeAbonnementId;
    private boolean removeAbonnement;

    // Getters et Setters
    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getNom() {
        return nom;
    }

    public void setNom(String nom) {
        this.nom = nom;
    }

    public String getPrenom() {
        return prenom;
    }

    public void setPrenom(String prenom) {
        this.prenom = prenom;
    }

    public String getImage() {
        return image;
    }

    public void setImage(String image) {
        this.image = image;
    }

    public Integer getTypeAbonnementId() {
        return typeAbonnementId;
    }

    public void setTypeAbonnementId(Integer typeAbonnementId) {
        this.typeAbonnementId = typeAbonnementId;
    }

    public boolean isRemoveAbonnement() {
        return removeAbonnement;
    }

    public void setRemoveAbonnement(boolean removeAbonnement) {
        this.removeAbonnement = removeAbonnement;
    }
}