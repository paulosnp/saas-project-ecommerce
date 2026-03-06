import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/api.service';
import { ToastService } from '../../core/toast.service';
import { PlanResponse, PlanRequest } from '../../core/models';

@Component({
  selector: 'app-plans',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="sa-page-header" style="display:flex;justify-content:space-between;align-items:flex-start;">
      <div>
        <h1 class="sa-page-title">Gestão de Planos</h1>
        <p class="sa-page-subtitle">Crie, edite e exclua os planos da plataforma</p>
      </div>
      <button class="sa-btn sa-btn-primary" (click)="openCreate()">+ Novo Plano</button>
    </div>

    <div class="plans-grid">
      @for (plan of plans(); track plan.id) {
        <div class="sa-card plan-card" [class.inactive]="!plan.active">
          <div class="plan-header">
            <h3 class="plan-name">{{ plan.name }}</h3>
            <span class="sa-badge" [class]="plan.active ? 'sa-badge-active' : 'sa-badge-inactive'">
              {{ plan.active ? 'Ativo' : 'Inativo' }}
            </span>
          </div>
          <div class="plan-price">R$ {{ plan.price.toFixed(2).replace('.', ',') }}<span>/mês</span></div>
          <div class="plan-order-badge">Ordem: {{ plan.displayOrder }}</div>
          <p class="plan-desc">{{ plan.description }}</p>
          <div class="plan-limits">
            <div class="plan-limit">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>
              {{ plan.maxProducts }} produtos
            </div>
            <div class="plan-limit">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
              {{ plan.maxOrdersMonth }} pedidos/mês
            </div>
          </div>
          <div class="plan-actions">
            <button class="sa-btn sa-btn-ghost" (click)="openEdit(plan)">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
              Editar
            </button>
            <button class="sa-btn sa-btn-danger-ghost" (click)="startDelete(plan)">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
              Excluir
            </button>
          </div>
        </div>
      }
    </div>

    <!-- Create/Edit Modal -->
    @if (showModal()) {
      <div class="sa-modal-backdrop" (click)="showModal.set(false)">
        <div class="sa-modal" (click)="$event.stopPropagation()">
          <div class="sa-modal-header">
            <h3 class="sa-modal-title">{{ editId() ? 'Editar Plano' : 'Novo Plano' }}</h3>
            <button class="sa-modal-close" (click)="showModal.set(false)">×</button>
          </div>
          <div class="sa-modal-body">
            <div class="sa-form-group">
              <label class="sa-label">Nome</label>
              <input class="sa-input" [(ngModel)]="form.name" placeholder="Ex: PRO">
            </div>
            <div class="sa-form-group">
              <label class="sa-label">Descrição</label>
              <input class="sa-input" [(ngModel)]="form.description" placeholder="Descrição do plano">
            </div>
            <div class="form-row">
              <div class="sa-form-group">
                <label class="sa-label">Preço (R$)</label>
                <input class="sa-input" type="number" [(ngModel)]="form.price" step="0.01">
              </div>
              <div class="sa-form-group">
                <label class="sa-label">Máx. Produtos</label>
                <input class="sa-input" type="number" [(ngModel)]="form.maxProducts">
              </div>
              <div class="sa-form-group">
                <label class="sa-label">Máx. Pedidos/Mês</label>
                <input class="sa-input" type="number" [(ngModel)]="form.maxOrdersMonth">
              </div>
              <div class="sa-form-group">
                <label class="sa-label">Ordem de Exibição</label>
                <input class="sa-input" type="number" [(ngModel)]="form.displayOrder" min="0">
              </div>
            </div>
            <div class="sa-form-group">
              <label style="display:flex;align-items:center;gap:8px;cursor:pointer">
                <input type="checkbox" [(ngModel)]="form.active"> Plano ativo
              </label>
            </div>
          </div>
          <div class="sa-modal-footer">
            <button class="sa-btn sa-btn-ghost" (click)="showModal.set(false)">Cancelar</button>
            <button class="sa-btn sa-btn-primary" (click)="savePlan()">Salvar</button>
          </div>
        </div>
      </div>
    }

    <!-- Delete Modal -->
    @if (showDeleteModal()) {
      <div class="sa-modal-backdrop" (click)="showDeleteModal.set(false)">
        <div class="sa-modal" (click)="$event.stopPropagation()">
          <div class="sa-modal-header">
            <h3 class="sa-modal-title">Excluir Plano</h3>
            <button class="sa-modal-close" (click)="showDeleteModal.set(false)">×</button>
          </div>
          <div class="sa-modal-body">
            @if (deleteSubsCount() > 0) {
              <div class="delete-warning">
                <span class="warning-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#EAB308" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                </span>
                <div>
                  <strong>Atenção!</strong>
                  <p>O plano <strong>{{ deletePlan()?.name }}</strong> possui
                    <strong>{{ deleteSubsCount() }}</strong> assinatura(s) ativa(s).
                    Selecione o plano para onde migrar antes de excluir:</p>
                </div>
              </div>
              <div class="sa-form-group">
                <label class="sa-label">Migrar assinaturas para:</label>
                <select class="sa-input" [(ngModel)]="migrateToId">
                  <option value="">Selecione um plano...</option>
                  @for (p of otherPlans(); track p.id) {
                    <option [value]="p.id">{{ p.name }} - R$ {{ p.price.toFixed(2).replace('.', ',') }}/mês</option>
                  }
                </select>
              </div>
            } @else {
              <p>Tem certeza que deseja excluir o plano <strong>{{ deletePlan()?.name }}</strong>?</p>
              <p style="font-size:13px;color:#64748b;">Esta ação não pode ser desfeita.</p>
            }
          </div>
          <div class="sa-modal-footer">
            <button class="sa-btn sa-btn-ghost" (click)="showDeleteModal.set(false)">Cancelar</button>
            <button class="sa-btn sa-btn-danger"
              [disabled]="deleteSubsCount() > 0 && !migrateToId"
              (click)="confirmDelete()">
              {{ deleteSubsCount() > 0 ? 'Migrar e Excluir' : 'Excluir' }}
            </button>
          </div>
        </div>
      </div>
    }
  `,
  styles: `
    .plans-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 20px; }
    .plan-card { transition: all .2s; }
    .plan-card.inactive { opacity: .6; }
    .plan-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
    .plan-name { font-size: 1.25rem; font-weight: 700; color: var(--sa-text-primary); }
    .plan-price { font-size: 1.75rem; font-weight: 800; color: var(--sa-primary); margin-bottom: 8px; }
    .plan-price span { font-size: 0.875rem; font-weight: 400; color: var(--sa-text-muted); }
    .plan-order-badge { font-size: 0.75rem; font-weight: 600; color: var(--sa-text-secondary); margin-bottom: 4px; }
    .plan-desc { font-size: 0.8125rem; color: var(--sa-text-secondary); margin-bottom: 16px; }
    .plan-limits { display: flex; flex-direction: column; gap: 8px; }
    .plan-limit { display: flex; align-items: center; gap: 8px; font-size: 0.875rem; color: var(--sa-text-primary); }
    .plan-actions { display: flex; gap: 8px; margin-top: 16px; }
    .plan-actions .sa-btn { flex: 1; justify-content: center; }
    .form-row { display: grid; grid-template-columns: 1fr 1fr 1fr 1fr; gap: 12px; }
    .sa-btn-danger-ghost {
      background: transparent; color: var(--sa-danger); border: 1px solid #FECACA;
      padding: 8px 16px; border-radius: var(--sa-radius-md); cursor: pointer; font-size: 0.8125rem; font-weight: 600;
      transition: all .15s;
    }
    .sa-btn-danger-ghost:hover { background: var(--sa-danger-light); border-color: var(--sa-danger); }
    .delete-warning {
      display: flex; gap: 12px; padding: 16px;
      background: var(--sa-warning-light); border: 1px solid #FDE68A; border-radius: var(--sa-radius-md); margin-bottom: 16px;
    }
    .warning-icon { font-size: 1.5rem; }
    .delete-warning p { font-size: 0.8125rem; color: #92400E; margin-top: 4px; line-height: 1.5; }
  `
})
export class PlansComponent implements OnInit {
  plans = signal<PlanResponse[]>([]);
  showModal = signal(false);
  editId = signal<string | null>(null);
  form: PlanRequest = { name: '', description: '', price: 0, maxProducts: 0, maxOrdersMonth: 0, active: true, displayOrder: 0 };

  // Delete state
  showDeleteModal = signal(false);
  deletePlan = signal<PlanResponse | null>(null);
  deleteSubsCount = signal(0);
  otherPlans = signal<PlanResponse[]>([]);
  migrateToId = '';

  constructor(private api: ApiService, private toast: ToastService) { }

  ngOnInit(): void { this.loadPlans(); }

  loadPlans(): void {
    this.api.getPlans().subscribe(p => this.plans.set(p));
  }

  openCreate(): void {
    this.form = { name: '', description: '', price: 0, maxProducts: 0, maxOrdersMonth: 0, active: true, displayOrder: 0 };
    this.editId.set(null);
    this.showModal.set(true);
  }

  openEdit(plan: PlanResponse): void {
    this.form = { name: plan.name, description: plan.description, price: plan.price, maxProducts: plan.maxProducts, maxOrdersMonth: plan.maxOrdersMonth, active: plan.active, displayOrder: plan.displayOrder };
    this.editId.set(plan.id);
    this.showModal.set(true);
  }

  savePlan(): void {
    const obs = this.editId()
      ? this.api.updatePlan(this.editId()!, this.form)
      : this.api.createPlan(this.form);

    obs.subscribe({
      next: () => {
        this.toast.success(this.editId() ? 'Plano atualizado' : 'Plano criado');
        this.showModal.set(false);
        this.loadPlans();
      },
      error: () => this.toast.error('Erro ao salvar plano')
    });
  }

  startDelete(plan: PlanResponse): void {
    this.deletePlan.set(plan);
    this.migrateToId = '';
    this.deleteSubsCount.set(0);

    this.api.getPlanSubscriptionsCount(plan.id).subscribe({
      next: (res) => {
        this.deleteSubsCount.set(res.count);
        this.otherPlans.set(this.plans().filter(p => p.id !== plan.id && p.active));
        this.showDeleteModal.set(true);
      },
      error: () => this.toast.error('Erro ao verificar assinaturas')
    });
  }

  confirmDelete(): void {
    const plan = this.deletePlan();
    if (!plan) return;

    const migrateTo = this.deleteSubsCount() > 0 ? this.migrateToId : undefined;

    this.api.deletePlan(plan.id, migrateTo).subscribe({
      next: () => {
        const msg = this.deleteSubsCount() > 0
          ? `Plano excluído e ${this.deleteSubsCount()} assinatura(s) migrada(s)`
          : 'Plano excluído';
        this.toast.success(msg);
        this.showDeleteModal.set(false);
        this.loadPlans();
      },
      error: () => this.toast.error('Erro ao excluir plano')
    });
  }
}
