import { Component, inject, OnInit, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { ApiService } from '../../core/api.service';
import { ToastService } from '../../core/toast.service';
import { CustomerSummaryResponse, CustomerOrderResponse } from '../../core/models';

@Component({
    selector: 'app-customers',
    standalone: true,
    imports: [DecimalPipe],
    template: `
    <div class="page-header">
      <div>
        <h1>Clientes</h1>
        <p>{{ customers().length }} cliente(s) com pedidos</p>
      </div>
    </div>

    @if (loading()) {
      <div class="loading-overlay"><div class="spinner"></div></div>
    } @else if (customers().length === 0) {
      <div class="card empty-state">
        <h3>Nenhum cliente</h3>
        <p>Clientes que fizerem pedidos aparecerão aqui</p>
      </div>
    } @else {
      <div class="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Cliente</th>
              <th>E-mail</th>
              <th>Telefone</th>
              <th>Pedidos</th>
              <th>Total Gasto</th>
              <th>Último Pedido</th>
            </tr>
          </thead>
          <tbody>
            @for (c of customers(); track c.customerId) {
              <tr (click)="selectCustomer(c)" style="cursor:pointer">
                <td><strong>{{ c.fullName }}</strong></td>
                <td>{{ c.email }}</td>
                <td>{{ c.phone || '-' }}</td>
                <td><span class="badge badge-info">{{ c.totalOrders }}</span></td>
                <td><strong>R$ {{ c.totalSpent | number:'1.2-2' }}</strong></td>
                <td>{{ formatDate(c.lastOrderDate) }}</td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    }

    @if (selectedCustomer()) {
      <div class="modal-overlay" (click)="selectedCustomer.set(null)">
        <div class="modal-content" style="max-width:640px" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h2>Pedidos de {{ selectedCustomer()!.fullName }}</h2>
            <button class="btn-icon" (click)="selectedCustomer.set(null)">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>
          <div class="modal-body">
            @if (loadingOrders()) {
              <div class="loading-overlay"><div class="spinner"></div></div>
            } @else if (customerOrders().length === 0) {
              <p style="text-align:center;color:var(--text-muted);padding:24px">Nenhum pedido encontrado</p>
            } @else {
              @for (order of customerOrders(); track order.orderId) {
                <div class="order-card">
                  <div class="order-card-header">
                    <span class="order-id-label">#{{ order.orderId.substring(0, 8) }}</span>
                    <span class="badge" [class]="getStatusClass(order.status)">{{ getStatusLabel(order.status) }}</span>
                  </div>
                  <div class="detail-row">
                    <span>Data</span>
                    <span>{{ formatDate(order.createdAt) }}</span>
                  </div>
                  <div class="detail-row">
                    <span>Total</span>
                    <strong>R$ {{ order.total | number:'1.2-2' }}</strong>
                  </div>
                  @for (item of order.items; track item.id) {
                    <div class="detail-row item-row">
                      <span>{{ item.productName }} × {{ item.quantity }}</span>
                      <span>R$ {{ (item.unitPrice * item.quantity) | number:'1.2-2' }}</span>
                    </div>
                  }
                </div>
              }
            }
          </div>
        </div>
      </div>
    }
  `,
    styles: [`
    .order-card {
      background: var(--bg-page);
      border-radius: var(--radius-md);
      padding: 16px;
      margin-bottom: 12px;
    }
    .order-card:last-child { margin-bottom: 0; }
    .order-card-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 10px;
      padding-bottom: 10px;
      border-bottom: 1px solid var(--border);
    }
    .order-id-label {
      font-family: monospace;
      font-weight: 700;
      color: var(--primary);
      font-size: 0.9375rem;
    }
    .detail-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 5px 0;
      font-size: 0.875rem;
    }
    .item-row {
      color: var(--text-secondary);
      font-size: 0.8125rem;
      padding-left: 8px;
    }
  `]
})
export class CustomersComponent implements OnInit {
    private api = inject(ApiService);
    private toast = inject(ToastService);

    customers = signal<CustomerSummaryResponse[]>([]);
    loading = signal(true);
    selectedCustomer = signal<CustomerSummaryResponse | null>(null);
    customerOrders = signal<CustomerOrderResponse[]>([]);
    loadingOrders = signal(false);

    ngOnInit() {
        this.api.getCustomers().subscribe({
            next: (res) => { this.customers.set(res); this.loading.set(false); },
            error: () => { this.toast.error('Erro ao carregar clientes'); this.loading.set(false); }
        });
    }

    selectCustomer(customer: CustomerSummaryResponse) {
        this.selectedCustomer.set(customer);
        this.loadingOrders.set(true);
        this.api.getCustomerOrders(customer.customerId).subscribe({
            next: (res) => { this.customerOrders.set(res); this.loadingOrders.set(false); },
            error: () => { this.toast.error('Erro ao carregar pedidos'); this.loadingOrders.set(false); }
        });
    }

    getStatusClass(status: string): string {
        const map: Record<string, string> = {
            'AWAITING_PAYMENT': 'badge-warning', 'PAYMENT_CONFIRMED': 'badge-info',
            'PROCESSING': 'badge-info', 'SHIPPED': 'badge-info',
            'DELIVERED': 'badge-success', 'CANCELLED': 'badge-danger'
        };
        return map[status] || 'badge-neutral';
    }

    getStatusLabel(status: string): string {
        const map: Record<string, string> = {
            'AWAITING_PAYMENT': 'Aguardando', 'PAYMENT_CONFIRMED': 'Pago',
            'PROCESSING': 'Processando', 'SHIPPED': 'Enviado',
            'DELIVERED': 'Entregue', 'CANCELLED': 'Cancelado'
        };
        return map[status] || status;
    }

    formatDate(iso: string): string {
        if (!iso) return '-';
        return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
    }
}
