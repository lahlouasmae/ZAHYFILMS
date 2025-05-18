package org.example.servicenotification.listener;

import lombok.RequiredArgsConstructor;
import org.example.servicenotification.client.UserClient;
import org.example.servicenotification.dto.UserDTO;
import org.example.servicenotification.dto.VideoUploadMessage;
import org.example.servicenotification.service.EmailService;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

import java.util.List;

import static org.example.servicenotification.config.RabbitMQConfig.VIDEO_UPLOAD_QUEUE;

@Component
@RequiredArgsConstructor
public class VideoUploadListener {
    private static final org.slf4j.Logger log = org.slf4j.LoggerFactory.getLogger(VideoUploadListener.class);

    private final UserClient userClient;
    private final EmailService emailService;

    @RabbitListener(queues = VIDEO_UPLOAD_QUEUE)
    public void handleVideoUpload(VideoUploadMessage message) {
        log.info("📩 Réception du message : {}", message);

        // Récupérer les utilisateurs éligibles depuis le microservice user
        List<UserDTO> utilisateurs = userClient.getEligibleUsers(message.getNiveauAbonnementRequis());

        // Envoyer un email à chaque utilisateur
        for (UserDTO user : utilisateurs) {
            String subject = "🎬 Nouvelle vidéo disponible : " + message.getTitle();
            String body = "<html><body>" +
                    "<p>Bonjour " + user.getPrenom() + ",</p>" +
                    "<p>Une nouvelle vidéo intitulée <strong>" + message.getTitle() + "</strong> est maintenant disponible.</p>" +
                    "<p><strong>Description :</strong> " + message.getDescription() + "<br>" +
                    "<strong>Genre :</strong> " + message.getGenre() + "</p>" +
                    "<p>🎬 <a href='" + message.getUrl() + "'>Cliquez ici pour la regarder</a></p>" +
                    "</body></html>";


            emailService.sendEmail(user.getEmail(), subject, body);
        }

        log.info("✅ Emails envoyés à {} utilisateurs.", utilisateurs.size());
    }
}
