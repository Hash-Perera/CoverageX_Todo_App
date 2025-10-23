import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export enum ToastType {
  Success = 'success',
  Error = 'error',
  Info = 'info',
  Warning = 'warning',
}

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
}

@Injectable({
  providedIn: 'root',
})
export class ToasterService {
  private toastsSubject = new BehaviorSubject<Toast[]>([]);
  public toasts$: Observable<Toast[]> = this.toastsSubject.asObservable();

  private readonly DEFAULT_DURATION = 3000;

  showSuccess(message: string, duration?: number): void {
    this.show(message, ToastType.Success, duration);
  }

  showError(message: string, duration?: number): void {
    this.show(message, ToastType.Error, duration);
  }

  showInfo(message: string, duration?: number): void {
    this.show(message, ToastType.Info, duration);
  }

  showWarning(message: string, duration?: number): void {
    this.show(message, ToastType.Warning, duration);
  }

  private show(message: string, type: ToastType, duration?: number): void {
    const toast: Toast = {
      id: this.generateId(),
      message,
      type,
      duration: duration || this.DEFAULT_DURATION,
    };

    const currentToasts = this.toastsSubject.value;
    this.toastsSubject.next([...currentToasts, toast]);

    // Auto-remove toast after duration
    setTimeout(() => {
      this.remove(toast.id);
    }, toast.duration);
  }

  remove(id: string): void {
    const currentToasts = this.toastsSubject.value;
    const filteredToasts = currentToasts.filter((toast) => toast.id !== id);
    this.toastsSubject.next(filteredToasts);
  }

  private generateId(): string {
    return `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  clearAll(): void {
    this.toastsSubject.next([]);
  }
}
