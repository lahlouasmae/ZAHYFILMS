package com.example.serviceAuth.controller;

import java.util.*;
import java.util.stream.Collectors;

import com.example.serviceAuth.model.TypeAbonnement;
import com.example.serviceAuth.repository.TypeAbonnementRepository;
import jakarta.validation.Valid;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import com.example.serviceAuth.model.ERole;
import com.example.serviceAuth.model.Role;
import com.example.serviceAuth.model.User;
import com.example.serviceAuth.request.LoginRequest;
import com.example.serviceAuth.request.SignupRequest;
import com.example.serviceAuth.response.JwtResponse;
import com.example.serviceAuth.response.MessageResponse;
import com.example.serviceAuth.repository.RoleRepository;
import com.example.serviceAuth.repository.UserRepository;
import com.example.serviceAuth.security.JwtUtils;
import com.example.serviceAuth.services.UserDetailsImpl;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/auth")
public class AuthController {
    @Autowired
    AuthenticationManager authenticationManager;

    @Autowired
    UserRepository userRepository;

    @Autowired
    RoleRepository roleRepository;

    @Autowired
    PasswordEncoder encoder;

    @Autowired
    JwtUtils jwtUtils;
    @Autowired
    TypeAbonnementRepository typeAbonnementRepository;

    @PostMapping("/signin")
    public ResponseEntity<?> authenticateUser(@Valid @RequestBody LoginRequest loginRequest) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginRequest.getUsername(), loginRequest.getPassword()));

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = jwtUtils.generateJwtToken(authentication);

        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        List<String> roles = userDetails.getAuthorities().stream()
                .map(item -> item.getAuthority())
                .collect(Collectors.toList());

        // Vérifier si l'utilisateur est un admin pour le rediriger correctement
        boolean isAdmin = roles.contains("ROLE_ADMIN");

        return ResponseEntity.ok(new JwtResponse(jwt,
                userDetails.getId(),
                userDetails.getUsername(),
                userDetails.getEmail(),
                userDetails.getNom(),
                userDetails.getPrenom(),
                roles,
                isAdmin));
    }

    @PostMapping("/signup")
    public ResponseEntity<?> registerUser(@Valid @RequestBody SignupRequest signupRequest) {
        if (userRepository.existsByUsername(signupRequest.getUsername())) {
            return ResponseEntity
                    .badRequest()
                    .body(new MessageResponse("Erreur: Ce nom d'utilisateur est déjà pris!"));
        }

        if (userRepository.existsByEmail(signupRequest.getEmail())) {
            return ResponseEntity
                    .badRequest()
                    .body(new MessageResponse("Erreur: Cet email est déjà utilisé!"));
        }

        // Créer un nouveau compte utilisateur avec seulement les informations essentielles
        User user = new User();
        user.setUsername(signupRequest.getUsername());
        user.setEmail(signupRequest.getEmail());
        user.setPassword(encoder.encode(signupRequest.getPassword()));

        // Attribuer automatiquement le rôle USER (jamais ADMIN lors de l'inscription)
        Set<Role> roles = new HashSet<>();
        Role userRole = roleRepository.findByName(ERole.ROLE_USER)
                .orElseThrow(() -> new RuntimeException("Erreur: Role utilisateur non trouvé."));
        roles.add(userRole);
        user.setRoles(roles);

        // Attribuer l'abonnement Gratuit par défaut
        TypeAbonnement abonnementGratuit = typeAbonnementRepository.findByNom("Gratuit")
                .orElseThrow(() -> new RuntimeException("Erreur: Abonnement Gratuit non trouvé."));
        user.setTypeAbonnement(abonnementGratuit);

        userRepository.save(user);

        return ResponseEntity.ok(new MessageResponse("Utilisateur enregistré avec succès!"));
    }
    @GetMapping("/test")
    public ResponseEntity<?> testEndpoint() {
        return ResponseEntity.ok(new MessageResponse("Test réussi!"));
    }
    @GetMapping("/user/{id}/abonnement")
    public ResponseEntity<?> getUserAbonnement(@PathVariable Long id) {
        Optional<User> userOpt = userRepository.findById(id);
        if (!userOpt.isPresent()) {
            return ResponseEntity.notFound().build();
        }

        User user = userOpt.get();
        TypeAbonnement abonnement = user.getTypeAbonnement();

        if (abonnement == null) {
            return ResponseEntity.ok(Map.of(
                    "userId", user.getId(),
                    "hasAbonnement", false
            ));
        }

        return ResponseEntity.ok(Map.of(
                "userId", user.getId(),
                "abonnementId", abonnement.getId(),
                "abonnementNom", abonnement.getNom(),
                "qualiteHD", abonnement.getQualiteHD(),
                "qualite4K", abonnement.getQualite4K(),
                "nombreEcrans", abonnement.getNombreEcrans()
        ));
    }
}


