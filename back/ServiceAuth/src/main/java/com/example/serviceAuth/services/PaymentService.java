package com.example.serviceAuth.services;

import com.example.serviceAuth.model.Payment;
import com.example.serviceAuth.model.TypeAbonnement;
import com.example.serviceAuth.model.User;
import com.example.serviceAuth.repository.PaymentRepository;
import com.example.serviceAuth.repository.TypeAbonnementRepository;
import com.example.serviceAuth.repository.UserRepository;
import com.paypal.api.payments.*;
import com.paypal.base.rest.APIContext;
import com.paypal.base.rest.PayPalRESTException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
public class PaymentService {

    @Autowired
    private APIContext apiContext;

    @Autowired
    private PaymentRepository paymentRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private TypeAbonnementRepository typeAbonnementRepository;

    public String createPayment(Long userId, Integer abonnementId, String cancelUrl, String successUrl) throws PayPalRESTException {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));

        TypeAbonnement abonnement = typeAbonnementRepository.findById(abonnementId)
                .orElseThrow(() -> new RuntimeException("Abonnement non trouvé"));

        // Création du paiement PayPal
        Amount amount = new Amount();
        amount.setCurrency("EUR");
        // Ensure the decimal format is strictly using a period as decimal separator
        amount.setTotal(String.valueOf(abonnement.getPrix()));

        Transaction transaction = new Transaction();
        transaction.setAmount(amount);
        transaction.setDescription("Abonnement " + abonnement.getNom());

        List<Transaction> transactions = new ArrayList<>();
        transactions.add(transaction);

        Payer payer = new Payer();
        payer.setPaymentMethod("paypal");

        com.paypal.api.payments.Payment payment = new com.paypal.api.payments.Payment();
        payment.setIntent("sale");
        payment.setPayer(payer);
        payment.setTransactions(transactions);

        RedirectUrls redirectUrls = new RedirectUrls();
        redirectUrls.setCancelUrl(cancelUrl);
        redirectUrls.setReturnUrl(successUrl);
        payment.setRedirectUrls(redirectUrls);

        // Exécuter le paiement et obtenir les liens
        com.paypal.api.payments.Payment createdPayment = payment.create(apiContext);

        // Enregistrer le paiement en attente dans notre base de données
        Payment paymentRecord = new Payment();
        paymentRecord.setPaymentId(createdPayment.getId());
        paymentRecord.setMontant(abonnement.getPrix());
        paymentRecord.setStatus("CREATED");
        paymentRecord.setDateCreation(LocalDateTime.now());
        paymentRecord.setUser(user);
        paymentRecord.setTypeAbonnement(abonnement);
        paymentRepository.save(paymentRecord);

        // Récupérer le lien de redirection pour l'approbation
        return createdPayment.getLinks().stream()
                .filter(link -> "approval_url".equals(link.getRel()))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("URL d'approbation non trouvée"))
                .getHref();
    }

    public void executePayment(String paymentId, String payerId) throws PayPalRESTException {
        // Récupérer le paiement de notre base de données
        Payment paymentRecord = paymentRepository.findByPaymentId(paymentId);
        if (paymentRecord == null) {
            throw new RuntimeException("Paiement non trouvé");
        }

        // Exécuter le paiement PayPal
        com.paypal.api.payments.Payment payment = new com.paypal.api.payments.Payment();
        payment.setId(paymentId);

        PaymentExecution paymentExecution = new PaymentExecution();
        paymentExecution.setPayerId(payerId);

        com.paypal.api.payments.Payment executedPayment = payment.execute(apiContext, paymentExecution);

        // Mettre à jour notre enregistrement de paiement
        paymentRecord.setPayerId(payerId);
        paymentRecord.setStatus(executedPayment.getState());
        paymentRecord.setDatePaiement(LocalDateTime.now());
        paymentRepository.save(paymentRecord);

        // Si le paiement est approuvé, mettre à jour l'abonnement de l'utilisateur
        if ("approved".equals(executedPayment.getState())) {
            User user = paymentRecord.getUser();
            user.setTypeAbonnement(paymentRecord.getTypeAbonnement());
            userRepository.save(user);
        }
    }
}