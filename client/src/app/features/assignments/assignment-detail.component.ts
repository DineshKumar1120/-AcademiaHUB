import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AssignmentService } from '../../core/services/assignment.service';
import { SubmissionService } from '../../core/services/submission.service';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';
import { Assignment } from '../../core/models/assignment.model';
import { Submission } from '../../core/models/submission.model';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner.component';
import { StatusBadgePipe } from '../../shared/pipes/status-badge.pipe';

@Component({
  selector: 'app-assignment-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, LoadingSpinnerComponent, StatusBadgePipe],
  template: `
    <div class="container-fluid p-0 fade-in" style="max-width: 900px;">
      <app-loading-spinner *ngIf="loading" message="Loading assignment details..."></app-loading-spinner>

      <div *ngIf="!loading && assignment">
        <!-- Header & Breadcrumbs -->
        <div class="d-flex align-items-center justify-content-between mb-3">
          <div>
            <span class="badge bg-primary-subtle text-primary border border-primary-subtle me-2 fw-semibold">
              {{ assignment.subjectId?.code || 'SUBJECT' }}
            </span>
            <span class="badge rounded-pill" [ngClass]="assignment.status | statusBadge">{{ assignment.status }}</span>
          </div>
          <button class="btn btn-outline-secondary btn-sm" (click)="goBack()">
            <i class="bi bi-arrow-left me-1"></i> Back
          </button>
        </div>

        <h2 class="fw-bold text-dark mb-2">{{ assignment.title }}</h2>

        <div class="d-flex flex-wrap gap-4 text-muted small border-bottom pb-3 mb-4">
          <div><i class="bi bi-person me-1 text-primary"></i> Posted by: <strong>{{ assignment.createdBy?.name || 'Faculty Member' }}</strong></div>
          <div><i class="bi bi-calendar-event me-1 text-danger"></i> Due: <strong>{{ assignment.dueDate | date: 'medium' }}</strong></div>
          <div><i class="bi bi-award me-1 text-warning"></i> Total Marks: <strong>{{ assignment.totalMarks }}</strong></div>
        </div>

        <!-- Description Card -->
        <div class="card card-custom p-4 mb-4">
          <h5 class="fw-bold text-dark mb-3"><i class="bi bi-file-text text-primary me-2"></i> Assignment Instructions</h5>
          <div class="text-secondary leading-relaxed mb-3" style="white-space: pre-line;">
            {{ assignment.description }}
          </div>

          <div *ngIf="assignment.attachmentUrl" class="p-3 bg-light rounded-3 border d-flex align-items-center justify-content-between mt-2">
            <div class="d-flex align-items-center gap-2">
              <i class="bi bi-paperclip fs-4 text-primary"></i>
              <div>
                <div class="fw-semibold text-dark small">{{ assignment.attachmentName || 'Resource Attachment' }}</div>
                <div class="text-muted extra-small">Download instructor reference file</div>
              </div>
            </div>
            <a [href]="getDownloadUrl(assignment.attachmentUrl)" target="_blank" class="btn btn-sm btn-outline-primary">
              <i class="bi bi-download me-1"></i> Download File
            </a>
          </div>
        </div>

        <!-- Submission Status Card (For Students) -->
        <div *ngIf="isStudent" class="card card-custom p-4 border-start border-4" [ngClass]="submission ? 'border-success' : 'border-warning'">
          <h5 class="fw-bold text-dark mb-3"><i class="bi bi-upload text-primary me-2"></i> Your Work Submission</h5>

          <div *ngIf="submission" class="p-3 bg-light rounded-3 mb-3 border">
            <div class="d-flex justify-content-between align-items-start mb-2">
              <div>
                <span class="badge rounded-pill me-2" [ngClass]="submission.status | statusBadge">{{ submission.status }}</span>
                <span class="extra-small text-muted">Submitted on: {{ submission.submissionDate | date: 'medium' }}</span>
              </div>
              <a [href]="getDownloadUrl(submission.fileUrl)" target="_blank" class="btn btn-sm btn-light border text-primary">
                <i class="bi bi-file-earmark-arrow-down me-1"></i> {{ submission.fileName }}
              </a>
            </div>

            <!-- Graded Details -->
            <div *ngIf="submission.status === 'GRADED'" class="mt-3 p-3 bg-white rounded border border-success-subtle">
              <div class="d-flex justify-content-between align-items-center mb-2">
                <div class="fw-bold text-success fs-5">Score: {{ submission.marksObtained }} / {{ assignment.totalMarks }}</div>
                <div class="extra-small text-muted">Graded by {{ submission.gradedBy?.name || 'Faculty' }}</div>
              </div>
              <div *ngIf="submission.feedback" class="text-secondary small italic">
                <i class="bi bi-chat-quote me-1 text-primary"></i> "{{ submission.feedback }}"
              </div>
            </div>
          </div>

          <!-- Upload Form -->
          <div *ngIf="!submission || submission.status !== 'GRADED'">
            <div class="mb-3">
              <label class="form-label fw-medium small">Select File to Upload</label>
              <input type="file" class="form-control" (change)="onFileSelected($event)" accept=".pdf,.doc,.docx,.zip,.txt" />
              <div class="form-text">PDF, DOC, DOCX, ZIP files supported (Max 20MB)</div>
            </div>

            <button
              class="btn btn-primary-custom px-4"
              (click)="uploadWork()"
              [disabled]="!selectedFile || uploading"
            >
              <span *ngIf="uploading" class="spinner-border spinner-border-sm me-2"></span>
              {{ uploading ? 'Uploading...' : (submission ? 'Re-upload Submission' : 'Submit Work') }}
            </button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class AssignmentDetailComponent implements OnInit {
  assignmentId: string = '';
  assignment: Assignment | null = null;
  submission: Submission | null = null;
  loading = true;
  isStudent = false;

  selectedFile: File | null = null;
  uploading = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private assignmentService: AssignmentService,
    private submissionService: SubmissionService,
    private authService: AuthService,
    private toast: ToastService
  ) {}

  ngOnInit() {
    this.isStudent = this.authService.currentUserValue?.role === 'STUDENT';
    this.assignmentId = this.route.snapshot.paramMap.get('id') || '';
    if (this.assignmentId) this.loadAssignment();
  }

  loadAssignment() {
    this.loading = true;
    this.assignmentService.getAssignmentById(this.assignmentId).subscribe({
      next: (res) => {
        this.assignment = res.assignment;
        this.submission = res.submission || null;
        this.loading = false;

        if (this.assignment.type === 'MCQ' && this.isStudent) {
          this.router.navigate(['/assignments', this.assignmentId, 'quiz']);
        } else if (this.assignment.type === 'PROGRAMMING' && this.isStudent) {
          this.router.navigate(['/assignments', this.assignmentId, 'code']);
        }
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  onFileSelected(event: any) {
    if (event.target.files && event.target.files.length > 0) {
      this.selectedFile = event.target.files[0];
    }
  }

  uploadWork() {
    if (!this.selectedFile) return;

    this.uploading = true;
    const formData = new FormData();
    formData.append('assignmentId', this.assignmentId);
    formData.append('submissionFile', this.selectedFile);

    this.submissionService.submitAssignment(formData).subscribe({
      next: (res) => {
        this.uploading = false;
        this.toast.success(res.message);
        this.selectedFile = null;
        this.loadAssignment();
      },
      error: () => {
        this.uploading = false;
      }
    });
  }

  getDownloadUrl(path: string | undefined): string {
    if (!path) return '#';
    return `http://localhost:5000${path}`;
  }

  goBack() {
    window.history.back();
  }
}
