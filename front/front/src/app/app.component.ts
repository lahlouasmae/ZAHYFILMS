import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { TokenStorageService } from './_services/token-storage.service';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
  <!-- Fond en plein écran qui couvre toute la page -->
  <div class="background-container"></div>
  
  <!-- Barre de navigation transparente - masquée pour l'admin -->
  <nav class="navbar navbar-expand" *ngIf="!showAdminBoard">
    <a [routerLink]="'/home'" class="navbar-brand">ZAHY FILMS</a>
    <div class="navbar-nav me-auto">
      <li class="nav-item" *ngIf="isLoggedIn">
        <a routerLink="accueil" class="nav-link" routerLinkActive="active">Accueil</a>
      </li>
      <li class="nav-item" *ngIf="isLoggedIn">
        <a routerLink="profile" class="nav-link" routerLinkActive="active">Profil</a>
      </li>
      <li class="nav-item" *ngIf="isLoggedIn">
        <a routerLink="Films" class="nav-link" routerLinkActive="active">Films</a>
      </li>
       <li class="nav-item" *ngIf="isLoggedIn">
      <a routerLink="recommendations" class="nav-link" routerLinkActive="active">Recommandations</a>
       </li>
      <li class="nav-item" *ngIf="isLoggedIn">
        <a routerLink="Favoris" class="nav-link" routerLinkActive="active">Favoris</a>
      </li>
      <li class="nav-item" *ngIf="isLoggedIn">
        <a routerLink="History" class="nav-link" routerLinkActive="active">History</a>
      </li>
      <li class="nav-item" *ngIf="isLoggedIn">
        <a routerLink="payment" class="nav-link" routerLinkActive="active">Abonnements</a>
      </li>
    </div>

    <div class="navbar-nav ms-auto">
      <li class="nav-item" *ngIf="!isLoggedIn">
        <a routerLink="login" class="nav-link">Connexion</a>
      </li>
      <li class="nav-item" *ngIf="!isLoggedIn">
        <a routerLink="register" class="nav-link">Inscription</a>
      </li>
      <li class="nav-item" *ngIf="isLoggedIn">
        <a href (click)="logout()" class="nav-link">Déconnexion</a>
      </li>
    </div>
  </nav>

  <!-- Le conteneur du contenu principal sans fond supplémentaire -->
  <div class="content-wrapper">
    <router-outlet></router-outlet>
  </div>
  
  <!-- Chatbot Botpress - affiché uniquement quand l'utilisateur est connecté -->
  <div id="bp-webchat" class="bp-webchat-container" *ngIf="isLoggedIn"></div>
  `,
  styles:  [`
    /* Reset de base pour s'assurer que l'application prend tout l'écran */
    :host {
      display: block;
      position: relative;
      width: 100%;
      height: 100vh;
      margin: 0;
      padding: 0;
      overflow-x: hidden;
      font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
      color: #fff;
    }
    
    /* Fond avec image qui couvre tout l'écran */
    /* Fond avec image qui couvre tout l'écran sans superposition de couleur */
.background-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-image: url('/assets/image.jpg');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  z-index: -1;
}
    
    /* Barre de navigation */
    .navbar {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: space-between;
      padding: 20px 40px;
      background-color: transparent;
      position: relative;
      z-index: 1000;
    }
    
    /* Logo de l'application */
    .navbar-brand {
      display: inline-block;
      padding-top: 0.3125rem;
      padding-bottom: 0.3125rem;
      margin-right: 1rem;
      font-size: 28px;
      font-weight: bold;
      line-height: inherit;
      white-space: nowrap;
      text-decoration: none;
      color: #e50914;
    }
    
    /* Navigation */
    .navbar-nav {
      display: flex;
      flex-direction: row;
      padding-left: 0;
      margin-bottom: 0;
      list-style: none;
    }
    
    .nav-item {
      margin-right: 15px;
    }
    
    .nav-link {
      display: block;
      padding: 0.5rem 1rem;
      text-decoration: none;
      color: #fff;
      transition: color 0.2s;
    }
    
    .nav-link:hover, .nav-link.active {
      color: #e50914;
      font-weight: bold;
    }
    
    .me-auto {
      margin-right: auto !important;
    }
    
    .ms-auto {
      margin-left: auto !important;
    }
    
    /* Conteneur du contenu principal */
    .content-wrapper {
      width: 100%;
      position: relative;
      z-index: 1;
      /* Pas de background ici pour que le background-container soit visible */
    }
    
    /* Styles globaux qui seront hérités par les enfants */
    :host ::ng-deep .card-container {
      background-color: rgba(0, 0, 0, 0.75);
      border-radius: 4px;
      padding: 60px 68px 40px;
      max-width: 450px;
      margin: 60px auto 0;
      box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
    }
    
    :host ::ng-deep form {
      width: 100%;
    }
    
    :host ::ng-deep .form-group {
      margin-bottom: 16px;
    }
    
    :host ::ng-deep label {
      display: block;
      color: #8c8c8c;
      font-size: 14px;
      margin-bottom: 8px;
    }
    
    :host ::ng-deep .form-control {
      width: 100%;
      height: 50px;
      background-color: #333;
      border: none;
      border-radius: 4px;
      color: white;
      padding: 16px 20px;
      font-size: 16px;
      box-sizing: border-box;
    }
    
    :host ::ng-deep .form-control:focus {
      background-color: #454545;
      outline: none;
      box-shadow: none;
      border: none;
    }
    
    :host ::ng-deep .btn-primary, 
    :host ::ng-deep .btn-block {
      width: 100%;
      height: 50px;
      background-color: #e50914;
      border: none;
      border-radius: 4px;
      color: white;
      font-size: 16px;
      font-weight: 700;
      margin-top: 24px;
      margin-bottom: 12px;
      cursor: pointer;
      transition: background-color 0.2s;
    }
    
    :host ::ng-deep .btn-primary:hover, 
    :host ::ng-deep .btn-block:hover {
      background-color: #f40612;
    }
    
    /* Pour s'assurer que les formulaires d'authentification ont bien l'apparence Netflix */
    :host ::ng-deep .form-options {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 10px;
      font-size: 13px;
      color: #b3b3b3;
    }
    
    :host ::ng-deep .form-options input[type="checkbox"] {
      margin-right: 5px;
    }
    
    :host ::ng-deep .form-options a,
    :host ::ng-deep .help-link {
      color: #b3b3b3;
      text-decoration: none;
    }
    
    :host ::ng-deep .form-options a:hover,
    :host ::ng-deep .help-link:hover {
      text-decoration: underline;
    }
    
    /* Pour les écrans plus petits */
    @media (max-width: 768px) {
      .navbar {
        padding: 10px 20px;
      }
      
      :host ::ng-deep .card-container {
        padding: 40px 20px;
        margin: 30px 20px;
      }
    }
  `]
})
export class AppComponent implements OnInit {
  isLoggedIn = false;
  showAdminBoard = false;
  username?: string;
  currentUrl = '';

  constructor(
    private tokenStorageService: TokenStorageService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Vérifier l'état de connexion initial
    this.updateLoginStatus();
    
    // S'abonner aux événements de navigation pour mettre à jour l'état
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      this.currentUrl = event.url;
      this.updateLoginStatus();
      
      // Charger les scripts de Botpress uniquement si l'utilisateur est connecté
      if (this.isLoggedIn) {
        this.loadBotpressScripts();
      }
    });
  }
  
  updateLoginStatus(): void {
    this.isLoggedIn = !!this.tokenStorageService.getToken();

    if (this.isLoggedIn) {
      const user = this.tokenStorageService.getUser();
      this.showAdminBoard = user.roles && user.roles.includes('ROLE_ADMIN');
      this.username = user.username;
      
      // Charger le chatbot si l'utilisateur vient de se connecter
      this.loadBotpressScripts();
    } else {
      this.showAdminBoard = false;
    }
  }

  logout(): void {
    this.tokenStorageService.signOut();
    this.router.navigate(['/login']).then(() => {
      window.location.reload();
    });
  }
  
  loadBotpressScripts(): void {
    // Vérifier si les scripts sont déjà chargés pour éviter les doublons
    const scriptExists = document.querySelector('script[src="https://cdn.botpress.cloud/webchat/v2.3/inject.js"]');
    if (scriptExists) return;
    
    // Charger le script principal de Botpress
    const mainScript = document.createElement('script');
    mainScript.src = "https://cdn.botpress.cloud/webchat/v2.3/inject.js";
    mainScript.async = true;
    document.body.appendChild(mainScript);

    // Charger le script de configuration spécifique à votre bot
    const configScript = document.createElement('script');
    configScript.src = "https://files.bpcontent.cloud/2025/04/21/18/20250421181242-6Z8YGQLL.js";
    configScript.async = true;
    document.body.appendChild(configScript);
  }
}