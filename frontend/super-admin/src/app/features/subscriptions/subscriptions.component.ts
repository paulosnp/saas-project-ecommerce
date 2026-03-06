import { Component, OnInit, signal } from '@angular/core';
import { ApiService } from '../../core/api.service';
import { ToastService } from '../../core/toast.service';
import { SubscriptionResponse, Page } from '../../core/models';

@Component({
  selector: 'app-subscriptions',
  standalone: true,
  template: `
    <div class="sa-page-header">
      <h1 class="sa-page-title">Gestão de Assinaturas</h1>
      <p class="sa-page-subtitle">Controle as assinaturas de todos os lojistas</p>
    </div>

    <div class="sa-card">
      <div class="sa-table-wrap">
        <table class="sa-table">
          <thead>
            <tr>
              <th>Loja</th>
              <th>Plano</th>
              <th>Status</th>
              <th>Início</th>
              <th>Expiração</th>
              <th>Tempo Restante</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            @for (sub of subs(); track sub.id) {
              <tr>
                <td><strong>{{ sub.storeName }}</strong></td>
                <td>{{ sub.planName }}</td>
                <td>
                  <span class="sa-badge" [class]="'sa-badge-' + sub.status.toLowerCase()">
                    {{ sub.status }}
                  </span>
                </td>
                <td>{{ formatDate(sub.startsAt) }}</td>
                <td>{{ formatDate(sub.expiresAt) }}</td>
                <td>
                  <span [class]="getTimeClass(sub)">{{ getTimeRemaining(sub) }}</span>
                </td>
                <td>
                  <select class="sa-select status-select" [value]="sub.status" (change)="changeStatus(sub.id, $event)">
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="TRIAL">TRIAL</option>
                    <option value="PAST_DUE">PAST_DUE</option>
                    <option value="CANCELLED">CANCELLED</option>
                    <option value="EXPIRED">EXPIRED</option>
                  </select>
                </td>
              </tr>
            }
            @if (subs().length === 0) {
              <tr><td colspan="7" style="text-align:center;color:var(--sa-text-muted);padding:40px">Nenhuma assinatura encontrada</td></tr>
            }
          </tbody>
        </table>
      </div>

      <div class="sa-pagination">
        <button (click)="changePage(currentPage() - 1)" [disabled]="currentPage() === 0">← Anterior</button>
        <span class="sa-page-info">Página {{ currentPage() + 1 }} de {{ totalPages() }}</span>
        <button (click)="changePage(currentPage() + 1)" [disabled]="currentPage() + 1 >= totalPages()">Próxima →</button>
      </div>
    </div>
  `,
  styles: `
    .status-select { width: 140px; padding: 6px 10px; font-size: 0.8125rem; }
    .time-ok { color: var(--sa-success); font-weight: 600; }
    .time-warn { color: var(--sa-warning); font-weight: 600; }
    .time-danger { color: var(--sa-danger); font-weight: 600; }
    .time-na { color: var(--sa-text-muted); }
  `
})
export class SubscriptionsComponent implements OnInit {
  subs = signal<SubscriptionResponse[]>([]);
  currentPage = signal(0);
  totalPages = signal(1);

  constructor(private api: ApiService, private toast: ToastService) { }

  ngOnInit(): void { this.loadSubs(); }

  loadSubs(): void {
    this.api.getSubscriptions(this.currentPage()).subscribe(p => {
      this.subs.set(p.content);
      this.totalPages.set(p.totalPages || 1);
    });
  }

  changeStatus(id: string, event: Event): void {
    const status = (event.target as HTMLSelectElement).value;
    this.api.updateSubscriptionStatus(id, status).subscribe({
      next: (updated) => {
        this.subs.update(list => list.map(s => s.id === updated.id ? updated : s));
        this.toast.success('Status atualizado para ' + status);
      },
      error: () => this.toast.error('Erro ao atualizar status')
    });
  }

  getTimeRemaining(sub: SubscriptionResponse): string {
    if (!sub.expiresAt) return 'Sem expiração';
    const now = new Date().getTime();
    const exp = new Date(sub.expiresAt).getTime();
    const diff = exp - now;
    if (diff <= 0) return 'Expirado';
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return days + ' dia(s)';
  }

  getTimeClass(sub: SubscriptionResponse): string {
    if (!sub.expiresAt) return 'time-na';
    const now = new Date().getTime();
    const exp = new Date(sub.expiresAt).getTime();
    const days = Math.ceil((exp - now) / (1000 * 60 * 60 * 24));
    if (days <= 0) return 'time-danger';
    if (days <= 7) return 'time-warn';
    return 'time-ok';
  }

  changePage(page: number): void {
    this.currentPage.set(page);
    this.loadSubs();
  }

  formatDate(iso: string): string {
    if (!iso) return '-';
    return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
  }
}
