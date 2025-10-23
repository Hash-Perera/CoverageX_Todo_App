import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { trigger, transition, style, animate } from '@angular/animations';
import { Toast, ToasterService } from '../../services/toaster.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-toaster',
  imports: [CommonModule],
  templateUrl: './toaster.html',
  styleUrl: './toaster.scss',
  animations: [
    trigger('toastAnimation', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(-100%) translateX(-50%)' }),
        animate(
          '300ms ease-out',
          style({ opacity: 1, transform: 'translateY(0) translateX(-50%)' })
        ),
      ]),
      transition(':leave', [
        animate(
          '300ms ease-in',
          style({ opacity: 0, transform: 'translateY(-100%) translateX(-50%)' })
        ),
      ]),
    ]),
  ],
})
export class Toaster implements OnInit {
  toasts$: Observable<Toast[]>;

  constructor(private toasterService: ToasterService) {
    this.toasts$ = this.toasterService.toasts$;
  }

  ngOnInit(): void {}

  closeToast(id: string): void {
    this.toasterService.remove(id);
  }

  getIcon(type: string): string {
    switch (type) {
      case 'success':
        return '✓';
      case 'error':
        return '✕';
      case 'warning':
        return '⚠';
      case 'info':
        return 'ℹ';
      default:
        return '';
    }
  }
}
