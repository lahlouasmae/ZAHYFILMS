package com.example.serviceAuth.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

import java.security.Key;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Component
public class JwtUtils {

    @Value("${jwt.secret}")
    private String jwtSecret;

    @Value("${jwt.expiration}")
    private int jwtExpirationMs;

    private Key key;

    public String generateJwtToken(Authentication authentication) {
        UserDetails userPrincipal = (UserDetails) authentication.getPrincipal();

        // Extraire les rôles directement des autorités
        List<String> roles = authentication.getAuthorities().stream()
                .map(authority -> authority.getAuthority())
                .collect(Collectors.toList());

        // Log pour déboguer
        System.out.println("Rôles à inclure dans le token: " + roles);

        // Préparer les claims
        Map<String, Object> claims = new HashMap<>();
        claims.put("roles", roles);

        // Extraire l'ID utilisateur si possible
        Long userId = null;
        if (userPrincipal instanceof com.example.serviceAuth.services.UserDetailsImpl) {
            userId = ((com.example.serviceAuth.services.UserDetailsImpl) userPrincipal).getId();
            claims.put("userId", userId);
        }

        // Initialiser la clé si nécessaire
        if (key == null) {
            key = Keys.hmacShaKeyFor(jwtSecret.getBytes());
        }

        // Construire le token avec les claims
        return Jwts.builder()
                .setClaims(claims)  // Ajouter tous les claims d'un coup
                .setSubject(userPrincipal.getUsername())
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + jwtExpirationMs))
                .signWith(key)
                .compact();
    }

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

    public boolean validateJwtToken(String authToken) {
        try {
            if (key == null) {
                key = Keys.hmacShaKeyFor(jwtSecret.getBytes());
            }

            Jwts.parserBuilder().setSigningKey(key).build().parseClaimsJws(authToken);
            return true;
        } catch (Exception e) {
            return false;
        }
    }
}
