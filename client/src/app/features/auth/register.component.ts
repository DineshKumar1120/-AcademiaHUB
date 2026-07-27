import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { DepartmentService } from '../../core/services/department.service';
import { ToastService } from '../../core/services/toast.service';
import { Department } from '../../core/models/department.model';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="min-vh-100 d-flex align-items-center justify-content-center bg-light py-5 px-3">
      <div class="card card-custom border-0 shadow-lg p-4 p-md-5" style="max-width: 550px; width: 100%;">
        <div class="text-center mb-4">
          <div class="brand-icon bg-primary text-white rounded-3 mx-auto d-flex align-items-center justify-content-center mb-3" style="width: 54px; height: 54px;">
            <i class="bi bi-person-plus-fill fs-2"></i>
          </div>
          <h3 class="fw-bold text-dark mb-1">Create Account</h3>
          <p class="text-muted small">Register to start submitting or managing college assignments</p>
        </div>

        <form [formGroup]="registerForm" (ngSubmit)="onSubmit()">
          <!-- Role Selector -->
          <div class="mb-3">
            <label class="form-label fw-medium small">Register As</label>
            <div class="btn-group w-100" role="group">
              <input type="radio" class="btn-check" formControlName="role" value="STUDENT" id="roleStudent">
              <label class="btn btn-outline-primary" for="roleStudent"><i class="bi bi-mortarboard me-1"></i> Student</label>

              <input type="radio" class="btn-check" formControlName="role" value="FACULTY" id="roleFaculty">
              <label class="btn btn-outline-primary" for="roleFaculty"><i class="bi bi-person-badge me-1"></i> Faculty / Staff</label>
            </div>
          </div>

          <div class="row g-2">
            <div class="col-md-6 mb-3">
              <label class="form-label fw-medium small">Full Name</label>
              <input type="text" class="form-control" placeholder="John Doe" formControlName="name" />
            </div>

            <div class="col-md-6 mb-3">
              <label class="form-label fw-medium small">Email Address</label>
              <input type="email" class="form-control" placeholder="john@college.edu" formControlName="email" />
            </div>
          </div>

          <div class="row g-2">
            <div class="col-md-6 mb-3">
              <label class="form-label fw-medium small">Password</label>
              <input type="password" class="form-control" placeholder="••••••••" formControlName="password" />
            </div>

            <div class="col-md-6 mb-3">
              <label class="form-label fw-medium small">Phone Number</label>
              <input type="text" class="form-control" placeholder="+1 555-0199" formControlName="phone" />
            </div>
          </div>

          <div class="mb-3">
            <label class="form-label fw-medium small">Department</label>
            <select class="form-select" formControlName="departmentId">
              <option value="">Select Department</option>
              <option *ngFor="let dept of departments" [value]="dept._id">{{ dept.name }} ({{ dept.code }})</option>
            </select>
          </div>

          <!-- Role-Specific Fields -->
          <div *ngIf="f['role'].value === 'STUDENT'" class="row g-2">
            <div class="col-md-6 mb-3">
              <label class="form-label fw-medium small">Roll Number / Enrollment</label>
              <input type="text" class="form-control" placeholder="STU-2026-101" formControlName="rollNo" />
            </div>
            <div class="col-md-6 mb-3">
              <label class="form-label fw-medium small">Current Semester</label>
              <input type="number" min="1" max="10" class="form-control" formControlName="semester" />
            </div>
          </div>

          <div *ngIf="f['role'].value === 'FACULTY'" class="row g-2">
            <div class="col-md-6 mb-3">
              <label class="form-label fw-medium small">Employee ID</label>
              <input type="text" class="form-control" placeholder="EMP-2026-55" formControlName="employeeId" />
            </div>
            <div class="col-md-6 mb-3">
              <label class="form-label fw-medium small">Designation</label>
              <input type="text" class="form-control" placeholder="Assistant Professor" formControlName="designation" />
            </div>
          </div>

          <button type="submit" class="btn btn-primary-custom w-100 py-2 fs-6 fw-semibold mb-3" [disabled]="loading || registerForm.invalid">
            <span *ngIf="loading" class="spinner-border spinner-border-sm me-2"></span>
            {{ loading ? 'Creating Account...' : 'Register' }}
          </button>
        </form>

        <div class="text-center">
          <span class="text-muted small">Already have an account? </span>
          <a routerLink="/login" class="fw-semibold text-decoration-none text-primary small">Sign in</a>
        </div>
      </div>
    </div>
  `
})
export class RegisterComponent implements OnInit {
  registerForm: FormGroup;
  departments: Department[] = [];
  loading = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private deptService: DepartmentService,
    private router: Router,
    private toast: ToastService
  ) {
    this.registerForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      role: ['STUDENT', Validators.required],
      phone: [''],
      departmentId: [''],
      rollNo: [''],
      semester: [1],
      employeeId: [''],
      designation: ['']
    });
  }

  ngOnInit() {
    this.deptService.getDepartments().subscribe(res => {
      if (res.success) {
        this.departments = res.departments;
      }
    });
  }

  get f() { return this.registerForm.controls; }

  onSubmit() {
    if (this.registerForm.invalid) return;

    this.loading = true;
    this.authService.register(this.registerForm.value).subscribe({
      next: (res) => {
        this.loading = false;
        this.toast.success('Registration successful! Welcome to AcademiaHUB.');
        const targetRoute = this.authService.getDashboardRouteForRole(res.user.role);
        this.router.navigate([targetRoute]);
      },
      error: () => {
        this.loading = false;
      }
    });
  }
}
