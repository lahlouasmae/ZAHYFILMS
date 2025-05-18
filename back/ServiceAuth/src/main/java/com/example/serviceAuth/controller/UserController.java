package com.example.serviceAuth.controller;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import com.example.serviceAuth.model.TypeAbonnement;
import com.example.serviceAuth.model.User;
import com.example.serviceAuth.request.UpdateProfileRequest;
import com.example.serviceAuth.response.MessageResponse;
import com.example.serviceAuth.response.ProfileResponse;
import com.example.serviceAuth.repository.TypeAbonnementRepository;
import com.example.serviceAuth.repository.UserRepository;
import com.example.serviceAuth.services.UserDetailsImpl;
import com.example.serviceAuth.services.UserDetailsServiceImpl;
import com.example.serviceAuth.services.PaymentService;

import java.util.Map;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/profile")
public class UserController {
    @Autowired
    UserRepository userRepository;

    @Autowired
    TypeAbonnementRepository typeAbonnementRepository;

    @Autowired
    UserDetailsServiceImpl userDetailsService;

    @Autowired
    PaymentService paymentService;
    @GetMapping("/{userId}/subscription-level")
    public ResponseEntity<String> getUserSubscriptionLevel(@PathVariable Long userId) {
        return userRepository.findById(userId)
                .map(user -> {
                    String level = user.getTypeAbonnement() != null ?
                            user.getTypeAbonnement().getNom() : "GRATUIT";
                    return ResponseEntity.ok(level);
                })
                .orElse(ResponseEntity.notFound().build());
    }
    @GetMapping
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<?> getUserProfile() {
        // Récupérer l'utilisateur connecté
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        Long userId = userDetails.getId();

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Erreur: Utilisateur non trouvé."));

        // Créer la réponse avec les données du profil
        ProfileResponse profileResponse = new ProfileResponse(
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getNom(),
                user.getPrenom(),
                user.getImage(),
                user.getTypeAbonnement() != null ? user.getTypeAbonnement().getId() : null,
                user.getTypeAbonnement() != null ? user.getTypeAbonnement().getNom() : null,
                user.getTypeAbonnement() != null ? user.getTypeAbonnement().getPrix() : null  // Ajout du prix
        );

        return ResponseEntity.ok(profileResponse);
    }




    @PutMapping
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<?> updateUserProfile(@Valid @RequestBody UpdateProfileRequest updateRequest, HttpServletRequest request) {
        // Récupérer l'utilisateur connecté
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        Long userId = userDetails.getId();

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Erreur: Utilisateur non trouvé."));

        boolean securityContextNeedsUpdate = false;

        // Vérifier si le nom d'utilisateur est mis à jour et s'il n'est pas déjà pris
        if (updateRequest.getUsername() != null && !updateRequest.getUsername().equals(user.getUsername())) {
            if (userRepository.existsByUsername(updateRequest.getUsername())) {
                return ResponseEntity
                        .badRequest()
                        .body(new MessageResponse("Erreur: Ce nom d'utilisateur est déjà pris!"));
            }
            user.setUsername(updateRequest.getUsername());
            securityContextNeedsUpdate = true;
        }

        // Vérifier si l'email est mis à jour et s'il n'est pas déjà utilisé
        if (updateRequest.getEmail() != null && !updateRequest.getEmail().equals(user.getEmail())) {
            if (userRepository.existsByEmail(updateRequest.getEmail())) {
                return ResponseEntity
                        .badRequest()
                        .body(new MessageResponse("Erreur: Cet email est déjà utilisé!"));
            }
            user.setEmail(updateRequest.getEmail());
            securityContextNeedsUpdate = true;
        }

        // Mettre à jour les autres informations du profil
        if (updateRequest.getNom() != null) {
            user.setNom(updateRequest.getNom());
        }

        if (updateRequest.getPrenom() != null) {
            user.setPrenom(updateRequest.getPrenom());
        }

        if (updateRequest.getImage() != null) {
            user.setImage(updateRequest.getImage());
        }

        // Pour le type d'abonnement, on ne le met plus à jour directement
        // On redirige plutôt vers le processus de paiement
        if (updateRequest.getTypeAbonnementId() != null) {
            return ResponseEntity
                    .badRequest()
                    .body(new MessageResponse("Pour changer d'abonnement, veuillez passer par la page de paiement."));
        } else if (updateRequest.getTypeAbonnementId() == null && updateRequest.isRemoveAbonnement()) {
            // On permet quand même de supprimer un abonnement sans passer par le paiement
            user.setTypeAbonnement(null);
        }

        // Sauvegarder les modifications
        user = userRepository.save(user);

        // Mettre à jour le contexte de sécurité si nécessaire
        if (securityContextNeedsUpdate) {
            UserDetails updatedUserDetails = userDetailsService.loadUserById(userId);
            Authentication newAuth = new UsernamePasswordAuthenticationToken(
                    updatedUserDetails, null, updatedUserDetails.getAuthorities());
            SecurityContextHolder.getContext().setAuthentication(newAuth);
        }

        return ResponseEntity.ok(new MessageResponse("Profil mis à jour avec succès!"));
    }

    // Nouvelle méthode pour initier un processus de paiement d'abonnement
    @PostMapping("/subscribe")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<?> initiateSubscription(@RequestParam Integer abonnementId,
                                                  @RequestParam String cancelUrl,
                                                  @RequestParam String successUrl) {
        try {
            // Récupérer l'utilisateur connecté
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
            Long userId = userDetails.getId();

            // Vérifier que l'abonnement existe
            TypeAbonnement abonnement = typeAbonnementRepository.findById(abonnementId)
                    .orElseThrow(() -> new RuntimeException("Erreur: Type d'abonnement non trouvé."));

            // Initier le processus de paiement
            String approvalUrl = paymentService.createPayment(userId, abonnementId, cancelUrl, successUrl);

            return ResponseEntity.ok(Map.of(
                    "status", "success",
                    "abonnement", abonnement.getNom(),
                    "prix", abonnement.getPrix(),
                    "redirect_url", approvalUrl
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse("Erreur lors de l'initiation du paiement: " + e.getMessage()));
        }
    }

    // Optionnel: méthode pour vérifier le statut de l'abonnement actuel
    @GetMapping("/subscription")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<?> getCurrentSubscription() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        Long userId = userDetails.getId();

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Erreur: Utilisateur non trouvé."));

        TypeAbonnement abonnement = user.getTypeAbonnement();

        if (abonnement == null) {
            return ResponseEntity.ok(Map.of(
                    "hasSubscription", false
            ));
        }

        return ResponseEntity.ok(Map.of(
                "hasSubscription", true,
                "id", abonnement.getId(),
                "nom", abonnement.getNom(),
                "prix", abonnement.getPrix(),
                "nombreEcrans", abonnement.getNombreEcrans(),
                "qualiteHD", abonnement.getQualiteHD(),
                "qualite4K", abonnement.getQualite4K()
        ));
    }

}