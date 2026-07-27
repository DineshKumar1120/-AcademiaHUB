import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../core/services/auth.service';
import { ToastService } from '../core/services/toast.service';
import { User } from '../core/models/user.model';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="container-fluid p-0 fade-in" style="max-width: 700px;">
      <h3 class="fw-bold text-dark mb-1">User Profile</h3>
      <p class="text-muted small mb-4">View and update your personal account settings.</p>

      <div class="card card-custom p-4 p-md-5" *ngIf="user">
        <div class="d-flex align-items-center gap-4 mb-4 pb-3 border-bottom">
          <div class="avatar-circle bg-primary text-white rounded-circle d-flex align-items-center justify-content-center fw-bold fs-2" style="width: 70px; height: 70px;">
            {{ user.name ? user.name[0].toUpperCase() : 'U' }}
          </div>
          <div>
            <h4 class="fw-bold text-dark mb-1">{{ user.name }}</h4>
            <div class="text-muted small mb-1">{{ user.email }}</div>
            <span class="badge bg-primary-subtle text-primary border border-primary-subtle rounded-pill">{{ user.role }}</span>
          </div>
        </div>

        <form [formGroup]="profileForm" (ngSubmit)="onSubmit()">
          <div class="mb-3">
            <label class="form-label fw-medium">Full Name</label>
            <input type="text" class="form-control" formControlName="name" />
          </div>

          <div class="mb-3">
            <label class="form-label fw-medium">Email Address (Read-only)</label>
            <input type="email" class="form-control bg-light" [value]="user.email" disabled />
          </div>

          <div class="mb-4">
            <label class="form-label fw-medium">Phone Number</label>
            <input type="text" class="form-control" formControlName="phone" />
          </div>

          <div class="d-flex justify-content-end">
            <button type="submit" class="btn btn-primary-custom px-4" [disabled]="saving || profileForm.invalid">
              <span *ngIf="saving" class="spinner-border spinner-border-sm me-2"></span>
              {{ saving ? 'Saving Changes...' : 'Save Profile' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  `
})
export class ProfileComponent implements OnInit {
  user: User | null = null;
  profileForm: FormGroup;
  saving = false;

  constructor(
    private authService: AuthService,
    private fb: FormBuilder,
    private toast: ToastService
  ) {
    this.profileForm = this.fb.group({
      name: ['', Validators.required],
      phone: ['']
    });
  }

  ngOnInit() {
    this.authService.currentUser$.subscribe(u => {
      this.user = u;
      if (u) {
        this.profileForm.patchValue({
          name: u.name,
          phone: u.phone || ''
        });
      }
    });
  }

  onSubmit() {
    if (this.profileForm.invalid) return;

    this.saving = true;
    this.authService.updateProfile(this.profileForm.value).subscribe({
      next: () => {
        this.saving = false;
        this.toast.success('Profile updated successfully!');
      },
      error: () => {
        this.saving = false;
      }
    });
  }
}
