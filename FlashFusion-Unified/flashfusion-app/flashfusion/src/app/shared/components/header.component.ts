import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatBadgeModule } from '@angular/material/badge';
import { MatDividerModule } from '@angular/material/divider';
import { map } from 'rxjs/operators';
import { AuthService } from '../../core/services/auth.service';
import { FlashcardService } from '../../core/services/flashcard.service';
import { User } from '../../core/models';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatBadgeModule,
    MatDividerModule
  ],
  template: `
    <mat-toolbar color="primary" class="header-toolbar">
      <div class="header-content">
        <!-- Logo and Brand -->
        <div class="brand-section">
          <button mat-icon-button routerLink="/dashboard" class="logo-button">
            <mat-icon>psychology</mat-icon>
          </button>
          <h1 class="brand-title" routerLink="/dashboard">FlashFusion</h1>
        </div>

        <!-- Navigation -->
        <nav class="nav-section" *ngIf="user()">
          <button mat-button routerLink="/dashboard" routerLinkActive="active">
            <mat-icon>dashboard</mat-icon>
            Dashboard
          </button>
          <button mat-button routerLink="/study" routerLinkActive="active" [matBadge]="dueCardsCount()" matBadgeColor="accent" [matBadgeHidden]="dueCardsCount() === 0">
            <mat-icon>school</mat-icon>
            Study
          </button>
          <button mat-button routerLink="/flashcards" routerLinkActive="active">
            <mat-icon>collections_bookmark</mat-icon>
            Cards
          </button>
        </nav>

        <!-- User Menu -->
        <div class="user-section">
          <ng-container *ngIf="user(); else loginButton">
            <button mat-icon-button [matMenuTriggerFor]="userMenu" class="user-menu-button">
              <mat-icon>account_circle</mat-icon>
            </button>
            <mat-menu #userMenu="matMenu">
              <div class="user-info">
                <div class="user-avatar">
                  <mat-icon>account_circle</mat-icon>
                </div>
                <div class="user-details">
                  <div class="user-name">{{ user()?.displayName }}</div>
                  <div class="user-email">{{ user()?.email }}</div>
                  <div class="user-level">Level {{ user()?.statistics?.level || 1 }}</div>
                </div>
              </div>
              <mat-divider></mat-divider>
              <button mat-menu-item routerLink="/profile">
                <mat-icon>person</mat-icon>
                Profile
              </button>
              <button mat-menu-item (click)="logout()">
                <mat-icon>logout</mat-icon>
                Sign Out
              </button>
            </mat-menu>
          </ng-container>
          
          <ng-template #loginButton>
            <button mat-raised-button color="accent" routerLink="/auth/login">
              Sign In
            </button>
          </ng-template>
        </div>
      </div>
    </mat-toolbar>
  `,
  styles: [`
    .header-toolbar {
      position: sticky;
      top: 0;
      z-index: 1000;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .header-content {
      display: flex;
      align-items: center;
      justify-content: space-between;
      width: 100%;
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 1rem;
    }

    .brand-section {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .logo-button {
      color: white !important;
    }

    .brand-title {
      margin: 0;
      font-size: 1.5rem;
      font-weight: 600;
      color: white;
      text-decoration: none;
      cursor: pointer;
    }

    .nav-section {
      display: flex;
      gap: 0.5rem;
    }

    .nav-section button {
      color: rgba(255, 255, 255, 0.9);
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .nav-section button.active {
      background-color: rgba(255, 255, 255, 0.1);
      color: white;
    }

    .nav-section button:hover {
      background-color: rgba(255, 255, 255, 0.1);
    }

    .user-section {
      display: flex;
      align-items: center;
    }

    .user-menu-button {
      color: white !important;
    }

    .user-info {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1rem;
      min-width: 250px;
    }

    .user-avatar mat-icon {
      font-size: 2.5rem;
      height: 2.5rem;
      width: 2.5rem;
      color: var(--primary-color);
    }

    .user-details {
      flex: 1;
    }

    .user-name {
      font-weight: 600;
      margin-bottom: 0.25rem;
    }

    .user-email {
      font-size: 0.875rem;
      color: var(--text-secondary);
      margin-bottom: 0.25rem;
    }

    .user-level {
      font-size: 0.75rem;
      color: var(--accent-color);
      font-weight: 500;
    }

    @media (max-width: 768px) {
      .header-content {
        padding: 0 0.5rem;
      }

      .nav-section {
        display: none;
      }

      .brand-title {
        font-size: 1.25rem;
      }

      .nav-section button span {
        display: none;
      }
    }
  `]
})
export class HeaderComponent {
  private authService = inject(AuthService);
  private flashcardService = inject(FlashcardService);
  private router = inject(Router);

  user = signal<User | null>(null);

  dueCardsCount = signal(0);

  constructor() {
    // Subscribe to user changes and update due cards count
    this.authService.currentUser$.subscribe(user => {
      this.user.set(user);
      if (user) {
        this.updateDueCardsCount();
      }
    });

    // Subscribe to flashcard changes to update due count
    this.flashcardService.flashcards$.subscribe(() => {
      this.updateDueCardsCount();
    });
  }

  private updateDueCardsCount(): void {
    const dueCards = this.flashcardService.getDueFlashcards();
    this.dueCardsCount.set(dueCards.length);
  }

  async logout(): Promise<void> {
    try {
      await this.authService.logout();
      this.router.navigate(['/auth/login']);
    } catch (error) {
      console.error('Logout failed:', error);
    }
  }
}