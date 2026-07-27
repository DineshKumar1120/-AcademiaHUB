import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpParams } from '@angular/common/http';
import { DepartmentService } from '../../core/services/department.service';
import { AssignmentService } from '../../core/services/assignment.service';
import { ToastService } from '../../core/services/toast.service';
import { Department, Subject } from '../../core/models/department.model';
import { Assignment } from '../../core/models/assignment.model';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner.component';
import { EmptyStateComponent } from '../../shared/components/empty-state.component';

@Component({
  selector: 'app-reports-export',
  standalone: true,
  imports: [CommonModule, FormsModule, LoadingSpinnerComponent, EmptyStateComponent],
  template: `
    <div class="container-fluid p-0 fade-in">
      <div class="d-flex flex-column flex-md-row align-items-md-center justify-content-between mb-4">
        <div>
          <h3 class="fw-bold text-dark mb-1">Marks & Reports Export Center</h3>
          <p class="text-muted small mb-0">Generate and download academic transcripts and student performance metrics in CSV or PDF format.</p>
        </div>
        <div class="mt-3 mt-md-0 d-flex gap-2">
          <button class="btn btn-outline-primary" (click)="exportCSV()">
            <i class="bi bi-filetype-csv me-1"></i> Export CSV
          </button>
          <button class="btn btn-primary-custom" (click)="exportPDF()">
            <i class="bi bi-file-earmark-pdf me-1"></i> Export PDF / Print
          </button>
        </div>
      </div>

      <!-- Filters -->
      <div class="card card-custom p-3 mb-4">
        <div class="row g-3">
          <div class="col-12 col-md-4">
            <label class="form-label extra-small text-muted fw-bold mb-1">DEPARTMENT</label>
            <select class="form-select" [(ngModel)]="selectedDept" (change)="loadReportData()">
              <option value="">All Departments</option>
              <option *ngFor="let d of departments" [value]="d._id">{{ d.name }}</option>
            </select>
          </div>

          <div class="col-12 col-md-4">
            <label class="form-label extra-small text-muted fw-bold mb-1">SUBJECT</label>
            <select class="form-select" [(ngModel)]="selectedSubject" (change)="loadReportData()">
              <option value="">All Subjects</option>
              <option *ngFor="let s of subjects" [value]="s._id">{{ s.name }} ({{ s.code }})</option>
            </select>
          </div>

          <div class="col-12 col-md-4">
            <label class="form-label extra-small text-muted fw-bold mb-1">ASSIGNMENT</label>
            <select class="form-select" [(ngModel)]="selectedAssignment" (change)="loadReportData()">
              <option value="">All Assignments</option>
              <option *ngFor="let a of assignments" [value]="a._id">{{ a.title }}</option>
            </select>
          </div>
        </div>
      </div>

      <app-loading-spinner *ngIf="loading" message="Compiling report data..."></app-loading-spinner>

      <app-empty-state
        *ngIf="!loading && reportList.length === 0"
        title="No Records Found"
        description="No student submissions or grades match your selected report filter criteria."
        icon="bi-file-earmark-x"
      ></app-empty-state>

      <!-- Printable Report View -->
      <div *ngIf="!loading && reportList.length > 0" class="card card-custom p-4 printable-area">
        <div class="d-flex justify-content-between align-items-center mb-3 pb-3 border-bottom">
          <div>
            <h5 class="fw-bold text-dark mb-0">Student Performance Report</h5>
            <span class="text-muted extra-small">Generated on: {{ generatedAt | date: 'medium' }} | Total Records: {{ reportList.length }}</span>
          </div>
          <div class="badge bg-primary fs-6">CONFIDENTIAL</div>
        </div>

        <div class="table-responsive">
          <table class="table table-hover table-striped align-middle mb-0">
            <thead class="table-dark">
              <tr>
                <th class="py-3 px-3">Student Name</th>
                <th class="py-3 px-3">Email</th>
                <th class="py-3 px-3">Assignment Title</th>
                <th class="py-3 px-3">Subject</th>
                <th class="py-3 px-3">Status</th>
                <th class="py-3 px-3">Marks</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let item of reportList">
                <td class="py-2 px-3 fw-bold text-dark">{{ item.studentId?.name }}</td>
                <td class="py-2 px-3 text-muted small">{{ item.studentId?.email }}</td>
                <td class="py-2 px-3 text-dark small">{{ item.assignmentId?.title }}</td>
                <td class="py-2 px-3"><span class="badge bg-secondary-subtle text-secondary">{{ item.assignmentId?.subjectId?.code || 'CS' }}</span></td>
                <td class="py-2 px-3"><span class="badge bg-light text-dark border">{{ item.status }}</span></td>
                <td class="py-2 px-3 fw-bold text-success">
                  {{ item.marksObtained !== null ? item.marksObtained : 'N/A' }} / {{ item.assignmentId?.totalMarks || 100 }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `,
  styles: [`
    @media print {
      body * { visibility: hidden; }
      .printable-area, .printable-area * { visibility: visible; }
      .printable-area { position: absolute; left: 0; top: 0; width: 100%; }
    }
  `]
})
export class ReportsExportComponent implements OnInit {
  departments: Department[] = [];
  subjects: Subject[] = [];
  assignments: Assignment[] = [];

  selectedDept = '';
  selectedSubject = '';
  selectedAssignment = '';

  reportList: any[] = [];
  generatedAt = new Date();
  loading = true;

  constructor(
    private http: HttpClient,
    private deptService: DepartmentService,
    private assignmentService: AssignmentService,
    private toast: ToastService
  ) {}

  ngOnInit() {
    this.loadFilters();
    this.loadReportData();
  }

  loadFilters() {
    this.deptService.getDepartments().subscribe(r => { if (r.success) this.departments = r.departments; });
    this.deptService.getSubjects().subscribe(r => { if (r.success) this.subjects = r.subjects; });
    this.assignmentService.getAssignments().subscribe(r => { if (r.success) this.assignments = r.assignments; });
  }

  loadReportData() {
    this.loading = true;
    let params = new HttpParams();
    if (this.selectedDept) params = params.set('departmentId', this.selectedDept);
    if (this.selectedSubject) params = params.set('subjectId', this.selectedSubject);
    if (this.selectedAssignment) params = params.set('assignmentId', this.selectedAssignment);

    this.http.get<{ success: boolean; submissions: any[] }>('http://localhost:5000/api/reports/export/pdf-data', { params }).subscribe({
      next: (res) => {
        this.reportList = res.submissions;
        this.generatedAt = new Date();
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  exportCSV() {
    let url = `http://localhost:5000/api/reports/export/csv?t=${Date.now()}`;
    if (this.selectedDept) url += `&departmentId=${this.selectedDept}`;
    if (this.selectedSubject) url += `&subjectId=${this.selectedSubject}`;
    if (this.selectedAssignment) url += `&assignmentId=${this.selectedAssignment}`;

    window.open(url, '_blank');
    this.toast.success('Downloading student marks report CSV...');
  }

  exportPDF() {
    window.print();
  }
}
