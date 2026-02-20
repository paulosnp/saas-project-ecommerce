import { Component, OnInit, signal, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';

interface PlanResponse {
  id: string;
  name: string;
  description: string;
  price: number;
  maxProducts: number;
  maxOrdersMonth: number;
  active: boolean;
}

@Component({
  selector: 'app-plans',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="plans-page">
      <div class="plans-header">
        <a routerLink="/login" class="back-link">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
          </svg>
          Voltar ao login
        </a>
        <div class="header-content">
          <div class="plans-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
              <line x1="3" y1="6" x2="21" y2="6"/>
              <path d="M16 10a4 4 0 0 1-8 0"/>
            </svg>
          </div>
          <h1>Escolha seu plano</h1>
          <p>Comece a vender online hoje mesmo. Escolha o plano ideal para o seu negócio.</p>
        </div>
      </div>

      @if (loading()) {
        <div class="loading"><div class="spinner"></div></div>
      } @else {
        <div class="plans-grid" [class.grid-2]="plans().length === 2" [class.grid-4]="plans().length >= 4">
          @for (plan of plans(); track plan.id; let i = $index) {
            <div class="plan-card" [class.highlight]="isHighlighted(i)">
              @if (isHighlighted(i)) {
                <div class="plan-badge">Mais popular</div>
              }
              <div class="plan-header">
                <h2>{{ plan.name }}</h2>
                @if (plan.description) {
                  <p class="plan-desc">{{ plan.description }}</p>
                }
              </div>
              <div class="plan-price">
                <span class="currency">R$</span>
                <span class="amount">{{ formatPrice(plan.price) }}</span>
                <span class="period">/ mês</span>
              </div>
              <ul class="plan-features">
                <li>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                  {{ plan.maxProducts === -1 ? 'Produtos ilimitados' : 'Até ' + plan.maxProducts + ' produtos' }}
                </li>
                <li>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                  {{ plan.maxOrdersMonth === -1 ? 'Pedidos ilimitados' : 'Até ' + plan.maxOrdersMonth + ' pedidos/mês' }}
                </li>
                <li>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                  Integração Mercado Pago
                </li>
                <li>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                  Loja virtual personalizada
                </li>
                <li>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                  Suporte por e-mail
                </li>
              </ul>
              <a [routerLink]="['/register']" [queryParams]="{ plan: plan.id }" class="btn" [class]="isHighlighted(i) ? 'btn-primary' : 'btn-secondary'" style="width:100%">
                Começar agora
              </a>
            </div>
          }
        </div>
      }

      <p class="plans-footer">
        Todos os planos incluem suporte por e-mail. Cancele a qualquer momento.
      </p>
    </div>
  `,
  styles: [`
    .plans-page {
      min-height: 100vh;
      background: var(--bg-page);
      padding: 40px 24px;
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    .plans-header {
      width: 100%;
      max-width: 1100px;
      margin-bottom: 40px;
    }

    .back-link {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      font-size: 0.875rem;
      color: var(--text-secondary);
      text-decoration: none;
      margin-bottom: 24px;
      transition: color 0.15s ease;
    }

    .back-link:hover { color: var(--primary); }

    .header-content { text-align: center; }

    .plans-icon {
      width: 60px;
      height: 60px;
      background: linear-gradient(135deg, var(--primary) 0%, var(--primary-hover) 100%);
      border-radius: var(--radius-lg);
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      margin: 0 auto 16px;
    }

    .header-content h1 {
      font-size: 2rem;
      font-weight: 800;
      color: var(--text-primary);
      margin-bottom: 8px;
      letter-spacing: -0.03em;
    }

    .header-content p {
      font-size: 1rem;
      color: var(--text-secondary);
      max-width: 480px;
      margin: 0 auto;
    }

    .loading {
      display: flex;
      justify-content: center;
      padding: 60px;
    }

    .spinner {
      width: 40px;
      height: 40px;
      border: 3px solid var(--border);
      border-top-color: var(--primary);
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }

    @keyframes spin { to { transform: rotate(360deg); } }

    .plans-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 24px;
      max-width: 1100px;
      width: 100%;
    }

    .plans-grid.grid-2 { grid-template-columns: repeat(2, 1fr); max-width: 700px; }
    .plans-grid.grid-4 { grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); }

    .plan-card {
      position: relative;
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: var(--radius-xl);
      padding: 32px 28px;
      display: flex;
      flex-direction: column;
      transition: all 0.2s ease;
      box-shadow: var(--shadow-sm);
    }

    .plan-card:hover {
      transform: translateY(-4px);
      box-shadow: var(--shadow-lg);
    }

    .plan-card.highlight {
      border-color: var(--primary);
      box-shadow: 0 0 0 1px var(--primary), var(--shadow-md);
      transform: scale(1.04);
    }

    .plan-card.highlight:hover {
      transform: scale(1.04) translateY(-4px);
    }

    .plan-badge {
      position: absolute;
      top: -12px;
      left: 50%;
      transform: translateX(-50%);
      background: var(--primary);
      color: white;
      font-size: 0.75rem;
      font-weight: 700;
      padding: 4px 16px;
      border-radius: var(--radius-full);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .plan-header { margin-bottom: 20px; }

    .plan-header h2 {
      font-size: 1.25rem;
      font-weight: 700;
      color: var(--text-primary);
      margin-bottom: 4px;
    }

    .plan-desc {
      font-size: 0.8125rem;
      color: var(--text-secondary);
    }

    .plan-price {
      display: flex;
      align-items: baseline;
      gap: 2px;
      margin-bottom: 24px;
      padding-bottom: 24px;
      border-bottom: 1px solid var(--border);
    }

    .currency {
      font-size: 1.125rem;
      font-weight: 600;
      color: var(--text-secondary);
    }

    .amount {
      font-size: 3rem;
      font-weight: 800;
      color: var(--text-primary);
      line-height: 1;
      letter-spacing: -0.04em;
    }

    .period {
      font-size: 0.875rem;
      color: var(--text-muted);
      margin-left: 4px;
    }

    .plan-features {
      list-style: none;
      padding: 0;
      margin: 0 0 28px;
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .plan-features li {
      display: flex;
      align-items: center;
      gap: 10px;
      font-size: 0.875rem;
      color: var(--text-primary);
    }

    .plan-features li svg {
      color: var(--success);
      flex-shrink: 0;
    }

    .plans-footer {
      margin-top: 32px;
      font-size: 0.8125rem;
      color: var(--text-muted);
      text-align: center;
    }

    @media (max-width: 768px) {
      .plans-grid {
        grid-template-columns: 1fr;
        max-width: 400px;
      }

      .plan-card.highlight {
        transform: none;
      }

      .plan-card.highlight:hover {
        transform: translateY(-4px);
      }
    }
  `]
})
export class PlansComponent implements OnInit {
  private http = inject(HttpClient);

  plans = signal<PlanResponse[]>([]);
  loading = signal(true);

  ngOnInit() {
    this.http.get<PlanResponse[]>('/api/auth/plans').subscribe({
      next: (plans) => {
        // Filter out FREE plan (price 0) from display, sort by price
        const displayPlans = plans
          .filter(p => p.price > 0)
          .sort((a, b) => a.price - b.price);
        this.plans.set(displayPlans);
        this.loading.set(false);
      },
      error: () => { this.loading.set(false); }
    });
  }

  isHighlighted(index: number): boolean {
    // Highlight the middle plan (most popular)
    const len = this.plans().length;
    if (len <= 2) return index === len - 1;
    return index === Math.floor(len / 2);
  }

  formatPrice(price: number): string {
    return Math.floor(price).toString();
  }
}
