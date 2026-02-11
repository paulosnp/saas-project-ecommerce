import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/api.service';
import { ToastService } from '../../core/toast.service';
import { CategoryResponse, CategoryRequest } from '../../core/models';

@Component({
    selector: 'app-categories',
    standalone: true,
    imports: [FormsModule],
    template: `
    <div class="page-header">
      <div>
        <h1>Categorias</h1>
        <p>Gerencie as categorias dos seus produtos</p>
      </div>
      <button class="btn btn-primary" (click)="openModal()">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        Nova Categoria
      </button>
    </div>

    @if (loading()) {
      <div class="loading-overlay"><div class="spinner"></div></div>
    } @else if (categories().length === 0) {
      <div class="card empty-state">
        <h3>Nenhuma categoria</h3>
        <p>Crie sua primeira categoria para organizar seus produtos</p>
      </div>
    } @else {
      <div class="table-wrapper">
        <table>
          <thead><tr><th>Nome</th><th>Descrição</th><th>Criada em</th><th style="width:100px">Ações</th></tr></thead>
          <tbody>
            @for (cat of categories(); track cat.id) {
              <tr>
                <td><strong>{{ cat.name }}</strong></td>
                <td>{{ cat.description || '—' }}</td>
                <td>{{ formatDate(cat.createdAt) }}</td>
                <td>
                  <div class="actions">
                    <button class="btn-icon" (click)="openModal(cat)" title="Editar">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                    </button>
                    <button class="btn-icon" style="color:var(--danger)" (click)="confirmDelete(cat)" title="Excluir">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                    </button>
                  </div>
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    }

    @if (showModal()) {
      <div class="modal-overlay" (click)="closeModal()">
        <div class="modal-content" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h2>{{ editingId ? 'Editar' : 'Nova' }} Categoria</h2>
            <button class="btn-icon" (click)="closeModal()">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>
          <form (ngSubmit)="save()">
            <div class="modal-body" style="display:flex;flex-direction:column;gap:16px">
              <div class="form-group">
                <label for="catName">Nome</label>
                <input id="catName" class="form-input" [(ngModel)]="formName" name="name" placeholder="Ex: Eletrônicos" required />
              </div>
              <div class="form-group">
                <label for="catDesc">Descrição</label>
                <input id="catDesc" class="form-input" [(ngModel)]="formDescription" name="description" placeholder="Descrição opcional" />
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" (click)="closeModal()">Cancelar</button>
              <button type="submit" class="btn btn-primary" [disabled]="saving()">
                {{ saving() ? 'Salvando...' : 'Salvar' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    }

    @if (deleteTarget()) {
      <div class="modal-overlay" (click)="deleteTarget.set(null)">
        <div class="modal-content" (click)="$event.stopPropagation()">
          <div class="modal-header"><h2>Excluir Categoria</h2></div>
          <div class="modal-body">
            <p>Tem certeza que deseja excluir <strong>{{ deleteTarget()!.name }}</strong>?</p>
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary" (click)="deleteTarget.set(null)">Cancelar</button>
            <button class="btn btn-danger" (click)="doDelete()">Excluir</button>
          </div>
        </div>
      </div>
    }
  `,
    styles: [`
    .actions { display: flex; gap: 4px; }
  `]
})
export class CategoriesComponent implements OnInit {
    private api = inject(ApiService);
    private toast = inject(ToastService);

    categories = signal<CategoryResponse[]>([]);
    loading = signal(true);
    showModal = signal(false);
    saving = signal(false);
    deleteTarget = signal<CategoryResponse | null>(null);

    editingId: string | null = null;
    formName = '';
    formDescription = '';

    ngOnInit() { this.load(); }

    load() {
        this.loading.set(true);
        this.api.getCategories().subscribe({
            next: res => { this.categories.set(res); this.loading.set(false); },
            error: () => { this.toast.error('Erro ao carregar categorias'); this.loading.set(false); }
        });
    }

    openModal(cat?: CategoryResponse) {
        this.editingId = cat?.id || null;
        this.formName = cat?.name || '';
        this.formDescription = cat?.description || '';
        this.showModal.set(true);
    }

    closeModal() { this.showModal.set(false); }

    save() {
        if (!this.formName.trim()) return;
        this.saving.set(true);

        const data: CategoryRequest = { name: this.formName, description: this.formDescription || undefined };
        const obs = this.editingId
            ? this.api.updateCategory(this.editingId, data)
            : this.api.createCategory(data);

        obs.subscribe({
            next: () => {
                this.toast.success(this.editingId ? 'Categoria atualizada!' : 'Categoria criada!');
                this.closeModal();
                this.saving.set(false);
                this.load();
            },
            error: () => {
                this.toast.error('Erro ao salvar categoria');
                this.saving.set(false);
            }
        });
    }

    confirmDelete(cat: CategoryResponse) { this.deleteTarget.set(cat); }

    doDelete() {
        const cat = this.deleteTarget();
        if (!cat) return;
        this.api.deleteCategory(cat.id).subscribe({
            next: () => { this.toast.success('Categoria excluída!'); this.deleteTarget.set(null); this.load(); },
            error: () => this.toast.error('Erro ao excluir categoria')
        });
    }

    formatDate(iso: string): string {
        return new Date(iso).toLocaleDateString('pt-BR');
    }
}
