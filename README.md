# 🛒 SaaS Multi-tenant E-commerce Platform

Plataforma SaaS onde pequenos comerciantes criam suas próprias lojas virtuais.

## 📐 Arquitetura

```
saas-project-ecommerce/
├── database/               → Scripts DDL (Flyway)
├── backend/                → Java 21 / Spring Boot 3.2+ (API REST)
├── frontend/
│   ├── admin-panel/        → Angular 17+ (Painel do Lojista)
│   ├── storefront/         → Angular 17+ (Loja Virtual do Cliente)
│   └── super-admin/        → Angular 17+ (Painel do Dono da Plataforma)
└── README.md
```

## 🛠️ Tech Stack

| Camada      | Tecnologias                                     |
|:------------|:------------------------------------------------|
| Backend     | Java 21, Spring Boot 3.2+, Spring Security (JWT RSA), Spring Data JPA, MapStruct, Lombok |
| Database    | PostgreSQL (Multi-tenant: Hibernate Filters + coluna `store_id`)      |
| Frontend    | Angular 17+ (Standalone Components)             |
| Pagamentos  | Mercado Pago (Split de pagamento)                |
| Frete       | Melhor Envio (Cotação de frete)                  |

## 🗄️ Modelagem de Dados

| Tabela          | Descrição                                    |
|:----------------|:---------------------------------------------|
| `stores`        | Lojas (tenant raiz)                          |
| `users`         | Usuários (SUPER_ADMIN, ADMIN_LOJA, CLIENTE)  |
| `categories`    | Categorias de produto por loja               |
| `products`      | Produtos com estoque e dimensões             |
| `orders`        | Pedidos com status e rastreio                |
| `order_items`   | Itens do pedido (N:N entre orders/products)  |
| `addresses`     | Endereços de entrega do cliente              |
| `plans`         | Planos de assinatura da plataforma           |
| `subscriptions` | Assinaturas das lojas (vínculo store ↔ plan) |

> **Isolamento Multi-tenant:** Trigger functions garantem que produtos só referenciam categorias da mesma loja.

## 🚀 Fases do Projeto

- [x] **Fase 1** — Modelagem de Dados e Configuração (DDL)
- [x] **Fase 2** — Backend: Entidades JPA e Repositórios
- [x] **Fase 3** — Backend: Autenticação e Segurança (JWT)
- [x] **Fase 4** — Backend: CRUD de Produtos e Categorias
- [x] **Fase 5** — Backend: Pedidos e Integrações (Mercado Pago, Melhor Envio)
- [ ] **Fase 6** — Frontend: Admin Panel (Painel do Lojista)
- [ ] **Fase 7** — Frontend: Super Admin (Gestão da Plataforma, Assinaturas, Planos)
- [ ] **Fase 8** — Frontend: Storefront (Loja Virtual do Cliente)
