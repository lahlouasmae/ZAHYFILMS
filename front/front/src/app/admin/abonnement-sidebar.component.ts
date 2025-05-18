import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { ProfileService } from '../_services/profile.service';
import { TypeAbonnement } from '../profile/profile.model';

@Component({
  selector: 'app-abonnement-sidebar',
  templateUrl: './abonnement-sidebar.component.html',
  styleUrls: ['./abonnement-sidebar.component.scss'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule]
})
export class AbonnementSidebarComponent implements OnInit {
  abonnements: TypeAbonnement[] = [];
  isDarkMode = true; // Mode sombre activé par défaut
  abonnementForm: FormGroup;
  isEditing = false;
  currentAbonnementId: number | null = null;
  showForm = false;

  constructor(
    private profileService: ProfileService,
    private fb: FormBuilder
  ) {
    this.abonnementForm = this.fb.group({
      nom: ['', [Validators.required, Validators.maxLength(30)]],
      prix: [null, [Validators.required, Validators.min(0)]],
      nombreEcrans: [null, [Validators.required, Validators.min(1)]],
      qualiteHD: [false],
      qualite4K: [false]
    });
  }
  
  ngOnInit(): void {
    this.loadAbonnements();
    // Force le mode sombre au chargement et désactive la possibilité de le changer
    this.isDarkMode = true;
  }
  
  loadAbonnements(): void {
    this.profileService.getAllAbonnements().subscribe(
      (abonnements) => {
        this.abonnements = abonnements;
      },
      (error) => {
        console.error('Erreur lors du chargement des abonnements:', error);
      }
    );
  }
  
  onSubmit(): void {
    if (this.abonnementForm.invalid) {
      return;
    }

    const formData = this.abonnementForm.value;
    
    if (this.isEditing && this.currentAbonnementId) {
      // Mode édition
      this.profileService.updateAbonnement(this.currentAbonnementId, formData).subscribe(
        () => {
          this.loadAbonnements();
          this.resetForm();
        },
        (error) => {
          console.error('Erreur lors de la mise à jour de l\'abonnement:', error);
        }
      );
    } else {
      // Mode création
      this.profileService.createAbonnement(formData).subscribe(
        () => {
          this.loadAbonnements();
          this.resetForm();
        },
        (error) => {
          console.error('Erreur lors de la création de l\'abonnement:', error);
        }
      );
    }
  }
  
  resetForm(): void {
    this.abonnementForm.reset({
      nom: '',
      prix: null,
      nombreEcrans: null,
      qualiteHD: false,
      qualite4K: false
    });
    this.isEditing = false;
    this.currentAbonnementId = null;
    this.showForm = false;
  }
  
  deleteAbonnement(id: number): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer cet abonnement ?')) {
      this.profileService.deleteAbonnement(id).subscribe(
        () => {
          this.loadAbonnements();
        },
        (error) => {
          console.error('Erreur lors de la suppression de l\'abonnement:', error);
        }
      );
    }
  }
  
  editAbonnement(abonnement: TypeAbonnement): void {
    this.isEditing = true;
    this.currentAbonnementId = abonnement.id;
    this.showForm = true;
    
    this.abonnementForm.patchValue({
      nom: abonnement.nom,
      prix: abonnement.prix,
      nombreEcrans: abonnement.nombreEcrans,
      qualiteHD: abonnement.qualiteHD,
      qualite4K: abonnement.qualite4K
    });
  }
  
  toggleForm(): void {
    if (this.showForm && this.isEditing) {
      this.resetForm();
    } else {
      this.showForm = !this.showForm;
      if (!this.showForm) {
        this.resetForm();
      }
    }
  }
  
  // La fonction toggleTheme a été supprimée car nous ne changeons plus de thème
  
  getAbonnementIcon(nom: string): string {
    const iconMap: {[key: string]: string} = {
      'Premium': 'assets/icons/premium.svg',
      'Standard': 'assets/icons/standard.svg',
      'Basic': 'assets/icons/basic.svg',
      'Basique': 'assets/icons/basic.svg',
      'Familial': 'assets/icons/family.svg',
      'Gratuit': 'assets/icons/free.svg'
    };
    
    return iconMap[nom] || 'assets/icons/default.svg';
  }
  
  normalizeClassName(name: string): string {
    return name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  }
}