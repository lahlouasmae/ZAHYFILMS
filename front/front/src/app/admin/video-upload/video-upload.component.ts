// video-upload.component.ts
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { VideoService } from '../../_services/video.service';
import { ProfileService } from '../../_services/profile.service';
import { TypeAbonnement } from '../../profile/profile.model';
import { HttpEventType, HttpResponse } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-video-upload',
  templateUrl: './video-upload.component.html',
  styleUrls: ['./video-upload.component.css']
})
export class VideoUploadComponent implements OnInit {
  uploadForm: FormGroup;
  selectedFile: File | null = null;
  progress = 0;
  message = '';
  isUploading = false;
  isUploadSuccess = false;
  abonnements: TypeAbonnement[] = [];
  errorMessage = '';
  availableGenres: string[] = [];
  newGenre: string = '';
  customGenre: string = '';
  
  // Nouvelles propriétés pour gérer la miniature
  uploadedVideoId: string = '';
  thumbnailUrl: string = '';
  showThumbnail: boolean = false;

  constructor(
    private formBuilder: FormBuilder,
    private videoService: VideoService,
    private profileService: ProfileService,
    private router: Router
  ) {
    this.uploadForm = this.formBuilder.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      description: [''],
      niveauAbonnementRequis: ['Standard', Validators.required],
      file: [null, Validators.required],
      genre: this.formBuilder.array([])
    });
  }

  ngOnInit(): void {
    this.loadAbonnements();
    this.loadGenres();
  }

  loadAbonnements(): void {
    this.profileService.getAllAbonnements().subscribe({
      next: (data) => {
        this.abonnements = data;
        console.log('Types d\'abonnements disponibles:', this.abonnements);
      },
      error: (err) => {
        console.error('Erreur lors du chargement des types d\'abonnements:', err);
        this.errorMessage = 'Impossible de charger les types d\'abonnements';
      }
    });
  }

  loadGenres(): void {
    this.videoService.getAllGenres().subscribe({
      next: (data) => {
        this.availableGenres = data;
        console.log('Genres disponibles:', this.availableGenres);
      },
      error: (err) => {
        console.error('Erreur lors du chargement des genres:', err);
        this.errorMessage = 'Impossible de charger les genres';
      }
    });
  }

  get genresArray(): FormArray {
    return this.uploadForm.get('genre') as FormArray;
  }

  addGenre(): void {
    if (this.newGenre && !this.genreAlreadyAdded(this.newGenre)) {
      this.genresArray.push(this.formBuilder.control(this.newGenre));
      this.newGenre = '';
    }
  }

  addCustomGenre(): void {
    if (this.customGenre && !this.genreAlreadyAdded(this.customGenre)) {
      if (!this.availableGenres.includes(this.customGenre.trim())) {
        this.availableGenres.push(this.customGenre.trim());
      }
      
      this.genresArray.push(this.formBuilder.control(this.customGenre.trim()));
      this.customGenre = '';
    }
  }

  genreAlreadyAdded(genre: string): boolean {
    return this.genresArray.controls.some(control => control.value === genre);
  }

  addNewGenre(): void {
    if (this.newGenre.trim()) {
      if (!this.availableGenres.includes(this.newGenre.trim())) {
        this.availableGenres.push(this.newGenre.trim());
      }
      if (!this.genreAlreadyAdded(this.newGenre.trim())) {
        this.genresArray.push(this.formBuilder.control(this.newGenre.trim()));
      }
      this.newGenre = '';
    }
  }

  removeGenre(index: number): void {
    this.genresArray.removeAt(index);
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      if (!file.type.startsWith('video/')) {
        this.errorMessage = 'Veuillez sélectionner un fichier vidéo valide';
        this.selectedFile = null;
        this.uploadForm.get('file')?.setValue(null);
        return;
      }
      
      const maxSize = 500 * 1024 * 1024; // 500MB en octets
      
      this.selectedFile = file;
      this.uploadForm.patchValue({
        file: file
      });
      this.uploadForm.get('file')?.updateValueAndValidity();
      this.errorMessage = '';
      console.log('Fichier sélectionné:', file.name);
    }
  }

  uploadVideo(): void {
    console.log('Fonction uploadVideo appelée');
    console.log('État du formulaire:', this.uploadForm.valid);
    console.log('Valeurs du formulaire:', this.uploadForm.value);
    
    if (this.uploadForm.invalid) {
      console.log('Formulaire invalide');
      this.markFormGroupTouched(this.uploadForm);
      return;
    }

    if (!this.selectedFile) {
      console.log('Aucun fichier sélectionné');
      this.errorMessage = 'Veuillez sélectionner un fichier vidéo';
      return;
    }

    this.isUploading = true;
    this.progress = 0;
    this.errorMessage = '';
    this.message = '';
    this.isUploadSuccess = false;
    this.showThumbnail = false; // Réinitialiser l'affichage de la miniature

    const formData = new FormData();
    formData.append('file', this.selectedFile);
    formData.append('title', this.uploadForm.get('title')?.value);
    formData.append('description', this.uploadForm.get('description')?.value || '');
    formData.append('niveauAbonnementRequis', this.uploadForm.get('niveauAbonnementRequis')?.value);
    
    const genres = this.genresArray.value;
    if (genres && genres.length > 0) {
      genres.forEach((genre: string) => {
        formData.append('genre', genre);
      });
    }
    
    console.log('Envoi de la requête au service...');
    this.videoService.uploadVideo(formData).subscribe({
      next: (event: any) => {
        console.log('Événement reçu:', event);
        if (event.type === HttpEventType.UploadProgress && event.total) {
          this.progress = Math.round(100 * event.loaded / event.total);
          console.log('Progression:', this.progress);
        } else if (event instanceof HttpResponse) {
          console.log('Upload terminé avec succès:', event);
          this.message = 'Vidéo téléchargée avec succès!';
          this.isUploadSuccess = true;
          
          // Récupérer l'ID de la vidéo et charger la miniature
          if (event.body && event.body.id) {
            this.uploadedVideoId = event.body.id;
            this.loadVideoThumbnail(this.uploadedVideoId);
          }
          
          // Ne pas réinitialiser le formulaire immédiatement pour permettre d'afficher la miniature
        }
      },
      error: (err) => {
        console.error('Erreur lors du téléchargement:', err);
        this.progress = 0;
        this.isUploading = false;
        
        if (err.error && err.error.message) {
          this.errorMessage = err.error.message;
        } else {
          this.errorMessage = 'Erreur lors du téléchargement de la vidéo';
        }
      },
      complete: () => {
        console.log('Observable complété');
        this.isUploading = false;
      }
    });
  }

  // Nouvelle méthode pour charger la miniature de la vidéo uploadée
  loadVideoThumbnail(videoId: string): void {
    this.videoService.getVideoById(videoId).subscribe({
      next: (video) => {
        const normalizedVideo = this.videoService.normalizeVideo(video);
        if (normalizedVideo.thumbnailUrl) {
          this.thumbnailUrl = normalizedVideo.thumbnailUrl;
          this.showThumbnail = true;
          console.log('Miniature chargée:', this.thumbnailUrl);
        } else {
          console.log('Aucune miniature disponible pour cette vidéo');
        }
      },
      error: (err) => {
        console.error('Erreur lors du chargement de la miniature:', err);
      }
    });
  }

  resetForm(): void {
    this.uploadForm.reset({
      title: '',
      description: '',
      niveauAbonnementRequis: 'Standard',
      file: null
    });
    while (this.genresArray.length !== 0) {
      this.genresArray.removeAt(0);
    }
    this.selectedFile = null;
    this.isUploading = false;
    this.newGenre = '';
    this.customGenre = '';
    this.showThumbnail = false;
    this.thumbnailUrl = '';
  }

  navigateToVideoManagement(): void {
    this.router.navigate(['/admin/videos']);
  }

  markFormGroupTouched(formGroup: FormGroup) {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();
      
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  get title() { return this.uploadForm.get('title'); }
  get description() { return this.uploadForm.get('description'); }
  get niveauAbonnementRequis() { return this.uploadForm.get('niveauAbonnementRequis'); }
  get file() { return this.uploadForm.get('file'); }
}