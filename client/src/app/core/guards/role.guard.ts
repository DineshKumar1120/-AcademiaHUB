import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { Role } from '../models/user.model';
import { ToastService } from '../services/toast.service';

export const roleGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const toast = inject(ToastService);

  const allowedRoles = route.data['roles'] as Role[];

  if (authService.hasRole(allowedRoles)) {
    return true;
  }

  toast.error('You do not have permission to access this page');
  const redirectUrl = authService.getDashboardRouteForRole();
  router.navigate([redirectUrl]);
  return false;
};
