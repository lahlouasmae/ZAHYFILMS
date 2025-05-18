import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { PaymentService } from '../_services/payment.service';
import { ProfileService } from '../_services/profile.service';
import { TypeAbonnement } from '../profile/profile.model';
import { TokenStorageService } from '../_services/token-storage.service';

@Component({
  selector: 'app-payment',
  templateUrl: './payment.component.html',
  styleUrls: ['./payment.component.scss'],
  standalone: true,
  imports: [CommonModule]
})
export class PaymentComponent implements OnInit {
  abonnements: TypeAbonnement[] = [];
  isLoading = true;
  errorMessage = '';
  successMessage = '';
  processingPayment = false;
  
  // Pour gérer le retour de PayPal
  paymentId: string | null = null;
  payerId: string | null = null;

  constructor(
    private paymentService: PaymentService,
    private profileService: ProfileService,
    private tokenService: TokenStorageService,
    private router: Router,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    // Vérifier si l'utilisateur est connecté
    if (!this.tokenService.getToken()) {
      this.router.navigate(['/login']);
      return;
    }

    // Vérifier s'il s'agit d'un retour de PayPal
    this.route.queryParams.subscribe(params => {
      this.paymentId = params['paymentId'] || null;
      this.payerId = params['PayerID'] || null;
      
      if (this.paymentId && this.payerId) {
        this.executePayment(this.paymentId, this.payerId);
      } else {
        this.loadAbonnements();
      }
    });
  }

  loadAbonnements(): void {
    this.isLoading = true;
    this.errorMessage = '';
    
    this.profileService.getAllAbonnements().subscribe({
      next: (data) => {
        this.abonnements = data;
        this.isLoading = false;
      },
      error: (err: HttpErrorResponse) => {
        console.error('Erreur lors du chargement des abonnements:', err);
        this.handleError(err);
        this.isLoading = false;
      }
    });
  }

  subscribe(abonnementId: number): void {
    this.processingPayment = true;
    this.errorMessage = '';
    
    // Vérifier à nouveau le token avant de procéder
    if (!this.tokenService.getToken()) {
      this.errorMessage = 'Session expirée. Veuillez vous reconnecter.';
      this.processingPayment = false;
      setTimeout(() => this.router.navigate(['/login']), 2000);
      return;
    }
    
    // URLs de retour après paiement
    const currentUrl = window.location.origin + '/payment';
    const successUrl = currentUrl;
    const cancelUrl = currentUrl;
    
    this.paymentService.createPayment(abonnementId, cancelUrl, successUrl).subscribe({
      next: (response) => {
        if (response && response.redirect_url) {
          window.location.href = response.redirect_url;
        } else {
          this.errorMessage = 'Réponse invalide du serveur de paiement.';
          this.processingPayment = false;
        }
      },
      error: (err: HttpErrorResponse) => {
        console.error('Erreur de création de paiement:', err);
        this.handleError(err);
        this.processingPayment = false;
      }
    });
  }

  executePayment(paymentId: string, payerId: string): void {
    this.processingPayment = true;
    this.errorMessage = '';
    
    // Vérifier à nouveau le token avant de procéder
    if (!this.tokenService.getToken()) {
      this.errorMessage = 'Session expirée. Veuillez vous reconnecter.';
      this.processingPayment = false;
      setTimeout(() => this.router.navigate(['/login']), 2000);
      return;
    }
    
    this.paymentService.executePayment(paymentId, payerId).subscribe({
      next: (response) => {
        this.successMessage = 'Paiement effectué avec succès! Votre abonnement est maintenant actif.';
        this.processingPayment = false;
        
        // Rediriger vers le profil après quelques secondes
        setTimeout(() => {
          this.router.navigate(['/profile']);
        }, 3000);
      },
      error: (err: HttpErrorResponse) => {
        console.error('Erreur lors de l\'exécution du paiement:', err);
        this.handleError(err);
        this.processingPayment = false;
      }
    });
  }

  // Méthode pour gérer les erreurs de manière centralisée
  private handleError(err: HttpErrorResponse): void {
    if (err.status === 401) {
      this.errorMessage = 'Session expirée ou non autorisée. Veuillez vous reconnecter.';
      // Déconnecter l'utilisateur car son token n'est plus valide
      this.tokenService.signOut();
      setTimeout(() => this.router.navigate(['/login']), 2000);
    } else if (err.status === 403) {
      this.errorMessage = 'Vous n\'avez pas les droits nécessaires pour effectuer cette action.';
    } else if (err.status === 0) {
      this.errorMessage = 'Impossible de se connecter au serveur. Veuillez vérifier votre connexion internet.';
    } else {
      this.errorMessage = err.error?.message || 'Une erreur s\'est produite. Veuillez réessayer plus tard.';
    }
  }
}