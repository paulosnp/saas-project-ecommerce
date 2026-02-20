import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
    DashboardData, StoreResponse, SubscriptionResponse,
    PlanResponse, PlanRequest, PlatformSettings, Page
} from './models';

@Injectable({ providedIn: 'root' })
export class ApiService {
    private base = '/api/super-admin';

    constructor(private http: HttpClient) { }

    // Dashboard
    getDashboard(): Observable<DashboardData> {
        return this.http.get<DashboardData>(`${this.base}/dashboard`);
    }

    // Stores
    getStores(page = 0, size = 20): Observable<Page<StoreResponse>> {
        const params = new HttpParams().set('page', page).set('size', size);
        return this.http.get<Page<StoreResponse>>(`${this.base}/stores`, { params });
    }

    getStore(id: string): Observable<StoreResponse> {
        return this.http.get<StoreResponse>(`${this.base}/stores/${id}`);
    }

    toggleStoreStatus(id: string, active: boolean): Observable<StoreResponse> {
        return this.http.put<StoreResponse>(`${this.base}/stores/${id}/status`, { active });
    }

    // Subscriptions
    getSubscriptions(page = 0, size = 20): Observable<Page<SubscriptionResponse>> {
        const params = new HttpParams().set('page', page).set('size', size);
        return this.http.get<Page<SubscriptionResponse>>(`${this.base}/subscriptions`, { params });
    }

    updateSubscriptionStatus(id: string, status: string): Observable<SubscriptionResponse> {
        return this.http.put<SubscriptionResponse>(`${this.base}/subscriptions/${id}/status`, { status });
    }

    // Plans
    getPlans(): Observable<PlanResponse[]> {
        return this.http.get<PlanResponse[]>(`${this.base}/plans`);
    }

    createPlan(plan: PlanRequest): Observable<PlanResponse> {
        return this.http.post<PlanResponse>(`${this.base}/plans`, plan);
    }

    updatePlan(id: string, plan: PlanRequest): Observable<PlanResponse> {
        return this.http.put<PlanResponse>(`${this.base}/plans/${id}`, plan);
    }

    getPlanSubscriptionsCount(id: string): Observable<{ count: number }> {
        return this.http.get<{ count: number }>(`${this.base}/plans/${id}/subscriptions-count`);
    }

    deletePlan(id: string, migrateTo?: string): Observable<void> {
        const params = migrateTo ? `?migrateTo=${migrateTo}` : '';
        return this.http.delete<void>(`${this.base}/plans/${id}${params}`);
    }

    // Settings
    getSettings(): Observable<PlatformSettings> {
        return this.http.get<PlatformSettings>(`${this.base}/settings`);
    }

    updateSettings(settings: Record<string, string>): Observable<PlatformSettings> {
        return this.http.put<PlatformSettings>(`${this.base}/settings`, settings);
    }
}
