package com.example.serviceAuth.response;

import lombok.Data;
import java.util.List;

@Data
public class JwtResponse {
    private String token;
    private String type = "Bearer";
    private Long id;
    private String username;
    private String email;
    private String nom;
    private String prenom;
    private List<String> roles;
    private boolean isAdmin; // Ajout pour distinguer les types d'utilisateurs

    public JwtResponse(String accessToken, Long id, String username, String email, String nom, String prenom, List<String> roles, boolean isAdmin) {
        this.token = accessToken;
        this.id = id;
        this.username = username;
        this.email = email;
        this.nom = nom;
        this.prenom = prenom;
        this.roles = roles;
        this.isAdmin = isAdmin;
    }
}
