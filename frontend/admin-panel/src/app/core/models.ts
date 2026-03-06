export interface LoginRequest {
    email: string;
    password: string;
}

export interface LoginResponse {
    token: string;
    role: string;
    storeId: string;
    email: string;
    fullName: string;
}

export interface CategoryRequest {
    name: string;
    description?: string;
}

export interface CategoryResponse {
    id: string;
    name: string;
    description: string;
    storeId: string;
    createdAt: string;
    updatedAt: string;
}

export interface ProductRequest {
    name: string;
    description?: string;
    price: number;
    stockQuantity: number;
    imageUrl?: string;
    weightKg?: number;
    heightCm?: number;
    widthCm?: number;
    lengthCm?: number;
    active: boolean;
    categoryId: string;
}

export interface ProductResponse {
    id: string;
    name: string;
    description: string;
    price: number;
    stockQuantity: number;
    imageUrl: string;
    weightKg: number;
    heightCm: number;
    widthCm: number;
    lengthCm: number;
    active: boolean;
    categoryId: string;
    categoryName: string;
    storeId: string;
    createdAt: string;
    updatedAt: string;
}

export interface OrderItemResponse {
    id: string;
    productId: string;
    productName: string;
    quantity: number;
    unitPrice: number;
}

export interface OrderResponse {
    id: string;
    status: string;
    total: number;
    shippingCost: number;
    trackingCode: string;
    customerId: string;
    storeId: string;
    items: OrderItemResponse[];
    createdAt: string;
    updatedAt: string;
}

export interface DashboardResponse {
    totalOrders: number;
    ordersToday: number;
    pendingOrders: number;
    totalProducts: number;
    activeProducts: number;
    totalRevenue: number;
    recentOrders: RecentOrderDto[];
}

export interface RecentOrderDto {
    id: string;
    status: string;
    total: number;
    createdAt: string;
}

export interface Page<T> {
    content: T[];
    totalElements: number;
    totalPages: number;
    number: number;
    size: number;
    first: boolean;
    last: boolean;
}

export interface StoreSettingsRequest {
    name: string;
    slugUrl: string;
    primaryColor?: string;
    logoUrl?: string;
    bannerUrl?: string;
    mercadoPagoToken?: string;
    melhorEnvioToken?: string;
}

export interface StoreSettingsResponse {
    id: string;
    name: string;
    slugUrl: string;
    primaryColor: string;
    logoUrl: string;
    bannerUrl: string;
    mercadoPagoToken: string;
    melhorEnvioToken: string;
    active: boolean;
}

export interface CustomerSummaryResponse {
    customerId: string;
    fullName: string;
    email: string;
    phone: string;
    totalOrders: number;
    totalSpent: number;
    lastOrderDate: string;
}

export interface CustomerOrderResponse {
    orderId: string;
    status: string;
    total: number;
    createdAt: string;
    items: OrderItemResponse[];
}

export interface FinancialResponse {
    totalRevenue: number;
    revenueToday: number;
    revenueLast7Days: number;
    revenueLast30Days: number;
    totalOrders: number;
    ordersCompleted: number;
    ordersCancelled: number;
    ordersPending: number;
    averageOrderValue: number;
}

export interface MySubscriptionResponse {
    subscriptionId: string;
    status: string;
    startsAt: string;
    expiresAt: string;
    cancelledAt: string;
    planName: string;
    planDescription: string;
    planPrice: number;
    maxProducts: number;
    maxOrdersMonth: number;
}

export interface PlanResponse {
    id: string;
    name: string;
    description: string;
    price: number;
    maxProducts: number;
    maxOrdersMonth: number;
    active: boolean;
    displayOrder: number;
}

