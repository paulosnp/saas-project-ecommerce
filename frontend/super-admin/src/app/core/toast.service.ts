import { Injectable, signal } from '@angular/core';

export interface Toast {
    id: number;
    message: string;
    type: 'success' | 'error' | 'warning';
}

@Injectable({ providedIn: 'root' })
export class ToastService {
    toasts = signal<Toast[]>([]);
    private counter = 0;

    success(message: string): void { this.add(message, 'success'); }
    error(message: string): void { this.add(message, 'error'); }
    warning(message: string): void { this.add(message, 'warning'); }

    remove(id: number): void {
        this.toasts.update(list => list.filter(t => t.id !== id));
    }

    private add(message: string, type: Toast['type']): void {
        const id = ++this.counter;
        this.toasts.update(list => [...list, { id, message, type }]);
        setTimeout(() => this.remove(id), 4000);
    }
}
