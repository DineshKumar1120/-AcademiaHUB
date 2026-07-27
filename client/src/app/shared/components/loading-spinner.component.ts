import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-loading-spinner',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="d-flex flex-column align-items-center justify-content-center py-5 fade-in">
      <div class="spinner-border text-primary" [style.width]="size" [style.height]="size" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
      <p *ngIf="message" class="text-muted mt-3 fw-medium small">{{ message }}</p>
    </div>
  `
})
export class LoadingSpinnerComponent {
  @Input() message: string = 'Loading data...';
  @Input() size: string = '3rem';
}
