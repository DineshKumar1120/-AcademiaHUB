import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="container-fluid p-0 fade-in" style="max-width: 700px;">
      <h3 class="fw-bold text-dark mb-1">System Settings</h3>
      <p class="text-muted small mb-4">Manage portal display preferences and notification options.</p>

      <div class="card card-custom p-4 p-md-5 mb-4">
        <h5 class="fw-bold text-dark mb-3"><i class="bi bi-bell text-primary me-2"></i> Notification Preferences</h5>

        <div class="form-check form-switch mb-3">
          <input class="form-check-input" type="checkbox" id="emailNotif" checked>
          <label class="form-check-label fw-medium text-dark" for="emailNotif">Email Notifications for New Assignments</label>
          <div class="text-muted extra-small">Receive automated alerts whenever a faculty member posts coursework</div>
        </div>

        <div class="form-check form-switch mb-3">
          <input class="form-check-input" type="checkbox" id="gradeNotif" checked>
          <label class="form-check-label fw-medium text-dark" for="gradeNotif">Grade Release Alerts</label>
          <div class="text-muted extra-small">Get notified immediately when assignment marks are published</div>
        </div>
      </div>

      <div class="card card-custom p-4 p-md-5">
        <h5 class="fw-bold text-dark mb-3"><i class="bi bi-laptop text-primary me-2"></i> Application Info</h5>
        <div class="d-flex justify-content-between py-2 border-bottom text-muted small">
          <span>Portal Version</span>
          <strong class="text-dark">v1.0.0 (Production)</strong>
        </div>
        <div class="d-flex justify-content-between py-2 border-bottom text-muted small">
          <span>Frontend Engine</span>
          <strong class="text-dark">Angular 18+ & Bootstrap 5</strong>
        </div>
        <div class="d-flex justify-content-between py-2 text-muted small">
          <span>Backend REST Framework</span>
          <strong class="text-dark">Node.js + Express + MongoDB</strong>
        </div>
      </div>
    </div>
  `
})
export class SettingsComponent {}
