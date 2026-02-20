import { Component, OnInit, signal } from '@angular/core';
import { ApiService } from '../../core/api.service';
import { ToastService } from '../../core/toast.service';
import { StoreResponse, Page } from '../../core/models';

@Component({
    selector: 'app-stores',
    standalone: true,
    template: `
    <div class="sa-page-header">
      <h1 class="sa-page-title">Gestão de Lojas</h1>
      <p class="sa-page-subtitle">Gerencie todas as lojas da plataforma</p>
    </div>

    <div class="sa-card">
      <div class="sa-table-wrap">
        <table class="sa-table">
          <thead>
            <tr>
              <th>Loja</th>
              <th>Slug</th>
              <th>Plano</th>
              <th>Status Assinatura</th>
              <th>Ativo</th>
              <th>Criada em</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            @for (store of stores(); track store.id) {
              <tr>
                <td><strong>{{ store.name }}</strong></td>
                <td><code>{{ store.slugUrl }}</code></td>
                <td><span class="sa-badge sa-badge-active">{{ store.currentPlan }}</span></td>
                <td>
                  <span class="sa-badge" [class]="'sa-badge-' + store.subscriptionStatus.toLowerCase()">
                    {{ store.subscriptionStatus }}
                  </span>
                </td>
                <td>
                  <button class="sa-btn sa-btn-sm"
                    [class]="store.active ? 'sa-btn-success' : 'sa-btn-danger'"
                    (click)="toggleStatus(store)">
                    {{ store.active ? '✅ Ativo' : '❌ Inativo' }}
                  </button>
                </td>
                <td>{{ formatDate(store.createdAt) }}</td>
                <td>
                  <button class="sa-btn sa-btn-ghost sa-btn-sm" (click)="viewDetails(store)">Detalhes</button>
                </td>
              </tr>
            }
            @if (stores().length === 0) {
              <tr><td colspan="7" style="text-align:center;color:#94a3b8;padding:40px">Nenhuma loja encontrada</td></tr>
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

    @if (selectedStore()) {
      <div class="sa-modal-backdrop" (click)="selectedStore.set(null)">
        <div class="sa-modal" (click)="$event.stopPropagation()">
          <div class="sa-modal-header">
            <h3 class="sa-modal-title">{{ selectedStore()!.name }}</h3>
            <button class="sa-modal-close" (click)="selectedStore.set(null)">×</button>
          </div>
          <div class="sa-modal-body">
            <div class="detail-grid">
              <div class="detail-item"><span class="detail-label">Slug</span><span>{{ selectedStore()!.slugUrl }}</span></div>
              <div class="detail-item"><span class="detail-label">Plano Atual</span><span>{{ selectedStore()!.currentPlan }}</span></div>
              <div class="detail-item"><span class="detail-label">Assinatura</span><span>{{ selectedStore()!.subscriptionStatus }}</span></div>
              <div class="detail-item"><span class="detail-label">Cor Primária</span><span style="display:flex;align-items:center;gap:8px"><span class="color-dot" [style.background]="selectedStore()!.primaryColor"></span>{{ selectedStore()!.primaryColor }}</span></div>
              <div class="detail-item"><span class="detail-label">Status</span><span>{{ selectedStore()!.active ? 'Ativo' : 'Inativo' }}</span></div>
              <div class="detail-item"><span class="detail-label">Criada em</span><span>{{ formatDate(selectedStore()!.createdAt) }}</span></div>
            </div>
          </div>
        </div>
      </div>
    }
  `,
    styles: `
    code { background: #f1f5f9; padding: 2px 8px; border-radius: 4px; font-size: 13px; color: #7c3aed; }
    .detail-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
    .detail-item { display: flex; flex-direction: column; gap: 4px; }
    .detail-label { font-size: 12px; font-weight: 600; color: #64748b; text-transform: uppercase; }
    .detail-item > span:last-child { font-size: 15px; font-weight: 500; }
    .color-dot { width: 16px; height: 16px; border-radius: 4px; display: inline-block; border: 1px solid #e2e8f0; }
  `
})
export class StoresComponent implements OnInit {
    stores = signal<StoreResponse[]>([]);
    currentPage = signal(0);
    totalPages = signal(1);
    selectedStore = signal<StoreResponse | null>(null);

    constructor(private api: ApiService, private toast: ToastService) { }

    ngOnInit(): void { this.loadStores(); }

    loadStores(): void {
        this.api.getStores(this.currentPage()).subscribe(p => {
            this.stores.set(p.content);
            this.totalPages.set(p.totalPages || 1);
        });
    }

    toggleStatus(store: StoreResponse): void {
        this.api.toggleStoreStatus(store.id, !store.active).subscribe({
            next: (updated) => {
                this.stores.update(list => list.map(s => s.id === updated.id ? updated : s));
                this.toast.success(updated.active ? 'Loja ativada' : 'Loja desativada');
            },
            error: () => this.toast.error('Erro ao atualizar status')
        });
    }

    viewDetails(store: StoreResponse): void {
        this.selectedStore.set(store);
    }

    changePage(page: number): void {
        this.currentPage.set(page);
        this.loadStores();
    }

    formatDate(iso: string): string {
        if (!iso) return '-';
        return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
    }
}
