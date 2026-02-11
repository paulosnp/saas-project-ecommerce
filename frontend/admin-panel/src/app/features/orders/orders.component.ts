import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/api.service';
import { ToastService } from '../../core/toast.service';
import { OrderResponse, Page } from '../../core/models';

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="page-header">
      <div>
        <h1>Pedidos</h1>
        <p>{{ totalElements() }} pedido(s) no total</p>
      </div>
    </div>

    @if (loading()) {
      <div class="loading-overlay"><div class="spinner"></div></div>
    } @else if (orders().length === 0) {
      <div class="card empty-state">
        <h3>Nenhum pedido</h3>
        <p>Os pedidos dos seus clientes aparecerão aqui</p>
      </div>
    } @else {
      <div class="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Pedido</th>
              <th>Status</th>
              <th>Itens</th>
              <th>Total</th>
              <th>Data</th>
              <th style="width:160px">Atualizar Status</th>
            </tr>
          </thead>
          <tbody>
            @for (o of orders(); track o.id) {
              <tr>
                <td class="order-id">#{{ o.id.substring(0, 8) }}</td>
                <td><span class="badge" [class]="getStatusClass(o.status)">{{ getStatusLabel(o.status) }}</span></td>
                <td>{{ o.items.length }} item(s)</td>
                <td><strong>R$ {{ o.total.toFixed(2) }}</strong></td>
                <td>{{ formatDate(o.createdAt) }}</td>
                <td>
                  <select class="form-input"
                    [ngModel]="o.status"
                    (ngModelChange)="updateStatus(o.id, $event)"
                    style="padding:6px 10px;font-size:0.8125rem">
                    <option value="AWAITING_PAYMENT">Aguardando Pagamento</option>
                    <option value="PAYMENT_CONFIRMED">Pago</option>
                    <option value="PROCESSING">Processando</option>
                    <option value="SHIPPED">Enviado</option>
                    <option value="DELIVERED">Entregue</option>
                    <option value="CANCELLED">Cancelado</option>
                  </select>
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>

      @if (totalPages() > 1) {
        <div class="pagination">
          <button [disabled]="currentPage() === 0" (click)="goToPage(currentPage() - 1)">Anterior</button>
          @for (p of pageNumbers(); track p) {
            <button [class.active]="p === currentPage()" (click)="goToPage(p)">{{ p + 1 }}</button>
          }
          <button [disabled]="currentPage() >= totalPages() - 1" (click)="goToPage(currentPage() + 1)">Próxima</button>
        </div>
      }
    }

    @if (selectedOrder()) {
      <div class="modal-overlay" (click)="selectedOrder.set(null)">
        <div class="modal-content" style="max-width:560px" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h2>Pedido #{{ selectedOrder()!.id.substring(0, 8) }}</h2>
            <button class="btn-icon" (click)="selectedOrder.set(null)">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>
          <div class="modal-body">
            <div class="detail-row">
              <span>Status</span>
              <span class="badge" [class]="getStatusClass(selectedOrder()!.status)">{{ getStatusLabel(selectedOrder()!.status) }}</span>
            </div>
            <div class="detail-row">
              <span>Total</span>
              <strong>R$ {{ selectedOrder()!.total.toFixed(2) }}</strong>
            </div>
            @if (selectedOrder()!.trackingCode) {
              <div class="detail-row">
                <span>Rastreio</span>
                <code>{{ selectedOrder()!.trackingCode }}</code>
              </div>
            }
            <h3 style="margin: 16px 0 8px; font-size: 0.875rem">Itens</h3>
            @for (item of selectedOrder()!.items; track item.id) {
              <div class="detail-row">
                <span>{{ item.productName }} × {{ item.quantity }}</span>
                <span>R$ {{ (item.unitPrice * item.quantity).toFixed(2) }}</span>
              </div>
            }
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    .order-id {
      font-family: monospace;
      font-weight: 600;
      color: var(--primary);
      cursor: pointer;
    }
    .detail-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px 0;
      border-bottom: 1px solid var(--border);
      font-size: 0.875rem;
    }
    .detail-row:last-child { border-bottom: none; }
    code {
      background: var(--bg-page);
      padding: 2px 8px;
      border-radius: var(--radius-sm);
      font-size: 0.8125rem;
    }
  `]
})
export class OrdersComponent implements OnInit {
  private api = inject(ApiService);
  private toast = inject(ToastService);

  orders = signal<OrderResponse[]>([]);
  loading = signal(true);
  currentPage = signal(0);
  totalPages = signal(0);
  totalElements = signal(0);
  pageNumbers = signal<number[]>([]);
  selectedOrder = signal<OrderResponse | null>(null);

  ngOnInit() { this.load(0); }

  load(page: number) {
    this.loading.set(true);
    this.api.getOrders(page).subscribe({
      next: (res) => {
        this.orders.set(res.content);
        this.currentPage.set(res.number);
        this.totalPages.set(res.totalPages);
        this.totalElements.set(res.totalElements);
        this.pageNumbers.set(Array.from({ length: res.totalPages }, (_, i) => i));
        this.loading.set(false);
      },
      error: () => { this.toast.error('Erro ao carregar pedidos'); this.loading.set(false); }
    });
  }

  goToPage(page: number) { this.load(page); }

  updateStatus(id: string, status: string) {
    this.api.updateOrderStatus(id, status).subscribe({
      next: (updated) => {
        this.toast.success('Status atualizado!');
        this.orders.update(list => list.map(o => o.id === id ? updated : o));
      },
      error: () => this.toast.error('Erro ao atualizar status')
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
    return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
  }
}
