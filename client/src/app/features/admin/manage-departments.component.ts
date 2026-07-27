import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DepartmentService } from '../../core/services/department.service';
import { ToastService } from '../../core/services/toast.service';
import { Department, Course, Subject } from '../../core/models/department.model';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner.component';

@Component({
  selector: 'app-manage-departments',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, LoadingSpinnerComponent],
  template: `
    <div class="container-fluid p-0 fade-in">
      <div class="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4">
        <div>
          <h3 class="fw-bold text-dark mb-1">Academic Curriculum Management</h3>
          <p class="text-muted small mb-0">Configure College Departments, Degree Courses, and Course Subjects.</p>
        </div>
      </div>

      <!-- Navigation Tabs -->
      <ul class="nav nav-tabs border-bottom mb-4">
        <li class="nav-item">
          <button class="nav-link fw-semibold" [class.active]="activeTab === 'depts'" (click)="activeTab = 'depts'">
            <i class="bi bi-building me-1"></i> Departments ({{ departments.length }})
          </button>
        </li>
        <li class="nav-item">
          <button class="nav-link fw-semibold" [class.active]="activeTab === 'courses'" (click)="activeTab = 'courses'">
            <i class="bi bi-book me-1"></i> Courses ({{ courses.length }})
          </button>
        </li>
        <li class="nav-item">
          <button class="nav-link fw-semibold" [class.active]="activeTab === 'subjects'" (click)="activeTab = 'subjects'">
            <i class="bi bi-journal-bookmark me-1"></i> Subjects ({{ subjects.length }})
          </button>
        </li>
      </ul>

      <app-loading-spinner *ngIf="loading" message="Loading curriculum data..."></app-loading-spinner>

      <!-- DEPARTMENTS TAB -->
      <div *ngIf="!loading && activeTab === 'depts'">
        <div class="d-flex justify-content-end mb-3">
          <button class="btn btn-primary-custom" (click)="openDeptModal()">
            <i class="bi bi-plus-circle me-1"></i> Add Department
          </button>
        </div>

        <div class="row g-3">
          <div class="col-12 col-md-6 col-lg-4" *ngFor="let d of departments">
            <div class="card card-custom p-4 h-100 d-flex flex-column">
              <div class="d-flex justify-content-between align-items-start mb-2">
                <span class="badge bg-primary text-white fs-6">{{ d.code }}</span>
                <button class="btn btn-sm btn-outline-danger" (click)="deleteDept(d._id)"><i class="bi bi-trash"></i></button>
              </div>
              <h5 class="fw-bold text-dark mb-1">{{ d.name }}</h5>
              <p class="text-muted small flex-grow-1 mb-0">{{ d.description || 'No description provided.' }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- COURSES TAB -->
      <div *ngIf="!loading && activeTab === 'courses'">
        <div class="d-flex justify-content-end mb-3">
          <button class="btn btn-primary-custom" (click)="openCourseModal()">
            <i class="bi bi-plus-circle me-1"></i> Add Course
          </button>
        </div>

        <div class="card card-custom p-0 overflow-hidden shadow-sm">
          <table class="table table-hover align-middle mb-0">
            <thead class="table-light">
              <tr>
                <th class="py-3 px-4">Course Name</th>
                <th class="py-3 px-3">Code</th>
                <th class="py-3 px-3">Department</th>
                <th class="py-3 px-3">Duration</th>
                <th class="py-3 px-4 text-end">Action</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let c of courses">
                <td class="py-3 px-4 fw-bold text-dark">{{ c.name }}</td>
                <td class="py-3 px-3"><span class="badge bg-secondary-subtle text-secondary">{{ c.code }}</span></td>
                <td class="py-3 px-3 text-muted small">{{ c.departmentId?.name }}</td>
                <td class="py-3 px-3 text-muted small">{{ c.durationYears }} Years</td>
                <td class="py-3 px-4 text-end">
                  <button class="btn btn-sm btn-outline-danger" (click)="deleteCourse(c._id)"><i class="bi bi-trash"></i></button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- SUBJECTS TAB -->
      <div *ngIf="!loading && activeTab === 'subjects'">
        <div class="d-flex justify-content-end mb-3">
          <button class="btn btn-primary-custom" (click)="openSubjectModal()">
            <i class="bi bi-plus-circle me-1"></i> Add Subject
          </button>
        </div>

        <div class="card card-custom p-0 overflow-hidden shadow-sm">
          <table class="table table-hover align-middle mb-0">
            <thead class="table-light">
              <tr>
                <th class="py-3 px-4">Subject Name</th>
                <th class="py-3 px-3">Subject Code</th>
                <th class="py-3 px-3">Department</th>
                <th class="py-3 px-3">Semester</th>
                <th class="py-3 px-4 text-end">Action</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let s of subjects">
                <td class="py-3 px-4 fw-bold text-dark">{{ s.name }}</td>
                <td class="py-3 px-3"><span class="badge bg-primary-subtle text-primary">{{ s.code }}</span></td>
                <td class="py-3 px-3 text-muted small">{{ s.departmentId?.name }}</td>
                <td class="py-3 px-3 text-muted small">Semester {{ s.semester }}</td>
                <td class="py-3 px-4 text-end">
                  <button class="btn btn-sm btn-outline-danger" (click)="deleteSubject(s._id)"><i class="bi bi-trash"></i></button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Add Department Modal -->
      <div *ngIf="showDeptModal" class="modal fade show d-block" tabindex="-1" style="background: rgba(0,0,0,0.5);">
        <div class="modal-dialog modal-dialog-centered">
          <div class="modal-content card-custom border-0 p-3">
            <div class="modal-header border-0 pb-0">
              <h5 class="modal-title fw-bold">Add Department</h5>
              <button type="button" class="btn-close" (click)="showDeptModal = false"></button>
            </div>
            <div class="modal-body">
              <form [formGroup]="deptForm" (ngSubmit)="saveDept()">
                <div class="mb-3">
                  <label class="form-label fw-medium">Department Name *</label>
                  <input type="text" class="form-control" placeholder="Computer Science & Engineering" formControlName="name" />
                </div>
                <div class="mb-3">
                  <label class="form-label fw-medium">Department Code *</label>
                  <input type="text" class="form-control text-uppercase" placeholder="CSE" formControlName="code" />
                </div>
                <div class="mb-3">
                  <label class="form-label fw-medium">Description</label>
                  <textarea class="form-control" rows="3" formControlName="description"></textarea>
                </div>
                <div class="d-flex justify-content-end gap-2">
                  <button type="button" class="btn btn-light" (click)="showDeptModal = false">Cancel</button>
                  <button type="submit" class="btn btn-primary-custom" [disabled]="deptForm.invalid">Save Department</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      <!-- Add Course Modal -->
      <div *ngIf="showCourseModal" class="modal fade show d-block" tabindex="-1" style="background: rgba(0,0,0,0.5);">
        <div class="modal-dialog modal-dialog-centered">
          <div class="modal-content card-custom border-0 p-3">
            <div class="modal-header border-0 pb-0">
              <h5 class="modal-title fw-bold">Add Degree Course</h5>
              <button type="button" class="btn-close" (click)="showCourseModal = false"></button>
            </div>
            <div class="modal-body">
              <form [formGroup]="courseForm" (ngSubmit)="saveCourse()">
                <div class="mb-3">
                  <label class="form-label fw-medium">Department *</label>
                  <select class="form-select" formControlName="departmentId">
                    <option value="">Select Department</option>
                    <option *ngFor="let d of departments" [value]="d._id">{{ d.name }}</option>
                  </select>
                </div>
                <div class="mb-3">
                  <label class="form-label fw-medium">Course Title *</label>
                  <input type="text" class="form-control" placeholder="B.Tech Computer Science" formControlName="name" />
                </div>
                <div class="mb-3">
                  <label class="form-label fw-medium">Course Code *</label>
                  <input type="text" class="form-control text-uppercase" placeholder="BTECH-CSE" formControlName="code" />
                </div>
                <div class="mb-3">
                  <label class="form-label fw-medium">Duration (Years)</label>
                  <input type="number" class="form-control" formControlName="durationYears" />
                </div>
                <div class="d-flex justify-content-end gap-2">
                  <button type="button" class="btn btn-light" (click)="showCourseModal = false">Cancel</button>
                  <button type="submit" class="btn btn-primary-custom" [disabled]="courseForm.invalid">Save Course</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      <!-- Add Subject Modal -->
      <div *ngIf="showSubjectModal" class="modal fade show d-block" tabindex="-1" style="background: rgba(0,0,0,0.5);">
        <div class="modal-dialog modal-dialog-centered">
          <div class="modal-content card-custom border-0 p-3">
            <div class="modal-header border-0 pb-0">
              <h5 class="modal-title fw-bold">Add Subject</h5>
              <button type="button" class="btn-close" (click)="showSubjectModal = false"></button>
            </div>
            <div class="modal-body">
              <form [formGroup]="subjectForm" (ngSubmit)="saveSubject()">
                <div class="mb-3">
                  <label class="form-label fw-medium">Department *</label>
                  <select class="form-select" formControlName="departmentId">
                    <option value="">Select Department</option>
                    <option *ngFor="let d of departments" [value]="d._id">{{ d.name }}</option>
                  </select>
                </div>
                <div class="mb-3">
                  <label class="form-label fw-medium">Course *</label>
                  <select class="form-select" formControlName="courseId">
                    <option value="">Select Course</option>
                    <option *ngFor="let c of courses" [value]="c._id">{{ c.name }}</option>
                  </select>
                </div>
                <div class="mb-3">
                  <label class="form-label fw-medium">Subject Name *</label>
                  <input type="text" class="form-control" placeholder="Database Systems" formControlName="name" />
                </div>
                <div class="mb-3">
                  <label class="form-label fw-medium">Subject Code *</label>
                  <input type="text" class="form-control text-uppercase" placeholder="CS602" formControlName="code" />
                </div>
                <div class="mb-3">
                  <label class="form-label fw-medium">Semester *</label>
                  <input type="number" min="1" max="10" class="form-control" formControlName="semester" />
                </div>
                <div class="d-flex justify-content-end gap-2">
                  <button type="button" class="btn btn-light" (click)="showSubjectModal = false">Cancel</button>
                  <button type="submit" class="btn btn-primary-custom" [disabled]="subjectForm.invalid">Save Subject</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class ManageDepartmentsComponent implements OnInit {
  activeTab = 'depts';
  departments: Department[] = [];
  courses: Course[] = [];
  subjects: Subject[] = [];
  loading = true;

  showDeptModal = false;
  showCourseModal = false;
  showSubjectModal = false;

  deptForm: FormGroup;
  courseForm: FormGroup;
  subjectForm: FormGroup;

  constructor(
    private deptService: DepartmentService,
    private fb: FormBuilder,
    private toast: ToastService
  ) {
    this.deptForm = this.fb.group({
      name: ['', Validators.required],
      code: ['', Validators.required],
      description: ['']
    });

    this.courseForm = this.fb.group({
      name: ['', Validators.required],
      code: ['', Validators.required],
      departmentId: ['', Validators.required],
      durationYears: [4]
    });

    this.subjectForm = this.fb.group({
      name: ['', Validators.required],
      code: ['', Validators.required],
      departmentId: ['', Validators.required],
      courseId: ['', Validators.required],
      semester: [6, Validators.required]
    });
  }

  ngOnInit() {
    this.loadAll();
  }

  loadAll() {
    this.loading = true;
    this.deptService.getDepartments().subscribe(r => { if (r.success) this.departments = r.departments; });
    this.deptService.getCourses().subscribe(r => { if (r.success) this.courses = r.courses; });
    this.deptService.getSubjects().subscribe(r => {
      if (r.success) this.subjects = r.subjects;
      this.loading = false;
    });
  }

  openDeptModal() { this.showDeptModal = true; }
  openCourseModal() { this.showCourseModal = true; }
  openSubjectModal() { this.showSubjectModal = true; }

  saveDept() {
    if (this.deptForm.invalid) return;
    this.deptService.createDepartment(this.deptForm.value).subscribe(() => {
      this.toast.success('Department created');
      this.showDeptModal = false;
      this.loadAll();
    });
  }

  deleteDept(id: string) {
    if (confirm('Delete department?')) {
      this.deptService.deleteDepartment(id).subscribe(() => {
        this.toast.success('Department deleted');
        this.loadAll();
      });
    }
  }

  saveCourse() {
    if (this.courseForm.invalid) return;
    this.deptService.createCourse(this.courseForm.value).subscribe(() => {
      this.toast.success('Course created');
      this.showCourseModal = false;
      this.loadAll();
    });
  }

  deleteCourse(id: string) {
    if (confirm('Delete course?')) {
      this.deptService.deleteCourse(id).subscribe(() => {
        this.toast.success('Course deleted');
        this.loadAll();
      });
    }
  }

  saveSubject() {
    if (this.subjectForm.invalid) return;
    this.deptService.createSubject(this.subjectForm.value).subscribe(() => {
      this.toast.success('Subject created');
      this.showSubjectModal = false;
      this.loadAll();
    });
  }

  deleteSubject(id: string) {
    if (confirm('Delete subject?')) {
      this.deptService.deleteSubject(id).subscribe(() => {
        this.toast.success('Subject deleted');
        this.loadAll();
      });
    }
  }
}
