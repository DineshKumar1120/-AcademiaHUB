import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="min-vh-100 d-flex align-items-center justify-content-center bg-light py-5 px-3">
      <div class="card card-custom border-0 shadow-lg p-4 p-md-5" style="max-width: 450px; width: 100%;">
        <div class="text-center mb-4">
          <div class="brand-icon bg-primary text-white rounded-3 mx-auto d-flex align-items-center justify-content-center mb-3" style="width: 54px; height: 54px;">
            <i class="bi bi-mortarboard-fill fs-2"></i>
          </div>
          <h3 class="fw-bold text-dark mb-1">Welcome Back</h3>
          <p class="text-muted small">Sign in to access your assignment portal</p>
        </div>

        <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
          <div class="mb-3">
            <label class="form-label fw-medium small">Email Address</label>
            <div class="input-group">
              <span class="input-group-text bg-white border-end-0 text-muted"><i class="bi bi-envelope"></i></span>
              <input
                type="email"
                class="form-control border-start-0"
                placeholder="name@college.edu"
                formControlName="email"
                [class.is-invalid]="f['email'].touched && f['email'].errors"
              />
            </div>
            <div *ngIf="f['email'].touched && f['email'].errors" class="invalid-feedback d-block small">
              <span *ngIf="f['email'].errors?.['required']">Email is required</span>
              <span *ngIf="f['email'].errors?.['email']">Invalid email format</span>
            </div>
          </div>

          <div class="mb-3">
            <div class="d-flex justify-content-between align-items-center mb-1">
              <label class="form-label fw-medium small mb-0">Password</label>
              <a routerLink="/forgot-password" class="extra-small text-decoration-none text-primary">Forgot Password?</a>
            </div>
            <div class="input-group">
              <span class="input-group-text bg-white border-end-0 text-muted"><i class="bi bi-lock"></i></span>
              <input
                [type]="showPassword ? 'text' : 'password'"
                class="form-control border-start-0 border-end-0"
                placeholder="••••••••"
                formControlName="password"
                [class.is-invalid]="f['password'].touched && f['password'].errors"
              />
              <button class="btn btn-outline-secondary border-start-0 bg-white text-muted" type="button" (click)="showPassword = !showPassword">
                <i class="bi" [ngClass]="showPassword ? 'bi-eye-slash' : 'bi-eye'"></i>
              </button>
            </div>
            <div *ngIf="f['password'].touched && f['password'].errors" class="invalid-feedback d-block small">
              Password is required (min 6 characters)
            </div>
          </div>

          <button type="submit" class="btn btn-primary-custom w-100 py-2 fs-6 fw-semibold mb-3" [disabled]="loading || loginForm.invalid">
            <span *ngIf="loading" class="spinner-border spinner-border-sm me-2" role="status"></span>
            {{ loading ? 'Signing In...' : 'Sign In' }}
          </button>
        </form>

        <div class="text-center mb-4">
          <span class="text-muted small">Don't have an account? </span>
          <a routerLink="/register" class="fw-semibold text-decoration-none text-primary small">Register here</a>
        </div>

        <!-- Quick Seeder Credentials for Instant Testing -->
        <div class="border-top pt-3 mt-3">
          <div class="extra-small text-muted text-uppercase fw-bold text-center mb-2">Quick One-Click Demo Logins</div>
          <div class="d-grid gap-1">
            <button class="btn btn-sm btn-outline-primary text-start" (click)="fillDemo('student@college.edu')">
              <i class="bi bi-person-fill me-1"></i> Student Demo (student&#64;college.edu)
            </button>
            <button class="btn btn-sm btn-outline-secondary text-start" (click)="fillDemo('faculty@college.edu')">
              <i class="bi bi-person-badge-fill me-1"></i> Faculty Demo (faculty&#64;college.edu)
            </button>
            <button class="btn btn-sm btn-outline-danger text-start" (click)="fillDemo('admin@college.edu')">
              <i class="bi bi-shield-lock-fill me-1"></i> Admin Demo (admin&#64;college.edu)
            </button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class LoginComponent {
  loginForm: FormGroup;
  loading = false;
  showPassword = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private toast: ToastService
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  get f() { return this.loginForm.controls; }

  onSubmit() {
    if (this.loginForm.invalid) return;

    this.loading = true;
    this.authService.login(this.loginForm.value).subscribe({
      next: (res) => {
        this.loading = false;
        this.toast.success(`Welcome back, ${res.user.name}!`);
        const targetRoute = this.authService.getDashboardRouteForRole(res.user.role);
        this.router.navigate([targetRoute]);
      },
      error: (err) => {
        this.loading = false;
      }
    });
  }

  fillDemo(email: string) {
    this.loginForm.patchValue({
      email: email,
      password: 'Password123!'
    });
  }
}
