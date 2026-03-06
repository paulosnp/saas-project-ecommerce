import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/auth.service';
import { ToastService } from '../../core/toast.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="login-page">
      <div class="login-card">
        <div class="login-brand">
          <div class="login-icon"><img src="logo.svg" alt="Logo" class="login-logo" /></div>
          <h1>Super Admin</h1>
          <p>Painel de controle da plataforma</p>
        </div>
        <form (ngSubmit)="onLogin()" class="login-form">
          <div class="sa-form-group">
            <label class="sa-label">E-mail</label>
            <input class="sa-input" type="email" [(ngModel)]="email" name="email" placeholder="admin@plataforma.com" required>
          </div>
          <div class="sa-form-group">
            <label class="sa-label">Senha</label>
            <input class="sa-input" type="password" [(ngModel)]="password" name="password" placeholder="••••••••" required>
          </div>
          <button class="sa-btn sa-btn-primary login-btn" type="submit" [disabled]="loading()">
            {{ loading() ? 'Entrando...' : 'Entrar' }}
          </button>
        </form>
      </div>
    </div>
  `,
  styles: `
    .login-page {
      min-height: 100vh; display: flex; align-items: center; justify-content: center;
      background: linear-gradient(135deg, #1E293B 0%, #0F172A 100%);
      position: relative; overflow: hidden;
    }
    .login-page::before {
      content: ''; position: absolute; top: -50%; right: -20%;
      width: 600px; height: 600px; border-radius: 50%;
      background: radial-gradient(circle, rgba(249,115,22,0.12) 0%, transparent 70%);
    }
    .login-page::after {
      content: ''; position: absolute; bottom: -30%; left: -10%;
      width: 400px; height: 400px; border-radius: 50%;
      background: radial-gradient(circle, rgba(249,115,22,0.08) 0%, transparent 70%);
    }
    .login-card {
      background: #fff; border-radius: 20px; padding: 48px 40px; width: 400px;
      box-shadow: 0 20px 60px rgba(0,0,0,.35); animation: saScaleIn .3s ease;
      position: relative; z-index: 1;
    }
    .login-brand { text-align: center; margin-bottom: 32px; }
    .login-icon {
      width: 180px; height: 80px; margin: 0 auto 16px;
      display: flex; align-items: center; justify-content: center;
    }
    .login-logo { width: 100%; height: 100%; object-fit: contain; }
    .login-brand h1 { font-size: 1.375rem; font-weight: 800; color: #1e293b; }
    .login-brand p { font-size: 0.875rem; color: #64748b; margin-top: 4px; }
    .login-btn { width: 100%; justify-content: center; padding: 12px; font-size: 0.9375rem; margin-top: 8px; }
  `
})
export class LoginComponent {
  email = '';
  password = '';
  loading = signal(false);

  constructor(private auth: AuthService, private toast: ToastService) { }

  onLogin(): void {
    this.loading.set(true);
    this.auth.login({ email: this.email, password: this.password }).subscribe({
      next: (res) => {
        try {
          this.auth.handleLogin(res);
          this.toast.success('Bem-vindo ao Super Admin!');
        } catch (e: any) {
          this.toast.error(e.message || 'Erro ao fazer login');
          this.loading.set(false);
        }
      },
      error: () => {
        this.toast.error('Credenciais inválidas');
        this.loading.set(false);
      }
    });
  }
}
