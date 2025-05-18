package com.example.server.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.security.Key;
import java.util.List;

@Component
public class JwtUtils {

    @Value("${jwt.secret}")
    private String jwtSecret;

    private Key key;

    // Extraire le nom d'utilisateur du token
    public String getUsernameFromJwtToken(String token) {
        if (key == null) {
            key = Keys.hmacShaKeyFor(jwtSecret.getBytes());
        }

        return Jwts.parserBuilder()
                .setSigningKey(key)
                .build()
                .parseClaimsJws(token)
                .getBody()
                .getSubject();
    }

    // Extraire tous les claims du token
    public Claims extractAllClaims(String token) {
        if (key == null) {
            key = Keys.hmacShaKeyFor(jwtSecret.getBytes());
        }

        return Jwts.parserBuilder()
                .setSigningKey(key)
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    // Extraire les rôles du token
    @SuppressWarnings("unchecked")
    public List<String> getRolesFromJwtToken(String token) {
        Claims claims = extractAllClaims(token);
        return claims.get("roles", List.class);
    }

    // Extraire l'ID de l'utilisateur du token
    public Long getUserIdFromJwtToken(String token) {
        Claims claims = extractAllClaims(token);
        return claims.get("userId", Long.class);
    }

    // Valider le token
    public boolean validateJwtToken(String authToken) {
        try {
            if (key == null) {
                key = Keys.hmacShaKeyFor(jwtSecret.getBytes());
            }

            Jwts.parserBuilder().setSigningKey(key).build().parseClaimsJws(authToken);
            return true;
        } catch (Exception e) {
            System.out.println("Invalid JWT token: " + e.getMessage());
            return false;
        }
    }

}