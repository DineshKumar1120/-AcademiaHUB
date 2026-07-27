import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';
import { ShellComponent } from './layout/shell/shell.component';

export const routes: Routes = [
  // Public Auth Routes (Without Shell)
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'register',
    loadComponent: () => import('./features/auth/register.component').then(m => m.RegisterComponent)
  },
  {
    path: 'forgot-password',
    loadComponent: () => import('./features/auth/forgot-password.component').then(m => m.ForgotPasswordComponent)
  },
  {
    path: 'reset-password',
    loadComponent: () => import('./features/auth/reset-password.component').then(m => m.ResetPasswordComponent)
  },

  // Protected Routes (Wrapped inside Layout Shell)
  {
    path: '',
    component: ShellComponent,
    children: [
      {
        path: '',
        redirectTo: 'home',
        pathMatch: 'full'
      },
      {
        path: 'home',
        loadComponent: () => import('./pages/home.component').then(m => m.HomeComponent)
      },

      // Student Feature Routes
      {
        path: 'student/dashboard',
        loadComponent: () => import('./features/student/student-dashboard.component').then(m => m.StudentDashboardComponent),
        canActivate: [authGuard, roleGuard],
        data: { roles: ['STUDENT'] }
      },
      {
        path: 'student/assignments',
        loadComponent: () => import('./features/student/student-assignments.component').then(m => m.StudentAssignmentsComponent),
        canActivate: [authGuard, roleGuard],
        data: { roles: ['STUDENT'] }
      },
      {
        path: 'student/marks',
        loadComponent: () => import('./features/student/student-marks.component').then(m => m.StudentMarksComponent),
        canActivate: [authGuard, roleGuard],
        data: { roles: ['STUDENT'] }
      },

      // Faculty Feature Routes
      {
        path: 'faculty/dashboard',
        loadComponent: () => import('./features/faculty/faculty-dashboard.component').then(m => m.FacultyDashboardComponent),
        canActivate: [authGuard, roleGuard],
        data: { roles: ['FACULTY'] }
      },
      {
        path: 'faculty/create-assignment',
        loadComponent: () => import('./features/faculty/assignment-create-edit.component').then(m => m.AssignmentCreateEditComponent),
        canActivate: [authGuard, roleGuard],
        data: { roles: ['FACULTY', 'ADMIN'] }
      },
      {
        path: 'faculty/submissions/:assignmentId',
        loadComponent: () => import('./features/faculty/view-submissions.component').then(m => m.ViewSubmissionsComponent),
        canActivate: [authGuard, roleGuard],
        data: { roles: ['FACULTY', 'ADMIN'] }
      },
      {
        path: 'faculty/reports',
        loadComponent: () => import('./features/reports/reports-export.component').then(m => m.ReportsExportComponent),
        canActivate: [authGuard, roleGuard],
        data: { roles: ['FACULTY', 'ADMIN'] }
      },

      // Admin Feature Routes
      {
        path: 'admin/dashboard',
        loadComponent: () => import('./features/admin/admin-dashboard.component').then(m => m.AdminDashboardComponent),
        canActivate: [authGuard, roleGuard],
        data: { roles: ['ADMIN'] }
      },
      {
        path: 'admin/users',
        loadComponent: () => import('./features/admin/manage-users.component').then(m => m.ManageUsersComponent),
        canActivate: [authGuard, roleGuard],
        data: { roles: ['ADMIN'] }
      },
      {
        path: 'admin/departments',
        loadComponent: () => import('./features/admin/manage-departments.component').then(m => m.ManageDepartmentsComponent),
        canActivate: [authGuard, roleGuard],
        data: { roles: ['ADMIN'] }
      },
      {
        path: 'admin/reports',
        loadComponent: () => import('./features/reports/reports-export.component').then(m => m.ReportsExportComponent),
        canActivate: [authGuard, roleGuard],
        data: { roles: ['ADMIN'] }
      },

      // Assignment Modes Routes
      {
        path: 'assignments/:id',
        loadComponent: () => import('./features/assignments/assignment-detail.component').then(m => m.AssignmentDetailComponent),
        canActivate: [authGuard]
      },
      {
        path: 'assignments/:id/quiz',
        loadComponent: () => import('./features/assignments/mcq-quiz.component').then(m => m.MCQQuizComponent),
        canActivate: [authGuard]
      },
      {
        path: 'assignments/:id/code',
        loadComponent: () => import('./features/assignments/programming-assignment.component').then(m => m.ProgrammingAssignmentComponent),
        canActivate: [authGuard]
      },

      // Shared Pages
      {
        path: 'notifications',
        loadComponent: () => import('./features/notifications/notification-center.component').then(m => m.NotificationCenterComponent),
        canActivate: [authGuard]
      },
      {
        path: 'profile',
        loadComponent: () => import('./pages/profile.component').then(m => m.ProfileComponent),
        canActivate: [authGuard]
      },
      {
        path: 'settings',
        loadComponent: () => import('./pages/settings.component').then(m => m.SettingsComponent),
        canActivate: [authGuard]
      }
    ]
  },

  // 404 Fallback
  {
    path: '**',
    loadComponent: () => import('./pages/not-found.component').then(m => m.NotFoundComponent)
  }
];
