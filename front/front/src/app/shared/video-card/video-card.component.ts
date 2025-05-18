import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Video, VideoService } from '../../_services/video.service';
import { CommentsComponent } from '../comment/CommentsComponents';

@Component({
  selector: 'app-video-card',
  standalone: true,
  imports: [CommonModule, CommentsComponent],
  templateUrl: './video-card.component.html',
  styleUrls: ['./video-card.component.css']
})
export class VideoCardComponent implements OnInit, OnChanges {
  @Input() video!: Video;
  @Input() showFavoriteButton = true;
  @Input() formattedDuration: string = 'Durée non disponible';

  @Output() playVideo = new EventEmitter<void>();
  @Output() favoriteChanged = new EventEmitter<{ video: Video; isFavorite: boolean }>();
  showComments = false;
  
  constructor(private videoService: VideoService) {}

  ngOnInit(): void {
    this.ensureVideoProperties();
    this.checkFavoriteStatus();
  }

  ngOnChanges(changes: SimpleChanges): void {
    // Vérifier à nouveau le statut des favoris si la vidéo change
    if (changes['video'] && !changes['video'].firstChange) {
      this.checkFavoriteStatus();
    }
  }

  checkFavoriteStatus(): void {
    if (this.showFavoriteButton && this.video && this.video.id) {
      this.videoService.checkFavorite(this.video.id).subscribe({
        next: (isFavorite) => {
          console.log(`Vidéo ${this.video.id} est favorite: ${isFavorite}`);
          this.video.isFavorite = isFavorite;
        },
        error: (err) => {
          console.error('Erreur lors de la vérification du statut favori:', err);
        }
      });
    }
  }

  ensureVideoProperties(): void {
    if (!this.video) return;
    
    // Assurer que genre est toujours un tableau
    let genreArray: string[];
    if (!this.video.genre) {
      genreArray = ['Non catégorisé'];
    } else if (typeof this.video.genre === 'string') {
      // Si c'est une chaîne, la convertir en tableau avec un seul élément
      genreArray = [this.video.genre as unknown as string];
    } else if (Array.isArray(this.video.genre)) {
      // Si c'est déjà un tableau, l'utiliser tel quel
      genreArray = this.video.genre;
    } else {
      // Si c'est autre chose, initialiser avec 'Non catégorisé'
      genreArray = ['Non catégorisé'];
    }
    
    this.video = {
      ...this.video,
      title: this.video.title || 'Sans titre',
      description: this.video.description || 'Aucune description',
      thumbnailUrl: this.video.thumbnailUrl || '',
      duration: this.video.duration || 0,
      isFavorite: this.video.isFavorite || false,
      progress: this.video.progress || 0,
      completed: this.video.completed || false,
      genre: genreArray
    };
  }

  onPlayVideo() {
    this.playVideo.emit();
  }

  toggleFavorite() {
    if (!this.video || !this.video.id) return;
    
    const newFavoriteState = !this.video.isFavorite;
    
    // Optimistic UI update - mettre à jour l'interface avant la réponse du serveur
    this.video.isFavorite = newFavoriteState;
    
    // Émettre l'événement pour que le composant parent puisse réagir
    this.favoriteChanged.emit({
      video: this.video,
      isFavorite: newFavoriteState
    });
  }

  formatDuration(duration: number): string {
    if (!duration) return '0m 0s';
    const minutes = Math.floor(duration / 60);
    const seconds = Math.floor(duration % 60);
    return `${minutes}m ${seconds}s`;
  }
  
  getProgressPercentage(): number {
    if (this.video && this.video.progress && this.video.duration) {
      return Math.min((this.video.progress / this.video.duration) * 100, 100);
    }
    return 0;
  }
  
  toggleComments() {
    this.showComments = !this.showComments;
  }
  
  // Nouvelle méthode pour formater les genres en chaîne lisible
  formatGenres(): string {
    if (!this.video || !this.video.genre || this.video.genre.length === 0) {
      return 'Non catégorisé';
    }
    return this.video.genre.join(', ');
  }
}