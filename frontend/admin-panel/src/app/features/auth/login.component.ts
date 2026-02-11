import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth.service';
import { ToastService } from '../../core/toast.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, RouterLink],
  template: `
    <div class="login-page">
      <div class="login-card">
        <div class="login-header">
          <div class="login-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
              <line x1="3" y1="6" x2="21" y2="6"/>
              <path d="M16 10a4 4 0 0 1-8 0"/>
            </svg>
          </div>
          <h1>Painel do Lojista</h1>
          <p>Acesse sua conta para gerenciar sua loja</p>
        </div>

        <form (ngSubmit)="onSubmit()" class="login-form">
          <div class="form-group">
            <label for="email">E-mail</label>
            <input
              id="email"
              type="email"
              class="form-input"
              [(ngModel)]="email"
              name="email"
              placeholder="seu@email.com"
              required
              autocomplete="email"
            />
          </div>

          <div class="form-group">
            <label for="password">Senha</label>
            <input
              id="password"
              type="password"
              class="form-input"
              [(ngModel)]="password"
              name="password"
              placeholder="Sua senha"
              required
              autocomplete="current-password"
            />
          </div>

          <button type="submit" class="btn btn-primary login-btn" [disabled]="loading">
            @if (loading) {
              <span class="spinner" style="width:18px;height:18px;border-width:2px"></span>
            }
            {{ loading ? 'Entrando...' : 'Entrar' }}
          </button>
        </form>

        <div class="login-footer">
          <div class="divider">
            <span>ou</span>
          </div>
          <a routerLink="/plans" class="btn btn-secondary plans-btn">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
              <line x1="1" y1="10" x2="23" y2="10"/>
            </svg>
            Ver planos e criar conta
          </a>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .login-page {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: var(--bg-page);
      padding: 24px;
    }

    .login-card {
      width: 100%;
      max-width: 420px;
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: var(--radius-xl);
      box-shadow: var(--shadow-lg);
      padding: 40px;
      animation: slideUp 0.3s ease;
    }

    .login-header {
      text-align: center;
      margin-bottom: 32px;
    }

    .login-icon {
      width: 60px;
      height: 60px;
      background: linear-gradient(135deg, var(--primary) 0%, var(--primary-hover) 100%);
      border-radius: var(--radius-lg);
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      margin: 0 auto 16px;
    }

    .login-header h1 {
      font-size: 1.5rem;
      font-weight: 700;
      color: var(--text-primary);
      margin-bottom: 4px;
    }

    .login-header p {
      font-size: 0.875rem;
      color: var(--text-secondary);
    }

    .login-form {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .login-btn {
      width: 100%;
      padding: 12px;
      font-size: 1rem;
      margin-top: 8px;
    }

    .login-footer {
      margin-top: 24px;
    }

    .divider {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 16px;
    }

    .divider::before,
    .divider::after {
      content: '';
      flex: 1;
      height: 1px;
      background: var(--border);
    }

    .divider span {
      font-size: 0.75rem;
      color: var(--text-muted);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .plans-btn {
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      padding: 12px;
      font-size: 0.9375rem;
      text-decoration: none;
    }
  `]
})
export class LoginComponent {
  private auth = inject(AuthService);
  private router = inject(Router);
  private toast = inject(ToastService);

  email = '';
  password = '';
  loading = false;

  onSubmit() {
    if (!this.email || !this.password) return;

    this.loading = true;
    this.auth.login({ email: this.email, password: this.password }).subscribe({
      next: () => {
        this.toast.success('Login realizado com sucesso!');
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.loading = false;
        this.toast.error(err.status === 401 ? 'E-mail ou senha incorretos' : 'Erro ao fazer login');
      }
    });
  }
}
