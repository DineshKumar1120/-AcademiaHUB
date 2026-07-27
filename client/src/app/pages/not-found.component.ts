import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="min-vh-100 d-flex align-items-center justify-content-center bg-light p-4 text-center">
      <div class="card card-custom p-5 border-0 shadow-lg" style="max-width: 480px;">
        <h1 class="display-1 fw-bold text-primary mb-0">404</h1>
        <h4 class="fw-bold text-dark mb-2">Page Not Found</h4>
        <p class="text-muted small mb-4">
          The requested route or resource does not exist or may have been moved.
        </p>
        <a routerLink="/" class="btn btn-primary-custom py-2 px-4 fw-semibold mx-auto">
          <i class="bi bi-house me-2"></i> Return to Safety
        </a>
      </div>
    </div>
  `
})
export class NotFoundComponent {}
