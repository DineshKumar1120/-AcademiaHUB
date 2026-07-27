import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="min-vh-100 d-flex align-items-center justify-content-center bg-light py-5 px-3">
      <div class="card card-custom border-0 shadow-lg p-4 p-md-5" style="max-width: 440px; width: 100%;">
        <div class="text-center mb-4">
          <div class="brand-icon bg-success text-white rounded-3 mx-auto d-flex align-items-center justify-content-center mb-3" style="width: 54px; height: 54px;">
            <i class="bi bi-shield-check fs-2"></i>
          </div>
          <h3 class="fw-bold text-dark mb-1">Reset Password</h3>
          <p class="text-muted small">Enter your reset code and new password</p>
        </div>

        <form [formGroup]="resetForm" (ngSubmit)="onSubmit()">
          <div class="mb-3">
            <label class="form-label fw-medium small">Email Address</label>
            <input type="email" class="form-control" formControlName="email" readonly />
          </div>

          <div class="mb-3">
            <label class="form-label fw-medium small">Reset Code</label>
            <input type="text" class="form-control text-uppercase" placeholder="e.g. AB12CD34" formControlName="resetToken" />
          </div>

          <div class="mb-3">
            <label class="form-label fw-medium small">New Password</label>
            <input type="password" class="form-control" placeholder="••••••••" formControlName="newPassword" />
          </div>

          <button type="submit" class="btn btn-primary-custom w-100 py-2 fs-6 fw-semibold mb-3" [disabled]="loading || resetForm.invalid">
            <span *ngIf="loading" class="spinner-border spinner-border-sm me-2"></span>
            {{ loading ? 'Updating Password...' : 'Reset Password' }}
          </button>
        </form>

        <div class="text-center">
          <a routerLink="/login" class="text-decoration-none text-muted small"><i class="bi bi-arrow-left me-1"></i> Back to Sign In</a>
        </div>
      </div>
    </div>
  `
})
export class ResetPasswordComponent implements OnInit {
  resetForm: FormGroup;
  loading = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router,
    private toast: ToastService
  ) {
    this.resetForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      resetToken: ['', Validators.required],
      newPassword: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      if (params['email']) this.resetForm.patchValue({ email: params['email'] });
      if (params['token']) this.resetForm.patchValue({ resetToken: params['token'] });
    });
  }

  onSubmit() {
    if (this.resetForm.invalid) return;

    this.loading = true;
    this.authService.resetPassword(this.resetForm.value).subscribe({
      next: (res) => {
        this.loading = false;
        this.toast.success(res.message);
        this.router.navigate(['/login']);
      },
      error: () => {
        this.loading = false;
      }
    });
  }
}
