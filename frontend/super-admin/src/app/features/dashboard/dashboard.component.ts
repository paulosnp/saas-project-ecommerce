import { Component, OnInit, signal } from '@angular/core';
import { ApiService } from '../../core/api.service';
import { DashboardData } from '../../core/models';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  template: `
    <div class="sa-page-header">
      <div>
        <h1 class="sa-page-title">Dashboard</h1>
        <p class="sa-page-subtitle">Visão geral da plataforma</p>
      </div>
    </div>

    @if (data()) {
      <div class="sa-kpi-grid">
        <div class="sa-kpi">
          <div class="sa-kpi-icon orange">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
              <polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
          </div>
          <div class="sa-kpi-label">Total de Lojas</div>
          <div class="sa-kpi-value">{{ data()!.totalStores }}</div>
        </div>
        <div class="sa-kpi">
          <div class="sa-kpi-icon green">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
          </div>
          <div class="sa-kpi-label">Lojas Ativas</div>
          <div class="sa-kpi-value">{{ data()!.activeStores }}</div>
        </div>
        <div class="sa-kpi">
          <div class="sa-kpi-icon blue">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
              <line x1="1" y1="10" x2="23" y2="10"/>
            </svg>
          </div>
          <div class="sa-kpi-label">Assinaturas Ativas</div>
          <div class="sa-kpi-value">{{ data()!.activeSubscriptions }}</div>
        </div>
        <div class="sa-kpi">
          <div class="sa-kpi-icon blue">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
            </svg>
          </div>
          <div class="sa-kpi-label">Em Trial</div>
          <div class="sa-kpi-value">{{ data()!.trialSubscriptions }}</div>
        </div>
        <div class="sa-kpi">
          <div class="sa-kpi-icon red">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
            </svg>
          </div>
          <div class="sa-kpi-label">Canceladas</div>
          <div class="sa-kpi-value">{{ data()!.cancelledSubscriptions }}</div>
        </div>
        <div class="sa-kpi">
          <div class="sa-kpi-icon green">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
            </svg>
          </div>
          <div class="sa-kpi-label">Receita Mensal</div>
          <div class="sa-kpi-value">R$ {{ formatMoney(data()!.monthlyRevenue) }}</div>
        </div>
      </div>

      <div class="dashboard-grid">
        <div class="sa-card">
          <div class="sa-card-header">
            <h2 class="sa-card-title">Distribuição por Plano</h2>
          </div>
          <div class="plan-dist">
            @for (entry of planEntries(); track entry[0]) {
              <div class="plan-dist-row">
                <div class="plan-dist-info">
                  <span class="plan-dist-name">{{ entry[0] }}</span>
                  <span class="plan-dist-count">{{ entry[1] }} loja(s)</span>
                </div>
                <div class="plan-dist-bar-bg">
                  <div class="plan-dist-bar" [style.width.%]="getBarWidth(entry[1])"></div>
                </div>
              </div>
            }
            @if (planEntries().length === 0) {
              <p class="empty-text">Nenhuma assinatura ativa</p>
            }
          </div>
        </div>

        <div class="sa-card">
          <div class="sa-card-header">
            <h2 class="sa-card-title">Resumo</h2>
          </div>
          <div class="summary-list">
            <div class="summary-item">
              <span class="summary-label">Lojas inativas</span>
              <span class="summary-value">{{ data()!.totalStores - data()!.activeStores }}</span>
            </div>
            <div class="summary-item">
              <span class="summary-label">Assinaturas expiradas</span>
              <span class="summary-value">{{ data()!.expiredSubscriptions }}</span>
            </div>
            <div class="summary-item">
              <span class="summary-label">Total assinaturas ativas + trial</span>
              <span class="summary-value">{{ data()!.activeSubscriptions + data()!.trialSubscriptions }}</span>
            </div>
          </div>
        </div>
      </div>
    } @else {
      <div class="loading">
        <div class="loading-spinner"></div>
        <span>Carregando dados...</span>
      </div>
    }
  `,
  styles: `
    .dashboard-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
    .plan-dist { display: flex; flex-direction: column; gap: 16px; }
    .plan-dist-row { display: flex; flex-direction: column; gap: 6px; }
    .plan-dist-info { display: flex; justify-content: space-between; }
    .plan-dist-name { font-weight: 600; font-size: 0.875rem; color: var(--sa-text-primary); }
    .plan-dist-count { font-size: 0.8125rem; color: var(--sa-text-muted); }
    .plan-dist-bar-bg { height: 8px; background: var(--sa-border); border-radius: 4px; overflow: hidden; }
    .plan-dist-bar { height: 100%; background: linear-gradient(90deg, var(--sa-primary), #FDBA74); border-radius: 4px; transition: width .5s ease; }
    .summary-list { display: flex; flex-direction: column; gap: 0; }
    .summary-item { display: flex; justify-content: space-between; align-items: center; padding: 14px 0; border-bottom: 1px solid var(--sa-border); }
    .summary-item:last-child { border-bottom: none; }
    .summary-label { font-size: 0.875rem; color: var(--sa-text-secondary); }
    .summary-value { font-size: 1.125rem; font-weight: 700; color: var(--sa-text-primary); }
    .empty-text { color: var(--sa-text-muted); font-size: 0.875rem; text-align: center; padding: 20px; }
    .loading { display: flex; flex-direction: column; align-items: center; gap: 16px; padding: 80px; color: var(--sa-text-muted); font-size: 0.9375rem; }
    .loading-spinner { width: 32px; height: 32px; border: 3px solid var(--sa-border); border-top-color: var(--sa-primary); border-radius: 50%; animation: spin 0.6s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }
    @media (max-width: 900px) { .dashboard-grid { grid-template-columns: 1fr; } }
  `
})
export class DashboardComponent implements OnInit {
  data = signal<DashboardData | null>(null);
  planEntries = signal<[string, number][]>([]);
  private maxCount = 1;

  constructor(private api: ApiService) { }

  ngOnInit(): void {
    this.api.getDashboard().subscribe(d => {
      this.data.set(d);
      const entries = Object.entries(d.planDistribution);
      this.planEntries.set(entries);
      this.maxCount = Math.max(...entries.map(e => e[1]), 1);
    });
  }

  formatMoney(v: number): string {
    return v.toFixed(2).replace('.', ',');
  }

  getBarWidth(count: number): number {
    return (count / this.maxCount) * 100;
  }
}
