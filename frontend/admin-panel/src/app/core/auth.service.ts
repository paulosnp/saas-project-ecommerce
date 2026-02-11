import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { LoginRequest, LoginResponse } from './models';
import { tap } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
    private userSignal = signal<LoginResponse | null>(this.loadUser());

    user = this.userSignal.asReadonly();
    isAuthenticated = computed(() => !!this.userSignal());
    userName = computed(() => this.userSignal()?.fullName ?? '');

    constructor(private http: HttpClient, private router: Router) { }

    login(request: LoginRequest) {
        return this.http.post<LoginResponse>('/api/auth/login', request).pipe(
            tap(res => {
                localStorage.setItem('admin-user', JSON.stringify(res));
                localStorage.setItem('admin-token', res.token);
                this.userSignal.set(res);
            })
        );
    }

    logout(): void {
        localStorage.removeItem('admin-user');
        localStorage.removeItem('admin-token');
        this.userSignal.set(null);
        this.router.navigate(['/login']);
    }

    getToken(): string | null {
        return localStorage.getItem('admin-token');
    }

    private loadUser(): LoginResponse | null {
        const data = localStorage.getItem('admin-user');
        if (!data) return null;
        try { return JSON.parse(data); }
        catch { return null; }
    }
}
