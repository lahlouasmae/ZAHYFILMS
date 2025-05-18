// payment.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';
import { TokenStorageService } from '../_services/token-storage.service';

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  // URL de l'API correctement formatée
  private apiUrl = 'http://localhost:8083/api/payments';
  
  constructor(
    private http: HttpClient,
    private tokenService: TokenStorageService // Ajouter le service de token
  ) { }
  
  // Créer un nouveau paiement avec type de retour correct
  createPayment(abonnementId: number, cancelUrl: string, successUrl: string): Observable<any> {
    const payload = {
      abonnementId: abonnementId,
      cancelUrl: cancelUrl,   // Changez de cancel_url à cancelUrl
      successUrl: successUrl  // Changez de success_url à successUrl
    };
    
    
    // Ajouter l'en-tête d'autorisation manuellement comme sécurité supplémentaire
    const token = this.tokenService.getToken();
    console.log('👉 Token utilisé pour l’appel :', token);

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'X-Requested-With': 'XMLHttpRequest',
      'Authorization': `Bearer ${token}`
    });
    
    return this.http.post<any>(`${this.apiUrl}/create`, payload, { headers })
  .pipe(
    retry(1),
    catchError(this.handleError)
  );
  }
  
  // Exécuter un paiement après retour de PayPal avec type de retour correct
  executePayment(paymentId: string, payerId: string): Observable<any> {
    const payload = {
      paymentId,
      payerId
    };
    
    // Ajouter l'en-tête d'autorisation manuellement comme sécurité supplémentaire
    const token = this.tokenService.getToken();
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'X-Requested-With': 'XMLHttpRequest',
      'Authorization': token ? `Bearer ${token}` : ''
    });
    
    return this.http.post<any>(`${this.apiUrl}/execute`, payload, { headers })
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  }
  
  // Gestionnaire d'erreur amélioré
  private handleError(error: any) {
    let errorMessage = '';
    if (error.error instanceof ErrorEvent) {
      // Erreur côté client
      errorMessage = `Erreur: ${error.error.message}`;
    } else {
      // Erreur côté serveur
      errorMessage = `Code d'erreur: ${error.status}\nMessage: ${error.message}`;
      
      // Ajouter des détails supplémentaires si disponibles
      if (error.error && error.error.message) {
        errorMessage += `\nDétails: ${error.error.message}`;
      }
    }
    console.error(errorMessage);
    return throwError(() => error);
  }
}