import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { NotificationService } from '../../core/services/notification.service';
import { User } from '../../core/models/user.model';
import { NotificationItem } from '../../core/models/notification.model';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <nav class="navbar navbar-expand-lg sticky-top bg-white border-bottom shadow-sm py-2 px-3">
      <div class="container-fluid">
        <a class="navbar-brand d-flex align-items-center gap-2 fw-bold text-primary" routerLink="/">
          <div class="brand-icon bg-primary text-white rounded-3 d-flex align-items-center justify-content-center" style="width: 36px; height: 36px;">
            <i class="bi bi-mortarboard-fill fs-5"></i>
          </div>
          <span class="fs-5 tracking-tight">AcademiaHUB</span>
        </a>

        <div class="d-flex align-items-center ms-auto gap-3">
          <!-- Notification Dropdown -->
          <div class="dropdown" *ngIf="user">
            <button
              class="btn btn-light position-relative rounded-circle p-2"
              type="button"
              id="notificationDropdown"
              data-bs-toggle="dropdown"
              aria-expanded="false"
              (click)="loadNotifications()"
            >
              <i class="bi bi-bell fs-5 text-secondary"></i>
              <span
                *ngIf="unreadCount > 0"
                class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger"
              >
                {{ unreadCount }}
              </span>
            </button>

            <div class="dropdown-menu dropdown-menu-end shadow-lg border-0 mt-2 p-0" style="width: 340px; max-height: 420px; overflow-y: auto;" aria-labelledby="notificationDropdown">
              <div class="p-3 bg-light border-bottom d-flex justify-content-between align-items-center">
                <h6 class="mb-0 fw-bold">Notifications</h6>
                <button *ngIf="unreadCount > 0" class="btn btn-link btn-sm text-decoration-none p-0" (click)="markAllRead()">Mark all as read</button>
              </div>

              <div *ngIf="notifications.length === 0" class="p-4 text-center text-muted">
                <i class="bi bi-bell-slash fs-3 d-block mb-2"></i>
                No notifications right now
              </div>

              <div class="list-group list-group-flush" *ngFor="let notif of notifications">
                <a
                  [routerLink]="notif.link || null"
                  (click)="markAsRead(notif)"
                  class="list-group-item list-group-item-action p-3 d-flex gap-3 align-items-start border-bottom"
                  [ngClass]="{ 'bg-light': !notif.isRead }"
                >
                  <div class="badge rounded-circle p-2" [ngClass]="getNotifBadgeClass(notif.type)">
                    <i class="bi" [ngClass]="getNotifIcon(notif.type)"></i>
                  </div>
                  <div>
                    <div class="fw-semibold text-dark small">{{ notif.title }}</div>
                    <div class="text-muted small">{{ notif.message }}</div>
                    <div class="text-muted extra-small mt-1" style="font-size: 0.75rem;">{{ notif.createdAt | date: 'shortTime' }}</div>
                  </div>
                </a>
              </div>
            </div>
          </div>

          <!-- User Profile Dropdown -->
          <div class="dropdown" *ngIf="user">
            <a
              class="d-flex align-items-center text-decoration-none dropdown-toggle gap-2 text-dark"
              href="#"
              role="button"
              id="userDropdown"
              data-bs-toggle="dropdown"
              aria-expanded="false"
            >
              <div class="avatar-circle bg-primary text-white rounded-circle d-flex align-items-center justify-content-center fw-bold" style="width: 38px; height: 38px;">
                {{ user.name ? user.name[0].toUpperCase() : 'U' }}
              </div>
              <div class="d-none d-md-block text-start">
                <div class="fw-bold small leading-tight">{{ user.name }}</div>
                <span class="badge rounded-pill" [ngClass]="getRoleBadgeClass(user.role)">{{ user.role }}</span>
              </div>
            </a>

            <ul class="dropdown-menu dropdown-menu-end shadow border-0 mt-2" aria-labelledby="userDropdown">
              <li><a class="dropdown-item d-flex align-items-center gap-2 py-2" routerLink="/profile"><i class="bi bi-person text-secondary"></i> My Profile</a></li>
              <li><a class="dropdown-item d-flex align-items-center gap-2 py-2" routerLink="/settings"><i class="bi bi-gear text-secondary"></i> Settings</a></li>
              <li><hr class="dropdown-divider"></li>
              <li><button class="dropdown-item d-flex align-items-center gap-2 py-2 text-danger" (click)="logout()"><i class="bi bi-box-arrow-right"></i> Sign Out</button></li>
            </ul>
          </div>
        </div>
      </div>
    </nav>
  `
})
export class NavbarComponent implements OnInit {
  user: User | null = null;
  unreadCount = 0;
  notifications: NotificationItem[] = [];

  constructor(
    private authService: AuthService,
    private notificationService: NotificationService
  ) {}

  ngOnInit() {
    this.authService.currentUser$.subscribe(u => {
      this.user = u;
      if (u) this.loadNotifications();
    });

    this.notificationService.unreadCount$.subscribe(count => {
      this.unreadCount = count;
    });
  }

  loadNotifications() {
    if (!this.user) return;
    this.notificationService.getNotifications().subscribe(res => {
      if (res.success) {
        this.notifications = res.notifications;
        this.unreadCount = res.unreadCount;
      }
    });
  }

  markAsRead(notif: NotificationItem) {
    if (!notif.isRead) {
      this.notificationService.markAsRead(notif._id).subscribe();
    }
  }

  markAllRead() {
    this.notificationService.markAllAsRead().subscribe(() => {
      this.loadNotifications();
    });
  }

  logout() {
    this.authService.logout();
  }

  getRoleBadgeClass(role?: string): string {
    switch (role) {
      case 'ADMIN': return 'bg-danger-subtle text-danger border border-danger';
      case 'FACULTY': return 'bg-indigo-subtle text-indigo border border-indigo';
      default: return 'bg-success-subtle text-success border border-success';
    }
  }

  getNotifBadgeClass(type: string): string {
    switch (type) {
      case 'ASSIGNMENT': return 'bg-primary text-white';
      case 'GRADE': return 'bg-success text-white';
      default: return 'bg-info text-white';
    }
  }

  getNotifIcon(type: string): string {
    switch (type) {
      case 'ASSIGNMENT': return 'bi-file-earmark-text';
      case 'GRADE': return 'bi-award';
      default: return 'bi-bell';
    }
  }
}
