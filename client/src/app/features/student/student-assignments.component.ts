import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AssignmentService } from '../../core/services/assignment.service';
import { DepartmentService } from '../../core/services/department.service';
import { Assignment } from '../../core/models/assignment.model';
import { Subject } from '../../core/models/department.model';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner.component';
import { EmptyStateComponent } from '../../shared/components/empty-state.component';
import { StatusBadgePipe } from '../../shared/pipes/status-badge.pipe';

@Component({
  selector: 'app-student-assignments',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, LoadingSpinnerComponent, EmptyStateComponent, StatusBadgePipe],
  template: `
    <div class="container-fluid p-0 fade-in">
      <div class="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4">
        <div>
          <h3 class="fw-bold text-dark mb-1">My Course Assignments</h3>
          <p class="text-muted small mb-0">Browse active assignments, review due dates, and upload your coursework.</p>
        </div>
      </div>

      <!-- Filters & Search Bar -->
      <div class="card card-custom p-3 mb-4">
        <div class="row g-3">
          <div class="col-12 col-md-5">
            <div class="input-group">
              <span class="input-group-text bg-white border-end-0 text-muted"><i class="bi bi-search"></i></span>
              <input
                type="text"
                class="form-control border-start-0"
                placeholder="Search by assignment title..."
                [(ngModel)]="searchQuery"
                (ngModelChange)="loadAssignments()"
              />
            </div>
          </div>

          <div class="col-12 col-sm-6 col-md-4">
            <select class="form-select" [(ngModel)]="selectedSubjectId" (change)="loadAssignments()">
              <option value="">All Subjects</option>
              <option *ngFor="let sub of subjects" [value]="sub._id">{{ sub.name }} ({{ sub.code }})</option>
            </select>
          </div>

          <div class="col-12 col-sm-6 col-md-3">
            <select class="form-select" [(ngModel)]="selectedStatus" (change)="loadAssignments()">
              <option value="">All Statuses</option>
              <option value="ACTIVE">Active Only</option>
              <option value="CLOSED">Closed</option>
            </select>
          </div>
        </div>
      </div>

      <app-loading-spinner *ngIf="loading" message="Loading assignments..."></app-loading-spinner>

      <app-empty-state
        *ngIf="!loading && assignments.length === 0"
        title="No Assignments Found"
        description="There are currently no assignments matching your selected search or filter criteria."
        icon="bi-journal-x"
      ></app-empty-state>

      <!-- Assignments Table / Cards -->
      <div *ngIf="!loading && assignments.length > 0" class="row g-3">
        <div class="col-12 col-md-6 col-lg-4" *ngFor="let assign of assignments">
          <div class="card card-custom h-100 p-4 d-flex flex-column">
            <div class="d-flex justify-content-between align-items-start mb-2">
              <span class="badge bg-primary-subtle text-primary border border-primary-subtle fw-semibold">
                {{ assign.subjectId?.code || 'SUBJECT' }}
              </span>
              <span class="badge rounded-pill" [ngClass]="assign.submission ? (assign.submission.status | statusBadge) : 'bg-warning-subtle text-warning'">
                {{ assign.submission ? assign.submission.status : 'PENDING' }}
              </span>
            </div>

            <h5 class="fw-bold text-dark mb-2">{{ assign.title }}</h5>
            <p class="text-muted small flex-grow-1 line-clamp-3 mb-3">{{ assign.description }}</p>

            <div class="border-top pt-3 mt-auto">
              <div class="d-flex justify-content-between align-items-center extra-small text-muted mb-3">
                <span><i class="bi bi-calendar-event me-1"></i> Due: {{ assign.dueDate | date: 'mediumDate' }}</span>
                <span><i class="bi bi-award me-1"></i> {{ assign.totalMarks }} Marks</span>
              </div>

              <a [routerLink]="['/assignments', assign._id]" class="btn btn-outline-primary w-100 py-2 btn-sm fw-medium">
                <i class="bi bi-eye me-1"></i> View & Submit
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class StudentAssignmentsComponent implements OnInit {
  assignments: Assignment[] = [];
  subjects: Subject[] = [];
  searchQuery = '';
  selectedSubjectId = '';
  selectedStatus = '';
  loading = true;

  constructor(
    private assignmentService: AssignmentService,
    private deptService: DepartmentService
  ) {}

  ngOnInit() {
    this.loadSubjects();
    this.loadAssignments();
  }

  loadSubjects() {
    this.deptService.getSubjects().subscribe(res => {
      if (res.success) this.subjects = res.subjects;
    });
  }

  loadAssignments() {
    this.loading = true;
    this.assignmentService.getAssignments({
      search: this.searchQuery,
      subjectId: this.selectedSubjectId,
      status: this.selectedStatus
    }).subscribe({
      next: (res) => {
        this.assignments = res.assignments;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }
}
