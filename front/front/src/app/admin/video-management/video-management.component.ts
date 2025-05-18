// 1. D'abord, mettons à jour le composant TypeScript pour gérer les genres

// Modifications dans VideoManagementComponent
import { Component, OnInit } from '@angular/core';
import { VideoService, Video } from '../../_services/video.service';
import { ProfileService } from '../../_services/profile.service';
import { TypeAbonnement } from '../../profile/profile.model';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-video-management',
  templateUrl: './video-management.component.html',
  styleUrls: ['./video-management.component.css']
})
export class VideoManagementComponent implements OnInit {
  videos: Video[] = [];
  loading = true;
  error = '';
  abonnements: TypeAbonnement[] = [];
  selectedVideo: Video | null = null;
  editForm: FormGroup;
  successMessage = '';
  selectedFile: File | null = null;
  allGenres: string[] = []; // Nouvelle propriété pour stocker tous les genres disponibles

  constructor(
    private videoService: VideoService,
    private profileService: ProfileService,
    private formBuilder: FormBuilder,
    private router: Router
  ) {
    this.editForm = this.formBuilder.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      description: [''],
      niveauAbonnementRequis: ['', Validators.required],
      genre: [[]],  // Ajout du champ pour les genres
      file: [null]
    });
  }

  ngOnInit(): void {
    this.loadVideos();
    this.loadAbonnements();
    this.loadGenres(); // Charger la liste des genres disponibles
  }

  // Nouvelle méthode pour charger tous les genres disponibles
  loadGenres(): void {
    this.videoService.getAllGenres().subscribe({
      next: (data) => {
        this.allGenres = data;
      },
      error: (err) => {
        console.error('Erreur lors du chargement des genres:', err);
      }
    });
  }

  loadVideos(): void {
    this.loading = true;
    this.videoService.getAllVideos().subscribe({
      next: (data) => {
        this.videos = data.map(video => this.videoService.normalizeVideo(video));
        this.loading = false;
      },
      error: (err) => {
        console.error('Erreur lors du chargement des vidéos:', err);
        this.error = 'Impossible de charger les vidéos';
        this.loading = false;
      }
    });
  }

  loadAbonnements(): void {
    this.profileService.getAllAbonnements().subscribe({
      next: (data) => {
        this.abonnements = data;
      },
      error: (err) => {
        console.error('Erreur lors du chargement des types d\'abonnements:', err);
      }
    });
  }

  selectVideoForEdit(video: Video): void {
    this.selectedVideo = video;
    this.selectedFile = null;
    this.editForm.patchValue({
      title: video.title,
      description: video.description || '',
      niveauAbonnementRequis: video.niveauAbonnementRequis,
      genre: video.genre || [], // Initialiser avec les genres existants
      file: null
    });
  }

  cancelEdit(): void {
    this.selectedVideo = null;
    this.selectedFile = null;
    this.editForm.reset();
  }

  onFileSelected(event: any): void {
    const file: File = event.target.files[0];
    if (file) {
      this.selectedFile = file;
    }
  }

  saveChanges(): void {
    if (this.editForm.invalid || !this.selectedVideo) {
      return;
    }

    const updatedMetadata = {
      title: this.editForm.get('title')?.value,
      description: this.editForm.get('description')?.value,
      niveauAbonnementRequis: this.editForm.get('niveauAbonnementRequis')?.value,
      genre: this.editForm.get('genre')?.value // Ajouter le genre aux métadonnées
    };

    if (this.selectedFile) {
      // Si un nouveau fichier a été sélectionné, mettre à jour le fichier et les métadonnées
      this.videoService.updateVideo(this.selectedVideo.id, this.selectedFile, updatedMetadata).subscribe({
        next: (updatedVideo) => {
          this.handleUpdateSuccess(updatedVideo);
        },
        error: (err) => {
          this.handleUpdateError(err);
        }
      });
    } else {
      // Sinon, mettre à jour uniquement les métadonnées
      this.videoService.updateVideoMetadata(this.selectedVideo.id, updatedMetadata).subscribe({
        next: (updatedVideo) => {
          this.handleUpdateSuccess(updatedVideo);
        },
        error: (err) => {
          this.handleUpdateError(err);
        }
      });
    }
  }

private handleUpdateSuccess(updatedVideo: Video): void {
  // Mettre à jour la vidéo dans la liste en préservant les propriétés importantes
  const index = this.videos.findIndex(v => v.id === updatedVideo.id);
  if (index !== -1) {
    // Récupérer l'ancienne vidéo
    const oldVideo = this.videos[index];
    
    // Préserver les propriétés qui pourraient ne pas être retournées par l'API
    // lors d'une mise à jour des métadonnées uniquement
    if (!updatedVideo.duration && oldVideo.duration) {
      updatedVideo.duration = oldVideo.duration;
    }
    
    // Préserver la taille du fichier
    if (!updatedVideo.size && oldVideo.size) {
      updatedVideo.size = oldVideo.size;
    }
    
    // Préserver la miniature (utiliser thumbnailUrl au lieu de thumbnail)
    if (!updatedVideo.thumbnailUrl && oldVideo.thumbnailUrl) {
      updatedVideo.thumbnailUrl = oldVideo.thumbnailUrl;
    }
    
    // Normaliser la vidéo pour s'assurer que tous les champs sont correctement formatés
    this.videos[index] = this.videoService.normalizeVideo(updatedVideo);
  }
  this.successMessage = 'Vidéo mise à jour avec succès';
  this.selectedVideo = null;
  this.selectedFile = null;
  
  // Effacer le message après 3 secondes
  setTimeout(() => {
    this.successMessage = '';
  }, 3000);
}

  private handleUpdateError(err: any): void {
    console.error('Erreur lors de la mise à jour de la vidéo:', err);
    this.error = 'Impossible de mettre à jour la vidéo';
    if (err.error && err.error.message) {
      this.error += `: ${err.error.message}`;
    }
  }

  deleteVideo(video: Video): void {
    if (confirm(`Êtes-vous sûr de vouloir supprimer la vidéo "${video.title}" ?`)) {
      this.videoService.deleteVideo(video.id).subscribe({
        next: () => {
          this.videos = this.videos.filter(v => v.id !== video.id);
          this.successMessage = 'Vidéo supprimée avec succès';
          
          // Effacer le message après 3 secondes
          setTimeout(() => {
            this.successMessage = '';
          }, 3000);
        },
        error: (err) => {
          console.error('Erreur lors de la suppression de la vidéo:', err);
          this.error = 'Impossible de supprimer la vidéo';
          if (err.error && err.error.message) {
            this.error += `: ${err.error.message}`;
          }
        }
      });
    }
  }

  navigateToUpload(): void {
    this.router.navigate(['/admin/upload']);
  }

  // Formatage de la date
  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  // Formatage de la taille du fichier
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  // Formatage de la durée
  formatDuration(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    
    return [
      hours > 0 ? String(hours).padStart(2, '0') : null,
      String(minutes).padStart(2, '0'),
      String(secs).padStart(2, '0')
    ].filter(Boolean).join(':');
  }

  // Méthode utilitaire pour joindre les genres avec des virgules
  formatGenres(genres: string[]): string {
    if (!genres || genres.length === 0) {
      return 'Aucun genre';
    }
    return genres.join(', ');
  }
}