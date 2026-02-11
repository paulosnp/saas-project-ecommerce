import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
    CategoryRequest, CategoryResponse,
    ProductRequest, ProductResponse,
    OrderResponse, DashboardResponse, Page
} from './models';

@Injectable({ providedIn: 'root' })
export class ApiService {

    constructor(private http: HttpClient) { }

    // Dashboard
    getDashboard(): Observable<DashboardResponse> {
        return this.http.get<DashboardResponse>('/api/admin/dashboard');
    }

    // Categories
    getCategories(): Observable<CategoryResponse[]> {
        return this.http.get<CategoryResponse[]>('/api/admin/categories');
    }

    getCategoryById(id: string): Observable<CategoryResponse> {
        return this.http.get<CategoryResponse>(`/api/admin/categories/${id}`);
    }

    createCategory(data: CategoryRequest): Observable<CategoryResponse> {
        return this.http.post<CategoryResponse>('/api/admin/categories', data);
    }

    updateCategory(id: string, data: CategoryRequest): Observable<CategoryResponse> {
        return this.http.put<CategoryResponse>(`/api/admin/categories/${id}`, data);
    }

    deleteCategory(id: string): Observable<void> {
        return this.http.delete<void>(`/api/admin/categories/${id}`);
    }

    // Products
    getProducts(page = 0, size = 20): Observable<Page<ProductResponse>> {
        const params = new HttpParams().set('page', page).set('size', size);
        return this.http.get<Page<ProductResponse>>('/api/admin/products', { params });
    }

    getProductById(id: string): Observable<ProductResponse> {
        return this.http.get<ProductResponse>(`/api/admin/products/${id}`);
    }

    createProduct(data: ProductRequest): Observable<ProductResponse> {
        return this.http.post<ProductResponse>('/api/admin/products', data);
    }

    updateProduct(id: string, data: ProductRequest): Observable<ProductResponse> {
        return this.http.put<ProductResponse>(`/api/admin/products/${id}`, data);
    }

    deleteProduct(id: string): Observable<void> {
        return this.http.delete<void>(`/api/admin/products/${id}`);
    }

    // Orders
    getOrders(page = 0, size = 20): Observable<Page<OrderResponse>> {
        const params = new HttpParams().set('page', page).set('size', size);
        return this.http.get<Page<OrderResponse>>('/api/admin/orders', { params });
    }

    getOrderById(id: string): Observable<OrderResponse> {
        return this.http.get<OrderResponse>(`/api/admin/orders/${id}`);
    }

    updateOrderStatus(id: string, status: string): Observable<OrderResponse> {
        return this.http.put<OrderResponse>(`/api/admin/orders/${id}/status`, { status });
    }
}
