import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NotificationService } from '../../core/services/notification.service';
import { NotificationItem } from '../../core/models/notification.model';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner.component';
import { EmptyStateComponent } from '../../shared/components/empty-state.component';

@Component({
  selector: 'app-notification-center',
  standalone: true,
  imports: [CommonModule, RouterModule, LoadingSpinnerComponent, EmptyStateComponent],
  template: `
    <div class="container-fluid p-0 fade-in" style="max-width: 900px;">
      <!-- Header Bar -->
      <div class="d-flex flex-column flex-md-row align-items-md-center justify-content-between mb-4 gap-3">
        <div>
          <h3 class="fw-bold text-dark mb-1">Notification Center</h3>
          <p class="text-muted small mb-0">Stay informed with updates on assignments, grades, and system alerts.</p>
        </div>

        <div class="d-flex align-items-center gap-2">
          <button
            *ngIf="notifications.length > 0 && unreadCount > 0"
            class="btn btn-outline-primary btn-sm rounded-3 shadow-sm"
            (click)="markAllRead()"
          >
            <i class="bi bi-check-all me-1"></i> Mark All as Read
          </button>
        </div>
      </div>

      <!-- Filter Tabs -->
      <div class="d-flex align-items-center justify-content-between mb-4 border-bottom pb-2">
        <ul class="nav nav-pills gap-2">
          <li class="nav-item">
            <button
              class="nav-link btn-sm px-3 rounded-pill fw-semibold"
              [class.active]="filter === 'ALL'"
              (click)="filter = 'ALL'"
            >
              All Notifications ({{ notifications.length }})
            </button>
          </li>
          <li class="nav-item">
            <button
              class="nav-link btn-sm px-3 rounded-pill fw-semibold"
              [class.active]="filter === 'UNREAD'"
              (click)="filter = 'UNREAD'"
            >
              Unread <span class="badge bg-danger rounded-pill ms-1" *ngIf="unreadCount > 0">{{ unreadCount }}</span>
            </button>
          </li>
          <li class="nav-item">
            <button
              class="nav-link btn-sm px-3 rounded-pill fw-semibold"
              [class.active]="filter === 'READ'"
              (click)="filter = 'READ'"
            >
              Read
            </button>
          </li>
        </ul>
      </div>

      <app-loading-spinner *ngIf="loading" message="Loading notifications..."></app-loading-spinner>

      <app-empty-state
        *ngIf="!loading && filteredNotifications.length === 0"
        title="No Notifications Found"
        description="You have no notifications matching your current filter."
        icon="bi-bell-slash-fill"
      ></app-empty-state>

      <!-- Card Grid / Stacked Cards -->
      <div *ngIf="!loading && filteredNotifications.length > 0" class="row g-3">
        <div class="col-12" *ngFor="let notif of filteredNotifications">
          <div
            class="card notification-card border-0 shadow-sm rounded-4 overflow-hidden transition-all"
            [ngClass]="getCardAccentClass(notif.type, notif.isRead)"
          >
            <div class="card-body p-4">
              <!-- Header: Icon + Title + Unread Badge -->
              <div class="d-flex align-items-center justify-content-between mb-2">
                <div class="d-flex align-items-center gap-3">
                  <div class="icon-box rounded-circle d-flex align-items-center justify-content-center" [ngClass]="getIconBoxClass(notif.type)">
                    <i class="bi fs-5" [ngClass]="getNotifIcon(notif.type)"></i>
                  </div>
                  <div>
                    <h6 class="fw-bold text-dark mb-0 d-inline-block align-middle me-2">{{ notif.title }}</h6>
                    <span class="badge bg-secondary-subtle text-secondary extra-small rounded-pill">{{ notif.type }}</span>
                  </div>
                </div>

                <span *ngIf="!notif.isRead" class="badge bg-danger rounded-pill px-2 py-1 extra-small">NEW</span>
              </div>

              <!-- Body: Text Message -->
              <div class="card-text text-secondary mb-3 ms-md-5 ps-md-2" style="font-size: 0.925rem;">
                {{ notif.message }}
              </div>

              <!-- Footer: Timestamp + Action Buttons -->
              <div class="d-flex align-items-center justify-content-between pt-2 border-top ms-md-5 ps-md-2 text-muted extra-small">
                <span>
                  <i class="bi bi-clock me-1"></i> {{ notif.createdAt | date: 'medium' }}
                </span>

                <div class="d-flex align-items-center gap-2">
                  <button
                    *ngIf="!notif.isRead"
                    class="btn btn-sm btn-light border text-muted px-2 py-1 extra-small"
                    (click)="markRead(notif)"
                  >
                    <i class="bi bi-check2 me-1"></i> Mark as Read
                  </button>

                  <a
                    *ngIf="notif.link"
                    [routerLink]="notif.link"
                    (click)="markRead(notif)"
                    class="btn btn-sm btn-primary-custom px-3 py-1 extra-small"
                  >
                    View <i class="bi bi-arrow-right ms-1"></i>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .notification-card {
      background: #ffffff;
      transition: all 0.25s ease-in-out;
      border-left: 5px solid transparent !important;

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 10px 20px -5px rgba(0, 0, 0, 0.08) !important;
      }

      &.accent-blue { border-left-color: #3b82f6 !important; }
      &.accent-green { border-left-color: #10b981 !important; }
      &.accent-yellow { border-left-color: #f59e0b !important; }
      &.accent-red { border-left-color: #ef4444 !important; }

      &.unread-card {
        background-color: #f8fafc;
      }
    }

    .icon-box {
      width: 42px;
      height: 42px;
    }

    .nav-pills .nav-link {
      color: #64748b;
      background: #f1f5f9;
      &.active {
        background-color: #4f46e5;
        color: #ffffff;
      }
    }
  `]
})
export class NotificationCenterComponent implements OnInit {
  notifications: NotificationItem[] = [];
  filter: 'ALL' | 'UNREAD' | 'READ' = 'ALL';
  unreadCount = 0;
  loading = true;

  constructor(private notificationService: NotificationService) {}

  ngOnInit() {
    this.loadNotifications();
  }

  loadNotifications() {
    this.loading = true;
    this.notificationService.getNotifications().subscribe({
      next: (res) => {
        if (res.success) {
          this.notifications = res.notifications;
          this.unreadCount = res.unreadCount;
        }
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  get filteredNotifications(): NotificationItem[] {
    if (this.filter === 'UNREAD') return this.notifications.filter(n => !n.isRead);
    if (this.filter === 'READ') return this.notifications.filter(n => n.isRead);
    return this.notifications;
  }

  markRead(notif: NotificationItem) {
    if (!notif.isRead) {
      this.notificationService.markAsRead(notif._id).subscribe(() => {
        notif.isRead = true;
        if (this.unreadCount > 0) this.unreadCount--;
      });
    }
  }

  markAllRead() {
    this.notificationService.markAllAsRead().subscribe(() => {
      this.notifications.forEach(n => n.isRead = true);
      this.unreadCount = 0;
    });
  }

  getCardAccentClass(type: string, isRead: boolean): string {
    let accent = 'accent-blue';
    switch (type) {
      case 'GRADE': accent = 'accent-green'; break;
      case 'ASSIGNMENT': accent = 'accent-blue'; break;
      case 'SYSTEM': accent = 'accent-red'; break;
      default: accent = 'accent-yellow'; break;
    }
    return `${accent} ${!isRead ? 'unread-card' : ''}`;
  }

  getIconBoxClass(type: string): string {
    switch (type) {
      case 'GRADE': return 'bg-success-subtle text-success';
      case 'ASSIGNMENT': return 'bg-primary-subtle text-primary';
      case 'SYSTEM': return 'bg-danger-subtle text-danger';
      default: return 'bg-warning-subtle text-warning';
    }
  }

  getNotifIcon(type: string): string {
    switch (type) {
      case 'GRADE': return 'bi-award-fill';
      case 'ASSIGNMENT': return 'bi-file-earmark-text-fill';
      case 'SYSTEM': return 'bi-shield-exclamation';
      default: return 'bi-bell-fill';
    }
  }
}
