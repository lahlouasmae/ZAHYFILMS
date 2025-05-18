import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AdminService } from '../../_services/admin.service';
import { TokenStorageService } from '../../_services/token-storage.service';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-user-management',
  templateUrl: './user-management.component.html',
  styleUrls: ['./user-management.component.css']
})
export class UserManagementComponent implements OnInit {
  users: any[] = [];
  filteredUsers: any[] = [];
  isLoading = false;
  errorMessage = '';
  imageCache: Map<string, SafeUrl> = new Map(); // Cache pour les images

  constructor(
    private adminService: AdminService,
    private tokenService: TokenStorageService,
    private router: Router,
    private sanitizer: DomSanitizer
  ) { }

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.isLoading = true;
    this.errorMessage = '';
    
    console.log('Chargement des utilisateurs...');
    
    this.adminService.getAllUsers().subscribe({
      next: (data) => {
        console.log('Utilisateurs reçus:', data);
        this.users = data;
        this.filterOnlyUsers();
        
        // Précharger les images des utilisateurs
        this.filteredUsers.forEach(user => {
          if (user.image && !user.image.startsWith('http')) {
            // Extraire le nom du fichier
            const fileName = user.image.split('/').pop();
            this.preloadImage(fileName);
          }
        });
        
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Erreur lors du chargement des utilisateurs:', err);
        this.errorMessage = 'Erreur lors du chargement des utilisateurs';
        this.isLoading = false;
        
        if (err.status === 401) {
          this.tokenService.signOut();
          this.router.navigate(['/login']);
        }
      }
    });
  }

  // Méthode pour filtrer seulement les utilisateurs avec le rôle "user" et pas "admin"
  filterOnlyUsers(): void {
    this.filteredUsers = this.users.filter(user => {
      // Vérifie si l'utilisateur a le rôle "user"
      const hasUserRole = user.roles.some((role: any) => role.name === 'ROLE_USER' || role.name === 'user');
      // Vérifie si l'utilisateur n'a pas le rôle "admin"
      const hasAdminRole = user.roles.some((role: any) => role.name === 'ROLE_ADMIN' || role.name === 'admin');
      
      // Retourne true seulement si l'utilisateur a le rôle "user" mais pas "admin"
      return hasUserRole && !hasAdminRole;
    });
  }

  deleteUser(userId: number): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) {
      console.log(`Suppression de l'utilisateur ${userId}...`);
      
      this.adminService.deleteUser(userId).subscribe({
        next: () => {
          console.log('Utilisateur supprimé avec succès');
          // Mettre à jour la liste des utilisateurs
          this.users = this.users.filter(user => user.id !== userId);
          // Mettre à jour la liste filtrée
          this.filterOnlyUsers();
        },
        error: (err) => {
          console.error('Erreur lors de la suppression:', err);
          this.errorMessage = 'Erreur lors de la suppression de l\'utilisateur';
        }
      });
    }
  }

  getImageUrl(imagePath: string): SafeUrl | string {
    if (!imagePath) return '';
    if (imagePath.startsWith('http')) return imagePath;
    
    // Extraire le nom du fichier avec une vérification
    const parts = imagePath.split('/');
    const fileName = parts.pop() || imagePath; // Si pop() retourne undefined, utilisez imagePath complet
    
    // Vérifier si l'image est dans le cache
    if (this.imageCache.has(fileName)) {
      return this.imageCache.get(fileName) || '';
    }
    
    // Si l'image n'est pas encore chargée, lancer le chargement
    this.preloadImage(fileName);
    
    // Retourner une image par défaut ou vide en attendant
    return '';
  }
  
  // Préchargement des images
  preloadImage(fileName: string): void {
    if (this.imageCache.has(fileName)) {
      return; // Image déjà en cache
    }
    
    this.adminService.getImage(fileName).subscribe({
      next: (blob) => {
        const objectUrl = URL.createObjectURL(blob);
        const safeUrl = this.sanitizer.bypassSecurityTrustUrl(objectUrl);
        this.imageCache.set(fileName, safeUrl);
      },
      error: (err) => {
        console.error(`Erreur lors du chargement de l'image ${fileName}:`, err);
        // En cas d'erreur, stocker null pour éviter des tentatives répétées
        this.imageCache.set(fileName, '');
      }
    });
  }

  // Méthode pour obtenir le nom du type d'abonnement
  getSubscriptionType(user: any): string {
    if (user.typeAbonnement) {
      return user.typeAbonnement.nom || user.typeAbonnement.name || 'Non spécifié';
    }
    return 'Aucun abonnement';
  }

  // Méthode pour obtenir une classe CSS basée sur le type d'abonnement
  getSubscriptionClass(user: any): string {
    if (!user.typeAbonnement) return 'no-subscription';

    // Vous pouvez personnaliser ceci en fonction des noms de vos abonnements
    const type = (user.typeAbonnement.nom || user.typeAbonnement.name || '').toLowerCase();
    
    if (type.includes('premium')) return 'premium-subscription';
    if (type.includes('standard')) return 'standard-subscription';
    if (type.includes('basic')) return 'basic-subscription';
    
    return 'default-subscription';
  }
}