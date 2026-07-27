import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../core/services/auth.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="container-fluid p-0 fade-in">
      <!-- Hero Banner -->
      <div class="bg-gradient p-5 rounded-4 text-white text-center mb-5 shadow-lg position-relative overflow-hidden" style="background: linear-gradient(135deg, #4f46e5 0%, #06b6d4 100%);">
        <div class="position-relative z-1 py-4">
          <span class="badge bg-white text-primary rounded-pill px-3 py-2 fw-semibold mb-3">NEXT-GEN ACADEMIC PORTAL</span>
          <h1 class="display-4 fw-bold mb-3 tracking-tight">College Assignment Management System</h1>
          <p class="lead mx-auto text-white-50 mb-4" style="max-width: 680px;">
            A centralized digital platform connecting Students, Faculty Members, and Academic Administrators for seamless assignment delivery, evaluation, and grade publishing.
          </p>

          <div class="d-flex justify-content-center gap-3" *ngIf="!isLoggedIn">
            <a routerLink="/login" class="btn btn-light btn-lg px-4 fw-bold text-primary shadow">Sign In to Portal</a>
            <a routerLink="/register" class="btn btn-outline-light btn-lg px-4 fw-bold">Create Account</a>
          </div>

          <div class="d-flex justify-content-center gap-3" *ngIf="isLoggedIn">
            <a [routerLink]="dashboardLink" class="btn btn-light btn-lg px-4 fw-bold text-primary shadow">
              <i class="bi bi-speedometer2 me-2"></i> Go to My Dashboard
            </a>
          </div>
        </div>
      </div>

      <!-- Feature Cards Grid -->
      <div class="row g-4 mb-5">
        <div class="col-12 col-md-4">
          <div class="card card-custom h-100 p-4 text-center">
            <div class="feature-icon bg-primary-subtle text-primary rounded-circle mx-auto d-flex align-items-center justify-content-center mb-3" style="width: 64px; height: 64px;">
              <i class="bi bi-mortarboard-fill fs-2"></i>
            </div>
            <h4 class="fw-bold text-dark mb-2">Student Portal</h4>
            <p class="text-muted small">
              View course assignments, track submission deadlines, upload homework files, and review evaluator marks and feedback instantly.
            </p>
          </div>
        </div>

        <div class="col-12 col-md-4">
          <div class="card card-custom h-100 p-4 text-center">
            <div class="feature-icon bg-indigo-subtle text-indigo rounded-circle mx-auto d-flex align-items-center justify-content-center mb-3" style="width: 64px; height: 64px; color: #6366f1;">
              <i class="bi bi-person-badge-fill fs-2"></i>
            </div>
            <h4 class="fw-bold text-dark mb-2">Faculty Hub</h4>
            <p class="text-muted small">
              Publish new assignments, attach reference guidelines, inspect student submission files, grade work, and provide detailed feedback.
            </p>
          </div>
        </div>

        <div class="col-12 col-md-4">
          <div class="card card-custom h-100 p-4 text-center">
            <div class="feature-icon bg-danger-subtle text-danger rounded-circle mx-auto d-flex align-items-center justify-content-center mb-3" style="width: 64px; height: 64px;">
              <i class="bi bi-shield-check fs-2"></i>
            </div>
            <h4 class="fw-bold text-dark mb-2">Admin Console</h4>
            <p class="text-muted small">
              Manage system users, departments, courses, and subject offerings while monitoring institutional performance metrics.
            </p>
          </div>
        </div>
      </div>
    </div>
  `
})
export class HomeComponent {
  constructor(private authService: AuthService) {}

  get isLoggedIn(): boolean {
    return !!this.authService.currentUserValue;
  }

  get dashboardLink(): string {
    return this.authService.getDashboardRouteForRole();
  }
}
