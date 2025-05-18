import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Video, VideoService } from '../_services/video.service';
import { VideoCardComponent } from '../shared/video-card/video-card.component';

@Component({
  selector: 'app-favorites',
  templateUrl: './favorites.component.html',
  styleUrls: ['./favorites.component.css'],
  standalone: true,
  imports: [CommonModule, VideoCardComponent]
})
export class FavoritesComponent implements OnInit {
  favorites: Video[] = [];
  recommendationsFav: Video[] = [];
  loading = true;
  loadingRecommendations = true;
  errorMessage = '';
  recommendationsError = '';

  constructor(
    private videoService: VideoService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loadFavorites();
  }

  loadFavorites(): void {
    this.loading = true;
    this.errorMessage = '';
    
    this.videoService.getFavorites().subscribe({
      next: (data) => {
        console.log('Favoris bruts chargés:', data);
        
        // Normaliser et marquer explicitement chaque vidéo comme favorite
        this.favorites = data.map(video => ({
          ...this.videoService.normalizeVideo(video),
          isFavorite: true  // Ces vidéos sont déjà des favoris
        }));
        
        console.log('Favoris normalisés:', this.favorites);
        this.loading = false;
        
        // Charger les recommandations basées sur les favoris après le chargement des favoris
        if (this.favorites.length > 0) {
          this.loadRecommendationsFav();
        } else {
          this.loadingRecommendations = false;
        }
      },
      error: (err) => {
        this.errorMessage = 'Erreur lors du chargement des favoris';
        console.error('Erreur:', err);
        this.loading = false;
        this.loadingRecommendations = false;
      }
    });
  }

  loadRecommendationsFav(): void {
    this.loadingRecommendations = true;
    this.recommendationsError = '';
    
    this.videoService.getRecommendationsFav().subscribe({
      next: (data) => {
        console.log('Recommandations favoris brutes chargées:', data);
        
        // Traiter chaque vidéo et s'assurer que niveauAbonnementRequis est correctement préservé
        this.recommendationsFav = data.map(video => {
          const normalizedVideo = this.videoService.normalizeVideo({...video});
          
          // S'assurer que le niveau d'abonnement est préservé
          if (video.niveauAbonnementRequis) {
            normalizedVideo.niveauAbonnementRequis = video.niveauAbonnementRequis;
          }
          
          // Pour déboguer
          console.log('Vidéo originale niveauAbonnementRequis:', video.niveauAbonnementRequis);
          console.log('Vidéo normalisée niveauAbonnementRequis:', normalizedVideo.niveauAbonnementRequis);
          
          return normalizedVideo;
        });
        
        // Vérifier le statut favori pour chaque recommandation
        this.checkFavoriteStatus(this.recommendationsFav);
        
        // Filtrer pour éviter les doublons avec les favoris existants
        this.recommendationsFav = this.recommendationsFav.filter(rec => 
          !this.favorites.some(fav => fav.id === rec.id)
        );
        
        console.log('Recommandations favoris finales:', this.recommendationsFav);
        this.loadingRecommendations = false;
      },
      error: (err) => {
        this.recommendationsError = 'Erreur lors du chargement des recommandations';
        console.error('Erreur recommandations:', err);
        this.loadingRecommendations = false;
      }
    });
  }
  checkFavoriteStatus(videos: Video[]): void {
    videos.forEach(video => {
      this.videoService.checkFavorite(video.id).subscribe({
        next: (isFavorite) => {
          video.isFavorite = isFavorite;
        },
        error: (err) => {
          console.error(`Erreur lors de la vérification du statut favori pour ${video.id}:`, err);
        }
      });
    });
  }

  playVideo(video: Video): void {
    this.router.navigate(['/Films'], { 
      queryParams: { 
        videoId: video.id,
        returnTo: 'favorites'
      } 
    });
  }

  onFavoriteChanged(event: {video: Video, isFavorite: boolean}): void {
    const action = event.isFavorite
      ? this.videoService.addToFavorites(event.video.id)
      : this.videoService.removeFromFavorites(event.video.id);
      
    action.subscribe({
      next: () => {
        console.log('Statut favori mis à jour avec succès');
        
        if (event.isFavorite) {
          // Ajouter la vidéo aux favoris si ce n'est pas déjà le cas
          if (!this.favorites.some(v => v.id === event.video.id)) {
            // S'assurer de préserver toutes les propriétés importantes
            const updatedVideo = { 
              ...event.video, 
              isFavorite: true
            };
            this.favorites.push(updatedVideo);
          }
        } else {
          // Retirer la vidéo des favoris
          this.favorites = this.favorites.filter(v => v.id !== event.video.id);
          
          // Si la vidéo est dans les recommandations, mettre à jour son statut
          const recIndex = this.recommendationsFav.findIndex(v => v.id === event.video.id);
          if (recIndex >= 0) {
            this.recommendationsFav[recIndex].isFavorite = false;
          }
        }
        
        // Actualiser les recommandations si nécessaire
        if (!event.isFavorite && this.favorites.length > 0) {
          this.loadRecommendationsFav();
        } else if (this.favorites.length === 0) {
          // Effacer les recommandations s'il n'y a plus de favoris
          this.recommendationsFav = [];
        }
      },
      error: (err) => {
        console.error('Erreur lors de la modification des favoris:', err);
        // Restaurer l'état précédent en cas d'erreur
        if (event.video.isFavorite !== event.isFavorite) {
          event.video.isFavorite = !event.isFavorite;
        }
      }
    });
  }

  refreshFavorites(): void {
    this.loadFavorites();
  }

  goBack(): void {
    this.router.navigate(['/Films']);
  }
}
