import { Component, inject, signal, HostListener, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { ThemeService } from '../core/theme.service';
import { AuthService } from '../core/auth.service';
import { ApiService } from '../core/api.service';
import { MySubscriptionResponse } from '../core/models';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink],
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

        <div class="profile-wrapper">
          <button class="profile-trigger" (click)="toggleDropdown($event)">
            <div class="user-avatar">
              {{ auth.userName().charAt(0).toUpperCase() }}
            </div>
            <div class="user-info">
              <span class="user-name">{{ auth.userName() }}</span>
              @if (subscription()) {
                <span class="plan-badge">{{ subscription()!.planName }}</span>
              }
            </div>
            <svg class="chevron" [class.open]="dropdownOpen()" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="6 9 12 15 18 9"/>
            </svg>
          </button>

          @if (dropdownOpen()) {
            <div class="dropdown" (click)="$event.stopPropagation()">
              <div class="dropdown-header">
                <div class="dropdown-avatar">
                  {{ auth.userName().charAt(0).toUpperCase() }}
                </div>
                <div class="dropdown-user-details">
                  <strong>{{ auth.userName() }}</strong>
                  <span class="dropdown-email">{{ auth.user()?.email }}</span>
                </div>
              </div>

              <div class="dropdown-divider"></div>

              <a routerLink="/subscription" class="dropdown-item" (click)="close()">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
                  <line x1="1" y1="10" x2="23" y2="10"/>
                </svg>
                <div class="dropdown-item-text">
                  <span>Minha Assinatura</span>
                  @if (subscription()) {
                    <small>{{ subscription()!.planName }} — {{ getStatusLabel(subscription()!.status) }}</small>
                  }
                </div>
              </a>

              <div class="dropdown-divider"></div>

              <button class="dropdown-item dropdown-logout" (click)="auth.logout()">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                  <polyline points="16 17 21 12 16 7"/>
                  <line x1="21" y1="12" x2="9" y2="12"/>
                </svg>
                <span>Sair</span>
              </button>
            </div>
          }
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
      background: linear-gradient(180deg, var(--bg-page) 0%, var(--bg-card) 100%);
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

    /* Profile Trigger */
    .profile-wrapper { position: relative; }

    .profile-trigger {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 6px 12px;
      padding-left: 14px;
      border: 1px solid var(--border);
      border-radius: var(--radius-full);
      background: var(--bg-card);
      cursor: pointer;
      transition: all 0.15s ease;
    }

    .profile-trigger:hover {
      border-color: var(--primary);
      background: var(--primary-light);
    }

    .user-avatar {
      width: 32px;
      height: 32px;
      background: linear-gradient(135deg, var(--primary) 0%, var(--primary-hover) 100%);
      border-radius: var(--radius-full);
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-weight: 700;
      font-size: 0.8125rem;
      flex-shrink: 0;
    }

    .user-info {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
    }

    .user-name {
      font-size: 0.8125rem;
      font-weight: 600;
      color: var(--text-primary);
      line-height: 1.2;
    }

    .plan-badge {
      font-size: 0.6875rem;
      font-weight: 600;
      color: var(--primary);
      background: var(--primary-light);
      padding: 1px 8px;
      border-radius: var(--radius-full);
      margin-top: 2px;
    }

    .chevron {
      color: var(--text-muted);
      transition: transform 0.2s ease;
      flex-shrink: 0;
    }

    .chevron.open { transform: rotate(180deg); }

    /* Dropdown */
    .dropdown {
      position: absolute;
      top: calc(100% + 8px);
      right: 0;
      width: 300px;
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-lg);
      overflow: hidden;
      animation: dropdownIn 0.18s ease;
      z-index: 100;
    }

    @keyframes dropdownIn {
      from { opacity: 0; transform: translateY(-8px) scale(0.96); }
      to { opacity: 1; transform: translateY(0) scale(1); }
    }

    .dropdown-header {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 16px;
    }

    .dropdown-avatar {
      width: 40px;
      height: 40px;
      background: linear-gradient(135deg, var(--primary) 0%, var(--primary-hover) 100%);
      border-radius: var(--radius-full);
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-weight: 700;
      font-size: 1rem;
      flex-shrink: 0;
    }

    .dropdown-user-details {
      display: flex;
      flex-direction: column;
      min-width: 0;
    }

    .dropdown-user-details strong {
      font-size: 0.875rem;
      color: var(--text-primary);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .dropdown-email {
      font-size: 0.75rem;
      color: var(--text-muted);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .dropdown-divider {
      height: 1px;
      background: var(--border);
    }

    .dropdown-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 16px;
      font-size: 0.875rem;
      color: var(--text-primary);
      cursor: pointer;
      transition: background 0.12s ease;
      text-decoration: none;
      border: none;
      background: none;
      width: 100%;
      font-family: inherit;
    }

    .dropdown-item:hover {
      background: var(--primary-light);
    }

    .dropdown-item svg {
      color: var(--text-secondary);
      flex-shrink: 0;
    }

    .dropdown-item:hover svg {
      color: var(--primary);
    }

    .dropdown-item-text {
      display: flex;
      flex-direction: column;
    }

    .dropdown-item-text small {
      font-size: 0.6875rem;
      color: var(--text-muted);
      margin-top: 1px;
    }

    .dropdown-logout {
      color: var(--danger);
    }

    .dropdown-logout svg {
      color: var(--danger) !important;
    }

    .dropdown-logout:hover {
      background: var(--danger-light);
    }

    @media (max-width: 768px) {
      .header { left: 0; }
      .mobile-menu { display: flex; }
      .user-info { display: none; }
      .chevron { display: none; }
    }
  `]
})
export class HeaderComponent implements OnInit {
  theme = inject(ThemeService);
  auth = inject(AuthService);
  private api = inject(ApiService);
  private router = inject(Router);

  dropdownOpen = signal(false);
  subscription = signal<MySubscriptionResponse | null>(null);

  ngOnInit() {
    this.api.getMySubscription().subscribe({
      next: (res) => this.subscription.set(res),
      error: () => { } // silently fail if no subscription
    });
  }

  toggleDropdown(event: Event) {
    event.stopPropagation();
    this.dropdownOpen.update(v => !v);
  }

  close() {
    this.dropdownOpen.set(false);
  }

  @HostListener('document:click')
  onDocumentClick() {
    this.dropdownOpen.set(false);
  }

  toggleMobile() {
    const sidebar = document.querySelector('.sidebar');
    sidebar?.classList.toggle('open');
  }

  getStatusLabel(status: string): string {
    const map: Record<string, string> = {
      'ACTIVE': 'Ativo', 'TRIAL': 'Trial',
      'PAST_DUE': 'Pendente', 'CANCELLED': 'Cancelado',
      'EXPIRED': 'Expirado'
    };
    return map[status] || status;
  }
}
