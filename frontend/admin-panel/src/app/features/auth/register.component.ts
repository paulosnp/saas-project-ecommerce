import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ToastService } from '../../core/toast.service';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, RouterLink],
  template: `
    <div class="register-page">
      <div class="register-card">
        <a routerLink="/plans" class="back-link">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
          </svg>
          Voltar aos planos
        </a>

        <div class="register-header">
          <div class="register-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
              <line x1="3" y1="6" x2="21" y2="6"/>
              <path d="M16 10a4 4 0 0 1-8 0"/>
            </svg>
          </div>
          <h1>Criar sua conta</h1>
          <div class="selected-plan">
            <span class="plan-badge-label">Plano selecionado:</span>
            <span class="plan-badge-name">{{ planLabel() }}</span>
          </div>
        </div>

        <form (ngSubmit)="onSubmit()" class="register-form">
          <div class="form-section">
            <h3>Dados pessoais</h3>
            <div class="form-group">
              <label for="fullName">Nome completo</label>
              <input id="fullName" type="text" class="form-input" [(ngModel)]="fullName" name="fullName" placeholder="Seu nome" required />
            </div>
            <div class="form-group">
              <label for="email">E-mail</label>
              <input id="email" type="email" class="form-input" [(ngModel)]="email" name="email" placeholder="seu@email.com" required autocomplete="email" />
            </div>
            <div class="form-group">
              <label for="password">Senha</label>
              <input id="password" type="password" class="form-input" [(ngModel)]="password" name="password" placeholder="Mínimo 8 caracteres" required minlength="8" autocomplete="new-password" />
            </div>
          </div>

          <div class="form-section">
            <h3>Dados da loja</h3>
            <div class="form-group">
              <label for="storeName">Nome da loja</label>
              <input id="storeName" type="text" class="form-input" [(ngModel)]="storeName" name="storeName" placeholder="Ex: Minha Loja Online" required />
            </div>
            <div class="form-group">
              <label for="cnpj">CNPJ (opcional)</label>
              <input id="cnpj" type="text" class="form-input" [(ngModel)]="cnpj" name="cnpj" placeholder="00.000.000/0000-00" />
            </div>
          </div>

          <div class="summary-box">
            <div class="summary-row">
              <span>Plano {{ planLabel() }}</span>
              <strong>R$ {{ planPrice() }}/mês</strong>
            </div>
            <p class="summary-note">
              Ao continuar, você será redirecionado para o pagamento.
              Sua conta será ativada após a confirmação do pagamento.
            </p>
          </div>

          <button type="submit" class="btn btn-primary register-btn" [disabled]="loading()">
            @if (loading()) {
              <span class="spinner" style="width:18px;height:18px;border-width:2px"></span>
            }
            {{ loading() ? 'Processando...' : 'Continuar para o pagamento' }}
          </button>

          <p class="login-link">
            Já tem uma conta? <a routerLink="/login">Faça login</a>
          </p>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .register-page {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: var(--bg-page);
      padding: 40px 24px;
    }

    .register-card {
      width: 100%;
      max-width: 480px;
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: var(--radius-xl);
      box-shadow: var(--shadow-lg);
      padding: 36px 40px;
      animation: slideUp 0.3s ease;
    }

    .back-link {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      font-size: 0.8125rem;
      color: var(--text-secondary);
      text-decoration: none;
      margin-bottom: 20px;
      transition: color 0.15s ease;
    }

    .back-link:hover { color: var(--primary); }

    .register-header {
      text-align: center;
      margin-bottom: 28px;
    }

    .register-icon {
      width: 52px;
      height: 52px;
      background: linear-gradient(135deg, var(--primary) 0%, var(--primary-hover) 100%);
      border-radius: var(--radius-lg);
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      margin: 0 auto 12px;
    }

    .register-header h1 {
      font-size: 1.375rem;
      font-weight: 700;
      color: var(--text-primary);
      margin-bottom: 8px;
    }

    .selected-plan {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 6px 14px;
      background: var(--primary-light);
      border-radius: var(--radius-full);
      font-size: 0.8125rem;
    }

    .plan-badge-label { color: var(--text-secondary); }
    .plan-badge-name { font-weight: 700; color: var(--primary); }

    .register-form { display: flex; flex-direction: column; gap: 24px; }

    .form-section h3 {
      font-size: 0.875rem;
      font-weight: 600;
      color: var(--text-secondary);
      text-transform: uppercase;
      letter-spacing: 0.04em;
      margin-bottom: 12px;
    }

    .form-section {
      display: flex;
      flex-direction: column;
      gap: 14px;
    }

    .summary-box {
      background: var(--bg-page);
      border: 1px solid var(--border);
      border-radius: var(--radius-md);
      padding: 16px;
    }

    .summary-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 0.9375rem;
    }

    .summary-row strong { color: var(--primary); }

    .summary-note {
      font-size: 0.75rem;
      color: var(--text-muted);
      margin-top: 8px;
      line-height: 1.5;
    }

    .register-btn {
      width: 100%;
      padding: 12px;
      font-size: 1rem;
    }

    .login-link {
      text-align: center;
      font-size: 0.8125rem;
      color: var(--text-secondary);
    }

    .login-link a {
      color: var(--primary);
      font-weight: 600;
      text-decoration: none;
    }

    .login-link a:hover { text-decoration: underline; }
  `]
})
export class RegisterComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private toast = inject(ToastService);
  private http = inject(HttpClient);

  planId = '';
  fullName = '';
  email = '';
  password = '';
  storeName = '';
  cnpj = '';
  loading = signal(false);

  planLabel = signal('');
  planPrice = signal('');

  private plansData: Record<string, { label: string; price: string }> = {
    'starter': { label: 'Starter', price: '49' },
    'pro': { label: 'Pro', price: '99' },
    'enterprise': { label: 'Enterprise', price: '199' }
  };

  ngOnInit() {
    this.planId = this.route.snapshot.queryParams['plan'] || 'pro';
    const plan = this.plansData[this.planId] || this.plansData['pro'];
    this.planLabel.set(plan.label);
    this.planPrice.set(plan.price);
  }

  onSubmit() {
    if (!this.fullName || !this.email || !this.password || !this.storeName) {
      this.toast.warning('Preencha todos os campos obrigatórios');
      return;
    }
    if (this.password.length < 8) {
      this.toast.warning('A senha deve ter no mínimo 8 caracteres');
      return;
    }

    this.loading.set(true);

    const body = {
      fullName: this.fullName,
      email: this.email,
      password: this.password,
      storeName: this.storeName,
      storeSlug: this.storeName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
      phone: null
    };

    this.http.post('/api/auth/register/store', body).subscribe({
      next: () => {
        this.toast.success('Redirecionando para o pagamento...');
        // In a real scenario, redirect to Mercado Pago checkout
        // For now, show success and redirect to login
        setTimeout(() => {
          this.toast.success('Conta criada com sucesso! Faça login para acessar.');
          this.router.navigate(['/login']);
        }, 2000);
      },
      error: (err) => {
        this.loading.set(false);
        if (err.status === 409) {
          this.toast.error('Este e-mail já está cadastrado');
        } else {
          this.toast.error('Erro ao criar conta. Tente novamente.');
        }
      }
    });
  }
}
