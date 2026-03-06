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
        <!-- First card: highlighted (orange bg) -->
        <div class="sa-kpi sa-kpi-highlight">
          <div class="sa-kpi-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
          </div>
          <div class="sa-kpi-label">Total de Lojas</div>
          <div class="sa-kpi-value">{{ data()!.totalStores }}</div>
          <div class="sa-kpi-subtitle">
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/></svg>
            Todas as lojas cadastradas
          </div>
        </div>

        <div class="sa-kpi">
          <div class="sa-kpi-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
          </div>
          <div class="sa-kpi-label">Lojas Ativas</div>
          <div class="sa-kpi-value">{{ data()!.activeStores }}</div>
          <div class="sa-kpi-subtitle">
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/></svg>
            Em operação
          </div>
        </div>

        <div class="sa-kpi">
          <div class="sa-kpi-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>
          </div>
          <div class="sa-kpi-label">Assinaturas Ativas</div>
          <div class="sa-kpi-value">{{ data()!.activeSubscriptions }}</div>
          <div class="sa-kpi-subtitle">
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/></svg>
            Pagantes
          </div>
        </div>

        <div class="sa-kpi">
          <div class="sa-kpi-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
          </div>
          <div class="sa-kpi-label">Receita Mensal</div>
          <div class="sa-kpi-value">R$ {{ formatMoney(data()!.monthlyRevenue) }}</div>
          <div class="sa-kpi-subtitle">Estimativa mensal</div>
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
              <div class="summary-item-info">
                <div class="summary-dot green"></div>
                <span class="summary-label">Em Trial</span>
              </div>
              <span class="summary-value">{{ data()!.trialSubscriptions }}</span>
            </div>
            <div class="summary-item">
              <div class="summary-item-info">
                <div class="summary-dot red"></div>
                <span class="summary-label">Canceladas</span>
              </div>
              <span class="summary-value">{{ data()!.cancelledSubscriptions }}</span>
            </div>
            <div class="summary-item">
              <div class="summary-item-info">
                <div class="summary-dot yellow"></div>
                <span class="summary-label">Expiradas</span>
              </div>
              <span class="summary-value">{{ data()!.expiredSubscriptions }}</span>
            </div>
            <div class="summary-item">
              <div class="summary-item-info">
                <div class="summary-dot gray"></div>
                <span class="summary-label">Lojas inativas</span>
              </div>
              <span class="summary-value">{{ data()!.totalStores - data()!.activeStores }}</span>
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
    .dashboard-grid { display: grid; grid-template-columns: 1.2fr 1fr; gap: 20px; }
    .plan-dist { display: flex; flex-direction: column; gap: 18px; }
    .plan-dist-row { display: flex; flex-direction: column; gap: 8px; }
    .plan-dist-info { display: flex; justify-content: space-between; }
    .plan-dist-name { font-weight: 600; font-size: 0.875rem; color: var(--sa-text-primary); }
    .plan-dist-count { font-size: 0.8125rem; color: var(--sa-text-muted); }
    .plan-dist-bar-bg { height: 10px; background: var(--sa-bg-input); border-radius: 5px; overflow: hidden; }
    .plan-dist-bar { height: 100%; background: linear-gradient(90deg, var(--sa-primary), #FDBA74); border-radius: 5px; transition: width .6s ease; }

    .summary-list { display: flex; flex-direction: column; gap: 0; }
    .summary-item { display: flex; justify-content: space-between; align-items: center; padding: 14px 0; border-bottom: 1px solid var(--sa-border); }
    .summary-item:last-child { border-bottom: none; }
    .summary-item-info { display: flex; align-items: center; gap: 10px; }
    .summary-dot { width: 10px; height: 10px; border-radius: var(--sa-radius-full); flex-shrink: 0; }
    .summary-dot.green { background: var(--sa-success); }
    .summary-dot.red { background: var(--sa-danger); }
    .summary-dot.yellow { background: var(--sa-warning); }
    .summary-dot.gray { background: var(--sa-text-muted); }
    .summary-label { font-size: 0.875rem; color: var(--sa-text-secondary); }
    .summary-value { font-size: 1.25rem; font-weight: 700; color: var(--sa-text-primary); }

    .empty-text { color: var(--sa-text-muted); font-size: 0.875rem; text-align: center; padding: 24px; }
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
