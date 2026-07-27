import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="card card-custom text-center p-5 fade-in my-3">
      <div class="empty-icon bg-light text-secondary rounded-circle mx-auto d-flex align-items-center justify-content-center mb-3" style="width: 70px; height: 70px;">
        <i class="bi fs-1" [ngClass]="icon"></i>
      </div>
      <h5 class="fw-bold text-dark mb-1">{{ title }}</h5>
      <p class="text-muted small mx-auto mb-3" style="max-width: 420px;">{{ description }}</p>
      <div *ngIf="actionText">
        <ng-content></ng-content>
      </div>
    </div>
  `
})
export class EmptyStateComponent {
  @Input() title: string = 'No Data Found';
  @Input() description: string = 'There are no records to display at this moment.';
  @Input() icon: string = 'bi-inbox';
  @Input() actionText?: string;
}
