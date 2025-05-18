import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CommentService, CommentResponseDTO } from '../../_services/comment.service';
import { finalize } from 'rxjs/operators';
import { ChangeDetectorRef } from '@angular/core';
import { TokenStorageService } from '../../_services/token-storage.service';

@Component({
  selector: 'app-comments',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="comments-container">
      <h3>Commentaires ({{ getTotalCommentsCount() }})</h3>
      
      <!-- Formulaire d'ajout de commentaire -->
      <div class="comment-form">
        <textarea 
          [(ngModel)]="newCommentContent" 
          placeholder="Ajouter un commentaire..." 
          rows="3"
          class="comment-textarea"></textarea>
        <button (click)="addComment()" [disabled]="!newCommentContent.trim() || isSubmitting">
          {{ isSubmitting ? 'Envoi...' : 'Commenter' }}
        </button>
      </div>

      <!-- Liste des commentaires -->
      <div class="comments-list">
        <div *ngIf="comments.length === 0" class="no-comments">
          Aucun commentaire pour cette vidéo.
        </div>
        
        <div *ngFor="let comment of comments; trackBy: trackByCommentId" class="comment-item">
          <div class="comment-header">
            <span class="comment-user">{{ comment.userId}}</span>
            <span class="comment-date">{{ comment.createdAt | date }}</span>
          </div>
          
          <!-- Mode édition et affichage normal -->
          <div *ngIf="editingCommentId !== comment.commentId" class="comment-content">{{ comment.content }}</div>
          <div *ngIf="editingCommentId === comment.commentId" class="edit-comment-form">
            <textarea [(ngModel)]="editCommentContent" rows="3" class="comment-textarea"></textarea>
            <div class="edit-buttons">
              <button (click)="saveEditComment(comment)" [disabled]="!editCommentContent.trim() || isEditing">
                {{ isEditing ? 'Sauvegarde...' : 'Sauvegarder' }}
              </button>
              <button (click)="cancelEdit()" class="cancel-btn">Annuler</button>
            </div>
          </div>
          
          <div class="comment-actions">
            <div class="like-container">
              <button 
                class="like-btn" 
                [class.active]="comment.userHasLiked"
                [disabled]="processingCommentIds.includes(comment.commentId)"
                (click)="likeComment(comment)">
                👍 {{ comment.likes }}
              </button>
              <!-- Affichage des utilisateurs qui ont liké -->
              <span *ngIf="comment.likedByUsers && comment.likedByUsers.length > 0" class="users-liked">
                {{ comment.likedByUsers.join(', ') }}
              </span>
            </div>
            
            <div class="dislike-container">
              <button 
                class="dislike-btn" 
                [class.active]="comment.userHasDisliked"
                [disabled]="processingCommentIds.includes(comment.commentId)"
                (click)="dislikeComment(comment)">
                👎 {{ comment.dislikes }}
              </button>
              <!-- Affichage des utilisateurs qui ont disliké -->
              <span *ngIf="comment.dislikedByUsers && comment.dislikedByUsers.length > 0" class="users-disliked">
                {{ comment.dislikedByUsers.join(', ') }}
              </span>
            </div>
            
            <!-- Boutons d'édition et de suppression -->
            <div *ngIf="canModifyComment(comment)" class="admin-actions">
              <button class="edit-btn" (click)="editComment(comment)">Modifier</button>
              <button class="delete-btn" (click)="deleteComment(comment)">Supprimer</button>
            </div>
            
            <!-- Bouton répondre -->
            <button class="reply-btn" (click)="toggleReplyForm(comment)">
              {{ showReplyForm && replyingToCommentId === comment.commentId ? 'Annuler' : 'Répondre' }}
            </button>
          </div>
          
          <!-- Formulaire de réponse -->
          <div *ngIf="showReplyForm && replyingToCommentId === comment.commentId" class="reply-form">
            <textarea 
              [(ngModel)]="replyContent" 
              placeholder="Écrire une réponse..." 
              rows="2" 
              class="reply-textarea"></textarea>
            <button (click)="addReply(comment)" [disabled]="!replyContent.trim() || isSubmittingReply">
              {{ isSubmittingReply ? 'Envoi...' : 'Répondre' }}
            </button>
          </div>
          
          <!-- Bouton pour afficher/masquer les réponses -->
          <div *ngIf="comment.hasReplies" class="show-replies">
            <button class="show-replies-btn" (click)="toggleReplies(comment)">
              {{ comment.showReplies ? 'Masquer les réponses' : 'Afficher les réponses' }}
            </button>
          </div>
          
          <!-- Affichage des réponses -->
          <div *ngIf="comment.showReplies && comment.replies && comment.replies.length > 0" class="replies-container">
            <div *ngFor="let reply of comment.replies; trackBy: trackByCommentId" class="reply-item">
              <div class="comment-header">
                <span class="comment-user">{{ reply.userId }}</span>
                <span class="comment-date">{{ reply.createdAt | date }}</span>
              </div>
              
              <!-- Mode édition et affichage normal pour les réponses -->
              <div *ngIf="editingCommentId !== reply.commentId" class="comment-content">{{ reply.content }}</div>
              <div *ngIf="editingCommentId === reply.commentId" class="edit-comment-form">
                <textarea [(ngModel)]="editCommentContent" rows="2" class="comment-textarea"></textarea>
                <div class="edit-buttons">
                  <button (click)="saveEditComment(reply)" [disabled]="!editCommentContent.trim() || isEditing">
                    {{ isEditing ? 'Sauvegarde...' : 'Sauvegarder' }}
                  </button>
                  <button (click)="cancelEdit()" class="cancel-btn">Annuler</button>
                </div>
              </div>
              
              <div class="comment-actions">
                <div class="like-container">
                  <button 
                    class="like-btn" 
                    [class.active]="reply.userHasLiked"
                    [disabled]="processingCommentIds.includes(reply.commentId)"
                    (click)="likeComment(reply)">
                    👍 {{ reply.likes }}
                  </button>
                </div>
                
                <div class="dislike-container">
                  <button 
                    class="dislike-btn" 
                    [class.active]="reply.userHasDisliked"
                    [disabled]="processingCommentIds.includes(reply.commentId)"
                    (click)="dislikeComment(reply)">
                    👎 {{ reply.dislikes }}
                  </button>
                </div>
                
                <!-- Boutons d'édition et de suppression pour les réponses -->
                <div *ngIf="canModifyComment(reply)" class="admin-actions">
                  <button class="edit-btn" (click)="editComment(reply)">Modifier</button>
                  <button class="delete-btn" (click)="deleteComment(reply)">Supprimer</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .comments-container {
      padding: 20px;
      margin-top: 20px;
      background-color: #181818;
      border-radius: 8px;
      color: #fff;
      font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
    }
  
    h3 {
      margin-top: 0;
      margin-bottom: 15px;
      color: #e50914;
    }
  
    .comment-form, .edit-comment-form {
      margin-bottom: 20px;
      
    }
  
    .comment-textarea, .reply-textarea {
      width: 90%;
      padding: 12px;
      background-color: #2c2c2c;
      border: 1px solid #444;
      border-radius: 4px;
      margin-bottom: 10px;
      color: #fff;
      resize: vertical;
    }
  
    button {
      padding: 8px 15px;
      background-color: #e50914;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      transition: background-color 0.2s ease;
      margin-right: 5px;
      font-weight: bold;
    }
  
    button:disabled {
      background-color: #555;
      cursor: not-allowed;
    }
  
    .cancel-btn {
      background-color: #6c757d;
    }
  
    .edit-btn {
      background-color: #f5c518;
      color: #000;
    }
  
    .delete-btn {
      background-color: #b81d24;
    }
  
    .reply-btn {
      background-color: #404040;
      font-size: 0.9em;
      padding: 4px 10px;
    }
  
    .show-replies-btn {
      background-color: transparent;
      color: #e50914;
      border: none;
      padding: 5px 0;
      text-decoration: underline;
      font-size: 0.9em;
    }
  
    .no-comments {
      color: #aaa;
      font-style: italic;
      padding: 10px 0;
    }
  
    .comment-item {
      padding: 12px;
      border-bottom: 1px solid #333;
    }
  
    .comment-header {
      margin-bottom: 5px;
      display: flex;
      justify-content: space-between;
    }
  
    .comment-user {
      font-weight: bold;
      color: #fff;
    }
  
    .comment-date {
      color: #999;
      font-size: 0.85em;
    }
  
    .comment-content {
      margin-bottom: 10px;
      line-height: 1.5;
      color: #ccc;
    }
  
    .comment-actions {
      display: flex;
      gap: 10px;
      flex-wrap: wrap;
      align-items: center;
    }
  
    .like-container, .dislike-container {
      display: flex;
      align-items: center;
      gap: 5px;
    }
  
    .users-liked, .users-disliked {
      font-size: 0.85em;
      color: #888;
    }
  
    .like-btn, .dislike-btn {
      background: none;
      color: #fff;
      padding: 5px 10px;
      border: 1px solid #444;
      transition: all 0.2s ease;
      border-radius: 4px;
    }
  
    .like-btn.active, .dislike-btn.active {
      background-color: #e50914;
      border-color: #e50914;
    }
  
    .like-btn:hover:not(:disabled), .dislike-btn:hover:not(:disabled) {
      background-color: #333;
    }
  
    .edit-buttons {
      display: flex;
      gap: 10px;
    }
  
    .admin-actions {
      display: flex;
      gap: 5px;
    }
  
    .reply-form {
      margin: 10px 0 10px 20px;
      padding-left: 10px;
      border-left: 2px solid #444;
    }
  
    .replies-container {
      margin-left: 20px;
      border-left: 2px solid #444;
      padding-left: 15px;
      margin-top: 10px;
    }
  
    .reply-item {
      padding: 8px 0;
      border-bottom: 1px solid #333;
      color: #ccc;
    }
  
    .reply-item:last-child {
      border-bottom: none;
    }
  
    .show-replies {
      margin-top: 5px;
      margin-bottom: 5px;
    }
  `]
  
})
export class CommentsComponent implements OnInit {
  @Input() videoId!: string;
  comments: CommentResponseDTO[] = [];
  newCommentContent = '';
  isSubmitting = false;
  processingCommentIds: string[] = [];
  currentUsername: string = '';
  
  // Pour les réponses
  showReplyForm = false; 
  replyingToCommentId = '';
  replyContent = '';
  isSubmittingReply = false;
  
  // Pour l'édition
  editingCommentId = '';
  editCommentContent = '';
  isEditing = false;
  
  // Pour la suppression
  isDeleting = false;

  constructor(
    private commentService: CommentService,
    private cdr: ChangeDetectorRef,
    private tokenStorage: TokenStorageService
  ) {
    // Récupérer le nom d'utilisateur connecté
    const user = this.tokenStorage.getUser();
    if (user && user.username) {
      this.currentUsername = user.username;
    }
  }

  ngOnInit(): void {
    this.loadComments();
  }

  // Calculer le nombre total de commentaires (y compris les réponses)
  getTotalCommentsCount(): number {
    let count = this.comments.length;
    this.comments.forEach(comment => {
      if (comment.replies) {
        count += comment.replies.length;
      }
    });
    return count;
  }

  // Utiliser trackBy pour améliorer les performances de rendu
  trackByCommentId(index: number, comment: CommentResponseDTO): string {
    return comment.commentId;
  }

  loadComments(): void {
    this.commentService.getCommentsByVideo(this.videoId).subscribe({
      next: (comments) => {
        // Filtrer pour n'afficher que les commentaires principaux (sans parent)
        const mainComments = comments.filter(comment => !comment.parentCommentId);
        
        // Marquer les commentaires qui ont des réponses
        mainComments.forEach(comment => {
          comment.hasReplies = comments.some(c => c.parentCommentId === comment.commentId);
          comment.showReplies = false; // Par défaut, les réponses sont masquées
          comment.replies = [];
          
          // Initialiser les tableaux si nécessaire
          if (!comment.likedByUsers) comment.likedByUsers = [];
          if (!comment.dislikedByUsers) comment.dislikedByUsers = [];
        });
        
        this.comments = mainComments;
        this.cdr.detectChanges(); // Force la détection de changements
      },
      error: (error) => {
        console.error('Erreur lors du chargement des commentaires', error);
      }
    });
  }

  addComment(): void {
    if (!this.newCommentContent.trim() || this.isSubmitting) return;
    
    this.isSubmitting = true;
    
    this.commentService.addComment(this.videoId, this.newCommentContent)
      .pipe(finalize(() => {
        this.isSubmitting = false;
        this.cdr.detectChanges(); // Force la détection de changements
      }))
      .subscribe({
        next: (newComment) => {
          // Initialiser les tableaux si nécessaire
          if (!newComment.likedByUsers) newComment.likedByUsers = [];
          if (!newComment.dislikedByUsers) newComment.dislikedByUsers = [];
          
          newComment.hasReplies = false;
          newComment.showReplies = false;
          newComment.replies = [];
          
          this.comments.unshift(newComment);
          this.newCommentContent = '';
          this.cdr.detectChanges(); // Force la détection de changements
        },
        error: (error) => {
          console.error('Erreur lors de l\'ajout du commentaire', error);
        }
      });
  }

  likeComment(comment: CommentResponseDTO): void {
    if (!comment.commentId || this.processingCommentIds.includes(comment.commentId)) {
      return;
    }
    
    this.processingCommentIds.push(comment.commentId);
    
    // Sauvegarde des valeurs initiales
    const initialLikes = comment.likes;
    const initialDislikes = comment.dislikes;
    const initialUserHasLiked = comment.userHasLiked;
    const initialUserHasDisliked = comment.userHasDisliked;
    const initialLikedByUsers = [...(comment.likedByUsers || [])];
    const initialDislikedByUsers = [...(comment.dislikedByUsers || [])];
    
    // Mise à jour optimiste de l'UI
    if (comment.userHasLiked) {
      comment.likes--;
      comment.userHasLiked = false;
      // Enlever l'utilisateur de la liste des likes
      comment.likedByUsers = comment.likedByUsers.filter(user => user !== this.currentUsername);
    } else {
      comment.likes++;
      comment.userHasLiked = true;
      // Ajouter l'utilisateur à la liste des likes
      if (!comment.likedByUsers.includes(this.currentUsername)) {
        comment.likedByUsers.push(this.currentUsername);
      }
      
      if (comment.userHasDisliked) {
        comment.dislikes--;
        comment.userHasDisliked = false;
        // Enlever l'utilisateur de la liste des dislikes
        comment.dislikedByUsers = comment.dislikedByUsers.filter(user => user !== this.currentUsername);
      }
    }
    
    // Force la détection de changements après la mise à jour optimiste
    this.cdr.detectChanges();
    
    this.commentService.likeComment(comment.commentId)
      .pipe(finalize(() => {
        this.processingCommentIds = this.processingCommentIds.filter(id => id !== comment.commentId);
        this.cdr.detectChanges(); // Force la détection de changements après la fin de l'opération
      }))
      .subscribe({
        next: (response) => {
          // Success - l'UI est déjà mise à jour
        },
        error: (error) => {
          console.error('Erreur lors du like', error);
          // Restaurer les valeurs initiales en cas d'erreur
          comment.likes = initialLikes;
          comment.dislikes = initialDislikes;
          comment.userHasLiked = initialUserHasLiked;
          comment.userHasDisliked = initialUserHasDisliked;
          comment.likedByUsers = initialLikedByUsers;
          comment.dislikedByUsers = initialDislikedByUsers;
          this.cdr.detectChanges(); // Force la détection de changements
        }
      });
  }
  
  dislikeComment(comment: CommentResponseDTO): void {
    if (!comment.commentId || this.processingCommentIds.includes(comment.commentId)) {
      return;
    }
    
    this.processingCommentIds.push(comment.commentId);
    
    // Sauvegarde des valeurs initiales
    const initialLikes = comment.likes;
    const initialDislikes = comment.dislikes;
    const initialUserHasLiked = comment.userHasLiked;
    const initialUserHasDisliked = comment.userHasDisliked;
    const initialLikedByUsers = [...(comment.likedByUsers || [])];
    const initialDislikedByUsers = [...(comment.dislikedByUsers || [])];
    
    // Mise à jour optimiste de l'UI
    if (comment.userHasDisliked) {
      comment.dislikes--;
      comment.userHasDisliked = false;
      // Enlever l'utilisateur de la liste des dislikes
      comment.dislikedByUsers = comment.dislikedByUsers.filter(user => user !== this.currentUsername);
    } else {
      comment.dislikes++;
      comment.userHasDisliked = true;
      // Ajouter l'utilisateur à la liste des dislikes
      if (!comment.dislikedByUsers.includes(this.currentUsername)) {
        comment.dislikedByUsers.push(this.currentUsername);
      }
      
      if (comment.userHasLiked) {
        comment.likes--;
        comment.userHasLiked = false;
        // Enlever l'utilisateur de la liste des likes
        comment.likedByUsers = comment.likedByUsers.filter(user => user !== this.currentUsername);
      }
    }
    
    // Force la détection de changements après la mise à jour optimiste
    this.cdr.detectChanges();
    
    this.commentService.dislikeComment(comment.commentId)
      .pipe(finalize(() => {
        this.processingCommentIds = this.processingCommentIds.filter(id => id !== comment.commentId);
        this.cdr.detectChanges(); // Force la détection de changements
      }))
      .subscribe({
        next: (response) => {
          // Success - l'UI est déjà mise à jour
        },
        error: (error) => {
          console.error('Erreur lors du dislike', error);
          // Restaurer les valeurs initiales en cas d'erreur
          comment.likes = initialLikes;
          comment.dislikes = initialDislikes;
          comment.userHasLiked = initialUserHasLiked;
          comment.userHasDisliked = initialUserHasDisliked;
          comment.likedByUsers = initialLikedByUsers;
          comment.dislikedByUsers = initialDislikedByUsers;
          this.cdr.detectChanges(); // Force la détection de changements
        }
      });
  }

  // Afficher/masquer le formulaire de réponse
  toggleReplyForm(comment: CommentResponseDTO): void {
    if (this.replyingToCommentId === comment.commentId && this.showReplyForm) {
      this.showReplyForm = false;
      this.replyingToCommentId = '';
      this.replyContent = '';
    } else {
      this.showReplyForm = true;
      this.replyingToCommentId = comment.commentId;
      this.replyContent = '';
    }
    this.cdr.detectChanges();
  }

  // Ajouter une réponse à un commentaire
  addReply(parentComment: CommentResponseDTO): void {
    if (!this.replyContent.trim() || this.isSubmittingReply) return;
    
    this.isSubmittingReply = true;
    
    this.commentService.addComment(this.videoId, this.replyContent, parentComment.commentId)
      .pipe(finalize(() => {
        this.isSubmittingReply = false;
        this.cdr.detectChanges();
      }))
      .subscribe({
        next: (newReply) => {
          // Initialiser les tableaux si nécessaire
          if (!newReply.likedByUsers) newReply.likedByUsers = [];
          if (!newReply.dislikedByUsers) newReply.dislikedByUsers = [];
          
          // Marquer le commentaire parent comme ayant des réponses
          parentComment.hasReplies = true;
          
          // Ajouter la réponse au tableau des réponses du parent
          if (!parentComment.replies) {
            parentComment.replies = [];
          }
          parentComment.replies.push(newReply);
          
          // Si les réponses ne sont pas déjà affichées, les afficher
          if (!parentComment.showReplies) {
            parentComment.showReplies = true;
          }
          
          // Réinitialiser le formulaire de réponse
          this.showReplyForm = false;
          this.replyingToCommentId = '';
          this.replyContent = '';
          
          this.cdr.detectChanges(); // Force la détection de changements
        },
        error: (error) => {
          console.error('Erreur lors de l\'ajout de la réponse', error);
        }
      });
  }

  // Afficher/masquer les réponses
  toggleReplies(comment: CommentResponseDTO): void {
    if (comment.showReplies) {
      // Si les réponses sont déjà affichées, on les masque simplement
      comment.showReplies = false;
      this.cdr.detectChanges();
    } else {
      // Sinon, on charge les réponses depuis l'API
      this.commentService.getReplies(comment.commentId).subscribe({
        next: (replies) => {
          // Initialiser les tableaux pour chaque réponse
          replies.forEach(reply => {
            if (!reply.likedByUsers) reply.likedByUsers = [];
            if (!reply.dislikedByUsers) reply.dislikedByUsers = [];
          });
          
          comment.replies = replies;
          comment.showReplies = true;
          this.cdr.detectChanges();
        },
        error: (error) => {
          console.error('Erreur lors du chargement des réponses', error);
        }
      });
    }
  }

  // Vérifier si l'utilisateur peut modifier ou supprimer un commentaire
  canModifyComment(comment: CommentResponseDTO): boolean {
    return this.currentUsername === comment.userId;
  }

  // Activer le mode édition d'un commentaire
 // Activer le mode édition d'un commentaire
 editComment(comment: CommentResponseDTO): void {
  this.editingCommentId = comment.commentId;
  this.editCommentContent = comment.content;
  this.cdr.detectChanges();
}

// Annuler l'édition d'un commentaire
cancelEdit(): void {
  this.editingCommentId = '';
  this.editCommentContent = '';
  this.cdr.detectChanges();
}

// Sauvegarder les modifications d'un commentaire
saveEditComment(comment: CommentResponseDTO): void {
  if (!this.editCommentContent.trim() || this.isEditing) return;
  
  this.isEditing = true;
  
  // Sauvegarde de la valeur initiale
  const initialContent = comment.content;
  
  // Mise à jour optimiste de l'UI
  comment.content = this.editCommentContent;
  
  this.commentService.updateComment(comment.commentId, this.editCommentContent)
    .pipe(finalize(() => {
      this.isEditing = false;
      this.editingCommentId = '';
      this.editCommentContent = '';
      this.cdr.detectChanges();
    }))
    .subscribe({
      next: (updatedComment) => {
        // Succès - l'UI est déjà mise à jour
      },
      error: (error) => {
        console.error('Erreur lors de la mise à jour du commentaire', error);
        // Restaurer le contenu initial en cas d'erreur
        comment.content = initialContent;
        this.cdr.detectChanges();
      }
    });
}

// Supprimer un commentaire
deleteComment(comment: CommentResponseDTO): void {
  if (confirm('Êtes-vous sûr de vouloir supprimer ce commentaire ?')) {
    // Ajouter à la liste des commentaires en cours de traitement pour désactiver les interactions
    this.processingCommentIds.push(comment.commentId);
    
    this.commentService.deleteComment(comment.commentId)
      .pipe(finalize(() => {
        this.processingCommentIds = this.processingCommentIds.filter(id => id !== comment.commentId);
        this.cdr.detectChanges();
      }))
      .subscribe({
        next: () => {
          if (comment.parentCommentId) {
            // C'est une réponse, la supprimer du parent
            const parentComment = this.comments.find(c => c.commentId === comment.parentCommentId);
            if (parentComment && parentComment.replies) {
              parentComment.replies = parentComment.replies.filter(
                reply => reply.commentId !== comment.commentId
              );
              
              // Vérifier s'il reste des réponses
              if (parentComment.replies.length === 0) {
                parentComment.hasReplies = false;
                parentComment.showReplies = false;
              }
            }
          } else {
            // C'est un commentaire principal, le supprimer de la liste
            this.comments = this.comments.filter(c => c.commentId !== comment.commentId);
          }
          this.cdr.detectChanges();
        },
        error: (error) => {
          console.error('Erreur lors de la suppression du commentaire', error);
        }
      });
  }
}
}