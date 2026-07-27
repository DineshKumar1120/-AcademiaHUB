import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { SubmissionService } from '../../core/services/submission.service';
import { ToastService } from '../../core/services/toast.service';
import { Submission } from '../../core/models/submission.model';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner.component';
import { EmptyStateComponent } from '../../shared/components/empty-state.component';
import { StatusBadgePipe } from '../../shared/pipes/status-badge.pipe';

@Component({
  selector: 'app-view-submissions',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, LoadingSpinnerComponent, EmptyStateComponent, StatusBadgePipe],
  template: `
    <div class="container-fluid p-0 fade-in">
      <div class="d-flex flex-column flex-md-row align-items-md-center justify-content-between mb-4">
        <div>
          <h3 class="fw-bold text-dark mb-1">Submissions Review</h3>
          <p class="text-muted small mb-0" *ngIf="assignment">
            Evaluating submissions for: <strong class="text-primary">{{ assignment.title }}</strong> (Max Marks: {{ assignment.totalMarks }})
          </p>
        </div>
        <div class="mt-3 mt-md-0">
          <a routerLink="/faculty/dashboard" class="btn btn-outline-secondary btn-sm">
            <i class="bi bi-arrow-left me-1"></i> Back to Faculty Dashboard
          </a>
        </div>
      </div>

      <app-loading-spinner *ngIf="loading" message="Fetching student submissions..."></app-loading-spinner>

      <app-empty-state
        *ngIf="!loading && submissions.length === 0"
        title="No Submissions Received"
        description="No students have submitted work for this assignment yet."
        icon="bi-cloud-slash"
      ></app-empty-state>

      <!-- Submissions Table -->
      <div *ngIf="!loading && submissions.length > 0" class="card card-custom p-0 overflow-hidden shadow-sm">
        <div class="table-responsive">
          <table class="table table-hover align-middle mb-0">
            <thead class="table-light border-bottom">
              <tr>
                <th class="py-3 px-4">Student Name</th>
                <th class="py-3 px-3">Submission Date</th>
                <th class="py-3 px-3">Uploaded File</th>
                <th class="py-3 px-3">Status</th>
                <th class="py-3 px-3">Assigned Marks</th>
                <th class="py-3 px-4 text-end">Action</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let sub of submissions">
                <td class="py-3 px-4">
                  <div class="d-flex align-items-center gap-3">
                    <div class="avatar-circle bg-primary text-white rounded-circle d-flex align-items-center justify-content-center fw-bold" style="width: 38px; height: 38px;">
                      {{ sub.studentId?.name ? sub.studentId.name[0].toUpperCase() : 'S' }}
                    </div>
                    <div>
                      <div class="fw-bold text-dark">{{ sub.studentId?.name }}</div>
                      <div class="text-muted extra-small">{{ sub.studentId?.email }}</div>
                    </div>
                  </div>
                </td>
                <td class="py-3 px-3 text-muted small">
                  {{ sub.submissionDate | date: 'medium' }}
                </td>
                <td class="py-3 px-3">
                  <a [href]="getDownloadUrl(sub.fileName)" target="_blank" class="btn btn-sm btn-light border text-primary">
                    <i class="bi bi-file-earmark-arrow-down me-1"></i> {{ sub.fileName }}
                  </a>
                </td>
                <td class="py-3 px-3">
                  <span class="badge rounded-pill" [ngClass]="sub.status | statusBadge">{{ sub.status }}</span>
                </td>
                <td class="py-3 px-3">
                  <div *ngIf="sub.status === 'GRADED'" class="fw-bold text-success fs-6">
                    {{ sub.marksObtained }} / {{ assignment?.totalMarks }}
                  </div>
                  <span *ngIf="sub.status !== 'GRADED'" class="text-muted extra-small italic">Not Graded</span>
                </td>
                <td class="py-3 px-4 text-end">
                  <button class="btn btn-sm btn-primary-custom" (click)="openGradeModal(sub)">
                    <i class="bi bi-pencil-square me-1"></i> {{ sub.status === 'GRADED' ? 'Edit Grade' : 'Grade Work' }}
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Grade Submission Modal -->
      <div *ngIf="selectedSubmission" class="modal fade show d-block" tabindex="-1" style="background: rgba(0,0,0,0.5);">
        <div class="modal-dialog modal-dialog-centered">
          <div class="modal-content card-custom border-0 p-3">
            <div class="modal-header border-0 pb-0">
              <h5 class="modal-title fw-bold">Grade Student Submission</h5>
              <button type="button" class="btn-close" (click)="closeGradeModal()"></button>
            </div>

            <div class="modal-body">
              <p class="text-muted small mb-3">
                Student: <strong>{{ selectedSubmission.studentId?.name }}</strong><br>
                Assignment: <strong>{{ assignment?.title }}</strong>
              </p>

              <form [formGroup]="gradeForm" (ngSubmit)="submitGrade()">
                <div class="mb-3">
                  <label class="form-label fw-medium">Marks Obtained (Max {{ assignment?.totalMarks }}) *</label>
                  <input
                    type="number"
                    min="0"
                    [max]="assignment?.totalMarks"
                    class="form-control"
                    formControlName="marksObtained"
                  />
                </div>

                <div class="mb-3">
                  <label class="form-label fw-medium">Feedback & Evaluator Remarks</label>
                  <textarea
                    class="form-control"
                    rows="4"
                    placeholder="Enter detailed constructive feedback for the student..."
                    formControlName="feedback"
                  ></textarea>
                </div>

                <div class="d-flex justify-content-end gap-2 pt-2">
                  <button type="button" class="btn btn-light" (click)="closeGradeModal()">Cancel</button>
                  <button type="submit" class="btn btn-primary-custom" [disabled]="submittingGrade || gradeForm.invalid">
                    <span *ngIf="submittingGrade" class="spinner-border spinner-border-sm me-1"></span>
                    Save & Publish Grade
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class ViewSubmissionsComponent implements OnInit {
  assignmentId: string = '';
  assignment: any = null;
  submissions: Submission[] = [];
  loading = true;

  selectedSubmission: Submission | null = null;
  gradeForm: FormGroup;
  submittingGrade = false;

  constructor(
    private route: ActivatedRoute,
    private submissionService: SubmissionService,
    private fb: FormBuilder,
    private toast: ToastService
  ) {
    this.gradeForm = this.fb.group({
      marksObtained: [0, [Validators.required, Validators.min(0)]],
      feedback: ['']
    });
  }

  ngOnInit() {
    this.assignmentId = this.route.snapshot.paramMap.get('assignmentId') || '';
    if (this.assignmentId) this.loadSubmissions();
  }

  loadSubmissions() {
    this.loading = true;
    this.submissionService.getSubmissionsByAssignment(this.assignmentId).subscribe({
      next: (res) => {
        this.assignment = res.assignment;
        this.submissions = res.submissions;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  getDownloadUrl(filename: string | undefined): string {
    if (!filename) return '#';
    return this.submissionService.getDownloadUrl(filename);
  }

  openGradeModal(sub: Submission) {
    this.selectedSubmission = sub;
    this.gradeForm.patchValue({
      marksObtained: sub.marksObtained || 0,
      feedback: sub.feedback || ''
    });
  }

  closeGradeModal() {
    this.selectedSubmission = null;
  }

  submitGrade() {
    if (!this.selectedSubmission || this.gradeForm.invalid) return;

    this.submittingGrade = true;
    this.submissionService.gradeSubmission(this.selectedSubmission._id, this.gradeForm.value).subscribe({
      next: (res) => {
        this.submittingGrade = false;
        this.toast.success('Grade published to student notification center!');
        this.closeGradeModal();
        this.loadSubmissions();
      },
      error: () => {
        this.submittingGrade = false;
      }
    });
  }
}
