package com.example.serviceAuth.controller;

import com.example.serviceAuth.model.PaymentRequest;
import com.example.serviceAuth.services.PaymentService;
import com.paypal.base.rest.PayPalRESTException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import com.example.serviceAuth.services.UserDetailsImpl;
import com.example.serviceAuth.response.MessageResponse;

import java.util.Map;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/payments")
public class PaymentController {

    @Autowired
    private PaymentService paymentService;

    @PostMapping("/create")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<?> createPayment(@RequestBody PaymentRequest request) {
        try {
            // Log pour vérifier les paramètres
            System.out.println("abonnementId: " + request.getAbonnementId());
            System.out.println("cancelUrl: " + request.getCancelUrl());
            System.out.println("successUrl: " + request.getSuccessUrl());

            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
            Long userId = userDetails.getId();

            // Créer le paiement
            String approvalUrl = paymentService.createPayment(userId, request.getAbonnementId(),
                    request.getCancelUrl(), request.getSuccessUrl());

            return ResponseEntity.ok(Map.of(
                    "status", "success",
                    "redirect_url", approvalUrl
            ));
        } catch (PayPalRESTException e) {
            System.out.println("Erreur PayPal: " + e.getMessage());
            return ResponseEntity.badRequest().body(new MessageResponse("Erreur lors de la création du paiement: " + e.getMessage()));
        }
    }

    @PostMapping("/execute")
    public ResponseEntity<?> executePayment(@RequestBody Map<String, String> payload) {
        try {
            String paymentId = payload.get("paymentId");
            String payerId = payload.get("payerId");

            // Vérifier que les paramètres ne sont pas null
            if (paymentId == null || payerId == null) {
                return ResponseEntity.badRequest().body(new MessageResponse("paymentId et payerId sont requis"));
            }

            paymentService.executePayment(paymentId, payerId);
            return ResponseEntity.ok(new MessageResponse("Paiement effectué avec succès!"));
        } catch (PayPalRESTException e) {
            return ResponseEntity.badRequest().body(new MessageResponse("Erreur lors de l'exécution du paiement: " + e.getMessage()));
        } catch (Exception e) {
            // Log complet de l'erreur pour le débogage
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new MessageResponse("Erreur serveur: " + e.getMessage()));
        }
    }
}