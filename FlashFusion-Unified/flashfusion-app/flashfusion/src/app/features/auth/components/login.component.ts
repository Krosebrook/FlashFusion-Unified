import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AuthService } from '../../../core/services/auth.service';
import { LoginCredentials } from '../../../core/models';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatCheckboxModule,
    MatProgressSpinnerModule,
    MatSnackBarModule
  ],
  template: `
    <div class="auth-container">
      <div class="auth-card-wrapper">
        <mat-card class="auth-card">
          <mat-card-header class="auth-header">
            <div class="brand-logo">
              <mat-icon class="logo-icon">psychology</mat-icon>
              <h1>FlashFusion</h1>
            </div>
            <p class="auth-subtitle">Sign in to continue your learning journey</p>
          </mat-card-header>

          <mat-card-content>
            <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="auth-form">
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Email</mat-label>
                <input
                  matInput
                  type="email"
                  formControlName="email"
                  placeholder="Enter your email"
                  [class.error]="email?.invalid && email?.touched"
                >
                <mat-icon matSuffix>email</mat-icon>
                <mat-error *ngIf="email?.hasError('required')">
                  Email is required
                </mat-error>
                <mat-error *ngIf="email?.hasError('email')">
                  Please enter a valid email
                </mat-error>
              </mat-form-field>

              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Password</mat-label>
                <input
                  matInput
                  [type]="hidePassword() ? 'password' : 'text'"
                  formControlName="password"
                  placeholder="Enter your password"
                  [class.error]="password?.invalid && password?.touched"
                >
                <button
                  mat-icon-button
                  matSuffix
                  type="button"
                  (click)="togglePasswordVisibility()"
                  [attr.aria-label]="'Hide password'"
                  [attr.aria-pressed]="hidePassword()"
                >
                  <mat-icon>{{ hidePassword() ? 'visibility_off' : 'visibility' }}</mat-icon>
                </button>
                <mat-error *ngIf="password?.hasError('required')">
                  Password is required
                </mat-error>
                <mat-error *ngIf="password?.hasError('minlength')">
                  Password must be at least 6 characters
                </mat-error>
              </mat-form-field>

              <div class="form-options">
                <mat-checkbox formControlName="rememberMe" color="primary">
                  Remember me
                </mat-checkbox>
                <a routerLink="/auth/reset-password" class="forgot-password-link">
                  Forgot password?
                </a>
              </div>

              <button
                mat-raised-button
                color="primary"
                type="submit"
                class="auth-button full-width"
                [disabled]="loginForm.invalid || isLoading()"
              >
                <span *ngIf="!isLoading()">Sign In</span>
                <mat-spinner *ngIf="isLoading()" diameter="20"></mat-spinner>
              </button>

              <div class="auth-divider">
                <span>or</span>
              </div>

              <div class="auth-footer">
                <p>Don't have an account?</p>
                <a routerLink="/auth/register" class="auth-link">Create account</a>
              </div>
            </form>
          </mat-card-content>
        </mat-card>
      </div>
    </div>
  `,
  styles: [`
    .auth-container {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, 
        var(--primary-color) 0%, 
        var(--accent-color) 100%);
      padding: 2rem 1rem;
    }

    .auth-card-wrapper {
      width: 100%;
      max-width: 400px;
    }

    .auth-card {
      padding: 2rem;
      border-radius: 12px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(10px);
    }

    .auth-header {
      text-align: center;
      margin-bottom: 2rem;
    }

    .brand-logo {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      margin-bottom: 1rem;
    }

    .logo-icon {
      font-size: 2.5rem;
      height: 2.5rem;
      width: 2.5rem;
      color: var(--primary-color);
    }

    .brand-logo h1 {
      margin: 0;
      font-size: 2rem;
      font-weight: 600;
      color: var(--primary-color);
    }

    .auth-subtitle {
      margin: 0;
      color: var(--text-secondary);
      font-size: 0.875rem;
    }

    .auth-form {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .full-width {
      width: 100%;
    }

    .form-options {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin: -0.5rem 0 0.5rem;
    }

    .forgot-password-link {
      color: var(--primary-color);
      text-decoration: none;
      font-size: 0.875rem;
      font-weight: 500;
    }

    .forgot-password-link:hover {
      text-decoration: underline;
    }

    .auth-button {
      height: 48px;
      font-size: 1rem;
      font-weight: 600;
      border-radius: 8px;
    }

    .auth-divider {
      position: relative;
      text-align: center;
      margin: 1rem 0;
    }

    .auth-divider::before {
      content: '';
      position: absolute;
      top: 50%;
      left: 0;
      right: 0;
      height: 1px;
      background-color: var(--text-secondary);
      opacity: 0.3;
    }

    .auth-divider span {
      background-color: white;
      padding: 0 1rem;
      color: var(--text-secondary);
      font-size: 0.875rem;
    }

    .auth-footer {
      text-align: center;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .auth-footer p {
      margin: 0;
      color: var(--text-secondary);
      font-size: 0.875rem;
    }

    .auth-link {
      color: var(--primary-color);
      text-decoration: none;
      font-weight: 600;
      font-size: 0.875rem;
    }

    .auth-link:hover {
      text-decoration: underline;
    }

    .error {
      border-color: var(--error-color) !important;
    }

    @media (max-width: 480px) {
      .auth-container {
        padding: 1rem;
      }

      .auth-card {
        padding: 1.5rem;
      }

      .brand-logo h1 {
        font-size: 1.75rem;
      }

      .form-options {
        flex-direction: column;
        align-items: flex-start;
        gap: 0.5rem;
      }
    }
  `]
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);

  hidePassword = signal(true);
  isLoading = signal(false);

  loginForm: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    rememberMe: [false]
  });

  get email() { return this.loginForm.get('email'); }
  get password() { return this.loginForm.get('password'); }

  togglePasswordVisibility(): void {
    this.hidePassword.update(hidden => !hidden);
  }

  async onSubmit(): Promise<void> {
    if (this.loginForm.invalid) {
      this.markFormGroupTouched();
      return;
    }

    this.isLoading.set(true);

    try {
      const credentials: LoginCredentials = {
        email: this.email?.value,
        password: this.password?.value,
        rememberMe: this.loginForm.get('rememberMe')?.value || false
      };

      await this.authService.login(credentials);
      
      this.snackBar.open('Welcome back! Redirecting to dashboard...', 'Close', {
        duration: 3000,
        panelClass: ['success-snackbar']
      });

      await this.router.navigate(['/dashboard']);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Login failed. Please try again.';
      
      this.snackBar.open(errorMessage, 'Close', {
        duration: 5000,
        panelClass: ['error-snackbar']
      });
    } finally {
      this.isLoading.set(false);
    }
  }

  private markFormGroupTouched(): void {
    Object.keys(this.loginForm.controls).forEach(key => {
      const control = this.loginForm.get(key);
      control?.markAsTouched();
    });
  }
}