import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { UserService } from '../../core/services/user.service';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner.component';
import { StatusBadgePipe } from '../../shared/pipes/status-badge.pipe';

@Component({
  selector: 'app-student-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, LoadingSpinnerComponent, StatusBadgePipe],
  template: `
    <div class="container-fluid p-0 fade-in">
      <!-- Page Header -->
      <div class="d-flex flex-column flex-md-row align-items-md-center justify-content-between mb-4">
        <div>
          <h3 class="fw-bold text-dark mb-1">Student Portal Dashboard</h3>
          <p class="text-muted small mb-0">Overview of your coursework, upcoming deadlines, and graded feedback.</p>
        </div>
        <div class="mt-3 mt-md-0">
          <a routerLink="/student/assignments" class="btn btn-gradient">
            <i class="bi bi-journal-text me-2"></i> Browse All Assignments
          </a>
        </div>
      </div>

      <app-loading-spinner *ngIf="loading" message="Loading your dashboard..."></app-loading-spinner>

      <div *ngIf="!loading && stats" class="row g-3 mb-4">
        <!-- Stat Cards -->
        <div class="col-12 col-sm-6 col-xl-3">
          <div class="stat-card bg-grad-primary shadow-sm">
            <div class="text-white-50 extra-small text-uppercase fw-bold mb-1">Total Assignments</div>
            <h2 class="fw-bold mb-0">{{ stats.totalAssignments }}</h2>
            <i class="bi bi-folder2-open stat-icon"></i>
          </div>
        </div>

        <div class="col-12 col-sm-6 col-xl-3">
          <div class="stat-card bg-grad-warning shadow-sm">
            <div class="text-white-50 extra-small text-uppercase fw-bold mb-1">Pending Submissions</div>
            <h2 class="fw-bold mb-0">{{ stats.pendingAssignments }}</h2>
            <i class="bi bi-hourglass-split stat-icon"></i>
          </div>
        </div>

        <div class="col-12 col-sm-6 col-xl-3">
          <div class="stat-card bg-grad-info shadow-sm">
            <div class="text-white-50 extra-small text-uppercase fw-bold mb-1">Submitted</div>
            <h2 class="fw-bold mb-0">{{ stats.submittedAssignments }}</h2>
            <i class="bi bi-cloud-arrow-up stat-icon"></i>
          </div>
        </div>

        <div class="col-12 col-sm-6 col-xl-3">
          <div class="stat-card bg-grad-success shadow-sm">
            <div class="text-white-50 extra-small text-uppercase fw-bold mb-1">Graded Tasks</div>
            <h2 class="fw-bold mb-0">{{ stats.gradedAssignments }}</h2>
            <i class="bi bi-award stat-icon"></i>
          </div>
        </div>
      </div>

      <!-- Main Grid Sections -->
      <div *ngIf="!loading && stats" class="row g-4">
        <!-- Upcoming Deadlines Section -->
        <div class="col-12 col-lg-7">
          <div class="card card-custom h-100 p-4">
            <div class="d-flex justify-content-between align-items-center mb-3">
              <h5 class="fw-bold text-dark mb-0"><i class="bi bi-calendar-event text-primary me-2"></i> Upcoming Deadlines</h5>
              <a routerLink="/student/assignments" class="small text-decoration-none text-primary">View All</a>
            </div>

            <div *ngIf="stats.upcomingAssignments?.length === 0" class="text-center py-4 text-muted">
              <i class="bi bi-check-circle fs-2 d-block mb-2 text-success"></i>
              No pending assignments right now! Great job.
            </div>

            <div class="list-group list-group-flush">
              <div *ngFor="let item of stats.upcomingAssignments" class="list-group-item px-0 py-3 border-bottom d-flex align-items-center justify-content-between">
                <div>
                  <span class="badge bg-secondary-subtle text-secondary me-2">{{ item.subjectId?.code || 'CS' }}</span>
                  <a [routerLink]="['/assignments', item._id]" class="fw-semibold text-dark text-decoration-none hover-primary">{{ item.title }}</a>
                  <div class="text-muted extra-small mt-1">Due: <strong class="text-danger">{{ item.dueDate | date: 'mediumDate' }}</strong> (Total Marks: {{ item.totalMarks }})</div>
                </div>
                <a [routerLink]="['/assignments', item._id]" class="btn btn-sm btn-outline-primary rounded-pill px-3">
                  Upload Work
                </a>
              </div>
            </div>
          </div>
        </div>

        <!-- Recent Marks & Feedback Section -->
        <div class="col-12 col-lg-5">
          <div class="card card-custom h-100 p-4">
            <div class="d-flex justify-content-between align-items-center mb-3">
              <h5 class="fw-bold text-dark mb-0"><i class="bi bi-trophy text-warning me-2"></i> Recent Submissions</h5>
              <a routerLink="/student/marks" class="small text-decoration-none text-primary">Full Marks</a>
            </div>

            <div *ngIf="stats.recentSubmissions?.length === 0" class="text-center py-4 text-muted">
              <i class="bi bi-inbox fs-2 d-block mb-2"></i>
              You haven't submitted any assignments yet.
            </div>

            <div class="list-group list-group-flush">
              <div *ngFor="let sub of stats.recentSubmissions" class="list-group-item px-0 py-3 border-bottom">
                <div class="d-flex justify-content-between align-items-start mb-1">
                  <div class="fw-semibold text-dark small">{{ sub.assignmentId?.title }}</div>
                  <span class="badge rounded-pill" [ngClass]="sub.status | statusBadge">{{ sub.status }}</span>
                </div>
                <div class="d-flex justify-content-between align-items-center text-muted extra-small">
                  <span>Submitted: {{ sub.submissionDate | date: 'shortDate' }}</span>
                  <span *ngIf="sub.status === 'GRADED'" class="fw-bold text-success fs-6">
                    {{ sub.marksObtained }} / {{ sub.assignmentId?.totalMarks }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class StudentDashboardComponent implements OnInit {
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
}
