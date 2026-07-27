import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { UserService } from '../../core/services/user.service';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner.component';
import { StatusBadgePipe } from '../../shared/pipes/status-badge.pipe';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, LoadingSpinnerComponent, StatusBadgePipe],
  template: `
    <div class="container-fluid p-0 fade-in">
      <div class="d-flex flex-column flex-md-row align-items-md-center justify-content-between mb-4">
        <div>
          <h3 class="fw-bold text-dark mb-1">System Administration Console</h3>
          <p class="text-muted small mb-0">Full oversight of college users, departments, courses, subjects, and analytics.</p>
        </div>
        <div class="mt-3 mt-md-0 d-flex gap-2">
          <a routerLink="/admin/users" class="btn btn-primary-custom">
            <i class="bi bi-person-plus me-1"></i> Manage Users
          </a>
          <a routerLink="/admin/departments" class="btn btn-outline-secondary">
            <i class="bi bi-building me-1"></i> Academic Curriculum
          </a>
        </div>
      </div>

      <app-loading-spinner *ngIf="loading" message="Gathering system analytics..."></app-loading-spinner>

      <div *ngIf="!loading && stats" class="row g-3 mb-4">
        <div class="col-12 col-sm-6 col-md-4 col-xl-3">
          <div class="stat-card bg-grad-primary shadow-sm">
            <div class="text-white-50 extra-small text-uppercase fw-bold mb-1">Total Students</div>
            <h2 class="fw-bold mb-0">{{ stats.totalStudents }}</h2>
            <i class="bi bi-mortarboard stat-icon"></i>
          </div>
        </div>

        <div class="col-12 col-sm-6 col-md-4 col-xl-3">
          <div class="stat-card bg-grad-info shadow-sm">
            <div class="text-white-50 extra-small text-uppercase fw-bold mb-1">Faculty & Staff</div>
            <h2 class="fw-bold mb-0">{{ stats.totalFaculty }}</h2>
            <i class="bi bi-person-badge stat-icon"></i>
          </div>
        </div>

        <div class="col-12 col-sm-6 col-md-4 col-xl-3">
          <div class="stat-card bg-grad-warning shadow-sm">
            <div class="text-white-50 extra-small text-uppercase fw-bold mb-1">Departments</div>
            <h2 class="fw-bold mb-0">{{ stats.totalDepartments }}</h2>
            <i class="bi bi-building stat-icon"></i>
          </div>
        </div>

        <div class="col-12 col-sm-6 col-md-4 col-xl-3">
          <div class="stat-card bg-grad-success shadow-sm">
            <div class="text-white-50 extra-small text-uppercase fw-bold mb-1">Total Submissions</div>
            <h2 class="fw-bold mb-0">{{ stats.totalSubmissions }}</h2>
            <i class="bi bi-cloud-check stat-icon"></i>
          </div>
        </div>
      </div>

      <!-- Recent Registered Users Table -->
      <div *ngIf="!loading && stats" class="card card-custom p-4">
        <div class="d-flex justify-content-between align-items-center mb-3">
          <h5 class="fw-bold text-dark mb-0"><i class="bi bi-clock-history text-primary me-2"></i> Recent User Registrations</h5>
          <a routerLink="/admin/users" class="small text-decoration-none text-primary">View All Users</a>
        </div>

        <div class="table-responsive">
          <table class="table table-hover align-middle mb-0">
            <thead class="table-light">
              <tr>
                <th class="py-3 px-4">User</th>
                <th class="py-3 px-3">Role</th>
                <th class="py-3 px-3">Status</th>
                <th class="py-3 px-3">Registered Date</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let user of stats.recentUsers">
                <td class="py-3 px-4">
                  <div class="d-flex align-items-center gap-3">
                    <div class="avatar-circle bg-primary text-white rounded-circle d-flex align-items-center justify-content-center fw-bold" style="width: 36px; height: 36px;">
                      {{ user.name ? user.name[0].toUpperCase() : 'U' }}
                    </div>
                    <div>
                      <div class="fw-bold text-dark">{{ user.name }}</div>
                      <div class="text-muted extra-small">{{ user.email }}</div>
                    </div>
                  </div>
                </td>
                <td class="py-3 px-3">
                  <span class="badge rounded-pill" [ngClass]="getRoleBadgeClass(user.role)">{{ user.role }}</span>
                </td>
                <td class="py-3 px-3">
                  <span class="badge rounded-pill" [ngClass]="user.isActive ? 'bg-success-subtle text-success' : 'bg-danger-subtle text-danger'">
                    {{ user.isActive ? 'Active' : 'Inactive' }}
                  </span>
                </td>
                <td class="py-3 px-3 text-muted small">
                  {{ user.createdAt | date: 'mediumDate' }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `
})
export class AdminDashboardComponent implements OnInit {
  stats: any = null;
  loading = true;

  constructor(private userService: UserService) {}

  ngOnInit() {
    this.userService.getDashboardStats().subscribe({
      next: (res) => {
        this.stats = res.stats;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  getRoleBadgeClass(role: string): string {
    switch (role) {
      case 'ADMIN': return 'bg-danger-subtle text-danger border border-danger-subtle';
      case 'FACULTY': return 'bg-primary-subtle text-primary border border-primary-subtle';
      default: return 'bg-success-subtle text-success border border-success-subtle';
    }
  }
}
