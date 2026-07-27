import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { UserService } from '../../core/services/user.service';
import { DepartmentService } from '../../core/services/department.service';
import { ToastService } from '../../core/services/toast.service';
import { User } from '../../core/models/user.model';
import { Department, Course } from '../../core/models/department.model';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner.component';
import { PaginationComponent } from '../../shared/components/pagination.component';

@Component({
  selector: 'app-manage-users',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule, LoadingSpinnerComponent, PaginationComponent],
  template: `
    <div class="container-fluid p-0 fade-in">
      <div class="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4">
        <div>
          <h3 class="fw-bold text-dark mb-1">User Management</h3>
          <p class="text-muted small mb-0">Manage system access for Students, Faculty, and Admin accounts.</p>
        </div>
        <div class="mt-3 mt-md-0">
          <button class="btn btn-primary-custom" (click)="openCreateModal()">
            <i class="bi bi-person-plus-fill me-1"></i> Add New User
          </button>
        </div>
      </div>

      <!-- Filters -->
      <div class="card card-custom p-3 mb-4">
        <div class="row g-3">
          <div class="col-12 col-md-6">
            <div class="input-group">
              <span class="input-group-text bg-white border-end-0 text-muted"><i class="bi bi-search"></i></span>
              <input
                type="text"
                class="form-control border-start-0"
                placeholder="Search user by name or email..."
                [(ngModel)]="searchQuery"
                (ngModelChange)="loadUsers()"
              />
            </div>
          </div>

          <div class="col-12 col-md-4">
            <select class="form-select" [(ngModel)]="roleFilter" (change)="loadUsers()">
              <option value="">All Roles</option>
              <option value="STUDENT">Students Only</option>
              <option value="FACULTY">Faculty / Staff Only</option>
              <option value="ADMIN">Admins Only</option>
            </select>
          </div>
        </div>
      </div>

      <app-loading-spinner *ngIf="loading" message="Loading users..."></app-loading-spinner>

      <div *ngIf="!loading" class="card card-custom p-0 overflow-hidden shadow-sm">
        <div class="table-responsive">
          <table class="table table-hover align-middle mb-0">
            <thead class="table-light border-bottom">
              <tr>
                <th class="py-3 px-4">User</th>
                <th class="py-3 px-3">Role</th>
                <th class="py-3 px-3">Phone</th>
                <th class="py-3 px-3">Status</th>
                <th class="py-3 px-4 text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let user of users">
                <td class="py-3 px-4">
                  <div class="d-flex align-items-center gap-3">
                    <div class="avatar-circle bg-primary text-white rounded-circle d-flex align-items-center justify-content-center fw-bold" style="width: 38px; height: 38px;">
                      {{ user.name ? user.name[0].toUpperCase() : 'U' }}
                    </div>
                    <div>
                      <div class="fw-bold text-dark">{{ user.name }}</div>
                      <div class="text-muted extra-small">{{ user.email }}</div>
                    </div>
                  </div>
                </td>
                <td class="py-3 px-3">
                  <span class="badge rounded-pill" [ngClass]="getRoleBadgeClass(user.role)">{{ user.role }}</span>
                </td>
                <td class="py-3 px-3 text-muted small">
                  {{ user.phone || 'N/A' }}
                </td>
                <td class="py-3 px-3">
                  <span class="badge rounded-pill" [ngClass]="user.isActive ? 'bg-success-subtle text-success' : 'bg-danger-subtle text-danger'">
                    {{ user.isActive ? 'Active' : 'Inactive' }}
                  </span>
                </td>
                <td class="py-3 px-4 text-end">
                  <div class="d-flex gap-2 justify-content-end">
                    <button class="btn btn-sm" [ngClass]="user.isActive ? 'btn-outline-warning' : 'btn-outline-success'" (click)="toggleStatus(user)">
                      {{ user.isActive ? 'Deactivate' : 'Activate' }}
                    </button>
                    <button class="btn btn-sm btn-outline-danger" (click)="deleteUser(user._id || user.id)">
                      <i class="bi bi-trash"></i>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Add User Modal -->
      <div *ngIf="showCreateModal" class="modal fade show d-block" tabindex="-1" style="background: rgba(0,0,0,0.5);">
        <div class="modal-dialog modal-dialog-centered">
          <div class="modal-content card-custom border-0 p-3">
            <div class="modal-header border-0 pb-0">
              <h5 class="modal-title fw-bold">Add New User Account</h5>
              <button type="button" class="btn-close" (click)="closeCreateModal()"></button>
            </div>

            <div class="modal-body">
              <form [formGroup]="userForm" (ngSubmit)="submitCreateUser()">
                <div class="mb-3">
                  <label class="form-label fw-medium">Role *</label>
                  <select class="form-select" formControlName="role">
                    <option value="STUDENT">Student</option>
                    <option value="FACULTY">Faculty / Staff</option>
                    <option value="ADMIN">Admin</option>
                  </select>
                </div>

                <div class="mb-3">
                  <label class="form-label fw-medium">Full Name *</label>
                  <input type="text" class="form-control" placeholder="Jane Doe" formControlName="name" />
                </div>

                <div class="mb-3">
                  <label class="form-label fw-medium">Email Address *</label>
                  <input type="email" class="form-control" placeholder="jane@college.edu" formControlName="email" />
                </div>

                <div class="mb-3">
                  <label class="form-label fw-medium">Password *</label>
                  <input type="password" class="form-control" placeholder="••••••••" formControlName="password" />
                </div>

                <div class="mb-3">
                  <label class="form-label fw-medium">Department</label>
                  <select class="form-select" formControlName="departmentId">
                    <option value="">Select Department</option>
                    <option *ngFor="let d of departments" [value]="d._id">{{ d.name }}</option>
                  </select>
                </div>

                <div class="d-flex justify-content-end gap-2 pt-2">
                  <button type="button" class="btn btn-light" (click)="closeCreateModal()">Cancel</button>
                  <button type="submit" class="btn btn-primary-custom" [disabled]="submitting || userForm.invalid">
                    <span *ngIf="submitting" class="spinner-border spinner-border-sm me-1"></span>
                    Create User
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
export class ManageUsersComponent implements OnInit {
  users: any[] = [];
  departments: Department[] = [];
  searchQuery = '';
  roleFilter = '';
  loading = true;

  showCreateModal = false;
  userForm: FormGroup;
  submitting = false;

  constructor(
    private userService: UserService,
    private deptService: DepartmentService,
    private fb: FormBuilder,
    private toast: ToastService
  ) {
    this.userForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['Password123!', [Validators.required, Validators.minLength(6)]],
      role: ['STUDENT', Validators.required],
      departmentId: ['']
    });
  }

  ngOnInit() {
    this.loadUsers();
    this.deptService.getDepartments().subscribe(res => {
      if (res.success) this.departments = res.departments;
    });
  }

  loadUsers() {
    this.loading = true;
    this.userService.getUsers(this.roleFilter, this.searchQuery).subscribe({
      next: (res) => {
        this.users = res.users;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  toggleStatus(user: any) {
    this.userService.toggleUserStatus(user._id || user.id).subscribe(res => {
      this.toast.success(res.message);
      this.loadUsers();
    });
  }

  deleteUser(id: string) {
    if (confirm('Are you sure you want to delete this user? This operation cannot be undone.')) {
      this.userService.deleteUser(id).subscribe(res => {
        this.toast.success('User deleted');
        this.loadUsers();
      });
    }
  }

  openCreateModal() {
    this.showCreateModal = true;
  }

  closeCreateModal() {
    this.showCreateModal = false;
  }

  submitCreateUser() {
    if (this.userForm.invalid) return;

    this.submitting = true;
    this.userService.createUser(this.userForm.value).subscribe({
      next: () => {
        this.submitting = false;
        this.toast.success('User created successfully');
        this.closeCreateModal();
        this.loadUsers();
      },
      error: () => {
        this.submitting = false;
      }
    });
  }

  getRoleBadgeClass(role: string): string {
    switch (role) {
      case 'ADMIN': return 'bg-danger-subtle text-danger border border-danger-subtle';
      case 'FACULTY': return 'bg-primary-subtle text-primary border border-primary-subtle';
      default: return 'bg-success-subtle text-success border border-success-subtle';
    }
  }
}
