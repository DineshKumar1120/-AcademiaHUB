import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService, ToastMessage } from '../../core/services/toast.service';

@Component({
  selector: 'app-toast-container',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="toast-container-custom">
      <div
        *ngFor="let toast of toasts"
        class="toast show shadow-lg border-0 mb-2 rounded-3 fade-in"
        [ngClass]="'bg-' + toast.type + ' text-white'"
        role="alert"
        aria-live="assertive"
        aria-atomic="true"
      >
        <div class="d-flex p-3 align-items-center justify-content-between">
          <div class="d-flex align-items-center gap-2">
            <i class="bi fs-5" [ngClass]="getIcon(toast.type)"></i>
            <div>
              <strong *ngIf="toast.title" class="d-block leading-none">{{ toast.title }}</strong>
              <span class="small">{{ toast.text }}</span>
            </div>
          </div>
          <button type="button" class="btn-close btn-close-white ms-3" (click)="remove(toast.id)"></button>
        </div>
      </div>
    </div>
  `
})
export class ToastContainerComponent implements OnInit {
  toasts: ToastMessage[] = [];

  constructor(private toastService: ToastService) {}

  ngOnInit() {
    this.toastService.toasts$.subscribe(t => {
      this.toasts = t;
    });
  }

  remove(id: string) {
    this.toastService.remove(id);
  }

  getIcon(type: string): string {
    switch (type) {
      case 'success': return 'bi-check-circle-fill';
      case 'danger': return 'bi-exclamation-octagon-fill';
      case 'warning': return 'bi-exclamation-triangle-fill';
      default: return 'bi-info-circle-fill';
    }
  }
}
