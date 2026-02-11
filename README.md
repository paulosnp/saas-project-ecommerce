# 🛒 SaaS Multi-tenant E-commerce Platform

Plataforma SaaS onde pequenos comerciantes criam suas próprias lojas virtuais.

## 📐 Arquitetura

```
saas-project-ecommerce/
├── database/               → Scripts DDL (Flyway)
├── backend/                → Java 17+ / Spring Boot 3 (API REST)
├── frontend/
│   ├── admin-panel/        → Angular 17+ (Painel do Lojista)
│   └── storefront/         → Angular 17+ (Loja Virtual do Cliente)
└── README.md
```

## 🛠️ Tech Stack

| Camada      | Tecnologias                                     |
|:------------|:------------------------------------------------|
| Backend     | Java 17+, Spring Boot 3, Spring Security (JWT), Spring Data JPA, Lombok |
| Database    | PostgreSQL (Multi-tenant: schema compartilhado, coluna `store_id`)      |
| Frontend    | Angular 17+ (Standalone Components)             |
| Pagamentos  | Mercado Pago (Split de pagamento)                |
| Frete       | Melhor Envio (Cotação de frete)                  |

## 🗄️ Modelagem de Dados

| Tabela         | Descrição                                    |
|:---------------|:---------------------------------------------|
| `stores`       | Lojas (tenant raiz)                          |
| `users`        | Usuários (ADMIN_LOJA e CLIENTE)              |
| `categories`   | Categorias de produto por loja               |
| `products`     | Produtos com estoque e dimensões             |
| `orders`       | Pedidos com status e rastreio                |
| `order_items`  | Itens do pedido (N:N entre orders/products)  |
| `addresses`    | Endereços de entrega do cliente              |

> **Isolamento Multi-tenant:** Trigger functions garantem que produtos só referenciam categorias da mesma loja.

## 🚀 Fases do Projeto

- [x] **Fase 1** — Modelagem de Dados e Configuração (DDL)
- [ ] **Fase 2** — Backend: Entidades JPA e Repositórios
- [ ] **Fase 3** — Backend: Autenticação e Segurança (JWT)
- [ ] **Fase 4** — Backend: CRUD de Produtos e Categorias
- [ ] **Fase 5** — Backend: Pedidos e Integrações (Mercado Pago, Melhor Envio)
- [ ] **Fase 6** — Frontend: Admin Panel
- [ ] **Fase 7** — Frontend: Storefront