package com.example.server.security;

import java.util.ArrayList;
import java.util.Collection;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;

@Service
public class UserDetailsServiceImpl implements UserDetailsService {

    @Autowired
    private JwtUtils jwtUtils;

    @Autowired
    private RestTemplate restTemplate;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        // Cette méthode est appelée par le AuthTokenFilter
        // Nous pouvons retourner un UserDetails basé sur les claims du token

        return org.springframework.security.core.userdetails.User.builder()
                .username(username)
                .password("") // Pas besoin de mot de passe car nous utilisons JWT
                .authorities(new ArrayList<>()) // Les autorités seront définies dans le token
                .build();
    }

    public UserDetails loadUserDetailsByToken(String token) {
        try {
            Claims claims = jwtUtils.extractAllClaims(token);
            String username = claims.getSubject();

            List<String> roles = claims.get("roles", List.class);
            Collection<GrantedAuthority> authorities = new ArrayList<>();

            if (roles != null) {
                roles.forEach(role -> {
                    authorities.add(new SimpleGrantedAuthority(role));
                });
            }

            return org.springframework.security.core.userdetails.User.builder()
                    .username(username)
                    .password("")
                    .authorities(authorities)
                    .build();

        } catch (Exception e) {
            throw new UsernameNotFoundException("Token invalide");
        }
    }
}