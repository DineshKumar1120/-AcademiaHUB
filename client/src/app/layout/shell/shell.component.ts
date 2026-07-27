import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NavbarComponent } from '../../shared/components/navbar.component';
import { SidebarComponent } from '../../shared/components/sidebar.component';
import { FooterComponent } from '../../shared/components/footer.component';
import { ToastContainerComponent } from '../../shared/components/toast.component';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    NavbarComponent,
    SidebarComponent,
    FooterComponent,
    ToastContainerComponent
  ],
  template: `
    <div class="app-wrapper flex-column min-vh-100">
      <app-navbar></app-navbar>
      <app-toast-container></app-toast-container>
      
      <div class="d-flex flex-grow-1">
        <app-sidebar></app-sidebar>
        
        <main class="main-content bg-light flex-grow-1 p-4">
          <router-outlet></router-outlet>
        </main>
      </div>

      <app-footer></app-footer>
    </div>
  `
})
export class ShellComponent {}
