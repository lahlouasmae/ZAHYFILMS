import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Video, VideoService } from '../_services/video.service';
import { VideoCardComponent } from '../shared/video-card/video-card.component';
import { forkJoin, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

@Component({
  selector: 'app-history',
  templateUrl: './history.component.html',
  styleUrls: ['./history.component.css'],
  standalone: true,
  imports: [CommonModule, VideoCardComponent]
})
export class HistoryComponent implements OnInit {
  historyVideos: Video[] = [];
  recommendedVideos: Video[] = [];
  loading = true;
  loadingRecommendations = true;
  errorMessage = '';
  recommendationsError = '';
  showRecommendations = true;

  constructor(
    private videoService: VideoService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loadHistory();
    this.loadRecommendations();
  }

  loadHistory(): void {
    this.loading = true;
    this.errorMessage = '';
    
    this.videoService.getHistory().subscribe({
      next: (data) => {
        console.log('Historique brut chargé:', data);
        
        // Normaliser les données des vidéos
        this.historyVideos = data.map(video => this.videoService.normalizeVideo(video));
        console.log('Historique normalisé:', this.historyVideos);
        
        // Pour chaque vidéo dans l'historique, vérifier si elle est aussi dans les favoris
        if (this.historyVideos.length > 0) {
          const favoriteChecks = this.historyVideos.map(video => 
            this.videoService.checkFavorite(video.id).pipe(
              map(isFavorite => ({ videoId: video.id, isFavorite })),
              catchError(() => of({ videoId: video.id, isFavorite: false }))
            )
          );
          
          forkJoin(favoriteChecks).subscribe(results => {
            results.forEach(result => {
              const video = this.historyVideos.find(v => v.id === result.videoId);
              if (video) {
                video.isFavorite = result.isFavorite;
              }
            });
          });
        }
        
        this.loading = false;
      },
      error: (err) => {
        this.errorMessage = 'Erreur lors du chargement de l\'historique';
        console.error('Erreur:', err);
        this.loading = false;
      }
    });
  }

  loadRecommendations(): void {
    this.loadingRecommendations = true;
    this.recommendationsError = '';
    
    this.videoService.getRecommendations().subscribe({
      next: (data) => {
        console.log('Recommandations brutes chargées:', data);
        
        // Normaliser les données des vidéos recommandées
        this.recommendedVideos = data.map(video => this.videoService.normalizeVideo(video));
        console.log('Recommandations normalisées:', this.recommendedVideos);
        
        // Pour chaque vidéo recommandée, vérifier si elle est dans les favoris
        if (this.recommendedVideos.length > 0) {
          const favoriteChecks = this.recommendedVideos.map(video => 
            this.videoService.checkFavorite(video.id).pipe(
              map(isFavorite => ({ videoId: video.id, isFavorite })),
              catchError(() => of({ videoId: video.id, isFavorite: false }))
            )
          );
          
          forkJoin(favoriteChecks).subscribe(results => {
            results.forEach(result => {
              const video = this.recommendedVideos.find(v => v.id === result.videoId);
              if (video) {
                video.isFavorite = result.isFavorite;
              }
            });
          });
        }
        
        this.loadingRecommendations = false;
      },
      error: (err) => {
        this.recommendationsError = 'Erreur lors du chargement des recommandations';
        console.error('Erreur recommandations:', err);
        this.loadingRecommendations = false;
      }
    });
  }

  playVideo(video: Video): void {
    this.router.navigate(['/Films'], { 
      queryParams: { 
        videoId: video.id,
        returnTo: 'history'
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
        
        // Mettre à jour l'état des favoris localement dans les deux listes
        const updateFavoriteStatus = (videoList: Video[]) => {
          const videoInList = videoList.find(v => v.id === event.video.id);
          if (videoInList) {
            videoInList.isFavorite = event.isFavorite;
          }
        };
        
        updateFavoriteStatus(this.historyVideos);
        updateFavoriteStatus(this.recommendedVideos);
      },
      error: (err) => {
        console.error('Erreur lors de la modification des favoris:', err);
        // Restaurer l'état précédent en cas d'erreur
        const updateFavoriteStatus = (videoList: Video[]) => {
          const videoInList = videoList.find(v => v.id === event.video.id);
          if (videoInList) {
            videoInList.isFavorite = !event.isFavorite;
          }
        };
        
        updateFavoriteStatus(this.historyVideos);
        updateFavoriteStatus(this.recommendedVideos);
      }
    });
  }

  clearHistory(): void {
    if (confirm('Êtes-vous sûr de vouloir effacer tout votre historique de visionnage ?')) {
      this.videoService.clearHistory().subscribe({
        next: () => {
          this.historyVideos = [];
          console.log('Historique effacé avec succès');
        },
        error: (err) => {
          console.error('Erreur lors de la suppression de l\'historique:', err);
          this.errorMessage = 'Erreur lors de la suppression de l\'historique';
        }
      });
    }
  }

  refreshHistory(): void {
    this.loadHistory();
  }

  refreshRecommendations(): void {
    this.loadRecommendations();
  }

  toggleRecommendations(): void {
    this.showRecommendations = !this.showRecommendations;
  }

  goBack(): void {
    this.router.navigate(['/Films']);
  }
}