# Frontend Finanzas

Frontend MVP de Finanzas construido con Next.js, React, TypeScript y Apollo Client.

## Estado actual

El frontend ya esta conectado al backend real y cubre:

- autenticacion con `login`, `register` y `currentUser`
- panel con cuentas, transacciones recientes y resumen del mes
- gestion de cuentas activas y archivadas, incluyendo reactivacion
- gestion de categorias globales y personalizadas
- gestion de transacciones con gasto, ingreso y transferencia
- resumen mensual conectado a `monthlySummary`
- estados principales de carga, vacio, error, validacion y feedback

## Requisitos

- Node.js 20 o superior
- backend de `app_finanzas/backend` ejecutandose
- base de datos disponible para el backend

## Variables de entorno

Crear `.env.local` a partir de `.env.example`:

```bash
NEXT_PUBLIC_GRAPHQL_URL=http://localhost:3000/graphql
```

Si el backend expone GraphQL en otra URL, actualiza ese valor.

## Instalacion

```bash
npm install
```

## Ejecucion local

1. Inicia el backend en `app_finanzas/backend`.
2. En esta carpeta, ejecuta:

```bash
npm run dev
```

El frontend queda disponible en `http://localhost:3001`.

## Build de verificacion

```bash
npm run build
```

## Rutas principales

- `/login`
- `/registro`
- `/panel`
- `/cuentas`
- `/categorias`
- `/transacciones`
- `/resumen-mensual`

## Flujo critico sugerido

1. Registrar usuario
2. Iniciar sesion
3. Crear cuenta
4. Crear categoria
5. Registrar transaccion
6. Revisar panel
7. Revisar resumen mensual
