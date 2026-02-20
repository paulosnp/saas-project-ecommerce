import { Component, inject, OnInit, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { ApiService } from '../../core/api.service';
import { ToastService } from '../../core/toast.service';
import { MySubscriptionResponse, PlanResponse } from '../../core/models';

@Component({
  selector: 'app-subscription',
  standalone: true,
  imports: [DecimalPipe],
  template: `
    <div class="page-header">
      <div>
        <h1>Minha Assinatura</h1>
        <p>Gerencie seu plano e assinatura</p>
      </div>
    </div>

    @if (loading()) {
      <div class="loading-overlay"><div class="spinner"></div></div>
    } @else {

      <!-- Current Plan Section -->
      @if (subscription()) {
        <div class="current-plan-card">
          <div class="plan-header-row">
            <div class="plan-title-area">
              <span class="plan-label">Plano Atual</span>
              <h2 class="plan-name-display">{{ subscription()!.planName }}</h2>
            </div>
            <div class="plan-price-area">
              <span class="plan-price">R$ {{ subscription()!.planPrice | number:'1.2-2' }}</span>
              <span class="plan-period">/mês</span>
            </div>
          </div>

          <div class="plan-status-row">
            <span class="status-badge" [class]="getStatusClass(subscription()!.status)">
              {{ getStatusLabel(subscription()!.status) }}
            </span>
            @if (subscription()!.startsAt) {
              <span class="plan-date">Desde {{ formatDate(subscription()!.startsAt) }}</span>
            }
            @if (subscription()!.expiresAt) {
              <span class="plan-date">Expira em {{ formatDate(subscription()!.expiresAt) }}</span>
            }
          </div>

          @if (subscription()!.planDescription) {
            <p class="plan-description">{{ subscription()!.planDescription }}</p>
          }

          <div class="limits-grid">
            <div class="limit-item">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>
              <div class="limit-info">
                <strong>{{ subscription()!.maxProducts }}</strong>
                <span>Produtos máx.</span>
              </div>
            </div>
            <div class="limit-item">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
              <div class="limit-info">
                <strong>{{ subscription()!.maxOrdersMonth }}</strong>
                <span>Pedidos/mês</span>
              </div>
            </div>
          </div>
        </div>
      } @else {
        <div class="card empty-state">
          <h3>Sem assinatura ativa</h3>
          <p>Escolha um plano abaixo para começar</p>
        </div>
      }

      <!-- Change Plan Section -->
      <div class="change-plan-section">
        <div class="section-header">
          <h2>Trocar Plano</h2>
          <p>Compare os planos disponíveis e escolha o melhor para sua loja</p>
        </div>

        @if (loadingPlans()) {
          <div class="loading-overlay"><div class="spinner"></div></div>
        } @else {
          <div class="plans-grid">
            @for (plan of plans(); track plan.id) {
              <div class="plan-card" [class.current]="isCurrentPlan(plan)">
                @if (isCurrentPlan(plan)) {
                  <div class="current-badge">Plano Atual</div>
                }
                <h3>{{ plan.name }}</h3>
                <div class="plan-card-price">
                  <span class="price-value">R$ {{ plan.price | number:'1.2-2' }}</span>
                  <span class="price-period">/mês</span>
                </div>
                @if (plan.description) {
                  <p class="plan-card-desc">{{ plan.description }}</p>
                }
                <ul class="plan-features">
                  @for (feature of getPlanFeatures(plan.name); track feature) {
                    <li>
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
                      {{ feature }}
                    </li>
                  }
                </ul>
                <button class="btn btn-select"
                  [class.btn-primary]="!isCurrentPlan(plan)"
                  [class.btn-secondary]="isCurrentPlan(plan)"
                  [disabled]="isCurrentPlan(plan) || changing()"
                  (click)="confirmChange(plan)">
                  {{ isCurrentPlan(plan) ? 'Plano Atual' : 'Selecionar' }}
                </button>
              </div>
            }
          </div>
        }
      </div>

      <!-- Confirmation Modal -->
      @if (confirmPlan()) {
        <div class="modal-overlay" (click)="confirmPlan.set(null)">
          <div class="modal-content" (click)="$event.stopPropagation()">
            <div class="modal-header">
              <h2>Confirmar Troca de Plano</h2>
              <button class="btn-icon" (click)="confirmPlan.set(null)">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
            <div class="modal-body">
              <p>Deseja trocar para o plano <strong>{{ confirmPlan()!.name }}</strong>?</p>
              <div class="confirm-details">
                <div class="confirm-row">
                  <span>Novo preço</span>
                  <strong>R$ {{ confirmPlan()!.price | number:'1.2-2' }}/mês</strong>
                </div>
                <div class="confirm-row">
                  <span>Produtos</span>
                  <strong>Até {{ confirmPlan()!.maxProducts }}</strong>
                </div>
                <div class="confirm-row">
                  <span>Pedidos/mês</span>
                  <strong>Até {{ confirmPlan()!.maxOrdersMonth }}</strong>
                </div>
              </div>
              <p class="confirm-note">A troca será efetivada imediatamente.</p>
            </div>
            <div class="modal-footer">
              <button class="btn btn-secondary" (click)="confirmPlan.set(null)">Cancelar</button>
              <button class="btn btn-primary" [disabled]="changing()" (click)="executeChange()">
                {{ changing() ? 'Trocando...' : 'Confirmar Troca' }}
              </button>
            </div>
          </div>
        </div>
      }
    }
  `,
  styles: [`
    /* Current Plan Card */
    .current-plan-card {
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: var(--radius-xl);
      padding: 28px;
      margin-bottom: 32px;
      box-shadow: var(--shadow-sm);
    }

    .plan-header-row {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      margin-bottom: 16px;
    }

    .plan-label {
      font-size: 0.75rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--primary);
    }

    .plan-name-display {
      font-size: 1.5rem;
      font-weight: 700;
      color: var(--text-primary);
      margin-top: 4px;
    }

    .plan-price-area {
      text-align: right;
    }

    .plan-price {
      font-size: 1.75rem;
      font-weight: 700;
      color: var(--text-primary);
    }

    .plan-period {
      font-size: 0.875rem;
      color: var(--text-muted);
    }

    .plan-status-row {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 16px;
      flex-wrap: wrap;
    }

    .status-badge {
      display: inline-flex;
      align-items: center;
      padding: 4px 12px;
      font-size: 0.75rem;
      font-weight: 600;
      border-radius: var(--radius-full);
      text-transform: uppercase;
    }

    .status-active { background: var(--success-light); color: var(--success); }
    .status-trial { background: var(--info-light); color: var(--info); }
    .status-past_due { background: var(--warning-light); color: var(--warning); }
    .status-cancelled { background: var(--danger-light); color: var(--danger); }
    .status-expired { background: var(--bg-page); color: var(--text-muted); }

    .plan-date {
      font-size: 0.8125rem;
      color: var(--text-secondary);
    }

    .plan-description {
      font-size: 0.875rem;
      color: var(--text-secondary);
      margin-bottom: 20px;
      line-height: 1.5;
    }

    .limits-grid {
      display: flex;
      gap: 24px;
    }

    .limit-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 14px 20px;
      background: var(--bg-page);
      border-radius: var(--radius-md);
      flex: 1;
    }

    .limit-item svg {
      color: var(--primary);
      flex-shrink: 0;
    }

    .limit-info {
      display: flex;
      flex-direction: column;
    }

    .limit-info strong {
      font-size: 1.125rem;
      color: var(--text-primary);
    }

    .limit-info span {
      font-size: 0.75rem;
      color: var(--text-secondary);
    }

    /* Change Plan Section */
    .change-plan-section {
      margin-top: 8px;
    }

    .section-header {
      margin-bottom: 20px;
    }

    .section-header h2 {
      font-size: 1.25rem;
      font-weight: 700;
      color: var(--text-primary);
    }

    .section-header p {
      font-size: 0.875rem;
      color: var(--text-secondary);
      margin-top: 4px;
    }

    .plans-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
      gap: 20px;
    }

    .plan-card {
      background: var(--bg-card);
      border: 2px solid var(--border);
      border-radius: var(--radius-xl);
      padding: 28px;
      display: flex;
      flex-direction: column;
      position: relative;
      transition: all 0.2s ease;
    }

    .plan-card:hover { border-color: var(--primary); box-shadow: var(--shadow-md); }

    .plan-card.current {
      border-color: var(--primary);
      background: var(--primary-light);
    }

    .current-badge {
      position: absolute;
      top: -1px;
      right: 20px;
      background: var(--primary);
      color: white;
      font-size: 0.6875rem;
      font-weight: 700;
      padding: 4px 12px;
      border-radius: 0 0 var(--radius-sm) var(--radius-sm);
      text-transform: uppercase;
      letter-spacing: 0.03em;
    }

    .plan-card h3 {
      font-size: 1.125rem;
      font-weight: 700;
      color: var(--text-primary);
      margin-bottom: 8px;
    }

    .plan-card-price {
      margin-bottom: 12px;
    }

    .price-value {
      font-size: 1.5rem;
      font-weight: 700;
      color: var(--text-primary);
    }

    .price-period {
      font-size: 0.875rem;
      color: var(--text-muted);
    }

    .plan-card-desc {
      font-size: 0.8125rem;
      color: var(--text-secondary);
      margin-bottom: 16px;
      line-height: 1.4;
    }

    .plan-features {
      list-style: none;
      padding: 0;
      margin-bottom: 20px;
      flex: 1;
    }

    .plan-features li {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 0.875rem;
      color: var(--text-secondary);
      padding: 6px 0;
    }

    .plan-features li svg {
      color: var(--success);
      flex-shrink: 0;
    }

    .btn-select {
      width: 100%;
      padding: 12px 20px;
    }

    /* Confirm Modal */
    .confirm-details {
      background: var(--bg-page);
      border-radius: var(--radius-md);
      padding: 16px;
      margin: 16px 0;
    }

    .confirm-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 6px 0;
      font-size: 0.875rem;
    }

    .confirm-row span { color: var(--text-secondary); }

    .confirm-note {
      font-size: 0.8125rem;
      color: var(--text-muted);
      text-align: center;
      font-style: italic;
    }

    @media (max-width: 768px) {
      .plan-header-row { flex-direction: column; gap: 8px; }
      .plan-price-area { text-align: left; }
      .limits-grid { flex-direction: column; }
    }
  `]
})
export class SubscriptionComponent implements OnInit {
  private api = inject(ApiService);
  private toast = inject(ToastService);

  loading = signal(true);
  loadingPlans = signal(true);
  subscription = signal<MySubscriptionResponse | null>(null);
  plans = signal<PlanResponse[]>([]);
  confirmPlan = signal<PlanResponse | null>(null);
  changing = signal(false);

  ngOnInit() {
    this.api.getMySubscription().subscribe({
      next: (res) => { this.subscription.set(res); this.loading.set(false); },
      error: () => { this.loading.set(false); }
    });

    this.api.getAvailablePlans().subscribe({
      next: (res) => { this.plans.set(res); this.loadingPlans.set(false); },
      error: () => { this.toast.error('Erro ao carregar planos'); this.loadingPlans.set(false); }
    });
  }

  isCurrentPlan(plan: PlanResponse): boolean {
    return this.subscription()?.planName === plan.name;
  }

  confirmChange(plan: PlanResponse) {
    this.confirmPlan.set(plan);
  }

  executeChange() {
    const plan = this.confirmPlan();
    if (!plan) return;

    this.changing.set(true);
    this.api.changePlan(plan.id).subscribe({
      next: (res) => {
        this.subscription.set(res);
        this.confirmPlan.set(null);
        this.changing.set(false);
        this.toast.success('Plano alterado com sucesso!');
      },
      error: () => {
        this.changing.set(false);
        this.toast.error('Erro ao trocar de plano');
      }
    });
  }

  getStatusClass(status: string): string {
    return 'status-' + status.toLowerCase();
  }

  getStatusLabel(status: string): string {
    const map: Record<string, string> = {
      'ACTIVE': 'Ativo', 'TRIAL': 'Trial',
      'PAST_DUE': 'Pendente', 'CANCELLED': 'Cancelado',
      'EXPIRED': 'Expirado'
    };
    return map[status] || status;
  }

  formatDate(iso: string): string {
    if (!iso) return '-';
    return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
  }

  private planFeaturesMap: Record<string, string[]> = {
    'FREE': [
      'Até 10 produtos',
      'Até 20 pedidos/mês',
      '1 usuário administrador',
      'Suporte por e-mail',
      'Loja virtual básica'
    ],
    'BASIC': [
      'Até 50 produtos',
      'Até 200 pedidos/mês',
      '1 usuário administrador',
      'Integração Mercado Pago',
      'Suporte por e-mail',
      'Loja virtual personalizada'
    ],
    'STARTER': [
      'Até 50 produtos',
      'Até 100 pedidos/mês',
      '1 usuário administrador',
      'Integração Mercado Pago',
      'Suporte por e-mail',
      'Loja virtual personalizada'
    ],
    'PREMIUM': [
      'Até 500 produtos',
      'Pedidos ilimitados',
      '3 usuários administradores',
      'Integração Mercado Pago',
      'Integração Melhor Envio',
      'Relatórios avançados',
      'Suporte prioritário',
      'Domínio personalizado'
    ],
    'PRO': [
      'Até 500 produtos',
      'Pedidos ilimitados',
      '3 usuários administradores',
      'Integração Mercado Pago',
      'Integração Melhor Envio',
      'Relatórios avançados',
      'Suporte prioritário',
      'Domínio personalizado'
    ],
    'ENTERPRISE': [
      'Produtos ilimitados',
      'Pedidos ilimitados',
      'Usuários ilimitados',
      'Todas as integrações',
      'API dedicada',
      'Suporte 24/7 via chat',
      'Gerente de conta dedicado',
      'SLA garantido de 99.9%'
    ]
  };

  getPlanFeatures(planName: string): string[] {
    return this.planFeaturesMap[planName.toUpperCase()] || [
      `Até ${planName} produtos`,
      'Suporte por e-mail'
    ];
  }
}
