package com.example.serviceAuth.repository;

import com.example.serviceAuth.model.TypeAbonnement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface TypeAbonnementRepository extends JpaRepository<TypeAbonnement, Integer> {
    Optional<TypeAbonnement> findByNom(String nom);
}
