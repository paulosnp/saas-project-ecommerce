import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/api.service';
import { ToastService } from '../../core/toast.service';
import { PlatformSettings } from '../../core/models';

@Component({
    selector: 'app-settings',
    standalone: true,
    imports: [FormsModule],
    template: `
    <div class="sa-page-header">
      <h1 class="sa-page-title">Configurações</h1>
      <p class="sa-page-subtitle">Configurações gerais da plataforma</p>
    </div>

    <div class="settings-grid">
      <div class="sa-card">
        <div class="sa-card-header">
          <h2 class="sa-card-title">💳 Mercado Pago</h2>
          <span class="sa-badge" [class]="settings()?.mercadoPagoConfigured ? 'sa-badge-active' : 'sa-badge-cancelled'">
            {{ settings()?.mercadoPagoConfigured ? 'Configurado' : 'Não configurado' }}
          </span>
        </div>

        <p class="settings-desc">
          Configure o Access Token da sua conta Mercado Pago. O dinheiro das assinaturas dos lojistas cairá nesta conta.
        </p>

        <div class="sa-form-group">
          <label class="sa-label">Access Token</label>
          <div class="token-input-row">
            <input
              class="sa-input"
              [type]="showToken() ? 'text' : 'password'"
              [(ngModel)]="newToken"
              [placeholder]="settings()?.mercadoPagoToken || 'Cole aqui seu Access Token do Mercado Pago'"
            >
            <button class="sa-btn sa-btn-ghost sa-btn-sm" (click)="showToken.set(!showToken())">
              {{ showToken() ? '🙈' : '👁️' }}
            </button>
          </div>
        </div>

        <div class="settings-actions">
          <button class="sa-btn sa-btn-primary" (click)="saveToken()" [disabled]="!newToken || saving()">
            {{ saving() ? 'Salvando...' : 'Salvar Token' }}
          </button>
        </div>

        <div class="info-box">
          <h4>📌 Como obter o Access Token:</h4>
          <ol>
            <li>Acesse <a href="https://www.mercadopago.com.br/developers" target="_blank">Mercado Pago Developers</a></li>
            <li>Vá em <strong>Suas integrações</strong> → selecione sua aplicação</li>
            <li>Copie o <strong>Access Token</strong> (começa com <code>TEST-</code> ou <code>APP_USR-</code>)</li>
            <li>Cole no campo acima e clique em Salvar</li>
          </ol>
        </div>
      </div>

      <div class="sa-card">
        <div class="sa-card-header">
          <h2 class="sa-card-title">🔗 URLs de Webhook</h2>
        </div>
        <p class="settings-desc">Configure estas URLs no painel do Mercado Pago para receber notificações de pagamento.</p>
        <div class="webhook-list">
          <div class="webhook-item">
            <span class="webhook-label">Pedidos:</span>
            <code>https://seudominio.com/api/webhooks/mercadopago/orders?storeId=ID_DA_LOJA</code>
          </div>
          <div class="webhook-item">
            <span class="webhook-label">Assinaturas:</span>
            <code>https://seudominio.com/api/webhooks/mercadopago/subscriptions</code>
          </div>
        </div>
      </div>
    </div>
  `,
    styles: `
    .settings-grid { display: flex; flex-direction: column; gap: 20px; max-width: 700px; }
    .settings-desc { font-size: 14px; color: #64748b; margin-bottom: 20px; line-height: 1.6; }
    .token-input-row { display: flex; gap: 8px; }
    .token-input-row .sa-input { flex: 1; font-family: monospace; font-size: 13px; }
    .settings-actions { margin-top: 8px; margin-bottom: 24px; }
    .info-box {
      background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 20px;
      font-size: 14px; line-height: 1.8;
    }
    .info-box h4 { margin-bottom: 8px; font-size: 14px; }
    .info-box ol { padding-left: 20px; }
    .info-box a { color: #7c3aed; font-weight: 600; }
    .info-box code { background: #e2e8f0; padding: 2px 6px; border-radius: 4px; font-size: 12px; }
    .webhook-list { display: flex; flex-direction: column; gap: 12px; }
    .webhook-item { display: flex; flex-direction: column; gap: 4px; }
    .webhook-label { font-size: 13px; font-weight: 600; color: #475569; }
    .webhook-item code { background: #f1f5f9; padding: 8px 12px; border-radius: 6px; font-size: 12px; word-break: break-all; }
  `
})
export class SettingsComponent implements OnInit {
    settings = signal<PlatformSettings | null>(null);
    newToken = '';
    showToken = signal(false);
    saving = signal(false);

    constructor(private api: ApiService, private toast: ToastService) { }

    ngOnInit(): void {
        this.api.getSettings().subscribe(s => this.settings.set(s));
    }

    saveToken(): void {
        if (!this.newToken.trim()) return;
        this.saving.set(true);
        this.api.updateSettings({ mercadoPagoToken: this.newToken }).subscribe({
            next: (s) => {
                this.settings.set(s);
                this.newToken = '';
                this.saving.set(false);
                this.toast.success('Token salvo com sucesso!');
            },
            error: () => {
                this.saving.set(false);
                this.toast.error('Erro ao salvar token');
            }
        });
    }
}
