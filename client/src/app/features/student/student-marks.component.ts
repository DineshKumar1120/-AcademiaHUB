import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AssignmentService } from '../../core/services/assignment.service';
import { Assignment } from '../../core/models/assignment.model';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner.component';
import { EmptyStateComponent } from '../../shared/components/empty-state.component';
import { StatusBadgePipe } from '../../shared/pipes/status-badge.pipe';

@Component({
  selector: 'app-student-marks',
  standalone: true,
  imports: [CommonModule, RouterModule, LoadingSpinnerComponent, EmptyStateComponent, StatusBadgePipe],
  template: `
    <div class="container-fluid p-0 fade-in">
      <div class="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4">
        <div>
          <h3 class="fw-bold text-dark mb-1">My Marks & Faculty Feedback</h3>
          <p class="text-muted small mb-0">Track your performance ratings and evaluator comments on submitted assignments.</p>
        </div>
      </div>

      <app-loading-spinner *ngIf="loading" message="Loading your grade reports..."></app-loading-spinner>

      <app-empty-state
        *ngIf="!loading && gradedAssignments.length === 0"
        title="No Graded Work Yet"
        description="You do not have any evaluated submissions with feedback at this moment."
        icon="bi-award-fill"
      ></app-empty-state>

      <!-- Marks Summary Table -->
      <div *ngIf="!loading && gradedAssignments.length > 0" class="card card-custom p-0 overflow-hidden shadow-sm">
        <div class="table-responsive">
          <table class="table table-hover align-middle mb-0">
            <thead class="table-light border-bottom">
              <tr>
                <th class="py-3 px-4">Assignment Title</th>
                <th class="py-3 px-3">Subject</th>
                <th class="py-3 px-3">Submitted On</th>
                <th class="py-3 px-3">Score / Total</th>
                <th class="py-3 px-3">Status</th>
                <th class="py-3 px-4">Faculty Feedback</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let item of gradedAssignments">
                <td class="py-3 px-4">
                  <div class="fw-bold text-dark">{{ item.title }}</div>
                  <div class="text-muted extra-small">Max Marks: {{ item.totalMarks }}</div>
                </td>
                <td class="py-3 px-3">
                  <span class="badge bg-secondary-subtle text-secondary fw-medium">{{ item.subjectId?.code || 'CS' }}</span>
                </td>
                <td class="py-3 px-3 text-muted small">
                  {{ item.submission?.submissionDate | date: 'mediumDate' }}
                </td>
                <td class="py-3 px-3">
                  <div class="fw-bold text-success fs-5">
                    {{ item.submission?.marksObtained }} <span class="text-muted fs-6">/ {{ item.totalMarks }}</span>
                  </div>
                  <div class="extra-small text-muted">
                    {{ getPercentage(item.submission?.marksObtained, item.totalMarks) }}% Grade
                  </div>
                </td>
                <td class="py-3 px-3">
                  <span class="badge rounded-pill" [ngClass]="item.submission?.status | statusBadge">
                    {{ item.submission?.status }}
                  </span>
                </td>
                <td class="py-3 px-4">
                  <div *ngIf="item.submission?.feedback" class="p-2 rounded bg-light border text-secondary small">
                    <i class="bi bi-chat-quote me-1 text-primary"></i> "{{ item.submission?.feedback }}"
                  </div>
                  <span *ngIf="!item.submission?.feedback" class="text-muted extra-small italic">No written comments</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `
})
export class StudentMarksComponent implements OnInit {
  gradedAssignments: Assignment[] = [];
  loading = true;

  constructor(private assignmentService: AssignmentService) {}

  ngOnInit() {
    this.assignmentService.getAssignments().subscribe({
      next: (res) => {
        if (res.success) {
          this.gradedAssignments = res.assignments.filter(a => a.submission && a.submission.status === 'GRADED');
        }
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  getPercentage(marks: number | undefined | null, total: number): number {
    if (!marks || !total) return 0;
    return Math.round((marks / total) * 100);
  }
}
