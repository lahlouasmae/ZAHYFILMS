package com.example.serviceAuth.response;

import lombok.Data;

@Data
public class ProfileResponse {
    private Long id;
    private String username;
    private String email;
    private String nom;
    private String prenom;
    private String image;
    private Integer typeAbonnementId;
    private String typeAbonnementNom;
    private Double typeAbonnementPrix;  // Nouveau champ pour le prix

    // Constructeur existant - gardez-le pour compatibilité
    public ProfileResponse(Long id, String username, String email, String nom, String prenom,
                           String image, Integer typeAbonnementId, String typeAbonnementNom) {
        this.id = id;
        this.username = username;
        this.email = email;
        this.nom = nom;
        this.prenom = prenom;
        this.image = image;
        this.typeAbonnementId = typeAbonnementId;
        this.typeAbonnementNom = typeAbonnementNom;
        this.typeAbonnementPrix = null; // Par défaut à null
    }

    // Nouveau constructeur avec le prix
    public ProfileResponse(Long id, String username, String email, String nom, String prenom,
                           String image, Integer typeAbonnementId, String typeAbonnementNom, Double typeAbonnementPrix) {
        this.id = id;
        this.username = username;
        this.email = email;
        this.nom = nom;
        this.prenom = prenom;
        this.image = image;
        this.typeAbonnementId = typeAbonnementId;
        this.typeAbonnementNom = typeAbonnementNom;
        this.typeAbonnementPrix = typeAbonnementPrix;
    }
}