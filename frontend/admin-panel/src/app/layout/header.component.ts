import { Component, inject } from '@angular/core';
import { ThemeService } from '../core/theme.service';
import { AuthService } from '../core/auth.service';

@Component({
    selector: 'app-header',
    standalone: true,
    template: `
    <header class="header">
      <div class="header-left">
        <button class="btn-icon mobile-menu" (click)="toggleMobile()">
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="3" y1="12" x2="21" y2="12"/>
            <line x1="3" y1="6" x2="21" y2="6"/>
            <line x1="3" y1="18" x2="21" y2="18"/>
          </svg>
        </button>
      </div>

      <div class="header-right">
        <button class="btn-icon theme-toggle" (click)="theme.toggle()" [title]="theme.theme() === 'light' ? 'Tema escuro' : 'Tema claro'">
          @if (theme.theme() === 'light') {
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
            </svg>
          } @else {
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="5"/>
              <line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
              <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
            </svg>
          }
        </button>

        <div class="user-menu">
          <div class="user-avatar">
            {{ auth.userName().charAt(0).toUpperCase() }}
          </div>
          <div class="user-info">
            <span class="user-name">{{ auth.userName() }}</span>
          </div>
          <button class="btn-icon" (click)="auth.logout()" title="Sair">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
              <polyline points="16 17 21 12 16 7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
          </button>
        </div>
      </div>
    </header>
  `,
    styles: [`
    .header {
      position: fixed;
      top: 0;
      left: var(--sidebar-width);
      right: 0;
      height: var(--header-height);
      background: var(--bg-card);
      border-bottom: 1px solid var(--border);
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 24px;
      z-index: 50;
      transition: left 0.3s ease, background 0.25s ease, border-color 0.25s ease;
    }

    .header-left { display: flex; align-items: center; gap: 16px; }
    .header-right { display: flex; align-items: center; gap: 12px; }

    .mobile-menu { display: none; }

    .theme-toggle {
      width: 40px;
      height: 40px;
      border-radius: var(--radius-full);
      background: var(--bg-page);
      border: 1px solid var(--border);
      color: var(--text-secondary);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.15s ease;
    }

    .theme-toggle:hover {
      border-color: var(--primary);
      color: var(--primary);
    }

    .user-menu {
      display: flex;
      align-items: center;
      gap: 10px;
      padding-left: 12px;
      border-left: 1px solid var(--border);
    }

    .user-avatar {
      width: 36px;
      height: 36px;
      background: linear-gradient(135deg, var(--primary) 0%, var(--primary-hover) 100%);
      border-radius: var(--radius-full);
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-weight: 700;
      font-size: 0.875rem;
    }

    .user-name {
      font-size: 0.875rem;
      font-weight: 600;
      color: var(--text-primary);
    }

    @media (max-width: 768px) {
      .header { left: 0; }
      .mobile-menu { display: flex; }
      .user-info { display: none; }
    }
  `]
})
export class HeaderComponent {
    theme = inject(ThemeService);
    auth = inject(AuthService);

    toggleMobile() {
        const sidebar = document.querySelector('.sidebar');
        sidebar?.classList.toggle('open');
    }
}
