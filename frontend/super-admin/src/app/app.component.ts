import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ToastService } from './core/toast.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  template: `
    <router-outlet />
    <div class="toast-container">
      @for (t of toast.toasts(); track t.id) {
        <div class="toast" [class]="'toast-' + t.type" (click)="toast.remove(t.id)">{{ t.message }}</div>
      }
    </div>
  `,
  styles: `
    .toast-container { position: fixed; top: 20px; right: 20px; z-index: 10000; display: flex; flex-direction: column; gap: 8px; }
    .toast { padding: 12px 20px; border-radius: 8px; color: #fff; font-size: 14px; cursor: pointer; animation: slideIn .3s ease; box-shadow: 0 4px 12px rgba(0,0,0,.15); max-width: 400px; }
    .toast-success { background: #059669; }
    .toast-error { background: #dc2626; }
    .toast-warning { background: #d97706; }
    @keyframes slideIn { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
  `
})
export class AppComponent {
  constructor(public toast: ToastService) { }
}
