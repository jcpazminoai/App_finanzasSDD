# Backend

Backend de la app de finanzas personales.

## Stack objetivo

- NestJS
- GraphQL
- Prisma
- PostgreSQL

## Enfoque arquitectonico

La estructura sigue una base de arquitectura hexagonal:

- `src/modules`: modulos de negocio
- `src/shared`: piezas transversales
- `src/modules/*/domain`: reglas y contratos de dominio
- `src/modules/*/application`: casos de uso
- `src/modules/*/infrastructure`: adaptadores de entrada y salida

## Estado actual

El backend MVP principal ya esta implementado con:

- autenticacion
- cuentas
- categorias
- transacciones
- resumen mensual
- pruebas unitarias
- pruebas de integracion con base separada de test

## Ejecucion local

### Requisitos

- Docker con el contenedor PostgreSQL levantado
- archivo `.env` en la raiz del repo

### Comandos utiles

Desde `app_finanzas/backend`:

```bash
npm run build
npm run start:dev
npm test -- --config test/jest.config.js --runInBand
npm run test:integration:db
npm run test:integration
npm run verify:backend
```

## GraphQL

Endpoint local:

```text
http://localhost:3000/graphql
```

Las operaciones protegidas requieren header:

```text
Authorization: Bearer <accessToken>
```

Los access tokens expiran segun `AUTH_TOKEN_TTL_SECONDS`.

### Registro

```graphql
mutation Register($input: RegisterUserInput!) {
  register(input: $input) {
    accessToken
    refreshToken
    user {
      id
      name
      email
    }
  }
}
```

Variables:

```json
{
  "input": {
    "name": "Ada Lovelace",
    "email": "ada@example.com",
    "password": "ClaveSegura123"
  }
}
```

### Login

```graphql
mutation Login($input: LoginInput!) {
  login(input: $input) {
    accessToken
    refreshToken
    user {
      id
      email
    }
  }
}
```

### Usuario actual

```graphql
query CurrentUser {
  currentUser {
    id
    name
    email
    currency
    locale
  }
}
```

### Crear cuenta

```graphql
mutation CreateAccount($input: CreateAccountInput!) {
  createAccount(input: $input) {
    id
    name
    type
    currency
    balance
  }
}
```

Variables:

```json
{
  "input": {
    "name": "Cuenta principal",
    "type": "BANK",
    "currency": "USD",
    "initialBalance": 1000
  }
}
```

### Consultar cuentas

```graphql
query Accounts {
  accounts {
    id
    name
    balance
    type
  }
}
```

### Crear categoria

```graphql
mutation CreateCategory($input: CreateCategoryInput!) {
  createCategory(input: $input) {
    id
    name
    kind
    isBuiltin
  }
}
```

### Consultar categorias

```graphql
query Categories {
  categories {
    id
    userId
    name
    kind
    isBuiltin
  }
}
```

### Crear transaccion

```graphql
mutation CreateTransaction($input: CreateTransactionInput!) {
  createTransaction(input: $input) {
    id
    type
    amount
    accountId
    categoryId
    transferAccountId
    linkedTransactionId
  }
}
```

Variables de ingreso:

```json
{
  "input": {
    "accountId": "account-id",
    "categoryId": "category-id",
    "txnDate": "2026-03-14T12:00:00.000Z",
    "amount": 500,
    "type": "INCOME",
    "description": "Pago freelance"
  }
}
```

Variables de gasto:

```json
{
  "input": {
    "accountId": "account-id",
    "categoryId": "category-id",
    "txnDate": "2026-03-15T12:00:00.000Z",
    "amount": 120,
    "type": "EXPENSE",
    "description": "Mercado"
  }
}
```

Variables de transferencia:

```json
{
  "input": {
    "accountId": "cuenta-origen-id",
    "categoryId": "category-id",
    "txnDate": "2026-03-16T12:00:00.000Z",
    "amount": 200,
    "type": "TRANSFER",
    "transferAccountId": "cuenta-destino-id",
    "description": "Mover a ahorros"
  }
}
```

Nota sobre transferencias:

- una transferencia se guarda como dos movimientos `TRANSFER` enlazados con `linkedTransactionId`, uno por la cuenta origen y otro por la cuenta destino.
- esto permite que cada cuenta tenga su propio historial consistente.
- los reportes globales, como `monthlySummary`, excluyen transacciones `TRANSFER` para evitar contar doble un movimiento interno entre cuentas del mismo usuario.

### Consultar transacciones

```graphql
query Transactions($filters: TransactionsFilterInput) {
  transactions(filters: $filters) {
    id
    type
    amount
    txnDate
    accountId
    categoryId
  }
}
```

Variables de ejemplo:

```json
{
  "filters": {
    "from": "2026-03-01T00:00:00.000Z",
    "to": "2026-03-31T23:59:59.000Z",
    "type": "EXPENSE"
  }
}
```

### Resumen mensual

```graphql
query MonthlySummary($input: MonthlySummaryInput!) {
  monthlySummary(input: $input) {
    year
    month
    income
    expense
    balance
    byCategory {
      categoryId
      categoryName
      kind
      total
    }
  }
}
```

Variables:

```json
{
  "input": {
    "year": 2026,
    "month": 3
  }
}
```
