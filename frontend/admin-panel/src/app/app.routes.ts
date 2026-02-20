import { Routes } from '@angular/router';
import { authGuard } from './core/auth.guard';
import { LayoutComponent } from './layout/layout.component';

export const routes: Routes = [
    {
        path: 'login',
        loadComponent: () => import('./features/auth/login.component').then(m => m.LoginComponent)
    },
    {
        path: 'plans',
        loadComponent: () => import('./features/auth/plans.component').then(m => m.PlansComponent)
    },
    {
        path: 'register',
        loadComponent: () => import('./features/auth/register.component').then(m => m.RegisterComponent)
    },
    {
        path: '',
        component: LayoutComponent,
        canActivate: [authGuard],
        children: [
            { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
            {
                path: 'dashboard',
                loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent)
            },
            {
                path: 'categories',
                loadComponent: () => import('./features/categories/categories.component').then(m => m.CategoriesComponent)
            },
            {
                path: 'products',
                loadComponent: () => import('./features/products/products.component').then(m => m.ProductsComponent)
            },
            {
                path: 'products/new',
                loadComponent: () => import('./features/products/product-form.component').then(m => m.ProductFormComponent)
            },
            {
                path: 'products/:id/edit',
                loadComponent: () => import('./features/products/product-form.component').then(m => m.ProductFormComponent)
            },
            {
                path: 'orders',
                loadComponent: () => import('./features/orders/orders.component').then(m => m.OrdersComponent)
            },
            {
                path: 'customers',
                loadComponent: () => import('./features/customers/customers.component').then(m => m.CustomersComponent)
            },
            {
                path: 'financial',
                loadComponent: () => import('./features/financial/financial.component').then(m => m.FinancialComponent)
            },
            {
                path: 'subscription',
                loadComponent: () => import('./features/subscription/subscription.component').then(m => m.SubscriptionComponent)
            },
            {
                path: 'settings',
                loadComponent: () => import('./features/settings/settings.component').then(m => m.SettingsComponent)
            }
        ]
    },
    { path: '**', redirectTo: 'dashboard' }
];
