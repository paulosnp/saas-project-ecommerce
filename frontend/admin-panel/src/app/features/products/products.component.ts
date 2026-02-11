import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../core/api.service';
import { ToastService } from '../../core/toast.service';
import { ProductResponse, Page } from '../../core/models';

@Component({
    selector: 'app-products',
    standalone: true,
    imports: [RouterLink],
    template: `
    <div class="page-header">
      <div>
        <h1>Produtos</h1>
        <p>{{ totalElements() }} produto(s) cadastrado(s)</p>
      </div>
      <a routerLink="/products/new" class="btn btn-primary">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        Novo Produto
      </a>
    </div>

    @if (loading()) {
      <div class="loading-overlay"><div class="spinner"></div></div>
    } @else if (products().length === 0) {
      <div class="card empty-state">
        <h3>Nenhum produto</h3>
        <p>Cadastre seu primeiro produto para começar a vender</p>
      </div>
    } @else {
      <div class="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Produto</th>
              <th>Categoria</th>
              <th>Preço</th>
              <th>Estoque</th>
              <th>Status</th>
              <th style="width:100px">Ações</th>
            </tr>
          </thead>
          <tbody>
            @for (p of products(); track p.id) {
              <tr>
                <td>
                  <div class="product-cell">
                    <div class="product-img">
                      @if (p.imageUrl) {
                        <img [src]="p.imageUrl" [alt]="p.name" />
                      } @else {
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                      }
                    </div>
                    <span class="product-name">{{ p.name }}</span>
                  </div>
                </td>
                <td>{{ p.categoryName || '—' }}</td>
                <td>R$ {{ p.price.toFixed(2) }}</td>
                <td>
                  <span [class]="p.stockQuantity <= 5 ? 'stock-low' : ''">{{ p.stockQuantity }}</span>
                </td>
                <td>
                  <span class="badge" [class]="p.active ? 'badge-success' : 'badge-neutral'">
                    {{ p.active ? 'Ativo' : 'Inativo' }}
                  </span>
                </td>
                <td>
                  <div class="actions">
                    <a [routerLink]="['/products', p.id, 'edit']" class="btn-icon" title="Editar">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                    </a>
                    <button class="btn-icon" style="color:var(--danger)" (click)="confirmDelete(p)" title="Excluir">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                    </button>
                  </div>
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

    @if (deleteTarget()) {
      <div class="modal-overlay" (click)="deleteTarget.set(null)">
        <div class="modal-content" (click)="$event.stopPropagation()">
          <div class="modal-header"><h2>Excluir Produto</h2></div>
          <div class="modal-body"><p>Tem certeza que deseja excluir <strong>{{ deleteTarget()!.name }}</strong>?</p></div>
          <div class="modal-footer">
            <button class="btn btn-secondary" (click)="deleteTarget.set(null)">Cancelar</button>
            <button class="btn btn-danger" (click)="doDelete()">Excluir</button>
          </div>
        </div>
      </div>
    }
  `,
    styles: [`
    .product-cell { display: flex; align-items: center; gap: 12px; }
    .product-img {
      width: 40px; height: 40px; border-radius: var(--radius-md);
      background: var(--bg-page); border: 1px solid var(--border);
      display: flex; align-items: center; justify-content: center;
      overflow: hidden; flex-shrink: 0; color: var(--text-muted);
    }
    .product-img img { width: 100%; height: 100%; object-fit: cover; }
    .product-name { font-weight: 600; }
    .stock-low { color: var(--danger); font-weight: 600; }
    .actions { display: flex; gap: 4px; }
  `]
})
export class ProductsComponent implements OnInit {
    private api = inject(ApiService);
    private toast = inject(ToastService);

    products = signal<ProductResponse[]>([]);
    loading = signal(true);
    currentPage = signal(0);
    totalPages = signal(0);
    totalElements = signal(0);
    deleteTarget = signal<ProductResponse | null>(null);

    pageNumbers = signal<number[]>([]);

    ngOnInit() { this.load(0); }

    load(page: number) {
        this.loading.set(true);
        this.api.getProducts(page).subscribe({
            next: (res) => {
                this.products.set(res.content);
                this.currentPage.set(res.number);
                this.totalPages.set(res.totalPages);
                this.totalElements.set(res.totalElements);
                this.pageNumbers.set(Array.from({ length: res.totalPages }, (_, i) => i));
                this.loading.set(false);
            },
            error: () => { this.toast.error('Erro ao carregar produtos'); this.loading.set(false); }
        });
    }

    goToPage(page: number) { this.load(page); }

    confirmDelete(p: ProductResponse) { this.deleteTarget.set(p); }

    doDelete() {
        const p = this.deleteTarget();
        if (!p) return;
        this.api.deleteProduct(p.id).subscribe({
            next: () => { this.toast.success('Produto excluído!'); this.deleteTarget.set(null); this.load(this.currentPage()); },
            error: () => this.toast.error('Erro ao excluir produto')
        });
    }
}
