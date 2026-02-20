import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { LoginRequest, LoginResponse } from './models';

@Injectable({ providedIn: 'root' })
export class AuthService {
    private userData = signal<LoginResponse | null>(this.loadUser());
    user = this.userData.asReadonly();
    isLoggedIn = computed(() => !!this.userData());

    constructor(private http: HttpClient, private router: Router) { }

    login(credentials: LoginRequest) {
        return this.http.post<LoginResponse>('/api/auth/login', credentials);
    }

    handleLogin(response: LoginResponse): void {
        if (response.role !== 'SUPER_ADMIN') {
            throw new Error('Acesso restrito ao Super Admin');
        }
        localStorage.setItem('sa_token', response.token);
        localStorage.setItem('sa_user', JSON.stringify(response));
        this.userData.set(response);
        this.router.navigate(['/dashboard']);
    }

    logout(): void {
        localStorage.removeItem('sa_token');
        localStorage.removeItem('sa_user');
        this.userData.set(null);
        this.router.navigate(['/login']);
    }

    getToken(): string | null {
        return localStorage.getItem('sa_token');
    }

    private loadUser(): LoginResponse | null {
        const raw = localStorage.getItem('sa_user');
        return raw ? JSON.parse(raw) : null;
    }
}
