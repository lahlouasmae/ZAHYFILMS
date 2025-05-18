package org.example.servicenotification.listener;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.example.servicenotification.proxy.CommentServiceClient;
import org.example.servicenotification.proxy.UserServiceClient;
import org.example.servicenotification.dto.CommentNotificationMessage;
import org.example.servicenotification.proxy.VideoServiceClient;
import org.example.servicenotification.service.EmailService;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
@Slf4j
public class CommentNotificationListener {

    private final CommentServiceClient commentServiceClient;
    private final UserServiceClient userServiceClient;
    private final EmailService emailService;
    private final VideoServiceClient videoServiceClient;


    @RabbitListener(queues = "commentNotificationQueue")
    public void handleCommentNotification(CommentNotificationMessage message) {
        String videoId = message.getVideoId();
        String authorUsername = message.getUsername();

        log.info("📥 Notification reçue pour un commentaire sur la vidéo {} par l'utilisateur {}", videoId, authorUsername);

        try {
            // 1. Récupérer tous les usernames ayant déjà commenté cette vidéo
            List<String> allCommenters = commentServiceClient.getUserIdsWhoCommented(videoId);
            log.info("🔍 Tous les utilisateurs ayant commenté : {}", allCommenters);

            // 2. Exclure l'auteur du commentaire actuel (vérification explicite)
            List<String> recipientUsernames = allCommenters.stream()
                    .filter(username -> username != null && !username.trim().isEmpty()) // S'assurer que le username est valide
                    .filter(username -> !username.equals(authorUsername))
                    .distinct() // Éliminer les doublons
                    .collect(Collectors.toList());

            log.info("🔍 Utilisateurs à notifier après filtrage : {}", recipientUsernames);

            if (recipientUsernames.isEmpty()) {
                log.info("Aucun autre utilisateur à notifier.");
                return;
            }

            String videoTitle = videoServiceClient.getVideoTitle(videoId);

            // 3. Récupérer les emails des utilisateurs
            List<String> emails = userServiceClient.getEmailsByUsernames(recipientUsernames).getBody();

            // Vérifier que nous avons bien des emails
            if (emails == null || emails.isEmpty()) {
                log.warn("Aucun email récupéré pour les utilisateurs : {}", recipientUsernames);
                return;
            }

            log.info("📧 Emails à notifier : {}", emails);

            // 4. Envoyer l'email
            for (String email : emails) {
                if (email != null && !email.trim().isEmpty()) {
                    String subject = "📢 Nouveau commentaire sur une vidéo que vous avez commentée";
                    String body = """
                        <h3>Bonjour,</h3>
                        <p>Un nouveau commentaire a été ajouté par <strong>%s</strong> sur la vidéo <strong>%s</strong> que vous avez déjà commentée.</p>
                        <p>Connectez-vous pour le découvrir !</p>
                        <hr>
                        <p style="font-size:12px;color:gray;">Ceci est un message automatique. Ne pas répondre.</p>
                    """.formatted(authorUsername, videoTitle);

                    emailService.sendEmail(email, subject, body);
                }
            }
        } catch (Exception e) {
            log.error("❌ Erreur lors du traitement de la notification de commentaire", e);
        }
    }
}