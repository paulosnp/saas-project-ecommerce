import { Component, OnInit, signal } from '@angular/core';
import { ApiService } from '../../core/api.service';
import { DashboardData } from '../../core/models';

@Component({
    selector: 'app-dashboard',
    standalone: true,
    template: `
    <div class="sa-page-header">
      <h1 class="sa-page-title">Dashboard</h1>
      <p class="sa-page-subtitle">Visão geral da plataforma</p>
    </div>

    @if (data()) {
      <div class="sa-kpi-grid">
        <div class="sa-kpi">
          <div class="sa-kpi-icon">🏪</div>
          <div class="sa-kpi-label">Total de Lojas</div>
          <div class="sa-kpi-value">{{ data()!.totalStores }}</div>
        </div>
        <div class="sa-kpi">
          <div class="sa-kpi-icon">✅</div>
          <div class="sa-kpi-label">Lojas Ativas</div>
          <div class="sa-kpi-value">{{ data()!.activeStores }}</div>
        </div>
        <div class="sa-kpi">
          <div class="sa-kpi-icon">💳</div>
          <div class="sa-kpi-label">Assinaturas Ativas</div>
          <div class="sa-kpi-value">{{ data()!.activeSubscriptions }}</div>
        </div>
        <div class="sa-kpi">
          <div class="sa-kpi-icon">🧪</div>
          <div class="sa-kpi-label">Em Trial</div>
          <div class="sa-kpi-value">{{ data()!.trialSubscriptions }}</div>
        </div>
        <div class="sa-kpi">
          <div class="sa-kpi-icon">❌</div>
          <div class="sa-kpi-label">Canceladas</div>
          <div class="sa-kpi-value">{{ data()!.cancelledSubscriptions }}</div>
        </div>
        <div class="sa-kpi">
          <div class="sa-kpi-icon">💰</div>
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
      <div class="loading">Carregando dados...</div>
    }
  `,
    styles: `
    .dashboard-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
    .plan-dist { display: flex; flex-direction: column; gap: 16px; }
    .plan-dist-row { display: flex; flex-direction: column; gap: 6px; }
    .plan-dist-info { display: flex; justify-content: space-between; }
    .plan-dist-name { font-weight: 600; font-size: 14px; }
    .plan-dist-count { font-size: 13px; color: #64748b; }
    .plan-dist-bar-bg { height: 8px; background: #e2e8f0; border-radius: 4px; overflow: hidden; }
    .plan-dist-bar { height: 100%; background: linear-gradient(90deg, #7c3aed, #a78bfa); border-radius: 4px; transition: width .5s ease; }
    .summary-list { display: flex; flex-direction: column; gap: 16px; }
    .summary-item { display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #f1f5f9; }
    .summary-label { font-size: 14px; color: #64748b; }
    .summary-value { font-size: 18px; font-weight: 700; color: #1e293b; }
    .empty-text { color: #94a3b8; font-size: 14px; text-align: center; padding: 20px; }
    .loading { text-align: center; padding: 60px; color: #94a3b8; font-size: 16px; }
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
