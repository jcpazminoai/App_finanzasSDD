# Stack Tecnologico

## Objetivo

Fijar las decisiones tecnicas concretas del MVP para evitar ambiguedad en Fase 3 y Fase 4.

## Arquitectura objetivo

- Backend con arquitectura hexagonal.
- GraphQL como interfaz principal entre cliente y backend.
- Base de datos PostgreSQL.

## Stack propuesto

### Frontend

- React
- Next.js

Motivo:

- Permite construir una interfaz moderna para dashboard, formularios y reportes.
- Tiene buen soporte para integracion con GraphQL.

### Backend

- NestJS
- GraphQL

Motivo:

- NestJS facilita organizacion por modulos y separacion de capas.
- Permite implementar con claridad puertos, adaptadores y casos de uso.
- GraphQL resuelve bien vistas compuestas como dashboard, resumen mensual y consultas filtradas.

### Persistencia

- PostgreSQL
- Prisma como ORM o mapper principal

Motivo:

- PostgreSQL aporta consistencia transaccional y robustez relacional.
- Prisma simplifica el modelado, migraciones y acceso tipado a datos.

### Autenticacion

- JWT para acceso
- refresh tokens para continuidad de sesion

Motivo:

- Permite proteger operaciones privadas y manejar sesiones renovables con buen equilibrio entre seguridad y simplicidad.

### Procesos auxiliares

- tareas programadas o cola ligera para notificaciones y procesos diferidos

Motivo:

- Presupuestos, alertas y correos no deben bloquear flujos principales.

### Despliegue

- Docker para empaquetado
- entornos separados para desarrollo, pruebas y produccion

Motivo:

- Facilita consistencia entre ambientes y despliegue controlado.

## Decisiones cerradas

- La base de datos objetivo es PostgreSQL.
- La interfaz principal del backend es GraphQL.
- La logica del negocio debe mantenerse desacoplada del framework y de la persistencia.

## Decisiones abiertas para fases posteriores

- proveedor cloud concreto,
- estrategia exacta de colas o jobs,
- canal de notificaciones push,
- almacenamiento definitivo de adjuntos.
