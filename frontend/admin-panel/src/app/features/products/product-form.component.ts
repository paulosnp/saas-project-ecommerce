import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { ApiService } from '../../core/api.service';
import { ToastService } from '../../core/toast.service';
import { CategoryResponse, ProductRequest } from '../../core/models';

@Component({
  selector: 'app-product-form',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="page-header">
      <div>
        <h1>{{ isEdit ? 'Editar Produto' : 'Novo Produto' }}</h1>
        <p>{{ isEdit ? 'Atualize as informações do produto' : 'Preencha os dados do novo produto' }}</p>
      </div>
    </div>

    @if (loadingData()) {
      <div class="loading-overlay"><div class="spinner"></div></div>
    } @else {
      <form (ngSubmit)="save()" class="product-form">
        <div class="form-grid">
          <div class="card form-section">
            <h3>Informações Básicas</h3>
            <div class="fields">
              <div class="form-group">
                <label for="name">Nome do produto</label>
                <input id="name" class="form-input" [(ngModel)]="form.name" name="name" required placeholder="Ex: Camiseta Básica" />
              </div>
              <div class="form-group">
                <label for="description">Descrição</label>
                <textarea id="description" class="form-input" [(ngModel)]="form.description" name="description" rows="3" placeholder="Descreva o produto..."></textarea>
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label for="price">Preço (R$)</label>
                  <input id="price" type="number" step="0.01" min="0" class="form-input" [(ngModel)]="form.price" name="price" required />
                </div>
                <div class="form-group">
                  <label for="stock">Estoque</label>
                  <input id="stock" type="number" min="0" class="form-input" [(ngModel)]="form.stockQuantity" name="stockQuantity" required />
                </div>
              </div>
              <div class="form-group">
                <label for="category">Categoria</label>
                <select id="category" class="form-input" [(ngModel)]="form.categoryId" name="categoryId" required>
                  <option value="">Selecione...</option>
                  @for (cat of categories(); track cat.id) {
                    <option [value]="cat.id">{{ cat.name }}</option>
                  }
                </select>
              </div>

              <!-- Image Upload -->
              <div class="form-group">
                <label>Imagem do produto</label>
                <div class="upload-area" (click)="fileInput.click()" (dragover)="onDragOver($event)" (drop)="onDrop($event)">
                  @if (imagePreview()) {
                    <div class="upload-preview">
                      <img [src]="imagePreview()" alt="Preview" />
                      <button type="button" class="remove-image" (click)="removeImage($event)">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                      </button>
                    </div>
                  } @else {
                    <div class="upload-placeholder">
                      <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>
                      </svg>
                      <span>Clique ou arraste uma imagem</span>
                      <small>JPEG, PNG, WebP ou GIF (máx 5MB)</small>
                    </div>
                  }
                  @if (uploading()) {
                    <div class="upload-progress">
                      <div class="spinner" style="width:24px;height:24px;border-width:2px"></div>
                      <span>Enviando...</span>
                    </div>
                  }
                </div>
                <input #fileInput type="file" accept="image/jpeg,image/png,image/webp,image/gif" (change)="onFileSelected($event)" style="display:none" />
              </div>

              <div class="form-group">
                <label class="checkbox-label">
                  <input type="checkbox" [(ngModel)]="form.active" name="active" />
                  Produto ativo (visível na loja)
                </label>
              </div>
            </div>
          </div>

          <div class="card form-section">
            <h3>Dimensões e Peso</h3>
            <p class="section-hint">Necessário para cálculo de frete</p>
            <div class="fields">
              <div class="form-group">
                <label for="weight">Peso (kg)</label>
                <input id="weight" type="number" step="0.01" min="0" class="form-input" [(ngModel)]="form.weightKg" name="weightKg" />
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label for="height">Altura (cm)</label>
                  <input id="height" type="number" step="0.1" min="0" class="form-input" [(ngModel)]="form.heightCm" name="heightCm" />
                </div>
                <div class="form-group">
                  <label for="width">Largura (cm)</label>
                  <input id="width" type="number" step="0.1" min="0" class="form-input" [(ngModel)]="form.widthCm" name="widthCm" />
                </div>
              </div>
              <div class="form-group">
                <label for="length">Comprimento (cm)</label>
                <input id="length" type="number" step="0.1" min="0" class="form-input" [(ngModel)]="form.lengthCm" name="lengthCm" />
              </div>
            </div>
          </div>
        </div>

        <div class="form-actions">
          <button type="button" class="btn btn-secondary" (click)="cancel()">Cancelar</button>
          <button type="submit" class="btn btn-primary" [disabled]="saving()">
            {{ saving() ? 'Salvando...' : (isEdit ? 'Atualizar' : 'Criar Produto') }}
          </button>
        </div>
      </form>
    }
  `,
  styles: [`
    .product-form { max-width: 900px; }

    .form-grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: 20px;
    }

    .form-section h3 { font-size: 1rem; font-weight: 600; margin-bottom: 4px; }
    .section-hint { font-size: 0.8125rem; color: var(--text-secondary); margin-bottom: 16px; }
    .fields { display: flex; flex-direction: column; gap: 16px; margin-top: 16px; }
    .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }

    textarea.form-input { resize: vertical; min-height: 80px; }

    .checkbox-label {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 0.875rem;
      font-weight: 500;
      color: var(--text-primary);
      cursor: pointer;
    }

    .checkbox-label input[type="checkbox"] {
      width: 18px;
      height: 18px;
      accent-color: var(--primary);
    }

    .upload-area {
      position: relative;
      border: 2px dashed var(--border);
      border-radius: var(--radius-lg);
      cursor: pointer;
      transition: all 0.2s ease;
      overflow: hidden;
      min-height: 160px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .upload-area:hover {
      border-color: var(--primary);
      background: var(--primary-light);
    }

    .upload-placeholder {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
      padding: 24px;
      color: var(--text-muted);
    }

    .upload-placeholder span {
      font-size: 0.875rem;
      font-weight: 500;
      color: var(--text-secondary);
    }

    .upload-placeholder small {
      font-size: 0.75rem;
    }

    .upload-preview {
      position: relative;
      width: 100%;
      display: flex;
      justify-content: center;
      padding: 12px;
    }

    .upload-preview img {
      max-height: 200px;
      max-width: 100%;
      object-fit: contain;
      border-radius: var(--radius-md);
    }

    .remove-image {
      position: absolute;
      top: 8px;
      right: 8px;
      width: 28px;
      height: 28px;
      background: var(--danger);
      color: white;
      border: none;
      border-radius: var(--radius-full);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: transform 0.15s ease;
    }

    .remove-image:hover { transform: scale(1.1); }

    .upload-progress {
      position: absolute;
      inset: 0;
      background: rgba(255,255,255,0.85);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 8px;
      font-size: 0.8125rem;
      color: var(--text-secondary);
    }

    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      margin-top: 24px;
      padding-top: 24px;
      border-top: 1px solid var(--border);
    }
  `]
})
export class ProductFormComponent implements OnInit {
  private api = inject(ApiService);
  private toast = inject(ToastService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private http = inject(HttpClient);

  isEdit = false;
  productId = '';
  categories = signal<CategoryResponse[]>([]);
  loadingData = signal(true);
  saving = signal(false);
  uploading = signal(false);
  imagePreview = signal<string | null>(null);

  form: ProductRequest = {
    name: '', description: '', price: 0, stockQuantity: 0,
    imageUrl: '', weightKg: 0, heightCm: 0, widthCm: 0, lengthCm: 0,
    active: true, categoryId: ''
  };

  ngOnInit() {
    this.productId = this.route.snapshot.params['id'] || '';
    this.isEdit = !!this.productId && this.productId !== 'new';

    this.api.getCategories().subscribe({
      next: cats => {
        this.categories.set(cats);
        if (this.isEdit) {
          this.api.getProductById(this.productId).subscribe({
            next: p => {
              this.form = {
                name: p.name, description: p.description, price: p.price,
                stockQuantity: p.stockQuantity, imageUrl: p.imageUrl,
                weightKg: p.weightKg, heightCm: p.heightCm,
                widthCm: p.widthCm, lengthCm: p.lengthCm,
                active: p.active, categoryId: p.categoryId
              };
              if (p.imageUrl) {
                this.imagePreview.set(p.imageUrl);
              }
              this.loadingData.set(false);
            },
            error: () => { this.toast.error('Produto não encontrado'); this.router.navigate(['/products']); }
          });
        } else {
          this.loadingData.set(false);
        }
      },
      error: () => this.toast.error('Erro ao carregar categorias')
    });
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.uploadFile(input.files[0]);
    }
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    if (event.dataTransfer?.files && event.dataTransfer.files[0]) {
      this.uploadFile(event.dataTransfer.files[0]);
    }
  }

  uploadFile(file: File) {
    if (file.size > 5 * 1024 * 1024) {
      this.toast.warning('Imagem muito grande (máx 5MB)');
      return;
    }

    if (!['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(file.type)) {
      this.toast.warning('Formato inválido. Use JPEG, PNG, WebP ou GIF');
      return;
    }

    // Show local preview immediately
    const reader = new FileReader();
    reader.onload = (e) => {
      this.imagePreview.set(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    // Upload to backend
    this.uploading.set(true);
    const formData = new FormData();
    formData.append('file', file);

    this.http.post<{ imageUrl: string }>('/api/admin/upload', formData).subscribe({
      next: (res) => {
        this.form.imageUrl = res.imageUrl;
        this.imagePreview.set(res.imageUrl);
        this.uploading.set(false);
        this.toast.success('Imagem enviada!');
      },
      error: () => {
        this.uploading.set(false);
        this.toast.error('Erro ao enviar imagem');
      }
    });
  }

  removeImage(event: Event) {
    event.stopPropagation();
    this.form.imageUrl = '';
    this.imagePreview.set(null);
  }

  save() {
    if (!this.form.name || !this.form.categoryId) {
      this.toast.warning('Preencha os campos obrigatórios');
      return;
    }

    this.saving.set(true);
    const obs = this.isEdit
      ? this.api.updateProduct(this.productId, this.form)
      : this.api.createProduct(this.form);

    obs.subscribe({
      next: () => {
        this.toast.success(this.isEdit ? 'Produto atualizado!' : 'Produto criado!');
        this.router.navigate(['/products']);
      },
      error: () => { this.toast.error('Erro ao salvar produto'); this.saving.set(false); }
    });
  }

  cancel() { this.router.navigate(['/products']); }
}
