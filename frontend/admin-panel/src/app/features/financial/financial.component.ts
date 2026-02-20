import { Component, inject, OnInit, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { ApiService } from '../../core/api.service';
import { ToastService } from '../../core/toast.service';
import { FinancialResponse } from '../../core/models';

@Component({
    selector: 'app-financial',
    standalone: true,
    imports: [DecimalPipe],
    template: `
    <div class="page-header">
      <div>
        <h1>Financeiro</h1>
        <p>Visão geral do rendimento da loja</p>
      </div>
    </div>

    @if (loading()) {
      <div class="loading-overlay"><div class="spinner"></div></div>
    } @else if (data()) {
      <div class="kpi-grid">
        <div class="kpi-card">
          <div class="kpi-icon kpi-green">
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
          </div>
          <div class="kpi-info">
            <span class="kpi-value">R$ {{ data()!.totalRevenue | number:'1.2-2' }}</span>
            <span class="kpi-label">Receita Total</span>
          </div>
        </div>

        <div class="kpi-card">
          <div class="kpi-icon kpi-blue">
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
          </div>
          <div class="kpi-info">
            <span class="kpi-value">R$ {{ data()!.revenueToday | number:'1.2-2' }}</span>
            <span class="kpi-label">Receita Hoje</span>
          </div>
        </div>

        <div class="kpi-card">
          <div class="kpi-icon kpi-orange">
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
          </div>
          <div class="kpi-info">
            <span class="kpi-value">R$ {{ data()!.revenueLast7Days | number:'1.2-2' }}</span>
            <span class="kpi-label">Últimos 7 Dias</span>
          </div>
        </div>

        <div class="kpi-card">
          <div class="kpi-icon kpi-purple">
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
          </div>
          <div class="kpi-info">
            <span class="kpi-value">R$ {{ data()!.revenueLast30Days | number:'1.2-2' }}</span>
            <span class="kpi-label">Últimos 30 Dias</span>
          </div>
        </div>
      </div>

      <div class="stats-grid">
        <div class="card">
          <div class="card-header">
            <h2>Pedidos</h2>
          </div>
          <div class="stats-list">
            <div class="stat-item">
              <div class="stat-left">
                <div class="stat-dot dot-blue"></div>
                <span>Total de Pedidos</span>
              </div>
              <strong>{{ data()!.totalOrders }}</strong>
            </div>
            <div class="stat-item">
              <div class="stat-left">
                <div class="stat-dot dot-green"></div>
                <span>Concluídos</span>
              </div>
              <strong class="text-success">{{ data()!.ordersCompleted }}</strong>
            </div>
            <div class="stat-item">
              <div class="stat-left">
                <div class="stat-dot dot-red"></div>
                <span>Cancelados</span>
              </div>
              <strong class="text-danger">{{ data()!.ordersCancelled }}</strong>
            </div>
            <div class="stat-item">
              <div class="stat-left">
                <div class="stat-dot dot-yellow"></div>
                <span>Pendentes</span>
              </div>
              <strong class="text-warning">{{ data()!.ordersPending }}</strong>
            </div>
          </div>
        </div>

        <div class="card">
          <div class="card-header">
            <h2>Ticket Médio</h2>
          </div>
          <div class="ticket-medio">
            <span class="ticket-value">R$ {{ data()!.averageOrderValue | number:'1.2-2' }}</span>
            <span class="ticket-label">Valor médio por pedido</span>
          </div>
        </div>
      </div>
    }
  `,
    styles: [`
    .kpi-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 20px;
      margin-bottom: 24px;
    }

    .kpi-card {
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
      padding: 20px;
      display: flex;
      align-items: center;
      gap: 16px;
      box-shadow: var(--shadow-sm);
      transition: all 0.15s ease;
    }

    .kpi-card:hover { box-shadow: var(--shadow-md); transform: translateY(-2px); }

    .kpi-icon {
      width: 48px;
      height: 48px;
      border-radius: var(--radius-md);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .kpi-blue { background: var(--info-light); color: var(--info); }
    .kpi-orange { background: var(--primary-light); color: var(--primary); }
    .kpi-green { background: var(--success-light); color: var(--success); }
    .kpi-purple { background: #F3E8FF; color: #9333EA; }

    .kpi-info { display: flex; flex-direction: column; }
    .kpi-value { font-size: 1.375rem; font-weight: 700; color: var(--text-primary); line-height: 1.2; }
    .kpi-label { font-size: 0.8125rem; color: var(--text-secondary); margin-top: 2px; }

    .stats-grid {
      display: grid;
      grid-template-columns: 2fr 1fr;
      gap: 20px;
    }

    .card-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 16px;
    }

    .card-header h2 { font-size: 1rem; font-weight: 600; }

    .stats-list {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .stat-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 12px 16px;
      background: var(--bg-page);
      border-radius: var(--radius-md);
      font-size: 0.875rem;
    }

    .stat-left {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .stat-dot {
      width: 10px;
      height: 10px;
      border-radius: 50%;
    }

    .dot-blue { background: var(--info); }
    .dot-green { background: var(--success); }
    .dot-red { background: var(--danger); }
    .dot-yellow { background: var(--warning); }

    .text-success { color: var(--success); }
    .text-danger { color: var(--danger); }
    .text-warning { color: var(--warning); }

    .ticket-medio {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 32px 16px;
      text-align: center;
    }

    .ticket-value {
      font-size: 2rem;
      font-weight: 700;
      color: var(--primary);
      line-height: 1.2;
    }

    .ticket-label {
      font-size: 0.8125rem;
      color: var(--text-secondary);
      margin-top: 8px;
    }

    @media (max-width: 768px) {
      .stats-grid { grid-template-columns: 1fr; }
    }
  `]
})
export class FinancialComponent implements OnInit {
    private api = inject(ApiService);
    private toast = inject(ToastService);

    loading = signal(true);
    data = signal<FinancialResponse | null>(null);

    ngOnInit() {
        this.api.getFinancialSummary().subscribe({
            next: (res) => { this.data.set(res); this.loading.set(false); },
            error: () => { this.toast.error('Erro ao carregar dados financeiros'); this.loading.set(false); }
        });
    }
}
