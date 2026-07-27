import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { User } from '../../core/models/user.model';

interface MenuItem {
  title: string;
  icon: string;
  link: string;
  roles: string[];
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="sidebar bg-white border-end h-100 d-flex flex-column" style="width: 260px; min-height: 100vh;">
      <div class="px-4 py-3 border-bottom d-flex align-items-center justify-content-between">
        <span class="text-uppercase fw-bold text-muted extra-small tracking-wider">Navigation Menu</span>
      </div>

      <div class="p-3 flex-grow-1">
        <ul class="nav nav-pills flex-column gap-1">
          <li class="nav-item" *ngFor="let item of filteredMenuItems">
            <a
              [routerLink]="item.link"
              routerLinkActive="active"
              class="nav-link d-flex align-items-center gap-3 px-3 py-2 rounded-3 text-secondary"
            >
              <i class="bi fs-5" [ngClass]="item.icon"></i>
              <span class="fw-medium fs-6">{{ item.title }}</span>
            </a>
          </li>
        </ul>
      </div>

      <!-- Quick User Card Footer -->
      <div class="p-3 border-top bg-light" *ngIf="user">
        <div class="d-flex align-items-center gap-3">
          <div class="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center fw-bold" style="width: 36px; height: 36px;">
            {{ user.name ? user.name[0].toUpperCase() : 'U' }}
          </div>
          <div class="overflow-hidden">
            <div class="fw-bold small text-truncate">{{ user.name }}</div>
            <div class="text-muted extra-small text-truncate">{{ user.email }}</div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .nav-link {
      transition: all 0.2s ease;
      &:hover {
        background-color: #f1f5f9;
        color: #4f46e5 !important;
      }
      &.active {
        background-color: #4f46e5 !important;
        color: #ffffff !important;
        box-shadow: 0 4px 12px rgba(79, 70, 229, 0.25);
      }
    }
  `]
})
export class SidebarComponent implements OnInit {
  user: User | null = null;
  filteredMenuItems: MenuItem[] = [];

  menuItems: MenuItem[] = [
    // Student Routes
    { title: 'Student Dashboard', icon: 'bi-grid-1x2', link: '/student/dashboard', roles: ['STUDENT'] },
    { title: 'My Assignments', icon: 'bi-journal-text', link: '/student/assignments', roles: ['STUDENT'] },
    { title: 'My Marks & Feedback', icon: 'bi-award', link: '/student/marks', roles: ['STUDENT'] },

    // Faculty Routes
    { title: 'Faculty Dashboard', icon: 'bi-speedometer2', link: '/faculty/dashboard', roles: ['FACULTY'] },
    { title: 'Create Assignment', icon: 'bi-plus-circle', link: '/faculty/create-assignment', roles: ['FACULTY'] },
    { title: 'Export Reports & Marks', icon: 'bi-file-earmark-pdf', link: '/faculty/reports', roles: ['FACULTY'] },

    // Admin Routes
    { title: 'Admin Dashboard', icon: 'bi-shield-check', link: '/admin/dashboard', roles: ['ADMIN'] },
    { title: 'Manage Users', icon: 'bi-people', link: '/admin/users', roles: ['ADMIN'] },
    { title: 'Departments & Courses', icon: 'bi-building', link: '/admin/departments', roles: ['ADMIN'] },
    { title: 'System Reports & Export', icon: 'bi-file-earmark-spreadsheet', link: '/admin/reports', roles: ['ADMIN'] },

    // Shared Routes
    { title: 'Notifications', icon: 'bi-bell', link: '/notifications', roles: ['STUDENT', 'FACULTY', 'ADMIN'] },
    { title: 'Profile Settings', icon: 'bi-person-gear', link: '/profile', roles: ['STUDENT', 'FACULTY', 'ADMIN'] }
  ];

  constructor(private authService: AuthService) {}

  ngOnInit() {
    this.authService.currentUser$.subscribe(u => {
      this.user = u;
      if (u) {
        this.filteredMenuItems = this.menuItems.filter(item => item.roles.includes(u.role));
      } else {
        this.filteredMenuItems = [];
      }
    });
  }
}
