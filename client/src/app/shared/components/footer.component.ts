import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule],
  template: `
    <footer class="bg-white border-top py-3 px-4 mt-auto text-center text-muted small">
      <div class="container-fluid d-flex flex-column flex-sm-row justify-content-between align-items-center gap-2">
        <div>&copy; 2026 <strong>College Assignment Management System</strong>. All rights reserved.</div>
        <div class="d-flex gap-3">
          <a href="#" class="text-decoration-none text-muted">Privacy Policy</a>
          <a href="#" class="text-decoration-none text-muted">Terms of Service</a>
          <a href="#" class="text-decoration-none text-muted">Support</a>
        </div>
      </div>
    </footer>
  `
})
export class FooterComponent {}
