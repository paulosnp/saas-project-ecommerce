import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/api.service';
import { ToastService } from '../../core/toast.service';
import { StoreSettingsRequest } from '../../core/models';
import { HttpClient } from '@angular/common/http';

@Component({
    selector: 'app-settings',
    standalone: true,
    imports: [FormsModule],
    template: `
    <div class="page-header">
      <div>
        <h1>Configurações da Loja</h1>
        <p>Gerencie a identidade visual e informações da sua loja</p>
      </div>
    </div>

    @if (loading()) {
      <div class="loading-overlay"><div class="spinner"></div></div>
    } @else {
      <form (ngSubmit)="save()" class="settings-form">
        <div class="form-grid">
          <!-- Dados da Loja -->
          <div class="card form-section">
            <h3>Dados da Loja</h3>
            <div class="fields">
              <div class="form-group">
                <label for="name">Nome da Loja</label>
                <input id="name" class="form-input" [(ngModel)]="form.name" name="name" required placeholder="Minha Loja Inc." />
              </div>
              <div class="form-group">
                <label for="slug">URL da Loja (Slug)</label>
                <div class="input-group">
                  <span class="prefix">loja.com/</span>
                  <input id="slug" class="form-input" [(ngModel)]="form.slugUrl" name="slug" required pattern="^[a-z0-9]+(-[a-z0-9]+)*$" placeholder="minha-loja" />
                </div>
                <small class="hint">Apenas letras minúsculas, números e hífens. Sem espaços.</small>
              </div>
              <div class="form-group">
                <label for="color">Cor Primária</label>
                <div class="color-picker-wrapper">
                  <input id="color" type="color" [(ngModel)]="form.primaryColor" name="color" class="color-input" />
                  <input type="text" [(ngModel)]="form.primaryColor" name="colorText" class="form-input" pattern="^#[0-9A-Fa-f]{6}$" placeholder="#000000" />
                </div>
              </div>
            </div>
          </div>

          <!-- Identidade Visual -->
          <div class="card form-section">
            <h3>Identidade Visual</h3>
            <div class="fields">
              <!-- Logo Upload -->
              <div class="form-group">
                <label>Logo da Loja</label>
                <div class="upload-area" (click)="logoInput.click()" (dragover)="onDragOver($event)" (drop)="onDrop($event, 'logo')">
                  @if (previews.logo) {
                    <div class="upload-preview logo-preview">
                      <img [src]="previews.logo" alt="Logo" />
                      <button type="button" class="remove-image" (click)="removeImage($event, 'logo')">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                      </button>
                    </div>
                  } @else {
                    <div class="upload-placeholder">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><image x="1" y="1" width="22" height="22" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>
                      <span>Upload Logo</span>
                    </div>
                  }
                  @if (uploading.logo) {
                    <div class="upload-progress"><div class="spinner-sm"></div></div>
                  }
                </div>
                <input #logoInput type="file" accept="image/*" (change)="onFileSelected($event, 'logo')" style="display:none" />
              </div>

              <!-- Banner Upload -->
              <div class="form-group">
                <label>Banner da Loja</label>
                <div class="upload-area banner-area" (click)="bannerInput.click()" (dragover)="onDragOver($event)" (drop)="onDrop($event, 'banner')">
                  @if (previews.banner) {
                    <div class="upload-preview banner-preview">
                      <img [src]="previews.banner" alt="Banner" />
                      <button type="button" class="remove-image" (click)="removeImage($event, 'banner')">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                      </button>
                    </div>
                  } @else {
                    <div class="upload-placeholder">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                      <span>Upload Banner</span>
                    </div>
                  }
                  @if (uploading.banner) {
                    <div class="upload-progress"><div class="spinner-sm"></div></div>
                  }
                </div>
                <input #bannerInput type="file" accept="image/*" (change)="onFileSelected($event, 'banner')" style="display:none" />
              </div>
            </div>
          </div>

          <!-- Integrações -->
          <div class="card form-section">
            <h3>Integrações</h3>
            <div class="fields">
              <div class="form-group">
                <label for="mp_token">Mercado Pago Token (Access Token)</label>
                <input id="mp_token" type="password" class="form-input" [(ngModel)]="form.mercadoPagoToken" name="mpToken" placeholder="APP_USR-..." />
              </div>
              <div class="form-group">
                <label for="me_token">Melhor Envio Token</label>
                <input id="me_token" type="password" class="form-input" [(ngModel)]="form.melhorEnvioToken" name="meToken" placeholder="Token de acesso..." />
              </div>
            </div>
          </div>
        </div>

        <div class="form-actions">
          <button type="submit" class="btn btn-primary" [disabled]="saving()">
            {{ saving() ? 'Salvando...' : 'Salvar Alterações' }}
          </button>
        </div>
      </form>
    }
  `,
    styles: [`
    .settings-form { max-width: 800px; }
    .form-grid { display: grid; gap: 24px; }
    .form-section h3 { font-size: 1.1rem; font-weight: 600; margin-bottom: 16px; border-bottom: 1px solid var(--border); padding-bottom: 8px; }
    .fields { display: flex; flex-direction: column; gap: 16px; }

    .input-group { display: flex; align-items: center; border: 1px solid var(--border); border-radius: var(--radius-md); overflow: hidden; }
    .input-group .prefix { background: var(--bg-secondary); padding: 0 12px; color: var(--text-secondary); font-size: 0.875rem; border-right: 1px solid var(--border); display: flex; align-items: center; height: 38px;}
    .input-group input { border: none; border-radius: 0; flex: 1; box-shadow: none; }
    .input-group:focus-within { border-color: var(--primary); ring: 2px solid var(--primary-light); }

    .color-picker-wrapper { display: flex; gap: 8px; align-items: center; }
    .color-input { width: 40px; height: 40px; border: none; padding: 0; background: none; cursor: pointer; }

    .upload-area {
      border: 2px dashed var(--border);
      border-radius: var(--radius-md);
      cursor: pointer;
      position: relative;
      overflow: hidden;
      transition: all 0.2s;
      min-height: 100px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: var(--bg-secondary);
    }
    .upload-area:hover { border-color: var(--primary); background: var(--bg-surface); }
    .banner-area { min-height: 150px; }

    .upload-placeholder { display: flex; flex-direction: column; align-items: center; gap: 8px; color: var(--text-muted); padding: 20px; }
    .upload-placeholder span { font-size: 0.875rem; font-weight: 500; }

    .upload-preview { width: 100%; display: flex; justify-content: center; padding: 10px; position: relative; }
    .upload-preview img { max-width: 100%; object-fit: contain; border-radius: var(--radius-sm); }
    .logo-preview img { max-height: 80px; }
    .banner-preview img { max-height: 130px; }

    .remove-image {
      position: absolute; top: 6px; right: 6px;
      width: 24px; height: 24px;
      background: rgba(0,0,0,0.6); color: white;
      border: none; border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      cursor: pointer;
    }
    .remove-image:hover { background: var(--danger); }

    .upload-progress { position: absolute; inset: 0; background: rgba(255,255,255,0.8); display: flex; align-items: center; justify-content: center; }
    .spinner-sm { width: 20px; height: 20px; border: 2px solid var(--border); border-top-color: var(--primary); border-radius: 50%; animation: spin 0.8s linear infinite; }

    .form-actions { margin-top: 24px; display: flex; justify-content: flex-end; }
  `]
})
export class SettingsComponent implements OnInit {
    private api = inject(ApiService);
    private toast = inject(ToastService);
    private http = inject(HttpClient);

    loading = signal(true);
    saving = signal(false);

    form: StoreSettingsRequest = {
        name: '', slugUrl: '', primaryColor: '#000000',
        logoUrl: '', bannerUrl: '', mercadoPagoToken: '', melhorEnvioToken: ''
    };

    previews = { logo: '', banner: '' };
    uploading = { logo: false, banner: false };

    ngOnInit() {
        this.loadSettings();
    }

    loadSettings() {
        this.api.getStoreSettings().subscribe({
            next: (data) => {
                this.form = {
                    name: data.name,
                    slugUrl: data.slugUrl,
                    primaryColor: data.primaryColor,
                    logoUrl: data.logoUrl,
                    bannerUrl: data.bannerUrl,
                    mercadoPagoToken: data.mercadoPagoToken,
                    melhorEnvioToken: data.melhorEnvioToken
                };
                this.previews.logo = data.logoUrl || '';
                this.previews.banner = data.bannerUrl || '';
                this.loading.set(false);
            },
            error: () => {
                this.toast.error('Erro ao carregar configurações');
                this.loading.set(false);
            }
        });
    }

    onFileSelected(event: Event, type: 'logo' | 'banner') {
        const input = event.target as HTMLInputElement;
        if (input.files && input.files[0]) this.uploadFile(input.files[0], type);
    }

    onDragOver(event: DragEvent) {
        event.preventDefault(); event.stopPropagation();
    }

    onDrop(event: DragEvent, type: 'logo' | 'banner') {
        event.preventDefault(); event.stopPropagation();
        if (event.dataTransfer?.files?.[0]) this.uploadFile(event.dataTransfer.files[0], type);
    }

    uploadFile(file: File, type: 'logo' | 'banner') {
        if (file.size > 5 * 1024 * 1024) {
            this.toast.warning('Imagem muito grande (máx 5MB)');
            return;
        }

        this.uploading[type] = true;
        const formData = new FormData();
        formData.append('file', file);

        this.http.post<{ imageUrl: string }>('/api/admin/upload', formData).subscribe({
            next: (res) => {
                if (type === 'logo') {
                    this.form.logoUrl = res.imageUrl;
                    this.previews.logo = res.imageUrl;
                } else {
                    this.form.bannerUrl = res.imageUrl;
                    this.previews.banner = res.imageUrl;
                }
                this.uploading[type] = false;
                this.toast.success('Upload concluído!');
            },
            error: () => {
                this.toast.error('Erro ao enviar imagem');
                this.uploading[type] = false;
            }
        });
    }

    removeImage(event: Event, type: 'logo' | 'banner') {
        event.stopPropagation();
        if (type === 'logo') {
            this.form.logoUrl = '';
            this.previews.logo = '';
        } else {
            this.form.bannerUrl = '';
            this.previews.banner = '';
        }
    }

    save() {
        this.saving.set(true);
        this.api.updateStoreSettings(this.form).subscribe({
            next: () => {
                this.toast.success('Configurações salvas com sucesso!');
                this.saving.set(false);
            },
            error: (err) => {
                console.error(err);
                this.toast.error('Erro ao salvar alterações');
                this.saving.set(false);
            }
        });
    }
}
