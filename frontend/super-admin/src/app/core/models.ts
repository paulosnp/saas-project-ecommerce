export interface LoginRequest { email: string; password: string; }

export interface LoginResponse {
    token: string;
    userId: string;
    name: string;
    email: string;
    role: string;
    storeId?: string;
}

export interface StoreResponse {
    id: string;
    name: string;
    slugUrl: string;
    bannerUrl: string;
    logoUrl: string;
    primaryColor: string;
    active: boolean;
    currentPlan: string;
    subscriptionStatus: string;
    createdAt: string;
}

export interface SubscriptionResponse {
    id: string;
    storeId: string;
    storeName: string;
    planId: string;
    planName: string;
    status: string;
    startsAt: string;
    expiresAt: string;
    cancelledAt: string;
    createdAt: string;
}

export interface PlanResponse {
    id: string;
    name: string;
    description: string;
    price: number;
    maxProducts: number;
    maxOrdersMonth: number;
    active: boolean;
}

export interface PlanRequest {
    name: string;
    description: string;
    price: number;
    maxProducts: number;
    maxOrdersMonth: number;
    active: boolean;
}

export interface DashboardData {
    totalStores: number;
    activeStores: number;
    activeSubscriptions: number;
    trialSubscriptions: number;
    cancelledSubscriptions: number;
    expiredSubscriptions: number;
    monthlyRevenue: number;
    planDistribution: Record<string, number>;
}

export interface PlatformSettings {
    mercadoPagoToken: string;
    mercadoPagoConfigured: boolean;
}

export interface Page<T> {
    content: T[];
    totalElements: number;
    totalPages: number;
    number: number;
    size: number;
}
