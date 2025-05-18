import { Component, OnInit, AfterViewInit } from '@angular/core';
import { Router } from '@angular/router';
import { TokenStorageService } from '../../_services/token-storage.service';
import { AdminService } from '../../_services/admin.service';
import { ProfileService } from '../../_services/profile.service';
import { VideoService, Video } from '../../_services/video.service';
import { TypeAbonnement } from '../../profile/profile.model';
import { Chart, registerables } from 'chart.js';

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css']
})
export class AdminDashboardComponent implements OnInit, AfterViewInit {
  currentUser: any;
  userCount: number = 0;
  subscriptionCount: number = 0;
  revenue: number = 0;
  actionCount: number = 0;
  abonnements: TypeAbonnement[] = [];
  private subscriptionChart: Chart<'doughnut', number[], string> | undefined;
  // Changed from 'line' to 'pie' to match the actual implementation
  private userRoleChart: Chart<'pie', number[], string> | undefined;
  private userActivityChart: Chart<'line', number[], string> | undefined;
  private videoGenreChart: Chart<'bar', number[], string> | undefined;
  videos: Video[] = [];
  userRoles: { role: string, count: number }[] = [];
  userRegistrations: { date: string, count: number }[] = [];
  videosByGenre: { genre: string, count: number }[] = [];

  constructor(
    private tokenService: TokenStorageService,
    private adminService: AdminService,
    private profileService: ProfileService,
    private videoService: VideoService,
    public router: Router
  ) {
    Chart.register(...registerables);
  }

  ngOnInit(): void {
    this.currentUser = this.tokenService.getUser();
    this.loadDashboardData();
    this.loadAbonnements();
    this.loadVideos();
    this.loadUserRegistrationData();
  }

  ngAfterViewInit(): void {
    // Le graphique sera initialisé après le chargement des données
  }

  loadDashboardData(): void {
    this.adminService.getAllUsers().subscribe({
      next: (data) => {
        if (Array.isArray(data)) {
          this.userCount = data.length;
          this.subscriptionCount = data.filter(user => 
            user.typeAbonnement && 
            (user.typeAbonnement.nom || user.typeAbonnement.name)
          ).length;
          this.revenue = 1250.75;
          
          // Analyser les rôles des utilisateurs pour le graphique
          this.analyzeUserRoles(data);
        }
      },
      error: (err) => {
        console.error('Erreur lors du chargement des données:', err);
      }
    });
    this.actionCount = 12;
  }
  
  analyzeUserRoles(users: any[]): void {
    const roles = new Map<string, number>();
    
    users.forEach(user => {
      if (user.roles && Array.isArray(user.roles)) {
        user.roles.forEach((role: any) => {
          const roleName = role.name || 'Unknown';
          roles.set(roleName, (roles.get(roleName) || 0) + 1);
        });
      }
    });
    
    this.userRoles = Array.from(roles.entries()).map(([role, count]) => {
      // Normaliser le nom du rôle pour l'affichage
      const displayRole = role.replace('ROLE_', '').charAt(0).toUpperCase() + 
                           role.replace('ROLE_', '').slice(1).toLowerCase();
      return { role: displayRole, count };
    });
    
    // Initialiser le graphique des utilisateurs après avoir analysé les données
    setTimeout(() => this.initUserChart(), 100);
  }
  
  loadUserRegistrationData(): void {
    // Simuler des données d'inscription (normalement cela viendrait d'une API)
    const today = new Date();
    const registrationData = new Map<string, number>();
    
    // Générer des données pour les 7 derniers jours
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      const dateString = date.toISOString().split('T')[0];
      
      // Simuler un nombre d'inscriptions entre 0 et 10
      registrationData.set(dateString, Math.floor(Math.random() * 11));
    }
    
    this.userRegistrations = Array.from(registrationData.entries()).map(([date, count]) => {
      return { date, count };
    });
    
    // Initialiser le graphique d'activité des utilisateurs
    setTimeout(() => this.initUserActivityChart(), 200);
  }
  
  loadVideos(): void {
    this.videoService.getAllVideos().subscribe({
      next: (data) => {
        if (Array.isArray(data)) {
          this.videos = data;
          this.analyzeVideoGenres();
        }
      },
      error: (err) => {
        console.error('Erreur lors du chargement des vidéos:', err);
      }
    });
  }
  
  analyzeVideoGenres(): void {
    const genres = new Map<string, number>();
    
    this.videos.forEach(video => {
      if (video.genre && Array.isArray(video.genre)) {
        video.genre.forEach(genre => {
          genres.set(genre, (genres.get(genre) || 0) + 1);
        });
      } else if (typeof video.genre === 'string' && video.genre) {
        genres.set(video.genre, (genres.get(video.genre) || 0) + 1);
      }
    });
    
    // Si aucun genre n'est trouvé, ajouter une catégorie par défaut
    if (genres.size === 0) {
      genres.set('Non catégorisé', this.videos.length);
    }
    
    this.videosByGenre = Array.from(genres.entries())
      .map(([genre, count]) => ({ genre, count }))
      .sort((a, b) => b.count - a.count);
    
    // Initialiser le graphique des genres de vidéos
    setTimeout(() => this.initVideoGenreChart(), 300);
  }

  loadAbonnements(): void {
    this.profileService.getAllAbonnements().subscribe({
      next: (data) => {
        if (data && Array.isArray(data)) {
          this.abonnements = data;
          console.log('Données des abonnements:', this.abonnements);
          // S'assurer que l'élément DOM est prêt avant d'initialiser le graphique
          setTimeout(() => this.initSubscriptionChart(), 100);
        } else {
          console.error('Format de données d\'abonnement invalide:', data);
        }
      },
      error: (err) => {
        console.error('Erreur lors du chargement des abonnements:', err);
      }
    });
  }

  private initSubscriptionChart() {
    const ctx = document.getElementById('subscriptionChart') as HTMLCanvasElement;
    if (!ctx) {
      console.error('Élément canvas non trouvé');
      return;
    }
    
    if (!this.abonnements || this.abonnements.length === 0) {
      console.warn('Aucune donnée d\'abonnement disponible');
      return;
    }

    // Nettoyer le graphique existant si nécessaire
    if (this.subscriptionChart) {
      this.subscriptionChart.destroy();
    }

    // Créer un compteur pour chaque type d'abonnement
    const abonnementCounts = new Map<string, number>();
    const abonnementPrices = new Map<string, number>();
    
    // Obtenir les statistiques d'abonnement à partir des données utilisateur
    this.adminService.getAllUsers().subscribe({
      next: (users) => {
        if (Array.isArray(users)) {
          // Pour chaque utilisateur avec un abonnement, incrémenter le compteur
          users.forEach(user => {
            if (user.typeAbonnement) {
              const abonnementNom = user.typeAbonnement.nom || user.typeAbonnement.name || 'Non spécifié';
              abonnementCounts.set(abonnementNom, (abonnementCounts.get(abonnementNom) || 0) + 1);
            }
          });
          
          // Maintenant, préparons les données pour le graphique
          // Préparation des données
          const labels: string[] = [];
          const data: number[] = [];
          const backgroundColor = [
            '#4e73df', // bleu
            '#1cc88a', // vert
            '#36b9cc', // turquoise
            '#f6c23e', // jaune
            '#e74a3b', // rouge
            '#858796'  // gris
          ];
          
          // Pour chaque type d'abonnement, récupérer le nombre d'utilisateurs
          this.abonnements.forEach(abonnement => {
            const nom = abonnement.nom || 'Non spécifié';
            const count = abonnementCounts.get(nom) || 0;
            
            // Si au moins un utilisateur possède cet abonnement, l'ajouter au graphique
            if (count > 0) {
              labels.push(`${nom} (${count})`);
              data.push(count);
            }
          });

          // Si aucun abonnement n'a d'utilisateurs, ajouter un message par défaut
          if (data.length === 0) {
            labels.push('Aucun abonnement actif');
            data.push(1);
          }

          console.log('Données pour le graphique:', { labels, data });

          // Création du graphique
          this.subscriptionChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
              labels: labels,
              datasets: [{
                data: data,
                backgroundColor: backgroundColor.slice(0, data.length),
                borderWidth: 1,
                hoverOffset: 15
              }]
            },
            options: {
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  position: 'right',
                  labels: {
                    font: {
                      size: 12
                    },
                    padding: 20
                  }
                },
                tooltip: {
                  callbacks: {
                    label: (context) => {
                      const label = context.label || '';
                      const value = context.parsed;
                      const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
                      const percentage = total > 0 ? Math.round((value / total) * 100) : 0;
                      return `${label}: ${value} utilisateurs (${percentage}%)`;
                    }
                  }
                }
              }
            }
          });
        }
      },
      error: (err) => {
        console.error('Erreur lors du chargement des utilisateurs pour le graphique:', err);
      }
    });
  }
  
  private initUserChart(): void {
    const ctx = document.getElementById('userRoleChart') as HTMLCanvasElement;
    if (!ctx) {
      console.error('Élément canvas userRoleChart non trouvé');
      return;
    }
    
    if (this.userRoleChart) {
      this.userRoleChart.destroy();
    }
    
    if (!this.userRoles || this.userRoles.length === 0) {
      console.warn('Aucune donnée de rôle utilisateur disponible');
      return;
    }
    
    const labels = this.userRoles.map(item => item.role);
    const data = this.userRoles.map(item => item.count);
    
    this.userRoleChart = new Chart(ctx, {
      type: 'pie',
      data: {
        labels: labels,
        datasets: [{
          data: data,
          backgroundColor: [
            '#4e73df', // bleu
            '#1cc88a', // vert
            '#e74a3b', // rouge
            '#f6c23e', // jaune
            '#36b9cc', // turquoise
            '#858796'  // gris
          ],
          hoverOffset: 10
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              font: {
                size: 12
              }
            }
          },
          tooltip: {
            callbacks: {
              label: (context) => {
                const label = context.label || '';
                const value = context.parsed;
                const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
                const percentage = total > 0 ? Math.round((value / total) * 100) : 0;
                return `${label}: ${value} (${percentage}%)`;
              }
            }
          }
        }
      }
    });
  }
  
  private initUserActivityChart(): void {
    const ctx = document.getElementById('userActivityChart') as HTMLCanvasElement;
    if (!ctx) {
      console.error('Élément canvas userActivityChart non trouvé');
      return;
    }
    
    if (this.userActivityChart) {
      this.userActivityChart.destroy();
    }
    
    if (!this.userRegistrations || this.userRegistrations.length === 0) {
      console.warn('Aucune donnée d\'activité utilisateur disponible');
      return;
    }
    
    // Formater les dates pour l'affichage
    const labels = this.userRegistrations.map(item => {
      const date = new Date(item.date);
      return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
    });
    
    const data = this.userRegistrations.map(item => item.count);
    
    this.userActivityChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [{
          label: 'Nouvelles inscriptions',
          data: data,
          fill: true,
          backgroundColor: 'rgba(78, 115, 223, 0.05)',
          borderColor: 'rgba(78, 115, 223, 1)',
          tension: 0.3,
          pointRadius: 3,
          pointBackgroundColor: 'rgba(78, 115, 223, 1)',
          pointBorderColor: '#fff',
          pointHoverRadius: 5,
          pointHoverBackgroundColor: 'rgba(78, 115, 223, 1)',
          pointHoverBorderColor: '#fff'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              precision: 0
            }
          }
        },
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            backgroundColor: '#fff',
            titleColor: '#858796',
            titleFont: {
              family: "'Nunito', sans-serif",
              size: 14
            },
            bodyColor: '#858796',
            bodyFont: {
              family: "'Nunito', sans-serif",
              size: 14
            },
            borderColor: '#dddfeb',
            borderWidth: 1,
            padding: 15,
            displayColors: false,
            callbacks: {
              label: (context) => {
                return `${context.parsed.y} inscriptions`;
              }
            }
          }
        }
      }
    });
  }
  
  private initVideoGenreChart(): void {
    const ctx = document.getElementById('videoGenreChart') as HTMLCanvasElement;
    if (!ctx) {
      console.error('Élément canvas videoGenreChart non trouvé');
      return;
    }
    
    if (this.videoGenreChart) {
      this.videoGenreChart.destroy();
    }
    
    if (!this.videosByGenre || this.videosByGenre.length === 0) {
      console.warn('Aucune donnée de genre vidéo disponible');
      return;
    }
    
    // Limiter à 6 genres maximum pour la lisibilité
    const topGenres = this.videosByGenre.slice(0, 6);
    
    const labels = topGenres.map(item => item.genre);
    const data = topGenres.map(item => item.count);
    
    this.videoGenreChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: 'Nombre de vidéos',
          data: data,
          backgroundColor: [
            'rgba(78, 115, 223, 0.8)',
            'rgba(28, 200, 138, 0.8)',
            'rgba(54, 185, 204, 0.8)',
            'rgba(246, 194, 62, 0.8)',
            'rgba(231, 74, 59, 0.8)',
            'rgba(133, 135, 150, 0.8)'
          ],
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              precision: 0
            }
          }
        },
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            callbacks: {
              label: (context) => {
                return `${context.parsed.y} vidéos`;
              }
            }
          }
        }
      }
    });
  }
}