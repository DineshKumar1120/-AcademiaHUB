import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { ToastService } from '../services/toast.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const toast = inject(ToastService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      let errorMessage = 'An unexpected error occurred';

      if (error.error && error.error.message) {
        errorMessage = error.error.message;
      } else if (error.status === 0) {
        errorMessage = 'Unable to connect to server. Please ensure backend API is running.';
      }

      if (error.status === 401 && !req.url.includes('/login')) {
        toast.error('Session expired. Please log in again.');
        authService.logout();
      } else if (error.status !== 404) {
        toast.error(errorMessage);
      }

      return throwError(() => new Error(errorMessage));
    })
  );
};
