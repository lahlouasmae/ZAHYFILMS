package com.example.serviceAuth.controller;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

import com.example.serviceAuth.repository.PaymentRepository;
import jakarta.transaction.Transactional;
import jakarta.validation.Valid;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import com.example.serviceAuth.model.ERole;
import com.example.serviceAuth.model.Role;
import com.example.serviceAuth.model.TypeAbonnement;
import com.example.serviceAuth.model.User;
import com.example.serviceAuth.request.SignupRequest;
import com.example.serviceAuth.response.MessageResponse;
import com.example.serviceAuth.repository.RoleRepository;
import com.example.serviceAuth.repository.TypeAbonnementRepository;
import com.example.serviceAuth.repository.UserRepository;
import org.springframework.web.server.ResponseStatusException;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/admin")
public class AdminController {
    @Autowired
    UserRepository userRepository;

    @Autowired
    RoleRepository roleRepository;

    @Autowired
    TypeAbonnementRepository typeAbonnementRepository;

    @Autowired
    PasswordEncoder encoder;
@Autowired
    PaymentRepository paymentRepository;
    @GetMapping("/users")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getAllUsers() {
        List<User> users = userRepository.findAll();
        return ResponseEntity.ok(users);
    }

    @PostMapping("/create-admin")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> createAdminUser(@Valid @RequestBody SignupRequest signupRequest) {
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

        // Créer un nouveau compte admin
        User user = new User();
        user.setUsername(signupRequest.getUsername());
        user.setEmail(signupRequest.getEmail());
        user.setPassword(encoder.encode(signupRequest.getPassword()));

        // Attribuer le rôle ADMIN
        Set<Role> roles = new HashSet<>();
        Role adminRole = roleRepository.findByName(ERole.ROLE_ADMIN)
                .orElseThrow(() -> new RuntimeException("Erreur: Role admin non trouvé."));
        roles.add(adminRole);
        user.setRoles(roles);

        userRepository.save(user);

        return ResponseEntity.ok(new MessageResponse("Administrateur créé avec succès!"));
    }

    @PostMapping("/abonnements")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> createAbonnement(@Valid @RequestBody TypeAbonnement typeAbonnement) {
        typeAbonnementRepository.save(typeAbonnement);
        return ResponseEntity.ok(new MessageResponse("Type d'abonnement créé avec succès!"));
    }

    @GetMapping("/abonnements")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getAllAbonnements() {
        List<TypeAbonnement> abonnements = typeAbonnementRepository.findAll();
        return ResponseEntity.ok(abonnements);
    }
    // Méthodes à ajouter dans votre AdminController.java

    @DeleteMapping("/users/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Transactional
    public ResponseEntity<?> deleteUser(@PathVariable Long id) {
        try {
            // Vérifier si l'utilisateur existe
            User user = userRepository.findById(id)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Utilisateur non trouvé"));

            // 1. Supprimer d'abord les paiements associés
            paymentRepository.deleteByUserId(id);

            // 2. Supprimer les autres relations si nécessaire
            // Ex: commentRepository.deleteByUserId(id);

            // 3. Finalement supprimer l'utilisateur
            userRepository.delete(user);

            return ResponseEntity.ok(new MessageResponse("Utilisateur supprimé avec succès!"));

        } catch (DataIntegrityViolationException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(new MessageResponse("Impossible de supprimer: données liées existantes"));
        } catch (ResponseStatusException e) {
            return ResponseEntity.status(e.getStatusCode())
                    .body(new MessageResponse(e.getReason()));
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(new MessageResponse("Erreur technique lors de la suppression: " + e.getMessage()));
        }
    }

    @PutMapping("/abonnements/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updateAbonnement(@PathVariable Integer id, @Valid @RequestBody TypeAbonnement typeAbonnement) {
        if (!typeAbonnementRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }

        typeAbonnement.setId(id);
        typeAbonnementRepository.save(typeAbonnement);
        return ResponseEntity.ok(new MessageResponse("Type d'abonnement mis à jour avec succès!"));
    }

    @DeleteMapping("/abonnements/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteAbonnement(@PathVariable Integer id) {
        if (!typeAbonnementRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }

        typeAbonnementRepository.deleteById(id);
        return ResponseEntity.ok(new MessageResponse("Type d'abonnement supprimé avec succès!"));
    }

    @GetMapping("/abonnements/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getAbonnementById(@PathVariable Integer id) {
        return typeAbonnementRepository.findById(id)
                .map(abonnement -> ResponseEntity.ok(abonnement))
                .orElse(ResponseEntity.notFound().build());
    }
}