import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../_services/auth.service';
import { TokenStorageService } from '../_services/token-storage.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'] 
})
export class LoginComponent implements OnInit {
  form: any = {
    username: null,
    password: null
  };
  isLoggedIn = false;
  isLoginFailed = false;
  errorMessage = '';
  roles: string[] = [];

  constructor(
    private authService: AuthService, 
    private tokenStorage: TokenStorageService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Si l'utilisateur est déjà connecté, rediriger immédiatement
    if (this.tokenStorage.getToken()) {
      this.isLoggedIn = true;
      const user = this.tokenStorage.getUser();
      this.roles = user.roles || [];
      
      // Rediriger selon le rôle
      this.redirectBasedOnRole();
    }
  }

  onSubmit(): void {
    const { username, password } = this.form;

    this.authService.login(username, password).subscribe({
      next: data => {
        console.log('Login réussi:', data);
        
        // Sauvegarder dans le storage
        this.tokenStorage.saveToken(data.token);
        this.tokenStorage.saveUser(data);

        this.isLoginFailed = false;
        this.isLoggedIn = true;
        this.roles = data.roles || [];
        
        // Rediriger selon le rôle et forcer le chargement complet
        this.redirectBasedOnRole();
      },
      error: (err: any) => {
        console.error('Erreur de connexion:', err);
        if (err.error && err.error.message) {
          this.errorMessage = err.error.message;
        } else if (err.status === 401) {
          this.errorMessage = "Nom d'utilisateur ou mot de passe incorrect";
        } else {
          this.errorMessage = "Une erreur est survenue lors de la connexion";
        }
        this.isLoginFailed = true;
      }
    });
  }

  private redirectBasedOnRole(): void {
    if (this.roles.includes('ROLE_ADMIN')) {
      console.log('Redirection vers /admin');
      // Redirection avec rechargement complet pour l'admin
      this.router.navigate(['/admin']).then(() => {
        // Cette ligne aide à garantir que tout est correctement initialisé
        setTimeout(() => {
          // Force la mise à jour de l'UI en déclenchant un changement de détection
          window.dispatchEvent(new Event('resize'));
        }, 100);
      });
    } else {
      console.log('Redirection vers /home');
      // Redirection avec rechargement complet pour l'utilisateur
      this.router.navigate(['/acceuil']).then(() => {
        // Cette ligne aide à garantir que tout est correctement initialisé
        setTimeout(() => {
          // Force la mise à jour de l'UI en déclenchant un changement de détection
          window.dispatchEvent(new Event('resize'));
        }, 100);
      });
    }
  }
}