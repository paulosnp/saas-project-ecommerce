import { Component, inject, OnInit, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../core/api.service';
import { DashboardResponse } from '../../core/models';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterLink, DecimalPipe],
  template: `
    <div class="page-header">
      <div>
        <h1>Dashboard</h1>
        <p>Visão geral da sua loja</p>
      </div>
    </div>

    @if (loading()) {
      <div class="loading-overlay"><div class="spinner"></div></div>
    } @else if (data()) {
      <div class="kpi-grid">
        <div class="kpi-card">
          <div class="kpi-icon kpi-blue">
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
          </div>
          <div class="kpi-info">
            <span class="kpi-value">{{ data()!.totalOrders }}</span>
            <span class="kpi-label">Total de Pedidos</span>
          </div>
        </div>

        <div class="kpi-card">
          <div class="kpi-icon kpi-orange">
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
          </div>
          <div class="kpi-info">
            <span class="kpi-value">{{ data()!.ordersToday }}</span>
            <span class="kpi-label">Pedidos Hoje</span>
          </div>
        </div>

        <div class="kpi-card">
          <div class="kpi-icon kpi-yellow">
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
          </div>
          <div class="kpi-info">
            <span class="kpi-value">{{ data()!.pendingOrders }}</span>
            <span class="kpi-label">Pagamento Pendente</span>
          </div>
        </div>

        <div class="kpi-card">
          <div class="kpi-icon kpi-green">
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
          </div>
          <div class="kpi-info">
            <span class="kpi-value">R$ {{ data()!.totalRevenue | number:'1.2-2' }}</span>
            <span class="kpi-label">Receita Total</span>
          </div>
        </div>
      </div>

      <div class="dashboard-grid">
        <div class="card">
          <div class="card-header">
            <h2>Pedidos Recentes</h2>
            <a routerLink="/orders" class="btn btn-secondary btn-sm">Ver todos</a>
          </div>

          @if (data()!.recentOrders.length === 0) {
            <div class="empty-state"><h3>Nenhum pedido ainda</h3><p>Os pedidos aparecerão aqui</p></div>
          } @else {
            <div class="table-wrapper" style="border:none;border-radius:0">
              <table>
                <thead>
                  <tr><th>Pedido</th><th>Status</th><th>Total</th><th>Data</th></tr>
                </thead>
                <tbody>
                  @for (order of data()!.recentOrders; track order.id) {
                    <tr>
                      <td class="order-id">#{{ order.id.substring(0, 8) }}</td>
                      <td><span class="badge" [class]="getStatusClass(order.status)">{{ getStatusLabel(order.status) }}</span></td>
                      <td>R$ {{ order.total | number:'1.2-2' }}</td>
                      <td>{{ formatDate(order.createdAt) }}</td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          }
        </div>

        <div class="card">
          <div class="card-header">
            <h2>Produtos</h2>
            <a routerLink="/products" class="btn btn-secondary btn-sm">Gerenciar</a>
          </div>
          <div class="products-summary">
            <div class="summary-item">
              <span class="summary-value">{{ data()!.totalProducts }}</span>
              <span class="summary-label">Total cadastrados</span>
            </div>
            <div class="summary-item">
              <span class="summary-value active-value">{{ data()!.activeProducts }}</span>
              <span class="summary-label">Ativos</span>
            </div>
            <div class="summary-item">
              <span class="summary-value inactive-value">{{ data()!.totalProducts - data()!.activeProducts }}</span>
              <span class="summary-label">Inativos</span>
            </div>
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
    .kpi-yellow { background: var(--warning-light); color: var(--warning); }
    .kpi-green { background: var(--success-light); color: var(--success); }

    .kpi-info { display: flex; flex-direction: column; }
    .kpi-value { font-size: 1.5rem; font-weight: 700; color: var(--text-primary); line-height: 1.2; }
    .kpi-label { font-size: 0.8125rem; color: var(--text-secondary); margin-top: 2px; }

    .dashboard-grid {
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

    .order-id { font-family: monospace; font-weight: 600; color: var(--primary); }

    .products-summary {
      display: flex;
      flex-direction: column;
      gap: 16px;
      padding-top: 8px;
    }

    .summary-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 12px 16px;
      background: var(--bg-page);
      border-radius: var(--radius-md);
    }

    .summary-value { font-size: 1.25rem; font-weight: 700; color: var(--text-primary); }
    .summary-label { font-size: 0.8125rem; color: var(--text-secondary); }
    .active-value { color: var(--success); }
    .inactive-value { color: var(--text-muted); }

    @media (max-width: 768px) {
      .dashboard-grid { grid-template-columns: 1fr; }
    }
  `]
})
export class DashboardComponent implements OnInit {
  private api = inject(ApiService);

  loading = signal(true);
  data = signal<DashboardResponse | null>(null);

  ngOnInit() {
    this.api.getDashboard().subscribe({
      next: (res) => { this.data.set(res); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  getStatusClass(status: string): string {
    const map: Record<string, string> = {
      'AWAITING_PAYMENT': 'badge-warning',
      'PAYMENT_CONFIRMED': 'badge-info',
      'PROCESSING': 'badge-info',
      'SHIPPED': 'badge-info',
      'DELIVERED': 'badge-success',
      'CANCELLED': 'badge-danger'
    };
    return map[status] || 'badge-neutral';
  }

  getStatusLabel(status: string): string {
    const map: Record<string, string> = {
      'AWAITING_PAYMENT': 'Aguardando',
      'PAYMENT_CONFIRMED': 'Confirmado',
      'PROCESSING': 'Processando',
      'SHIPPED': 'Enviado',
      'DELIVERED': 'Entregue',
      'CANCELLED': 'Cancelado'
    };
    return map[status] || status;
  }

  formatDate(iso: string): string {
    return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
  }
}
