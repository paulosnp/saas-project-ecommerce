import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../core/auth.service';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="sa-layout" [attr.data-theme]="theme">
      <aside class="sa-sidebar">
        <div class="sa-sidebar-brand">
          <img src="logo.svg" alt="Logo" class="sa-brand-logo" />
        </div>

        <div class="sa-nav-section">
          <span class="sa-nav-label">MENU</span>
          <nav class="sa-nav">
            <a routerLink="/dashboard" routerLinkActive="active" class="sa-nav-item">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
                <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
              </svg>
              <span>Dashboard</span>
            </a>
            <a routerLink="/stores" routerLinkActive="active" class="sa-nav-item">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                <polyline points="9 22 9 12 15 12 15 22"/>
              </svg>
              <span>Lojas</span>
            </a>
            <a routerLink="/subscriptions" routerLinkActive="active" class="sa-nav-item">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
                <line x1="1" y1="10" x2="23" y2="10"/>
              </svg>
              <span>Assinaturas</span>
            </a>
            <a routerLink="/plans" routerLinkActive="active" class="sa-nav-item">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
                <line x1="16" y1="13" x2="8" y2="13"/>
                <line x1="16" y1="17" x2="8" y2="17"/>
                <polyline points="10 9 9 9 8 9"/>
              </svg>
              <span>Planos</span>
            </a>
          </nav>
        </div>

        <div class="sa-nav-section">
          <span class="sa-nav-label">GERAL</span>
          <nav class="sa-nav">
            <a routerLink="/settings" routerLinkActive="active" class="sa-nav-item">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="3"/>
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
              </svg>
              <span>Configurações</span>
            </a>
          </nav>
        </div>

        <div class="sa-sidebar-footer">
          <div class="sa-user-info">
            <div class="sa-user-avatar">{{ auth.user()?.name?.charAt(0) || 'S' }}</div>
            <div class="sa-user-details">
              <span class="sa-user-name">{{ auth.user()?.name }}</span>
              <span class="sa-user-role">Super Admin</span>
            </div>
          </div>
          <div class="sa-footer-actions">
            <button class="sa-theme-btn" (click)="toggleTheme()" [title]="theme === 'light' ? 'Tema escuro' : 'Tema claro'">
              @if (theme === 'light') {
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
              } @else {
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
              }
            </button>
            <button class="sa-logout-btn" (click)="auth.logout()">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                <polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
              </svg>
              <span>Sair</span>
            </button>
          </div>
        </div>
      </aside>

      <main class="sa-main">
        <router-outlet />
      </main>
    </div>
  `,
  styles: `
    .sa-layout { display: flex; min-height: 100vh; }

    .sa-sidebar {
      width: var(--sa-sidebar-width); background: var(--sa-bg-sidebar);
      color: #fff; display: flex; flex-direction: column;
      position: fixed; top: 0; left: 0; height: 100vh; z-index: 100;
      border-right: 1px solid rgba(255, 255, 255, 0.06);
    }

    .sa-sidebar-brand {
      padding: 24px 20px; display: flex; align-items: center; justify-content: center;
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    }
    .sa-brand-logo { height: 48px; width: auto; object-fit: contain; }

    .sa-nav-section { padding: 16px 12px 0; }
    .sa-nav-label {
      display: block; padding: 0 16px 8px; font-size: 0.625rem; font-weight: 700;
      color: rgba(255, 255, 255, 0.35); text-transform: uppercase; letter-spacing: 0.1em;
    }
    .sa-nav { display: flex; flex-direction: column; gap: 2px; }

    .sa-nav-item {
      display: flex; align-items: center; gap: 12px; padding: 10px 16px;
      border-radius: 10px; color: var(--sa-text-sidebar); text-decoration: none;
      font-size: 0.875rem; font-weight: 500; transition: all 0.15s ease;
    }
    .sa-nav-item:hover { background: var(--sa-bg-sidebar-hover); color: #fff; }
    .sa-nav-item.active {
      background: var(--sa-bg-sidebar-active); color: var(--sa-text-sidebar-active);
      font-weight: 600;
    }
    .sa-nav-item.active svg { stroke: var(--sa-text-sidebar-active); }

    .sa-sidebar-footer {
      margin-top: auto; padding: 16px; border-top: 1px solid rgba(255, 255, 255, 0.08);
      display: flex; flex-direction: column; gap: 12px;
    }
    .sa-user-info { display: flex; align-items: center; gap: 10px; }
    .sa-user-avatar {
      width: 36px; height: 36px; border-radius: var(--sa-radius-md);
      background: linear-gradient(135deg, var(--sa-primary) 0%, var(--sa-primary-hover) 100%);
      display: flex; align-items: center; justify-content: center;
      font-weight: 700; font-size: 0.875rem; flex-shrink: 0;
    }
    .sa-user-details { display: flex; flex-direction: column; min-width: 0; }
    .sa-user-name { font-size: 0.8125rem; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .sa-user-role { font-size: 0.6875rem; color: rgba(255, 255, 255, 0.45); }

    .sa-footer-actions { display: flex; gap: 8px; }
    .sa-theme-btn {
      width: 36px; height: 36px; border-radius: var(--sa-radius-md);
      background: rgba(255, 255, 255, 0.06); border: 1px solid rgba(255, 255, 255, 0.1);
      color: rgba(255, 255, 255, 0.6); cursor: pointer;
      display: flex; align-items: center; justify-content: center;
      transition: all 0.15s ease; flex-shrink: 0;
    }
    .sa-theme-btn:hover { background: rgba(255, 255, 255, 0.12); color: #fff; }

    .sa-logout-btn {
      flex: 1; display: flex; align-items: center; justify-content: center; gap: 8px;
      background: rgba(255, 255, 255, 0.06); border: 1px solid rgba(255, 255, 255, 0.1);
      color: rgba(255, 255, 255, 0.6); padding: 8px 12px; border-radius: var(--sa-radius-md);
      cursor: pointer; font-size: 0.8125rem; font-family: inherit;
      transition: all 0.15s ease;
    }
    .sa-logout-btn:hover { background: rgba(239, 68, 68, 0.2); border-color: rgba(239, 68, 68, 0.4); color: #FCA5A5; }

    .sa-main {
      margin-left: var(--sa-sidebar-width); flex: 1;
      background: var(--sa-bg-page); padding: 32px; min-height: 100vh;
      transition: background var(--sa-transition-normal);
    }

    @media (max-width: 768px) {
      .sa-sidebar { transform: translateX(-100%); transition: transform 0.3s ease; }
      .sa-sidebar.open { transform: translateX(0); }
      .sa-main { margin-left: 0; padding: 20px; }
    }
  `
})
export class LayoutComponent {
  theme = 'light';

  constructor(public auth: AuthService) {
    this.theme = localStorage.getItem('sa-theme') || 'light';
    document.documentElement.setAttribute('data-theme', this.theme);
  }

  toggleTheme(): void {
    this.theme = this.theme === 'light' ? 'dark' : 'light';
    localStorage.setItem('sa-theme', this.theme);
    document.documentElement.setAttribute('data-theme', this.theme);
  }
}
