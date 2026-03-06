import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../core/auth.service';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="sa-layout">
      <aside class="sa-sidebar">
        <div class="sa-sidebar-brand">
          <img src="logo.svg" alt="Logo" class="sa-brand-logo" />
        </div>
        <nav class="sa-nav">
          <a routerLink="/dashboard" routerLinkActive="active" class="sa-nav-item">
            <span class="sa-nav-icon">📊</span> Dashboard
          </a>
          <a routerLink="/stores" routerLinkActive="active" class="sa-nav-item">
            <span class="sa-nav-icon">🏪</span> Lojas
          </a>
          <a routerLink="/subscriptions" routerLinkActive="active" class="sa-nav-item">
            <span class="sa-nav-icon">💳</span> Assinaturas
          </a>
          <a routerLink="/plans" routerLinkActive="active" class="sa-nav-item">
            <span class="sa-nav-icon">📋</span> Planos
          </a>
          <a routerLink="/settings" routerLinkActive="active" class="sa-nav-item">
            <span class="sa-nav-icon">⚙️</span> Configurações
          </a>
        </nav>
        <div class="sa-sidebar-footer">
          <div class="sa-user-info">
            <div class="sa-user-avatar">{{ auth.user()?.name?.charAt(0) || 'S' }}</div>
            <div class="sa-user-details">
              <span class="sa-user-name">{{ auth.user()?.name }}</span>
              <span class="sa-user-role">Super Admin</span>
            </div>
          </div>
          <button class="sa-logout-btn" (click)="auth.logout()">Sair</button>
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
      width: 260px; background: linear-gradient(135deg, #1e1b4b 0%, #312e81 100%);
      color: #fff; display: flex; flex-direction: column; position: fixed; top: 0; left: 0;
      height: 100vh; z-index: 100; box-shadow: 4px 0 20px rgba(0,0,0,.15);
    }
    .sa-sidebar-brand {
      padding: 24px 20px; display: flex; align-items: center; justify-content: center;
      border-bottom: 1px solid rgba(255,255,255,.1);
    }
    .sa-brand-logo { height: 56px; width: auto; object-fit: contain; }
    .sa-nav { flex: 1; padding: 16px 12px; display: flex; flex-direction: column; gap: 4px; }
    .sa-nav-item {
      display: flex; align-items: center; gap: 12px; padding: 12px 16px; border-radius: 10px;
      color: rgba(255,255,255,.7); text-decoration: none; font-size: 14px; font-weight: 500;
      transition: all .2s;
    }
    .sa-nav-item:hover { background: rgba(255,255,255,.1); color: #fff; }
    .sa-nav-item.active { background: rgba(124,58,237,.5); color: #fff; font-weight: 600; }
    .sa-nav-icon { font-size: 18px; width: 24px; text-align: center; }
    .sa-sidebar-footer {
      padding: 16px 16px 20px; border-top: 1px solid rgba(255,255,255,.1);
      display: flex; flex-direction: column; gap: 12px;
    }
    .sa-user-info { display: flex; align-items: center; gap: 10px; }
    .sa-user-avatar {
      width: 36px; height: 36px; border-radius: 8px; background: #7c3aed;
      display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 14px;
    }
    .sa-user-details { display: flex; flex-direction: column; }
    .sa-user-name { font-size: 13px; font-weight: 600; }
    .sa-user-role { font-size: 11px; color: rgba(255,255,255,.5); }
    .sa-logout-btn {
      background: rgba(255,255,255,.1); border: 1px solid rgba(255,255,255,.2);
      color: rgba(255,255,255,.8); padding: 8px; border-radius: 8px; cursor: pointer;
      font-size: 13px; transition: all .2s;
    }
    .sa-logout-btn:hover { background: rgba(239,68,68,.3); border-color: rgba(239,68,68,.5); color: #fff; }
    .sa-main { margin-left: 260px; flex: 1; background: #f8f9fc; padding: 32px; min-height: 100vh; }
  `
})
export class LayoutComponent {
  constructor(public auth: AuthService) { }
}
