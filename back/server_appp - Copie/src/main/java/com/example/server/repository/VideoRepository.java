package com.example.server.repository;

import com.example.server.entity.Video;
import org.springframework.data.mongodb.repository.Aggregation;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface VideoRepository extends MongoRepository<Video, String> {
    List<Video> findByNiveauAbonnementRequis(String niveauAbonnementRequis);

    // Méthode pour trouver les vidéos par genre
    List<Video> findByGenre(String genre);

    // Méthode pour trouver les vidéos par niveau d'abonnement requis et genre
    List<Video> findByNiveauAbonnementRequisAndGenre(String niveauAbonnementRequis, String genre);

    // Méthode pour trouver les vidéos par niveau d'abonnement requis parmi une liste de niveaux
    List<Video> findByNiveauAbonnementRequisIn(List<String> niveauAbonnementRequis);

    // Méthode pour trouver les vidéos par niveau d'abonnement requis et genre parmi une liste de niveaux
    List<Video> findByNiveauAbonnementRequisInAndGenre(List<String> niveauAbonnementRequis, String genre);
    @Query("{ 'genres': { $in: [?0] }, 'niveauAbonnementRequis': { $lte: ?1 } }")
    List<Video> findByGenreAndSubscriptionLevel(String genre, String userSubscriptionLevel);

    @Aggregation(pipeline = {
            "{ $unwind: '$genres' }",
            "{ $group: { _id: '$genres' } }",
            "{ $project: { _id: 0, genre: '$_id' } }"
    })
    List<String> findAllUniqueGenres();
}