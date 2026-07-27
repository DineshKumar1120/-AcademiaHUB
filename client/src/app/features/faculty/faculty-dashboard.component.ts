import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { UserService } from '../../core/services/user.service';
import { AssignmentService } from '../../core/services/assignment.service';
import { ToastService } from '../../core/services/toast.service';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner.component';
import { StatusBadgePipe } from '../../shared/pipes/status-badge.pipe';

@Component({
  selector: 'app-faculty-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, LoadingSpinnerComponent, StatusBadgePipe],
  template: `
    <div class="container-fluid p-0 fade-in">
      <div class="d-flex flex-column flex-md-row align-items-md-center justify-content-between mb-4">
        <div>
          <h3 class="fw-bold text-dark mb-1">Faculty & Staff Control Center</h3>
          <p class="text-muted small mb-0">Manage course assignments, evaluate student submissions, and publish grades.</p>
        </div>
        <div class="mt-3 mt-md-0 d-flex gap-2">
          <a routerLink="/faculty/create-assignment" class="btn btn-primary-custom">
            <i class="bi bi-plus-circle me-2"></i> Create New Assignment
          </a>
        </div>
      </div>

      <app-loading-spinner *ngIf="loading" message="Loading faculty metrics..."></app-loading-spinner>

      <div *ngIf="!loading && stats" class="row g-3 mb-4">
        <div class="col-12 col-sm-6 col-xl-3">
          <div class="stat-card bg-grad-primary shadow-sm">
            <div class="text-white-50 extra-small text-uppercase fw-bold mb-1">Created Assignments</div>
            <h2 class="fw-bold mb-0">{{ stats.totalCreatedAssignments }}</h2>
            <i class="bi bi-journal-plus stat-icon"></i>
          </div>
        </div>

        <div class="col-12 col-sm-6 col-xl-3">
          <div class="stat-card bg-grad-info shadow-sm">
            <div class="text-white-50 extra-small text-uppercase fw-bold mb-1">Active Tasks</div>
            <h2 class="fw-bold mb-0">{{ stats.activeAssignments }}</h2>
            <i class="bi bi-lightning stat-icon"></i>
          </div>
        </div>

        <div class="col-12 col-sm-6 col-xl-3">
          <div class="stat-card bg-grad-success shadow-sm">
            <div class="text-white-50 extra-small text-uppercase fw-bold mb-1">Submissions Received</div>
            <h2 class="fw-bold mb-0">{{ stats.totalSubmissionsReceived }}</h2>
            <i class="bi bi-file-earmark-check stat-icon"></i>
          </div>
        </div>

        <div class="col-12 col-sm-6 col-xl-3">
          <div class="stat-card bg-grad-danger shadow-sm">
            <div class="text-white-50 extra-small text-uppercase fw-bold mb-1">Pending Grading</div>
            <h2 class="fw-bold mb-0">{{ stats.pendingGradingCount }}</h2>
            <i class="bi bi-hourglass-top stat-icon"></i>
          </div>
        </div>
      </div>

      <!-- Created Assignments Management Table -->
      <div *ngIf="!loading" class="card card-custom p-4">
        <div class="d-flex justify-content-between align-items-center mb-3">
          <h5 class="fw-bold text-dark mb-0"><i class="bi bi-list-task text-primary me-2"></i> Managed Assignments</h5>
        </div>

        <div *ngIf="assignments.length === 0" class="text-center py-5 text-muted">
          <i class="bi bi-journal-x fs-2 d-block mb-2"></i>
          You haven't posted any assignments yet. Click "Create New Assignment" above to begin.
        </div>

        <div *ngIf="assignments.length > 0" class="table-responsive">
          <table class="table table-hover align-middle mb-0">
            <thead class="table-light">
              <tr>
                <th class="py-3 px-4">Title</th>
                <th class="py-3 px-3">Subject</th>
                <th class="py-3 px-3">Due Date</th>
                <th class="py-3 px-3">Total Marks</th>
                <th class="py-3 px-3">Status</th>
                <th class="py-3 px-4 text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let item of assignments">
                <td class="py-3 px-4">
                  <div class="fw-bold text-dark">{{ item.title }}</div>
                  <div class="text-muted extra-small text-truncate" style="max-width: 280px;">{{ item.description }}</div>
                </td>
                <td class="py-3 px-3">
                  <span class="badge bg-secondary-subtle text-secondary fw-medium">{{ item.subjectId?.code || 'CS' }}</span>
                </td>
                <td class="py-3 px-3 text-muted small">
                  {{ item.dueDate | date: 'mediumDate' }}
                </td>
                <td class="py-3 px-3 fw-bold text-dark">
                  {{ item.totalMarks }}
                </td>
                <td class="py-3 px-3">
                  <span class="badge rounded-pill" [ngClass]="item.status | statusBadge">{{ item.status }}</span>
                </td>
                <td class="py-3 px-4 text-end">
                  <div class="d-flex gap-2 justify-content-end">
                    <a [routerLink]="['/faculty/submissions', item._id]" class="btn btn-sm btn-outline-primary" title="View Submissions">
                      <i class="bi bi-people-fill me-1"></i> Submissions
                    </a>
                    <button class="btn btn-sm btn-outline-danger" (click)="deleteAssignment(item._id)" title="Delete">
                      <i class="bi bi-trash"></i>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `
})
export class FacultyDashboardComponent implements OnInit {
  stats: any = null;
  assignments: any[] = [];
  loading = true;

  constructor(
    private userService: UserService,
    private assignmentService: AssignmentService,
    private toast: ToastService
  ) {}

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.loading = true;
    this.userService.getDashboardStats().subscribe({
      next: (res) => {
        this.stats = res.stats;
      }
    });

    this.assignmentService.getAssignments({ myOnly: true }).subscribe({
      next: (res) => {
        this.assignments = res.assignments;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  deleteAssignment(id: string) {
    if (confirm('Are you sure you want to delete this assignment and all associated student submissions?')) {
      this.assignmentService.deleteAssignment(id).subscribe({
        next: (res) => {
          this.toast.success('Assignment deleted successfully');
          this.loadData();
        }
      });
    }
  }
}
