import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { VideoCardComponent } from '../shared/video-card/video-card.component';
import { RecommendationService } from '../_services/recommendation.service';
import { Video, VideoService } from '../_services/video.service';

@Component({
  selector: 'app-recommendations',
  standalone: true,
  imports: [CommonModule, VideoCardComponent],
  templateUrl: './recommendation.component.html',
  styleUrls: ['./recommendation.component.css']
})
export class RecommendationsComponent implements OnInit {
  recommendations: Video[] = [];
  isLoading = true;
  hasError = false;
  errorMessage = '';
  
  constructor(
    private recommendationService: RecommendationService,
    private videoService: VideoService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.loadRecommendations();
  }

  loadRecommendations(): void {
    this.isLoading = true;
    this.hasError = false;

    this.recommendationService.getCombinedRecommendations().subscribe({
      next: (data) => {
        this.recommendations = data.map(rec => this.convertToVideo(rec));
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des recommandations:', error);
        this.hasError = true;
        this.errorMessage = 'Impossible de charger les recommandations. Veuillez réessayer plus tard.';
        this.isLoading = false;
      }
    });
  }

  convertToVideo(recommendation: any): Video {
    // Store the score as a local variable if needed
    const score = recommendation.score;
       
    return {
      id: recommendation.videoId,
      title: recommendation.title,
      description: recommendation.description,
      thumbnailUrl: recommendation.thumbnailUrl,
      genre: recommendation.genre || [],
      duration: recommendation.duration || 0,
      // Required properties from Video interface with default values
      url: '',
      size: 0,
      uploadDate: new Date(),
      niveauAbonnementRequis: recommendation.niveauAbonnementRequis || 'Standard', // Utilisation de la valeur de la recommandation ou 'Standard' par défaut
      // Optional properties
      isFavorite: false,
      progress: 0,
      completed: false
    };
  }

  handlePlayVideo(video: Video): void {
    this.router.navigate(['/home'], {
      queryParams: { 
        videoId: video.id,
        returnTo: 'recommendations'
      }
    });
  }

  handleFavoriteChanged(event: { video: Video; isFavorite: boolean }): void {
    const action = event.isFavorite
      ? this.videoService.addToFavorites(event.video.id)
      : this.videoService.removeFromFavorites(event.video.id);
  
    action.subscribe({
      next: () => {
        console.log('Favori mis à jour avec succès');
        const videoInList = this.recommendations.find(v => v.id === event.video.id);
        if (videoInList) {
          videoInList.isFavorite = event.isFavorite;
        }
      },
      error: (err) => {
        console.error('Erreur lors de la modification des favoris:', err);
      }
    });
  }

  retryLoading(): void {
    this.loadRecommendations();
  }

  formatDuration(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  }
}