package com.example.server.config;

import io.minio.MinioClient;
import io.minio.BucketExistsArgs;
import io.minio.MakeBucketArgs;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;


@Configuration
public class MinioConfig {
    private static final Logger logger = LoggerFactory.getLogger(MinioConfig.class);

    @Value("${minio.endpoint}")
    private String endpoint;

    @Value("${minio.accessKey}")
    private String accessKey;

    @Value("${minio.secretKey}")
    private String secretKey;

    @Value("${minio.bucketName}")
    private String bucketName;

    @Bean
    public MinioClient minioClient() {
        logger.info("Initialisation du client MinIO avec endpoint: {}", endpoint);

        try {
            MinioClient minioClient = MinioClient.builder()
                    .endpoint(endpoint)
                    .credentials(accessKey, secretKey)
                    .build();

            logger.info("Client MinIO initialisé avec succès");
            // La vérification du bucket est déplacée dans le service
            // pour simplifier l'initialisation du bean

            return minioClient;
        } catch (Exception e) {
            logger.error("Erreur lors de l'initialisation du client MinIO: {}", e.getMessage(), e);
            throw new RuntimeException("Erreur d'initialisation du client MinIO: " + e.getMessage(), e);
        }
    }
}
