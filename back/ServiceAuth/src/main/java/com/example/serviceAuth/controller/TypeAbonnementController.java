package com.example.serviceAuth.controller;


import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.example.serviceAuth.model.TypeAbonnement;
import com.example.serviceAuth.repository.TypeAbonnementRepository;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/abonnements")
public class TypeAbonnementController {

    @Autowired
    TypeAbonnementRepository typeAbonnementRepository;

    // Endpoint public pour obtenir la liste des abonnements
    @GetMapping
    public ResponseEntity<?> getAllAbonnements() {
        List<TypeAbonnement> abonnements = typeAbonnementRepository.findAll();
        return ResponseEntity.ok(abonnements);
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getAbonnementById(@PathVariable Integer id) {
        TypeAbonnement abonnement = typeAbonnementRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Abonnement non trouvé"));
        return ResponseEntity.ok(abonnement);
    }
}
