import { Component, OnInit, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Video, VideoService, VideoProgressDTO } from '../_services/video.service';
import { VideoCardComponent } from '../shared/video-card/video-card.component';
import { forkJoin, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

interface VideosByGenre {
  genre: string[];
  videos: Video[];
}

@Component({
  selector: 'app-home',
  standalone: true,
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  imports: [CommonModule, VideoCardComponent]
})
export class HomeComponent implements OnInit, OnDestroy {
  @ViewChild('videoPlayer') videoPlayer?: ElementRef<HTMLVideoElement>;

  allVideos: Video[] = [];
  videosByGenre: VideosByGenre[] = [];
  genres: string[] = [];
  loading = true;
  errorMessage = '';
  selectedVideo: Video | null = null;
  currentProgress: VideoProgressDTO = { watchDuration: 0, completed: false };
  progressUpdateInterval: any;
  progressSaveTimeout: any;
  returnTo: string | null = null;

  constructor(
    private videoService: VideoService,
    private router: Router,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    this.loadVideos();

    this.route.queryParams.subscribe(params => {
      const videoId = params['videoId'];
      this.returnTo = params['returnTo'];
      
      if (videoId) {
        this.loadVideoById(videoId);
      }
    });
  }

  ngOnDestroy(): void {
    this.clearIntervals();
  }

  loadVideos(): void {
    this.loading = true;
    this.errorMessage = '';
    
    // D'abord, charger tous les genres disponibles
    this.videoService.getAllGenres().subscribe({
      next: (genres) => {
        console.log('Genres disponibles:', genres);
        this.genres = genres;
        
        // Maintenant, charger toutes les vidéos
        this.videoService.getUserVideos().subscribe({
          next: (videos) => {
            console.log('Vidéos brutes chargées:', videos);
            // Normaliser les données des vidéos
            this.allVideos = videos.map(video => this.videoService.normalizeVideo(video));
            console.log('Vidéos normalisées:', this.allVideos);
            
            // Organiser par genre
            this.organizeVideosByGenre();
            this.loading = false;
          },
          error: (err) => {
            console.error('Erreur lors du chargement des vidéos:', err);
            this.errorMessage = 'Impossible de charger les vidéos';
            this.loading = false;
          }
        });
      },
      error: (err) => {
        console.error('Erreur lors du chargement des genres:', err);
        this.errorMessage = 'Impossible de charger les genres';
        this.loading = false;
      }
    });
  }

  organizeVideosByGenre(): void {
    this.videosByGenre = [];
  
    this.genres.forEach(genre => {
      const videosForGenre = this.allVideos.filter(video => video.genre.includes(genre));
      if (videosForGenre.length > 0) {
        this.videosByGenre.push({
          genre: [genre],
          videos: videosForGenre
        });
      }
    });
  }
  

  loadVideoById(videoId: string): void {
    console.log('Chargement de la vidéo ID:', videoId);
    
    this.videoService.getVideoById(videoId).subscribe({
      next: (video) => {
        console.log('Vidéo brute chargée:', video);
        // Normaliser la vidéo
        this.selectedVideo = this.videoService.normalizeVideo(video);
        console.log('Vidéo normalisée:', this.selectedVideo);
        
        // Vérifier si la vidéo est en favoris
        this.checkFavoriteStatus(videoId);
        
        // Charger la progression de la vidéo
        this.loadVideoProgress(videoId);
      },
      error: (err) => {
        console.error('Erreur lors du chargement de la vidéo:', err);
        this.errorMessage = 'Impossible de charger la vidéo';
      }
    });
  }

  checkFavoriteStatus(videoId: string): void {
    this.videoService.checkFavorite(videoId).subscribe({
      next: (isFavorite) => {
        if (this.selectedVideo) {
          this.selectedVideo.isFavorite = isFavorite;
        }
      },
      error: (err) => console.error('Erreur vérification favoris:', err)
    });
  }

  loadVideoProgress(videoId: string): void {
    this.videoService.getVideoProgress(videoId).subscribe({
      next: (progress) => {
        console.log('Progression chargée:', progress);
        this.currentProgress = progress;
        
        if (this.selectedVideo) {
          this.selectedVideo.progress = progress.watchDuration;
          this.selectedVideo.completed = progress.completed;
        }
        
        // Définir la position de lecture après chargement de la vidéo
        setTimeout(() => this.setVideoPosition(), 500);
      },
      error: (err) => console.error('Erreur chargement progression:', err)
    });
  }

  setVideoPosition(): void {
    if (this.videoPlayer?.nativeElement && this.currentProgress.watchDuration > 0) {
      console.log('Définition de la position de lecture à:', this.currentProgress.watchDuration);
      this.videoPlayer.nativeElement.currentTime = this.currentProgress.watchDuration;
    }
  }

  playVideo(video: Video): void {
    console.log('Lecture de la vidéo:', video.id);
    
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { videoId: video.id },
      queryParamsHandling: 'merge'
    });

    this.loadVideoById(video.id);
  }

  closeVideoPlayer(): void {
    this.saveProgress();

    if (this.returnTo === 'favorites') {
      this.router.navigate(['/Favoris']);
    } else if (this.returnTo === 'history') {
      this.router.navigate(['/History']);
    } else {
      this.router.navigate([], {
        relativeTo: this.route,
        queryParams: { videoId: null, returnTo: null },
        queryParamsHandling: 'merge'
      });
    }

    this.selectedVideo = null;
    this.currentProgress = { watchDuration: 0, completed: false };
    this.clearIntervals();
  }

  updateProgress(): void {
    if (!this.videoPlayer?.nativeElement || !this.selectedVideo) return;

    const player = this.videoPlayer.nativeElement;
    const currentTime = Math.floor(player.currentTime);
    
    // N'enregistrer que si la position a changé significativement
    if (Math.abs(currentTime - this.currentProgress.watchDuration) >= 5) {
      console.log('Mise à jour de la progression:', currentTime);
      this.currentProgress.watchDuration = currentTime;
      
      if (this.progressSaveTimeout) {
        clearTimeout(this.progressSaveTimeout);
      }
      
      // Enregistrer la progression toutes les 5 secondes
      this.progressSaveTimeout = setTimeout(() => {
        this.saveProgress();
      }, 5000);
    }
  }

  saveProgress(): void {
    if (!this.selectedVideo) return;

    console.log('Sauvegarde de la progression:', this.currentProgress);
    this.videoService.updateProgress(
      this.selectedVideo.id, 
      this.currentProgress
    ).subscribe({
      next: () => console.log('Progression sauvegardée'),
      error: (err) => console.error('Erreur sauvegarde progression:', err)
    });
  }

  videoEnded(): void {
    if (!this.selectedVideo) return;

    this.currentProgress.completed = true;
    this.saveProgress();
  }

  videoLoaded(): void {
    if (this.videoPlayer?.nativeElement && this.currentProgress.watchDuration > 0) {
      console.log('Définition de la position initiale à:', this.currentProgress.watchDuration);
      this.videoPlayer.nativeElement.currentTime = this.currentProgress.watchDuration;
    }
    
    // Démarrer l'intervalle de mise à jour de la progression
    this.progressUpdateInterval = setInterval(() => {
      this.saveProgress();
    }, 30000); // Sauvegarder toutes les 30 secondes
  }

  toggleFavorite(video: Video): void {
    if (!video) return;

    const action = video.isFavorite
      ? this.videoService.removeFromFavorites(video.id)
      : this.videoService.addToFavorites(video.id);

    action.subscribe({
      next: () => {
        video.isFavorite = !video.isFavorite;
      },
      error: (err) => console.error('Erreur lors de la modification des favoris:', err)
    });
  }

  onFavoriteChanged(event: { video: Video, isFavorite: boolean }): void {
    console.log('Changement de favori détecté:', event);
    
    // Appeler le service pour mettre à jour le statut de favori
    const action = event.isFavorite
      ? this.videoService.addToFavorites(event.video.id)
      : this.videoService.removeFromFavorites(event.video.id);
  
    action.subscribe({
      next: () => {
        console.log('Favori mis à jour avec succès');
        // Mettre à jour l'état des favoris dans toutes les listes
        const videoInList = this.allVideos.find(v => v.id === event.video.id);
        if (videoInList) {
          videoInList.isFavorite = event.isFavorite;
        }
  
        if (this.selectedVideo && this.selectedVideo.id === event.video.id) {
          this.selectedVideo.isFavorite = event.isFavorite;
        }
      },
      error: (err) => {
        console.error('Erreur lors de la modification des favoris:', err);
        // En cas d'erreur, on ne met pas à jour l'interface
      }
    });
  }

  refreshVideos(): void {
    this.loadVideos();
  }

  formatDuration(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  }

  clearIntervals(): void {
    if (this.progressUpdateInterval) {
      clearInterval(this.progressUpdateInterval);
    }
    if (this.progressSaveTimeout) {
      clearTimeout(this.progressSaveTimeout);
    }
  }
}