import { Injectable, signal, effect } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ThemeService {
    theme = signal<'light' | 'dark'>(this.loadTheme());

    constructor() {
        effect(() => {
            const t = this.theme();
            document.documentElement.setAttribute('data-theme', t);
            localStorage.setItem('admin-theme', t);
        });
    }

    toggle(): void {
        this.theme.update(t => t === 'light' ? 'dark' : 'light');
    }

    private loadTheme(): 'light' | 'dark' {
        const saved = localStorage.getItem('admin-theme');
        if (saved === 'dark' || saved === 'light') return saved;
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
}
