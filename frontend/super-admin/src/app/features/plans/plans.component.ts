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
            <div class="plan-limit"><span>📦</span> {{ plan.maxProducts }} produtos</div>
            <div class="plan-limit"><span>📋</span> {{ plan.maxOrdersMonth }} pedidos/mês</div>
          </div>
          <div class="plan-actions">
            <button class="sa-btn sa-btn-ghost" (click)="openEdit(plan)">✏️ Editar</button>
            <button class="sa-btn sa-btn-danger-ghost" (click)="startDelete(plan)">🗑️ Excluir</button>
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
                <span class="warning-icon">⚠️</span>
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
    .plan-name { font-size: 20px; font-weight: 700; }
    .plan-price { font-size: 28px; font-weight: 800; color: #7c3aed; margin-bottom: 8px; }
    .plan-price span { font-size: 14px; font-weight: 400; color: #94a3b8; }
    .plan-desc { font-size: 13px; color: #64748b; margin-bottom: 16px; }
    .plan-limits { display: flex; flex-direction: column; gap: 8px; }
    .plan-limit { display: flex; align-items: center; gap: 8px; font-size: 14px; color: #334155; }
    .plan-actions { display: flex; gap: 8px; margin-top: 16px; }
    .plan-actions .sa-btn { flex: 1; justify-content: center; }
    .form-row { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px; }
    .sa-btn-danger-ghost {
      background: transparent; color: #ef4444; border: 1px solid #fecaca;
      padding: 8px 16px; border-radius: 8px; cursor: pointer; font-size: 13px; font-weight: 600;
      transition: all .15s;
    }
    .sa-btn-danger-ghost:hover { background: #fef2f2; border-color: #ef4444; }
    .sa-btn-danger {
      background: #ef4444; color: white; border: none;
      padding: 10px 20px; border-radius: 8px; cursor: pointer; font-size: 14px; font-weight: 600;
      transition: all .15s;
    }
    .sa-btn-danger:hover { background: #dc2626; }
    .sa-btn-danger:disabled { opacity: .5; cursor: not-allowed; }
    .delete-warning {
      display: flex; gap: 12px; padding: 16px;
      background: #fffbeb; border: 1px solid #fde68a; border-radius: 8px; margin-bottom: 16px;
    }
    .warning-icon { font-size: 24px; }
    .delete-warning p { font-size: 13px; color: #92400e; margin-top: 4px; line-height: 1.5; }
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
