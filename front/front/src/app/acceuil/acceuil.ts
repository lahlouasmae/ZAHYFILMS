// home.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TokenStorageService } from '../_services/token-storage.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="netflix-container">
      <header class="netflix-header">
        <div class="netflix-logo"></div>
      </header>
      
      <div class="hero-content">
        <h1>Films, séries et bien plus en illimité.</h1>
        <p>Regardez où vous voulez. Annulez à tout moment.</p>
        
        <div *ngIf="isLoggedIn" class="welcome-message">
          Bienvenue, <span class="username">{{ username }} </span>
          <a routerLink="/home" class="netflix-button">Parcourir le catalogue</a>
        </div>
        
        <div *ngIf="!isLoggedIn" class="auth-actions">
          <p class="auth-text">Prêt à regarder ? Commencez par vous connecter ou créer un compte.</p>
          <div class="auth-buttons">
            <a routerLink="/login" class="netflix-button">Se connecter</a>
            <a routerLink="/register" class="netflix-button-secondary">S'inscrire</a>
          </div>
        </div>
      </div>
      
      <div class="features-section">
        <div class="feature">
          <div class="feature-text">
            <h2>Regardez sur votre TV</h2>
            <p>Téléviseurs connectés, PlayStation, Xbox, Chromecast, Apple TV, lecteurs Blu-ray et bien plus.</p>
          </div>
          <div class="feature-img tv-img"></div>
        </div>
        
        <div class="feature">
          <div class="feature-img mobile-img"></div>
          <div class="feature-text">
            <h2>Téléchargez vos séries pour les regarder hors connexion</h2>
            <p>Enregistrez vos programmes préférés et ayez toujours quelque chose à regarder.</p>
          </div>
        </div>
      </div>
      
      <footer class="netflix-footer">
        <p>Des questions ? Appelez le 01 23 45 67 89</p>
        <div class="footer-links">
          <a href="#">FAQ</a>
          <a href="#">Centre d'aide</a>
          <a href="#">Conditions d'utilisation</a>
          <a href="#">Confidentialité</a>
          <a href="#">Préférences de cookies</a>
          <a href="#">Informations légales</a>
        </div>
      </footer>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
      background-color: #000;
      color: #fff;
      margin: 0;
      padding: 0;
    }
    
    .netflix-container {
      width: 100%;
      min-height: 100vh;
    }
    
    .netflix-header {
      padding: 20px 50px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    
    .netflix-logo {
      width: 150px;
      height: 40px;
      background-image: url('/assets/netflix-logo.png');
      background-size: contain;
      background-repeat: no-repeat;
      background-position: left center;
    }
    
    .hero-content {
      background-image: linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)),
                        url('/assets/hero-background.jpg');
      background-size: cover;
      background-position: center;
      height: 80vh;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      text-align: center;
      padding: 0 20px;
      border-bottom: 8px solid #222;
    }
    
    .hero-content h1 {
      font-size: 3.5rem;
      font-weight: 700;
      margin-bottom: 20px;
      max-width: 800px;
    }
    
    .hero-content p {
      font-size: 1.6rem;
      font-weight: 400;
      margin-bottom: 30px;
    }
    
    .welcome-message {
      font-size: 2rem;
      text-align: center;
      margin-top: 20px;
    }
    
    .username {
      font-weight: bold;
      color: #e50914;
    }
    
    .auth-text {
      font-size: 1.2rem;
      margin-bottom: 20px;
    }
    
    .auth-buttons {
      display: flex;
      flex-direction: row;
      gap: 15px;
      justify-content: center;
    }
    
    .netflix-button {
      background-color: #e50914;
      color: #fff;
      padding: 12px 24px;
      font-size: 1.2rem;
      font-weight: 500;
      border-radius: 4px;
      text-decoration: none;
      display: inline-block;
      transition: background-color 0.2s;
      cursor: pointer;
      margin-top: 15px;
    }
    
    .netflix-button:hover {
      background-color: #f40612;
    }
    
    .netflix-button-secondary {
      background-color: rgba(255, 255, 255, 0.1);
      color: #fff;
      padding: 12px 24px;
      font-size: 1.2rem;
      font-weight: 500;
      border-radius: 4px;
      text-decoration: none;
      display: inline-block;
      transition: background-color 0.2s;
      cursor: pointer;
      margin-top: 15px;
    }
    
    .netflix-button-secondary:hover {
      background-color: rgba(255, 255, 255, 0.2);
    }
    
    .features-section {
      width: 100%;
    }
    
    .feature {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 50px 5%;
      border-bottom: 8px solid #222;
    }
    
    .feature-text {
      flex: 0 1 50%;
      padding: 0 3rem 0 0;
    }
    
    .feature h2 {
      font-size: 2.5rem;
      margin-bottom: 20px;
      font-weight: 700;
    }
    
    .feature p {
      font-size: 1.5rem;
      font-weight: 400;
    }
    
    .feature-img {
      flex: 0 1 45%;
      height: 350px;
      background-size: contain;
      background-repeat: no-repeat;
      background-position: center;
    }
    
    .tv-img {
      background-image: url('/assets/tv.png');
    }
    
    .mobile-img {
      background-image: url('/assets/mobile.png');
    }
    
    .netflix-footer {
      padding: 50px 5%;
      color: #737373;
      font-size: 1rem;
    }
    
    .footer-links {
      display: flex;
      flex-wrap: wrap;
      margin-top: 20px;
    }
    
    .footer-links a {
      color: #737373;
      text-decoration: none;
      margin-right: 30px;
      margin-bottom: 15px;
      flex: 0 0 25%;
      font-size: 0.9rem;
    }
    
    .footer-links a:hover {
      text-decoration: underline;
    }
    
    @media (max-width: 768px) {
      .hero-content h1 {
        font-size: 2rem;
      }
      
      .hero-content p {
        font-size: 1.2rem;
      }
      
      .feature {
        flex-direction: column;
        text-align: center;
      }
      
      .feature-text {
        padding: 0 0 2rem 0;
        order: 1;
      }
      
      .feature-img {
        order: 2;
        margin-bottom: 30px;
      }
      
      .auth-buttons {
        flex-direction: column;
      }
    }
  `]
})
export class HomComponent implements OnInit {
  isLoggedIn = false;
  username?: string;

  constructor(private tokenStorageService: TokenStorageService) { }

  ngOnInit(): void {
    this.isLoggedIn = !!this.tokenStorageService.getToken();

    if (this.isLoggedIn) {
      const user = this.tokenStorageService.getUser();
      this.username = user.username;
    }
  }
}