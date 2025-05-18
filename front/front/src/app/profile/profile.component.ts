// profile.component.ts
import { Component, OnInit } from '@angular/core';
import { ProfileService } from '../_services/profile.service';
import { Profile, TypeAbonnement, UpdateProfileRequest } from './profile.model';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  standalone: true,
  imports: [CommonModule, FormsModule],
  styleUrls: ['./profile.component.scss'],
})
export class ProfileComponent implements OnInit {
  profile: Profile | null = null;
  editProfile: UpdateProfileRequest = {};
  isEditing = false;
  isLoading = true;
  isUploading = false;
  errorMessage = '';
  successMessage = '';
  abonnements: TypeAbonnement[] = [];
  selectedFile: File | null = null;
  profileImageUrl: SafeUrl | string = '';
  defaultAvatarUrl: SafeUrl | string = '';
  tempImageUrl: SafeUrl | string = '';
  emailError = '';
  usernameError = '';

  constructor(
    public profileService: ProfileService,
    private router: Router,
    private sanitizer: DomSanitizer
  ) { }

  ngOnInit(): void {
    this.loadProfile();
    this.loadAbonnements();
    this.loadDefaultAvatar();
  }

  loadProfile(): void {
    this.isLoading = true;
    this.profileService.getUserProfile().subscribe({
      next: (data) => {
        this.profile = data;
        if (this.profile && this.profile.image) {
          this.loadProfileImage(this.profile.image);
        } else {
          this.profileImageUrl = this.defaultAvatarUrl;
        }
        this.isLoading = false;
      },
      error: (err) => {
        this.errorMessage = 'Impossible de charger le profil. Veuillez réessayer.';
        this.isLoading = false;
        if (err.status === 401) {
          localStorage.removeItem('auth-token');
          this.router.navigate(['/login']);
        }
      }
    });
  }

  loadProfileImage(fileName: string): void {
    // Ajoutez un timestamp pour éviter le cache
    const timestamp = new Date().getTime();
    this.profileService.getImage(fileName + '?t=' + timestamp).subscribe({
      next: (imageBlob: Blob) => {
        this.profileService.createImageFromBlob(imageBlob).subscribe(imageUrl => {
          this.profileImageUrl = this.sanitizer.bypassSecurityTrustUrl(imageUrl);
        });
      },
      error: (err) => {
        console.error('Erreur lors du chargement de l\'image:', err);
        this.profileImageUrl = this.defaultAvatarUrl;
      }
    });
  }

  loadDefaultAvatar(): void {
    this.profileService.getImage('default-avatar.png').subscribe({
      next: (imageBlob: Blob) => {
        this.profileService.createImageFromBlob(imageBlob).subscribe(imageUrl => {
          this.defaultAvatarUrl = this.sanitizer.bypassSecurityTrustUrl(imageUrl);
        });
      },
      error: () => {
        // Fallback vers une URL statique en cas d'erreur
        this.defaultAvatarUrl = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0iIzgwODA4MCI+PHBhdGggZD0iTTEyIDJDNi40NyAyIDIgNi40NyAyIDEyczQuNDcgMTAgMTAgMTAgMTAtNC40NyAxMC0xMFMxNy41MyAyIDEyIDJ6bTAgM2MyLjIxIDAgNCAxLjc5IDQgNHMtMS43OSA0LTQgNC00LTEuNzktNC00IDEuNzktNCA0LTR6bTAgMTcuMDRjLTMuMyAwLTYuMjMtMS42My04LTQuMTIgMC0yLjY2IDUuMzMtNC4xMiA4LTQuMTIgMi42NiAwIDggMS40NyA4IDQuMTItMS43NyAyLjQ5LTQuNyA0LjEyLTggNC4xMnoiLz48L3N2Zz4=';
      }
    });
  }

  loadAbonnements(): void {
    this.profileService.getAllAbonnements().subscribe({
      next: (data) => {
        this.abonnements = data;
      },
      error: (err) => {
        this.errorMessage = 'Impossible de charger les types d\'abonnement.';
      }
    });
  }

  startEditing(): void {
    if (this.profile) {
      this.editProfile = {
        username: this.profile.username,
        email: this.profile.email,
        nom: this.profile.nom,
        prenom: this.profile.prenom,
        typeAbonnementId: this.profile.typeAbonnementId ?? undefined 
      };
      this.isEditing = true;
      this.tempImageUrl = ''; // Réinitialiser l'aperçu temporaire
      // Réinitialiser les messages d'erreur
      this.emailError = '';
      this.usernameError = '';
    }
  }

  cancelEditing(): void {
    this.isEditing = false;
    this.editProfile = {};
    this.selectedFile = null;
    this.tempImageUrl = ''; // Réinitialiser l'aperçu temporaire
    this.emailError = '';
    this.usernameError = '';
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      
      // Créer un aperçu immédiat
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.tempImageUrl = this.sanitizer.bypassSecurityTrustUrl(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  }

  validateForm(): boolean {
    let isValid = true;
    this.emailError = '';
    this.usernameError = '';

    // Validation de l'email
    if (this.editProfile.email) {
      const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (!emailPattern.test(this.editProfile.email)) {
        this.emailError = "Format d'email invalide";
        isValid = false;
      }
    } else {
      this.emailError = "L'email est requis";
      isValid = false;
    }

    // Validation du nom d'utilisateur
    if (!this.editProfile.username) {
      this.usernameError = "Le nom d'utilisateur est requis";
      isValid = false;
    } else if (this.editProfile.username.length < 3) {
      this.usernameError = "Le nom d'utilisateur doit contenir au moins 3 caractères";
      isValid = false;
    }

    return isValid;
  }

  saveProfile(): void {
    if (!this.validateForm()) {
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';
    
    // Si une image a été sélectionnée, la télécharger d'abord
    if (this.selectedFile) {
      this.uploadImageThenSaveProfile();
    } else {
      // Sinon, simplement sauvegarder le profil
      this.updateProfileOnly();
    }
  }

  uploadImageThenSaveProfile(): void {
    this.profileService.uploadProfileImage(this.selectedFile!).subscribe({
      next: (response) => {
        console.log('Image téléchargée:', response);
        // Mettre à jour l'image dans editProfile si nécessaire
        if (response && response.filename) {
          this.editProfile.image = response.filename;
        }
        // Maintenant, sauvegarder le profil
        this.updateProfileOnly();
      },
      error: (err) => {
        console.error('Erreur lors du téléchargement de l\'image:', err);
        this.errorMessage = 'Erreur lors du téléchargement de l\'image. Le profil n\'a pas été mis à jour.';
        this.isLoading = false;
      }
    });
  }

  updateProfileOnly(): void {
    this.profileService.updateUserProfile(this.editProfile).subscribe({
      next: (response) => {
        this.successMessage = 'Profil mis à jour avec succès!';
        this.isEditing = false;
        this.tempImageUrl = ''; // Réinitialiser l'aperçu temporaire
        this.selectedFile = null;
        this.loadProfile(); // Recharger le profil pour voir les changements
      },
      error: (err) => {
        this.errorMessage = 'Erreur lors de la mise à jour du profil.';
        if (err.error && err.error.message) {
          if (err.error.message.includes('username')) {
            this.usernameError = "Ce nom d'utilisateur est déjà pris";
          } else if (err.error.message.includes('email')) {
            this.emailError = "Cet email est déjà utilisé";
          } else {
            this.errorMessage = err.error.message;
          }
        }
        this.isLoading = false;
      }
    });
  }

  logout(): void {
    localStorage.removeItem('auth-token');
    this.router.navigate(['/login']);
  }
}