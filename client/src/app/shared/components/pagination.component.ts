import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-pagination',
  standalone: true,
  imports: [CommonModule],
  template: `
    <nav *ngIf="totalPages > 1" class="d-flex justify-content-between align-items-center mt-3">
      <div class="text-muted small">
        Showing {{ (currentPage - 1) * pageSize + 1 }} to {{ Math.min(currentPage * pageSize, totalItems) }} of {{ totalItems }} entries
      </div>
      <ul class="pagination pagination-sm mb-0">
        <li class="page-item" [class.disabled]="currentPage === 1">
          <button class="page-link" (click)="changePage(currentPage - 1)"><i class="bi bi-chevron-left"></i></button>
        </li>
        <li
          *ngFor="let page of pages"
          class="page-item"
          [class.active]="page === currentPage"
        >
          <button class="page-link" (click)="changePage(page)">{{ page }}</button>
        </li>
        <li class="page-item" [class.disabled]="currentPage === totalPages">
          <button class="page-link" (click)="changePage(currentPage + 1)"><i class="bi bi-chevron-right"></i></button>
        </li>
      </ul>
    </nav>
  `
})
export class PaginationComponent {
  @Input() totalItems: number = 0;
  @Input() pageSize: number = 10;
  @Input() currentPage: number = 1;
  @Output() pageChange = new EventEmitter<number>();

  Math = Math;

  get totalPages(): number {
    return Math.ceil(this.totalItems / this.pageSize);
  }

  get pages(): number[] {
    const list: number[] = [];
    for (let i = 1; i <= this.totalPages; i++) {
      list.push(i);
    }
    return list;
  }

  changePage(page: number) {
    if (page >= 1 && page <= this.totalPages && page !== this.currentPage) {
      this.pageChange.emit(page);
    }
  }
}
