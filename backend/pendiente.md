# Pendiente Backend

## Hecho

- estructura base del backend con NestJS y arquitectura modular preparada.
- integracion de Prisma con PostgreSQL y conexion real del backend a la base de datos.
- migracion inicial y seed base disponibles en `prisma/`.
- validacion de variables de entorno para `DATABASE_URL` y `AUTH_TOKEN_SECRET`.
- modulo `health` conectado a PostgreSQL con verificacion real de base de datos.
- modulo de autenticacion implementado con:
  - `register`
  - `login`
  - `currentUser`
  - hash de contrasena
  - generacion y validacion de token
  - guard GraphQL para rutas protegidas.
- modulo de cuentas implementado con:
  - `query accounts`
  - `mutation createAccount`
  - `mutation updateAccount`
  - `mutation archiveAccount`
  - asociacion de cuentas al usuario autenticado.
- modulo de categorias implementado con:
  - `query categories`
  - `mutation createCategory`
  - `mutation updateCategory`
  - `mutation deleteCategory`
  - combinacion de categorias base y personalizadas por usuario.
- modulo de transacciones implementado con:
  - `query transactions`
  - `mutation createTransaction`
  - validacion de cuenta y categoria
  - actualizacion de saldos
  - soporte de transferencias entre cuentas del mismo usuario
  - modelado como doble transaccion enlazada con `linkedTransactionId`.
- modulo de reportes basicos implementado con:
  - `query monthlySummary`
  - calculo de ingresos, gastos y balance mensual
  - agregado por categoria dentro del periodo.
- pruebas unitarias para servicios y casos de uso clave del backend.
- setup de pruebas de integracion implementado con:
  - base separada `finanzas_personales_test`
  - archivo `.env.test`
  - script de preparacion de base de test
  - configuracion Jest de integracion
  - prueba del flujo critico del MVP backend.
- endurecimiento final aplicado con:
  - expiracion de access token via `AUTH_TOKEN_TTL_SECONDS`
  - cobertura de integracion para autorizacion y errores de negocio
  - cobertura de integracion para CRUD de cuentas y categorias
  - validacion reproducible del backend con build, tests unitarios e integracion.

## Estado Actual

- el backend MVP principal ya esta implementado.
- existe una base de test separada para integracion.
- existe validacion final reproducible del backend con:
  - `npm run build`
  - `npm test -- --config test/jest.config.js --runInBand`
  - `npm run test:integration:db`
  - `npm run test:integration`
  - `npm run verify:backend`
- el flujo base ya tiene soporte de backend para:
  - registro
  - login
  - consulta de usuario actual
  - creacion de cuenta
  - consulta de cuentas
  - consulta y creacion de categorias
  - registro y consulta de transacciones
  - resumen mensual.
- existe validacion automatizada del flujo critico principal en pruebas de integracion.
- existe cobertura de integracion para:
  - autorizacion sin token
  - acceso cruzado entre usuarios
  - transferencias enlazadas
  - CRUD principal de cuentas
  - CRUD principal de categorias.

## Mejoras Posteriores Al MVP

### Alta prioridad

- ampliar aun mas cobertura de integracion para casos borde adicionales si se requiere.

### Seguridad y calidad

- revisar si se desea una estrategia mas completa de sesiones:
  - refresh token rotation
  - revocacion activa
  - logout.

### Cierre tecnico del backend

- ninguno bloqueante en backend MVP.

## Siguiente paso recomendado

- empezar frontend o integrar este backend con el cliente.
