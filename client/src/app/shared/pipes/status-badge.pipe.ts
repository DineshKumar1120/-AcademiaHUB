import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'statusBadge',
  standalone: true
})
export class StatusBadgePipe implements PipeTransform {
  transform(status: string | undefined | null): string {
    switch (status?.toUpperCase()) {
      case 'ACTIVE':
      case 'SUBMITTED':
        return 'bg-success-subtle text-success border border-success-subtle';
      case 'GRADED':
        return 'bg-primary-subtle text-primary border border-primary-subtle';
      case 'LATE':
      case 'CLOSED':
        return 'bg-warning-subtle text-warning border border-warning-subtle';
      case 'ARCHIVED':
      case 'INACTIVE':
        return 'bg-secondary-subtle text-secondary border border-secondary-subtle';
      default:
        return 'bg-light text-dark';
    }
  }
}
