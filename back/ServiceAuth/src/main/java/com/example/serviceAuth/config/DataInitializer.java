package com.example.serviceAuth.config;


import java.util.HashSet;
import java.util.Set;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import com.example.serviceAuth.model.ERole;
import com.example.serviceAuth.model.Role;
import com.example.serviceAuth.model.TypeAbonnement;
import com.example.serviceAuth.model.User;
import com.example.serviceAuth.repository.RoleRepository;
import com.example.serviceAuth.repository.TypeAbonnementRepository;
import com.example.serviceAuth.repository.UserRepository;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private TypeAbonnementRepository typeAbonnementRepository;

    @Autowired
    private PasswordEncoder encoder;

    @Override
    public void run(String... args) throws Exception {
        // Initialiser les rôles s'ils n'existent pas
        if (roleRepository.count() == 0) {
            Role adminRole = new Role();
            adminRole.setName(ERole.ROLE_ADMIN);
            roleRepository.save(adminRole);

            Role userRole = new Role();
            userRole.setName(ERole.ROLE_USER);
            roleRepository.save(userRole);

            System.out.println("Rôles initialisés");
        }

        // Créer un admin par défaut si aucun admin n'existe
        if (userRepository.count() == 0) {
            User adminUser = new User();
            adminUser.setUsername("admin");
            adminUser.setEmail("admin@streaming.com");
            adminUser.setPassword(encoder.encode("admin123"));
            adminUser.setNom("Admin");
            adminUser.setPrenom("Super");

            Role adminRole = roleRepository.findByName(ERole.ROLE_ADMIN)
                    .orElseThrow(() -> new RuntimeException("Erreur: Role admin non trouvé."));

            Set<Role> roles = new HashSet<>();
            roles.add(adminRole);
            adminUser.setRoles(roles);

            userRepository.save(adminUser);

            System.out.println("Admin par défaut créé");
        }

        // Initialiser les types d'abonnements de base
        if (typeAbonnementRepository.count() == 0) {
            TypeAbonnement basic = new TypeAbonnement();
            basic.setNom("Basic");
            basic.setPrix(50.99);
            basic.setNombreEcrans(1);
            basic.setQualiteHD(false);
            basic.setQualite4K(false);
            typeAbonnementRepository.save(basic);

            TypeAbonnement standard = new TypeAbonnement();
            standard.setNom("Standard");
            standard.setPrix(100.99);
            standard.setNombreEcrans(2);
            standard.setQualiteHD(true);
            standard.setQualite4K(false);
            typeAbonnementRepository.save(standard);

            TypeAbonnement premium = new TypeAbonnement();
            premium.setNom("Premium");
            premium.setPrix(150.99);
            premium.setNombreEcrans(4);
            premium.setQualiteHD(true);
            premium.setQualite4K(true);
            typeAbonnementRepository.save(premium);

            System.out.println("Types d'abonnements initialisés");
        }
    }
}
