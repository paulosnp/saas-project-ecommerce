import { Routes } from '@angular/router';
import { authGuard } from './core/auth.guard';

export const routes: Routes = [
    { path: 'login', loadComponent: () => import('./features/login/login.component').then(m => m.LoginComponent) },
    {
        path: '',
        loadComponent: () => import('./layout/layout.component').then(m => m.LayoutComponent),
        canActivate: [authGuard],
        children: [
            { path: 'dashboard', loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent) },
            { path: 'stores', loadComponent: () => import('./features/stores/stores.component').then(m => m.StoresComponent) },
            { path: 'subscriptions', loadComponent: () => import('./features/subscriptions/subscriptions.component').then(m => m.SubscriptionsComponent) },
            { path: 'plans', loadComponent: () => import('./features/plans/plans.component').then(m => m.PlansComponent) },
            { path: 'settings', loadComponent: () => import('./features/settings/settings.component').then(m => m.SettingsComponent) },
            { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
        ]
    },
    { path: '**', redirectTo: 'login' }
];
