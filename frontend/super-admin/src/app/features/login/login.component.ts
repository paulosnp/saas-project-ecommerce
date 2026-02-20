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
          <div class="login-icon">⚡</div>
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
      background: linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4c1d95 100%);
    }
    .login-card {
      background: #fff; border-radius: 20px; padding: 48px 40px; width: 400px;
      box-shadow: 0 20px 60px rgba(0,0,0,.3); animation: scaleIn .3s ease;
    }
    .login-brand { text-align: center; margin-bottom: 32px; }
    .login-icon {
      width: 64px; height: 64px; margin: 0 auto 16px;
      background: linear-gradient(135deg, #7c3aed, #a78bfa); border-radius: 16px;
      display: flex; align-items: center; justify-content: center; font-size: 32px;
    }
    .login-brand h1 { font-size: 24px; font-weight: 800; color: #1e293b; }
    .login-brand p { font-size: 14px; color: #64748b; margin-top: 4px; }
    .login-btn { width: 100%; justify-content: center; padding: 12px; font-size: 15px; margin-top: 8px; }
    @keyframes scaleIn { from { transform: scale(.95); opacity: 0; } to { transform: scale(1); opacity: 1; } }
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
