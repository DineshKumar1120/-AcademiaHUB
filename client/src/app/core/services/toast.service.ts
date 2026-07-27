import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface ToastMessage {
  id: string;
  type: 'success' | 'danger' | 'warning' | 'info';
  title?: string;
  text: string;
}

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  private toastsSubject = new BehaviorSubject<ToastMessage[]>([]);
  toasts$ = this.toastsSubject.asObservable();

  show(text: string, type: 'success' | 'danger' | 'warning' | 'info' = 'info', title?: string) {
    const id = Date.now().toString() + Math.random().toString().slice(2, 6);
    const newToast: ToastMessage = { id, type, title, text };
    const current = this.toastsSubject.value;
    this.toastsSubject.next([...current, newToast]);

    setTimeout(() => {
      this.remove(id);
    }, 4000);
  }

  success(text: string, title: string = 'Success') {
    this.show(text, 'success', title);
  }

  error(text: string, title: string = 'Error') {
    this.show(text, 'danger', title);
  }

  warning(text: string, title: string = 'Warning') {
    this.show(text, 'warning', title);
  }

  info(text: string, title: string = 'Info') {
    this.show(text, 'info', title);
  }

  remove(id: string) {
    const updated = this.toastsSubject.value.filter(t => t.id !== id);
    this.toastsSubject.next(updated);
  }
}
