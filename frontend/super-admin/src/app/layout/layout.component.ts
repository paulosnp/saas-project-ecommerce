import { Component, signal, HostListener } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../core/auth.service';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="sa-shell" [attr.data-theme]="theme">
      <!-- SIDEBAR -->
      <aside class="sa-sidebar" [class.open]="sidebarOpen()">
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
                <line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
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
            <button class="sa-nav-item sa-nav-logout" (click)="auth.logout()">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                <polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
              </svg>
              <span>Logout</span>
            </button>
          </nav>
        </div>
      </aside>

      <!-- MAIN -->
      <div class="sa-body">
        <!-- HEADER -->
        <header class="sa-header">
          <button class="sa-mobile-menu" (click)="toggleSidebar()">
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
          </button>



          <div class="sa-header-right">
            <button class="sa-header-btn" (click)="toggleTheme()" [title]="theme === 'light' ? 'Tema escuro' : 'Tema claro'">
              @if (theme === 'light') {
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
              } @else {
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
              }
            </button>

            <div class="sa-profile">
              <div class="sa-avatar">{{ auth.user()?.name?.charAt(0) || 'S' }}</div>
              <div class="sa-profile-info">
                <span class="sa-profile-name">{{ auth.user()?.name }}</span>
                <span class="sa-profile-role">Super Admin</span>
              </div>
            </div>
          </div>
        </header>

        <!-- CONTENT -->
        <main class="sa-content">
          <router-outlet />
        </main>
      </div>
    </div>
  `,
  styles: `
    .sa-shell { display: flex; min-height: 100vh; }

    /* ---- SIDEBAR (White, like reference) ---- */
    .sa-sidebar {
      width: var(--sa-sidebar-width); background: var(--sa-bg-sidebar);
      display: flex; flex-direction: column; position: fixed;
      top: 0; left: 0; height: 100vh; z-index: 100;
      border-right: 1px solid var(--sa-border);
      transition: transform 0.3s ease;
    }
    .sa-sidebar-brand {
      padding: 24px 20px; display: flex; align-items: center; justify-content: center;
    }
    .sa-brand-logo { height: 72px; width: auto; object-fit: contain; }

    .sa-nav-section { padding: 8px 16px 0; }
    .sa-nav-label {
      display: block; padding: 12px 12px 6px; font-size: 0.625rem; font-weight: 700;
      color: var(--sa-text-muted); text-transform: uppercase; letter-spacing: 0.1em;
    }
    .sa-nav { display: flex; flex-direction: column; gap: 2px; }

    .sa-nav-item {
      display: flex; align-items: center; gap: 12px; padding: 10px 12px;
      border-radius: var(--sa-radius-md); color: var(--sa-text-sidebar);
      text-decoration: none; font-size: 0.875rem; font-weight: 500;
      transition: all 0.15s ease; border: none; background: none;
      cursor: pointer; font-family: inherit; width: 100%;
      position: relative;
    }
    .sa-nav-item:hover { color: var(--sa-text-primary); background: var(--sa-bg-input); }
    .sa-nav-item.active {
      color: var(--sa-primary); background: var(--sa-primary-light);
      font-weight: 600;
    }
    .sa-nav-item.active::before {
      content: ''; position: absolute; left: -16px; top: 50%; transform: translateY(-50%);
      width: 4px; height: 24px; background: var(--sa-primary); border-radius: 0 4px 4px 0;
    }
    .sa-nav-item.active svg { stroke: var(--sa-primary); }
    .sa-nav-logout { color: var(--sa-text-muted); }
    .sa-nav-logout:hover { color: var(--sa-danger); background: var(--sa-danger-light); }

    /* ---- BODY ---- */
    .sa-body {
      margin-left: var(--sa-sidebar-width); flex: 1; display: flex; flex-direction: column;
      min-height: 100vh;
    }

    /* ---- HEADER (fixed, matching admin-panel) ---- */
    .sa-header {
      position: fixed; top: 0; left: var(--sa-sidebar-width); right: 0;
      height: 64px; display: flex; align-items: center;
      justify-content: flex-end; gap: 16px;
      padding: 0 24px;
      background: linear-gradient(180deg, var(--sa-bg-page) 0%, var(--sa-bg-card) 100%);
      border-bottom: 1px solid var(--sa-border);
      z-index: 50;
      transition: left 0.3s ease, background 0.25s ease, border-color 0.25s ease;
    }
    .sa-mobile-menu {
      display: none; background: none; border: none; cursor: pointer;
      color: var(--sa-text-secondary); padding: 6px;
    }


    .sa-header-right { margin-left: auto; display: flex; align-items: center; gap: 12px; }
    .sa-header-btn {
      width: 40px; height: 40px; border-radius: var(--sa-radius-full);
      background: var(--sa-bg-page); border: 1px solid var(--sa-border);
      color: var(--sa-text-secondary); cursor: pointer;
      display: flex; align-items: center; justify-content: center;
      transition: all 0.15s ease;
    }
    .sa-header-btn:hover { border-color: var(--sa-primary); color: var(--sa-primary); }

    .sa-profile {
      display: flex; align-items: center; gap: 10px;
      padding: 6px 12px 6px 14px; background: var(--sa-bg-card);
      border: 1px solid var(--sa-border); border-radius: var(--sa-radius-full);
      cursor: pointer; transition: all 0.15s ease;
    }
    .sa-profile:hover { border-color: var(--sa-primary); background: var(--sa-primary-light); }
    .sa-avatar {
      width: 32px; height: 32px; border-radius: var(--sa-radius-full);
      background: linear-gradient(135deg, var(--sa-primary), var(--sa-primary-hover));
      display: flex; align-items: center; justify-content: center;
      color: white; font-weight: 700; font-size: 0.8125rem; flex-shrink: 0;
    }
    .sa-profile-info { display: flex; flex-direction: column; align-items: flex-start; }
    .sa-profile-name { font-size: 0.8125rem; font-weight: 600; color: var(--sa-text-primary); line-height: 1.2; }
    .sa-profile-role { font-size: 0.6875rem; color: var(--sa-text-muted); }

    /* ---- CONTENT ---- */
    .sa-content {
      flex: 1; padding: 88px 32px 32px;
      transition: background var(--sa-transition-normal);
    }

    @media (max-width: 768px) {
      .sa-sidebar { transform: translateX(-100%); }
      .sa-sidebar.open { transform: translateX(0); }
      .sa-mobile-menu { display: flex; }
      .sa-body { margin-left: 0; }
      .sa-header { padding: 12px 16px; }
      .sa-content { padding: 0 16px 16px; }
      .sa-profile-info { display: none; }
    }
  `
})
export class LayoutComponent {
  theme = 'light';
  sidebarOpen = signal(false);

  constructor(public auth: AuthService) {
    this.theme = localStorage.getItem('sa-theme') || 'light';
    document.documentElement.setAttribute('data-theme', this.theme);
  }

  toggleTheme(): void {
    this.theme = this.theme === 'light' ? 'dark' : 'light';
    localStorage.setItem('sa-theme', this.theme);
    document.documentElement.setAttribute('data-theme', this.theme);
  }

  toggleSidebar(): void {
    this.sidebarOpen.update(v => !v);
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(e: Event) {
    const sidebar = document.querySelector('.sa-sidebar');
    const menuBtn = document.querySelector('.sa-mobile-menu');
    if (this.sidebarOpen() && sidebar && !sidebar.contains(e.target as Node) && !menuBtn?.contains(e.target as Node)) {
      this.sidebarOpen.set(false);
    }
  }
}
