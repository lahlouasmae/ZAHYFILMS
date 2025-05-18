package com.example.server.service;

import com.example.server.dto.VideoDTO;
import com.example.server.dto.VideoUploadResponse;
import com.example.server.entity.UserHistory;
import com.example.server.entity.Video;
import com.example.server.repository.VideoRepository;
import io.minio.*;
import io.minio.http.Method;
import org.apache.kafka.common.errors.ResourceNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.*;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Service
public class VideoService {
    private static final Logger logger = LoggerFactory.getLogger(VideoService.class);
    @Autowired
    private UserAbonnementService userAbonnementService;

    @Autowired
    private MinioClient minioClient;

    @Autowired
    private VideoRepository videoRepository;
    @Autowired
    private UserFavoriteService favoriteService;

    @Autowired
    private UserHistoryService historyService;
    @Value("${minio.bucketName}")
    private String bucketName;

    @Value("${minio.endpoint}")
    private String minioEndpoint;

    public double getVideoDurationInSeconds(File videoFile) throws IOException {
        ProcessBuilder builder = new ProcessBuilder(
                "C:\\ffmpeg\\bin\\ffprobe.exe", // ou le chemin complet si nécessaire
                "-v", "error",
                "-show_entries", "format=duration",
                "-of", "default=noprint_wrappers=1:nokey=1",
                videoFile.getAbsolutePath()
        );

        builder.redirectErrorStream(true);
        Process process = builder.start();

        BufferedReader reader = new BufferedReader(new InputStreamReader(process.getInputStream()));
        String line = reader.readLine();
        process.destroy();

        return line != null ? Double.parseDouble(line) : 0;
    }

    public VideoUploadResponse uploadVideo(MultipartFile file, String title, String description,
                                           String niveauAbonnementRequis, List<String> genre) throws Exception {
        logger.info("Démarrage de l'upload de la vidéo: {}", title);

        String originalFilename = file.getOriginalFilename();
        String extension = originalFilename.substring(originalFilename.lastIndexOf("."));
        String objectName = UUID.randomUUID().toString() + extension;
        String thumbnailObjectName = UUID.randomUUID().toString() + ".jpg";

        logger.info("Fichier à uploader: {} -> {}", originalFilename, objectName);

        try {
            boolean bucketExists = minioClient.bucketExists(BucketExistsArgs.builder()
                    .bucket(bucketName)
                    .build());

            if (!bucketExists) {
                logger.info("Création du bucket: {}", bucketName);
                minioClient.makeBucket(MakeBucketArgs.builder()
                        .bucket(bucketName)
                        .build());
            }

            logger.info("Début de l'upload vers MinIO...");
            InputStream inputStream = file.getInputStream();
            minioClient.putObject(
                    PutObjectArgs.builder()
                            .bucket(bucketName)
                            .object(objectName)
                            .stream(inputStream, file.getSize(), -1)
                            .contentType(file.getContentType())
                            .build()
            );
            logger.info("Upload vers MinIO terminé avec succès");

            // Create a temporary file for processing
            File tempFile = File.createTempFile("video-", ".tmp");
            file.transferTo(tempFile);

            // Generate thumbnail
            logger.info("Génération de la miniature pour la vidéo");
            File thumbnailFile = generateThumbnail(tempFile);

            // Upload the thumbnail to MinIO
            logger.info("Upload de la miniature vers MinIO");
            FileInputStream thumbnailInputStream = new FileInputStream(thumbnailFile);
            minioClient.putObject(
                    PutObjectArgs.builder()
                            .bucket(bucketName)
                            .object(thumbnailObjectName)
                            .stream(thumbnailInputStream, thumbnailFile.length(), -1)
                            .contentType("image/jpeg")
                            .build()
            );

            double durationInSeconds = getVideoDurationInSeconds(tempFile);

            // Save metadata to MongoDB
            Video video = new Video();
            video.setTitle(title);
            video.setDescription(description);
            video.setFileName(objectName);
            video.setContentType(file.getContentType());
            video.setSize(file.getSize());
            video.setUploadDate(LocalDateTime.now());
            video.setUrl(minioEndpoint + "/" + bucketName + "/" + objectName);
            video.setThumbnailUrl(minioEndpoint + "/" + bucketName + "/" + thumbnailObjectName);
            video.setNiveauAbonnementRequis(niveauAbonnementRequis);
            video.setGenre(genre); // Ajout du genre
            video.setDuration(durationInSeconds);

            Video savedVideo = videoRepository.save(video);
            logger.info("Métadonnées enregistrées dans MongoDB avec l'ID: {}", savedVideo.getId());

            // Clean up temporary files
            tempFile.delete();
            thumbnailFile.delete();

            return new VideoUploadResponse(
                    savedVideo.getId(),
                    savedVideo.getUrl(),
                    "Vidéo téléchargée avec succès"
            );
        } catch (Exception e) {
            logger.error("Erreur lors de l'upload de la vidéo: {}", e.getMessage(), e);
            throw e;
        }
    }

    public VideoDTO getVideoById(String id) throws Exception {
        Video video = videoRepository.findById(id)
                .orElseThrow(() -> new Exception("Vidéo non trouvée avec l'ID: " + id));

        // Generate presigned URL for temporary access
        String presignedUrl = minioClient.getPresignedObjectUrl(
                GetPresignedObjectUrlArgs.builder()
                        .bucket(bucketName)
                        .object(video.getFileName())
                        .method(Method.GET)
                        .expiry(60 * 60) // 1 hour
                        .build()
        );

        // Generate presigned URL for the thumbnail
        String thumbnailPresignedUrl = null;
        if (video.getThumbnailUrl() != null) {
            // Extract the object name from the full URL
            String thumbnailObjectName = video.getThumbnailUrl().substring(
                    video.getThumbnailUrl().lastIndexOf("/") + 1);

            thumbnailPresignedUrl = minioClient.getPresignedObjectUrl(
                    GetPresignedObjectUrlArgs.builder()
                            .bucket(bucketName)
                            .object(thumbnailObjectName)
                            .method(Method.GET)
                            .expiry(60 * 60) // 1 hour
                            .build()
            );
        }

        return new VideoDTO(
                video.getId(),
                video.getTitle(),
                video.getDescription(),
                presignedUrl,
                thumbnailPresignedUrl,
                video.getSize(),
                video.getUploadDate(),
                video.getNiveauAbonnementRequis(),
                video.getGenre(), // Incluez le genre ici
                video.getDuration()
        );
    }

    public List<VideoDTO> getAllVideos() throws Exception {
        logger.info("Récupération de toutes les vidéos");
        List<Video> videos = videoRepository.findAll();

        return videos.stream().map(video -> {
            try {
                // Générer une URL présignée pour chaque vidéo
                String presignedUrl = minioClient.getPresignedObjectUrl(
                        GetPresignedObjectUrlArgs.builder()
                                .bucket(bucketName)
                                .object(video.getFileName())
                                .method(Method.GET)
                                .expiry(60 * 60) // 1 hour
                                .build()
                );

                // Generate presigned URL for the thumbnail
                String thumbnailPresignedUrl = null;
                if (video.getThumbnailUrl() != null) {
                    String thumbnailObjectName = video.getThumbnailUrl().substring(
                            video.getThumbnailUrl().lastIndexOf("/") + 1);

                    thumbnailPresignedUrl = minioClient.getPresignedObjectUrl(
                            GetPresignedObjectUrlArgs.builder()
                                    .bucket(bucketName)
                                    .object(thumbnailObjectName)
                                    .method(Method.GET)
                                    .expiry(60 * 60) // 1 hour
                                    .build()
                    );
                }

                return new VideoDTO(
                        video.getId(),
                        video.getTitle(),
                        video.getDescription(),
                        presignedUrl,
                        thumbnailPresignedUrl,
                        video.getSize(),
                        video.getUploadDate(),
                        video.getNiveauAbonnementRequis(),
                        video.getGenre(), // Incluez le genre ici
                        video.getDuration()
                );
            } catch (Exception e) {
                logger.error("Erreur lors de la génération de l'URL présignée pour la vidéo {}: {}",
                        video.getId(), e.getMessage(), e);
                // En cas d'erreur, retourner l'URL stockée sans présignature
                return new VideoDTO(
                        video.getId(),
                        video.getTitle(),
                        video.getDescription(),
                        video.getUrl(),
                        video.getThumbnailUrl(),
                        video.getSize(),
                        video.getUploadDate(),
                        video.getNiveauAbonnementRequis(),
                        video.getGenre(), // Incluez le genre ici
                        video.getDuration()
                );
            }
        }).collect(Collectors.toList());
    }

    public List<Video> getVideosByGenre(String genre) {
        return videoRepository.findAll().stream()
                .filter(video -> video.getGenre() != null && video.getGenre().contains(genre))
                .collect(Collectors.toList());
    }

    private int compareAbonnement(String niveauVideo, String niveauUser) {
        List<String> niveaux = Arrays.asList("BASIC", "PREMIUM", "VIP");
        return Integer.compare(niveaux.indexOf(niveauVideo), niveaux.indexOf(niveauUser));
    }


    public List<String> getAllGenres() {
        logger.info("Récupération de tous les genres disponibles");
        List<Video> allVideos = videoRepository.findAll();
        return allVideos.stream()
                .filter(video -> video.getGenre() != null) // Filtrer les vidéos sans genre
                .flatMap(video -> video.getGenre().stream()) // Aplatir toutes les listes de genres
                .filter(genre -> genre != null && !genre.isEmpty())
                .distinct()
                .collect(Collectors.toList());
    }
    public List<VideoDTO> getVideosByUserAbonnement(Long userId, String token) {
        // Récupérer l'abonnement de l'utilisateur
        Map<String, Object> abonnement = userAbonnementService.getUserAbonnement(userId, token);
        logger.info("Abonnement récupéré: {}", abonnement);

        // Si pas d'abonnement, retourner seulement les vidéos gratuites
        if (abonnement == null || abonnement.get("abonnementNom") == null) {
            logger.info("Pas d'abonnement, retour des vidéos gratuites uniquement");
            List<Video> gratuitVideos = videoRepository.findByNiveauAbonnementRequis("GRATUIT");
            return convertVideosToDTO(gratuitVideos);
        }

        String abonnementNom = (String) abonnement.get("abonnementNom");
        logger.info("Nom de l'abonnement: {}", abonnementNom);

        // Logique de filtrage selon le nom de l'abonnement
        List<String> niveauxAccessibles = new ArrayList<>();
        niveauxAccessibles.add("GRATUIT");

        switch (abonnementNom.toUpperCase()) {
            case "BASIC":
                niveauxAccessibles.add("BASIC");
                break;
            case "PREMIUM":
                niveauxAccessibles.add("BASIC");
                niveauxAccessibles.add("PREMIUM");
                break;
            case "ULTIMATE":
                niveauxAccessibles.add("BASIC");
                niveauxAccessibles.add("PREMIUM");
                niveauxAccessibles.add("ULTIMATE");
                break;
        }

        logger.info("Niveaux accessibles: {}", niveauxAccessibles);

        List<Video> allVideos = videoRepository.findAll();
        logger.info("Nombre total de vidéos: {}", allVideos.size());

        List<Video> filteredVideos = allVideos.stream()
                .filter(video -> {
                    String niveau = video.getNiveauAbonnementRequis();
                    logger.debug("Vidéo ID: {}, niveau requis: '{}'", video.getId(), niveau);
                    boolean match = niveauxAccessibles.stream()
                            .anyMatch(n -> n.equalsIgnoreCase(niveau));
                    logger.debug("Match: {}", match);
                    return match;
                })
                .collect(Collectors.toList());

        logger.info("Nombre de vidéos après filtrage: {}", filteredVideos.size());
        List<VideoDTO> videoDTOs = convertVideosToDTO(filteredVideos);
        return enrichVideosWithUserInfo(videoDTOs, userId);
    }

    public List<VideoDTO> getVideosByUserAbonnementAndGenre(Long userId, String token, String genre) {
        // Récupérer toutes les vidéos accessibles à l'utilisateur
        List<VideoDTO> allAccessibleVideos = getVideosByUserAbonnement(userId, token);

        // Filtrer par genre (en vérifiant si le genre recherché est dans la liste des genres de la vidéo)
        return allAccessibleVideos.stream()
                .filter(video -> video.getGenre() != null &&
                        video.getGenre().stream()
                                .anyMatch(g -> g.equalsIgnoreCase(genre)))
                .collect(Collectors.toList());
    }

    // Méthode pour convertir les vidéos en DTO
    public List<VideoDTO> convertVideosToDTO(List<Video> videos) {
        return videos.stream().map(video -> {
            try {
                // Générer une URL présignée pour chaque vidéo
                String presignedUrl = minioClient.getPresignedObjectUrl(
                        GetPresignedObjectUrlArgs.builder()
                                .bucket(bucketName)
                                .object(video.getFileName())
                                .method(Method.GET)
                                .expiry(60 * 60) // 1 hour
                                .build()
                );

                // Generate presigned URL for the thumbnail
                String thumbnailPresignedUrl = null;
                if (video.getThumbnailUrl() != null) {
                    String thumbnailObjectName = video.getThumbnailUrl().substring(
                            video.getThumbnailUrl().lastIndexOf("/") + 1);

                    thumbnailPresignedUrl = minioClient.getPresignedObjectUrl(
                            GetPresignedObjectUrlArgs.builder()
                                    .bucket(bucketName)
                                    .object(thumbnailObjectName)
                                    .method(Method.GET)
                                    .expiry(60 * 60) // 1 hour
                                    .build()
                    );
                }

                return new VideoDTO(
                        video.getId(),
                        video.getTitle(),
                        video.getDescription(),
                        presignedUrl,
                        thumbnailPresignedUrl,
                        video.getSize(),
                        video.getUploadDate(),
                        video.getNiveauAbonnementRequis(),
                        video.getGenre(), // Incluez le genre ici
                        video.getDuration()
                );
            } catch (Exception e) {
                logger.error("Erreur lors de la génération de l'URL présignée pour la vidéo {}: {}",
                        video.getId(), e.getMessage(), e);
                // En cas d'erreur, retourner l'URL stockée sans présignature
                return new VideoDTO(
                        video.getId(),
                        video.getTitle(),
                        video.getDescription(),
                        video.getUrl(),
                        video.getThumbnailUrl(),
                        video.getSize(),
                        video.getUploadDate(),
                        video.getNiveauAbonnementRequis(),
                        video.getGenre(), // Incluez le genre ici
                        video.getDuration()
                );
            }
        }).collect(Collectors.toList());
    }

    // Méthode pour enrichir les vidéos avec les infos utilisateur
    public List<VideoDTO> enrichVideosWithUserInfo(List<VideoDTO> videos, Long userId) {
        if (videos == null || videos.isEmpty()) {
            return new ArrayList<>();
        }

        for (VideoDTO videoDTO : videos) {
            // Vérifier si la vidéo est en favori
            videoDTO.setIsFavorite(favoriteService.isFavorite(userId, videoDTO.getId()));

            // Récupérer la progression
            UserHistory progress = historyService.getVideoProgress(userId, videoDTO.getId());
            if (progress != null) {
                videoDTO.setProgress(progress.getWatchDuration());
                videoDTO.setCompleted(progress.getCompleted());
                videoDTO.setLastViewed(progress.getDateViewed());
            } else {
                videoDTO.setProgress(0);
                videoDTO.setCompleted(false);
            }
        }

        return videos;
    }

    public File generateThumbnail(File videoFile) throws IOException, InterruptedException {
        File thumbnail = File.createTempFile("thumb-", ".jpg");

        // Log pour debug
        logger.info("Génération de miniature - Fichier vidéo: {}", videoFile.getAbsolutePath());
        logger.info("Génération de miniature - Fichier cible: {}", thumbnail.getAbsolutePath());

        ProcessBuilder builder = new ProcessBuilder(
                "C:\\ffmpeg\\bin\\ffmpeg.exe",
                "-ss", "00:00:03",
                "-i", videoFile.getAbsolutePath(),
                "-frames:v", "1",
                "-q:v", "2",
                "-y",
                thumbnail.getAbsolutePath()
        );

        builder.redirectErrorStream(true);
        Process process = builder.start();

        // Capture et log de la sortie de FFmpeg
        BufferedReader reader = new BufferedReader(new InputStreamReader(process.getInputStream()));
        String line;
        StringBuilder output = new StringBuilder();
        while ((line = reader.readLine()) != null) {
            output.append(line).append("\n");
        }
        logger.info("Sortie FFmpeg: {}", output.toString());

        int exitCode = process.waitFor();
        logger.info("FFmpeg a terminé avec le code: {}", exitCode);

        // Vérifier si le fichier de miniature existe et a une taille
        if (thumbnail.exists() && thumbnail.length() > 0) {
            logger.info("Miniature générée avec succès: {} (taille: {} octets)",
                    thumbnail.getAbsolutePath(), thumbnail.length());
        } else {
            logger.error("Échec de génération de la miniature ou fichier vide");
        }

        return thumbnail;
    }

    public void deleteVideo(String id) throws Exception {
        logger.info("Suppression de la vidéo avec l'ID: {}", id);

        Video video = videoRepository.findById(id)
                .orElseThrow(() -> new Exception("Vidéo non trouvée avec l'ID: " + id));

        // Supprimer le fichier vidéo de MinIO
        minioClient.removeObject(
                RemoveObjectArgs.builder()
                        .bucket(bucketName)
                        .object(video.getFileName())
                        .build()
        );

        // Supprimer la miniature de MinIO si elle existe
        if (video.getThumbnailUrl() != null) {
            String thumbnailObjectName = video.getThumbnailUrl().substring(
                    video.getThumbnailUrl().lastIndexOf("/") + 1);

            minioClient.removeObject(
                    RemoveObjectArgs.builder()
                            .bucket(bucketName)
                            .object(thumbnailObjectName)
                            .build()
            );
        }

        // Supprimer la vidéo de la base de données
        videoRepository.deleteById(id);
        logger.info("Vidéo supprimée avec succès");
    }

    // Méthode pour la mise à jour des métadonnées
    public VideoDTO updateVideoMetadata(String id, Map<String, Object> metadata) {
        logger.info("Mise à jour des métadonnées de la vidéo avec l'ID: {}", id);

        // Trouver la vidéo ou lever une exception
        Video video = videoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Vidéo non trouvée avec l'ID: " + id));

        // Mise à jour des métadonnées avec vérification de type
        if (metadata.containsKey("title")) {
            video.setTitle(convertToString(metadata.get("title")));
        }

        if (metadata.containsKey("description")) {
            video.setDescription(convertToString(metadata.get("description")));
        }

        if (metadata.containsKey("niveauAbonnementRequis")) {
            video.setNiveauAbonnementRequis(convertToString(metadata.get("niveauAbonnementRequis")));
        }

        // Gestion spécifique pour le genre (List<String>)
        if (metadata.containsKey("genre")) {
            video.setGenre(convertToStringList(metadata.get("genre")));
        }

        // Sauvegarder les modifications
        Video updatedVideo = videoRepository.save(video);
        logger.info("Métadonnées mises à jour avec succès pour la vidéo ID: {}", id);

        // Retourner la vidéo mise à jour sous forme de DTO
        return convertToDto(updatedVideo);
    }

    // Méthodes utilitaires pour la conversion de type
    private String convertToString(Object value) {
        if (value == null) {
            return null;
        }
        if (value instanceof String) {
            return (String) value;
        }
        throw new IllegalArgumentException("La valeur doit être une chaîne de caractères");
    }

    private List<String> convertToStringList(Object value) {
        if (value == null) {
            return null;
        }

        if (value instanceof List) {
            // Vérifier que tous les éléments sont des String
            List<?> list = (List<?>) value;
            if (list.stream().allMatch(element -> element instanceof String)) {
                return (List<String>) value;
            }
            throw new IllegalArgumentException("Tous les éléments de la liste doivent être des chaînes de caractères");
        }

        if (value instanceof String) {
            // Convertir une String séparée par des virgules en List<String>
            return Arrays.asList(((String) value).split("\\s*,\\s*"));
        }

        throw new IllegalArgumentException("Le genre doit être une liste de chaînes ou une chaîne séparée par des virgules");
    }

    private VideoDTO convertToDto(Video video) {
        // Implémentez la conversion selon votre logique
        VideoDTO dto = new VideoDTO();
        dto.setId(video.getId());
        dto.setTitle(video.getTitle());
        dto.setDescription(video.getDescription());
        dto.setNiveauAbonnementRequis(video.getNiveauAbonnementRequis());
        dto.setGenre(video.getGenre());
        // Ajoutez les autres champs nécessaires
        return dto;
    }
    public VideoDTO updateVideo(String id, MultipartFile file, Map<String, Object> metadata) throws Exception {
        logger.info("Mise à jour complète de la vidéo avec l'ID: {}", id);

        // Récupérer la vidéo existante
        Video video = videoRepository.findById(id)
                .orElseThrow(() -> new Exception("Vidéo non trouvée avec l'ID: " + id));

        // Mise à jour des métadonnées si fournies
        if (metadata != null) {
            if (metadata.containsKey("title")) {
                video.setTitle((String) metadata.get("title"));
            }

            if (metadata.containsKey("description")) {
                video.setDescription((String) metadata.get("description"));
            }

            if (metadata.containsKey("niveauAbonnementRequis")) {
                video.setNiveauAbonnementRequis((String) metadata.get("niveauAbonnementRequis"));
            }

            // Ajout de la mise à jour du genre
            if (metadata.containsKey("genre")) {
                video.setGenre((List<String>) metadata.get("genre"));
            }
        }

        // Si pas de fichier à mettre à jour, on sauvegarde juste les métadonnées
        if (file == null) {
            Video updatedVideo = videoRepository.save(video);
            return getVideoById(id);
        }

        // Sinon, on procède à la mise à jour du fichier
        String originalFilename = file.getOriginalFilename();
        String extension = originalFilename.substring(originalFilename.lastIndexOf("."));
        String oldObjectName = video.getFileName();
        String oldThumbnailObjectName = null;
        if (video.getThumbnailUrl() != null) {
            oldThumbnailObjectName = video.getThumbnailUrl().substring(
                    video.getThumbnailUrl().lastIndexOf("/") + 1);
        }

        // Générer de nouveaux noms pour les fichiers
        String newObjectName = UUID.randomUUID().toString() + extension;
        String newThumbnailObjectName = UUID.randomUUID().toString() + ".jpg";

        try {
            // 1. Uploader le nouveau fichier vidéo
            logger.info("Début de l'upload du nouveau fichier vers MinIO...");
            InputStream inputStream = file.getInputStream();
            minioClient.putObject(
                    PutObjectArgs.builder()
                            .bucket(bucketName)
                            .object(newObjectName)
                            .stream(inputStream, file.getSize(), -1)
                            .contentType(file.getContentType())
                            .build()
            );
            logger.info("Upload vers MinIO terminé avec succès");

            // 2. Créer une miniature pour le nouveau fichier
            File tempFile = File.createTempFile("video-update-", ".tmp");
            file.transferTo(tempFile);

            logger.info("Génération de la nouvelle miniature pour la vidéo");
            File thumbnailFile = generateThumbnail(tempFile);

            // Upload la nouvelle miniature vers MinIO
            logger.info("Upload de la nouvelle miniature vers MinIO");
            FileInputStream thumbnailInputStream = new FileInputStream(thumbnailFile);
            minioClient.putObject(
                    PutObjectArgs.builder()
                            .bucket(bucketName)
                            .object(newThumbnailObjectName)
                            .stream(thumbnailInputStream, thumbnailFile.length(), -1)
                            .contentType("image/jpeg")
                            .build()
            );

            // 3. Calculer la nouvelle durée
            double durationInSeconds = getVideoDurationInSeconds(tempFile);

            // 4. Mettre à jour les attributs liés au fichier vidéo
            video.setFileName(newObjectName);
            video.setContentType(file.getContentType());
            video.setSize(file.getSize());
            video.setUrl(minioEndpoint + "/" + bucketName + "/" + newObjectName);
            video.setThumbnailUrl(minioEndpoint + "/" + bucketName + "/" + newThumbnailObjectName);
            video.setDuration(durationInSeconds);
            video.setUploadDate(LocalDateTime.now()); // Optionnel: mise à jour de la date

            Video savedVideo = videoRepository.save(video);
            logger.info("Vidéo mise à jour dans MongoDB avec l'ID: {}", savedVideo.getId());

            // 5. Nettoyer les anciens fichiers
            try {
                // Supprimer l'ancien fichier vidéo de MinIO
                minioClient.removeObject(
                        RemoveObjectArgs.builder()
                                .bucket(bucketName)
                                .object(oldObjectName)
                                .build()
                );

                // Supprimer l'ancienne miniature si elle existe
                if (oldThumbnailObjectName != null) {
                    minioClient.removeObject(
                            RemoveObjectArgs.builder()
                                    .bucket(bucketName)
                                    .object(oldThumbnailObjectName)
                                    .build()
                    );
                }
            } catch (Exception e) {
                logger.warn("Erreur lors de la suppression des anciens fichiers: {}", e.getMessage());
                // Continuer malgré l'erreur - les nouveaux fichiers sont déjà en place
            }

            // 6. Nettoyer les fichiers temporaires
            tempFile.delete();
            thumbnailFile.delete();

            // 7. Retourner la vidéo mise à jour
            return getVideoById(id);

        } catch (Exception e) {
            logger.error("Erreur lors de la mise à jour de la vidéo: {}", e.getMessage(), e);
            throw e;
        }
    }
}