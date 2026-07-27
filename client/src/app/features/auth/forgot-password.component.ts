import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="min-vh-100 d-flex align-items-center justify-content-center bg-light py-5 px-3">
      <div class="card card-custom border-0 shadow-lg p-4 p-md-5" style="max-width: 440px; width: 100%;">
        <div class="text-center mb-4">
          <div class="brand-icon bg-warning text-white rounded-3 mx-auto d-flex align-items-center justify-content-center mb-3" style="width: 54px; height: 54px;">
            <i class="bi bi-key-fill fs-2"></i>
          </div>
          <h3 class="fw-bold text-dark mb-1">Forgot Password?</h3>
          <p class="text-muted small">Enter your email and we'll generate a reset code for your account</p>
        </div>

        <form [formGroup]="forgotForm" (ngSubmit)="onSubmit()">
          <div class="mb-3">
            <label class="form-label fw-medium small">Account Email Address</label>
            <input type="email" class="form-control" placeholder="name@college.edu" formControlName="email" />
          </div>

          <button type="submit" class="btn btn-primary-custom w-100 py-2 fs-6 fw-semibold mb-3" [disabled]="loading || forgotForm.invalid">
            <span *ngIf="loading" class="spinner-border spinner-border-sm me-2"></span>
            {{ loading ? 'Generating Code...' : 'Send Reset Code' }}
          </button>
        </form>

        <div class="text-center">
          <a routerLink="/login" class="text-decoration-none text-muted small"><i class="bi bi-arrow-left me-1"></i> Back to Sign In</a>
        </div>
      </div>
    </div>
  `
})
export class ForgotPasswordComponent {
  forgotForm: FormGroup;
  loading = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private toast: ToastService
  ) {
    this.forgotForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  onSubmit() {
    if (this.forgotForm.invalid) return;

    this.loading = true;
    this.authService.forgotPassword(this.forgotForm.value.email).subscribe({
      next: (res) => {
        this.loading = false;
        this.toast.info(res.message, 'Reset Code Generated');
        this.router.navigate(['/reset-password'], { queryParams: { email: this.forgotForm.value.email, token: res.resetToken } });
      },
      error: () => {
        this.loading = false;
      }
    });
  }
}
