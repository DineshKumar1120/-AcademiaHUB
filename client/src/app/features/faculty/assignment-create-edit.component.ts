import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AssignmentService } from '../../core/services/assignment.service';
import { DepartmentService } from '../../core/services/department.service';
import { ToastService } from '../../core/services/toast.service';
import { Department, Subject } from '../../core/models/department.model';

@Component({
  selector: 'app-assignment-create-edit',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="container-fluid p-0 fade-in" style="max-width: 850px;">
      <div class="d-flex align-items-center justify-content-between mb-4">
        <div>
          <h3 class="fw-bold text-dark mb-1">Create New Assignment</h3>
          <p class="text-muted small mb-0">Publish an assignment for your students with attachments, test cases, and guidelines.</p>
        </div>
        <a routerLink="/faculty/dashboard" class="btn btn-outline-secondary btn-sm">
          <i class="bi bi-arrow-left me-1"></i> Back to Dashboard
        </a>
      </div>

      <div class="card card-custom p-4 p-md-5 shadow-sm border-0">
        <form [formGroup]="assignmentForm" (ngSubmit)="onSubmit()">
          <div class="mb-3">
            <label class="form-label fw-medium">Assignment Title *</label>
            <input
              type="text"
              class="form-control"
              placeholder="e.g., Two Sum Problem / Graph Theory Algorithm"
              formControlName="title"
              [class.is-invalid]="f['title'].touched && f['title'].errors"
            />
            <div *ngIf="f['title'].touched && f['title'].errors" class="invalid-feedback">Title is required</div>
          </div>

          <div class="row g-3 mb-3">
            <div class="col-md-4">
              <label class="form-label fw-medium">Assignment Type *</label>
              <select class="form-select fw-semibold" formControlName="type">
                <option value="FILE">File / Document Upload</option>
                <option value="MCQ">MCQ Quiz</option>
                <option value="PROGRAMMING">Programming Code Assignment</option>
              </select>
            </div>

            <div class="col-md-4">
              <label class="form-label fw-medium">Department *</label>
              <select class="form-select" formControlName="departmentId" (change)="onDepartmentChange()">
                <option value="">Select Department</option>
                <option *ngFor="let dept of departments" [value]="dept._id">{{ dept.name }} ({{ dept.code }})</option>
              </select>
            </div>

            <div class="col-md-4">
              <label class="form-label fw-medium">Subject *</label>
              <select class="form-select" formControlName="subjectId">
                <option value="">Select Subject</option>
                <option *ngFor="let sub of filteredSubjects" [value]="sub._id">{{ sub.name }} ({{ sub.code }})</option>
              </select>
            </div>
          </div>

          <div class="row g-3 mb-3">
            <div class="col-md-6">
              <label class="form-label fw-medium">Due Date & Time *</label>
              <input type="datetime-local" class="form-control" formControlName="dueDate" />
            </div>

            <div class="col-md-6">
              <label class="form-label fw-medium">Total Maximum Marks</label>
              <input type="number" class="form-control" formControlName="totalMarks" />
            </div>
          </div>

          <div class="mb-3">
            <label class="form-label fw-medium">Detailed Instructions / Description *</label>
            <textarea
              class="form-control"
              rows="4"
              placeholder="Provide assignment objectives, submission guidelines, format requirements..."
              formControlName="description"
            ></textarea>
          </div>

          <!-- Programming Specific Fields -->
          <div *ngIf="f['type'].value === 'PROGRAMMING'" class="p-4 bg-light rounded-3 border mb-4 fade-in">
            <h5 class="fw-bold text-dark mb-3"><i class="bi bi-code-slash text-primary me-2"></i> Programming Problem & Test Cases</h5>
            
            <div class="mb-3">
              <label class="form-label fw-medium">Problem Statement</label>
              <textarea class="form-control font-monospace extra-small" rows="4" placeholder="Detailed problem statement..." formControlName="problemStatement"></textarea>
            </div>

            <div class="row g-3 mb-3">
              <div class="col-md-6">
                <label class="form-label fw-medium">Input Format</label>
                <textarea class="form-control font-monospace extra-small" rows="2" placeholder="e.g. Line 1: N integers..." formControlName="inputFormat"></textarea>
              </div>
              <div class="col-md-6">
                <label class="form-label fw-medium">Output Format</label>
                <textarea class="form-control font-monospace extra-small" rows="2" placeholder="e.g. Single space-separated line..." formControlName="outputFormat"></textarea>
              </div>
            </div>

            <div class="row g-3 mb-3">
              <div class="col-md-6">
                <label class="form-label fw-medium">Sample Input</label>
                <textarea class="form-control font-monospace extra-small bg-dark text-warning" rows="3" placeholder="2 7 11 15&#10;9" formControlName="sampleInput"></textarea>
              </div>
              <div class="col-md-6">
                <label class="form-label fw-medium">Sample Output</label>
                <textarea class="form-control font-monospace extra-small bg-dark text-success" rows="3" placeholder="0 1" formControlName="sampleOutput"></textarea>
              </div>
            </div>

            <!-- Dynamic Test Cases FormArray -->
            <div class="mt-4">
              <div class="d-flex justify-content-between align-items-center mb-2">
                <h6 class="fw-bold text-dark mb-0"><i class="bi bi-check-square me-1"></i> Evaluation Test Cases</h6>
                <button type="button" class="btn btn-sm btn-outline-primary" (click)="addTestCase()">
                  <i class="bi bi-plus-lg me-1"></i> Add Test Case
                </button>
              </div>

              <div formArrayName="testCases">
                <div *ngFor="let tc of testCasesArray.controls; let i = index" [formGroupName]="i" class="card mb-2 p-3 border shadow-sm bg-white">
                  <div class="d-flex justify-content-between align-items-center mb-2">
                    <span class="fw-bold small text-secondary">Test Case #{{ i + 1 }}</span>
                    <button type="button" class="btn btn-sm btn-outline-danger border-0 p-1" (click)="removeTestCase(i)">
                      <i class="bi bi-trash"></i>
                    </button>
                  </div>
                  <div class="row g-2">
                    <div class="col-md-5">
                      <label class="extra-small text-muted fw-bold">Input (stdin)</label>
                      <textarea class="form-control font-monospace extra-small" rows="2" formControlName="input" placeholder="Test input..."></textarea>
                    </div>
                    <div class="col-md-5">
                      <label class="extra-small text-muted fw-bold">Expected Output (stdout) *</label>
                      <textarea class="form-control font-monospace extra-small" rows="2" formControlName="expectedOutput" placeholder="Expected output..."></textarea>
                    </div>
                    <div class="col-md-2 d-flex align-items-center pt-3">
                      <div class="form-check">
                        <input class="form-check-input" type="checkbox" formControlName="isHidden" [id]="'hidden_' + i" />
                        <label class="form-check-label extra-small text-secondary fw-semibold" [for]="'hidden_' + i">Hidden</label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- File Attachment for File type -->
          <div *ngIf="f['type'].value === 'FILE'" class="mb-4">
            <label class="form-label fw-medium">Resource / File Attachment (Optional)</label>
            <input type="file" class="form-control" (change)="onFileSelected($event)" accept=".pdf,.doc,.docx,.zip,.txt" />
            <div class="form-text">Supported formats: PDF, DOC, DOCX, ZIP, TXT (Max 20MB)</div>
          </div>

          <div class="d-flex justify-content-end gap-2">
            <a routerLink="/faculty/dashboard" class="btn btn-light px-4">Cancel</a>
            <button type="submit" class="btn btn-primary-custom px-4" [disabled]="loading || assignmentForm.invalid">
              <span *ngIf="loading" class="spinner-border spinner-border-sm me-2"></span>
              {{ loading ? 'Publishing...' : 'Publish Assignment' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  `
})
export class AssignmentCreateEditComponent implements OnInit {
  assignmentForm: FormGroup;
  departments: Department[] = [];
  allSubjects: Subject[] = [];
  filteredSubjects: Subject[] = [];
  selectedFile: File | null = null;
  loading = false;

  constructor(
    private fb: FormBuilder,
    private assignmentService: AssignmentService,
    private deptService: DepartmentService,
    private router: Router,
    private toast: ToastService
  ) {
    this.assignmentForm = this.fb.group({
      title: ['', Validators.required],
      description: ['', Validators.required],
      type: ['FILE', Validators.required],
      departmentId: ['', Validators.required],
      subjectId: ['', Validators.required],
      dueDate: ['', Validators.required],
      totalMarks: [100, [Validators.required, Validators.min(1)]],
      problemStatement: [''],
      inputFormat: [''],
      outputFormat: [''],
      constraints: [''],
      sampleInput: [''],
      sampleOutput: [''],
      testCases: this.fb.array([])
    });
  }

  ngOnInit() {
    this.deptService.getDepartments().subscribe(res => {
      if (res.success) this.departments = res.departments;
    });

    this.deptService.getSubjects().subscribe(res => {
      if (res.success) {
        this.allSubjects = res.subjects;
        this.filteredSubjects = res.subjects;
      }
    });

    // Default test case
    this.addTestCase();
  }

  get f() { return this.assignmentForm.controls; }
  get testCasesArray() { return this.assignmentForm.get('testCases') as FormArray; }

  addTestCase() {
    this.testCasesArray.push(
      this.fb.group({
        input: [''],
        expectedOutput: ['', Validators.required],
        isHidden: [false]
      })
    );
  }

  removeTestCase(index: number) {
    if (this.testCasesArray.length > 1) {
      this.testCasesArray.removeAt(index);
    }
  }

  onDepartmentChange() {
    const deptId = this.assignmentForm.value.departmentId;
    if (deptId) {
      this.filteredSubjects = this.allSubjects.filter(s => (s.departmentId?._id || s.departmentId) === deptId);
    } else {
      this.filteredSubjects = this.allSubjects;
    }
  }

  onFileSelected(event: any) {
    if (event.target.files && event.target.files.length > 0) {
      this.selectedFile = event.target.files[0];
    }
  }

  onSubmit() {
    if (this.assignmentForm.invalid) return;

    this.loading = true;
    const formVal = this.assignmentForm.value;
    const formData = new FormData();

    Object.keys(formVal).forEach(key => {
      if (key === 'testCases') {
        formData.append('testCases', JSON.stringify(formVal.testCases));
      } else {
        formData.append(key, formVal[key]);
      }
    });

    if (this.selectedFile) {
      formData.append('attachment', this.selectedFile);
    }

    this.assignmentService.createAssignment(formData).subscribe({
      next: (res) => {
        this.loading = false;
        this.toast.success('Assignment created and published to students!');
        this.router.navigate(['/faculty/dashboard']);
      },
      error: () => {
        this.loading = false;
      }
    });
  }
}
