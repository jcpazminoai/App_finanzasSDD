# Proceso de Creacion de la Base de Datos

## Objetivo

Definir el proceso recomendado para crear y mantener la base de datos de la app usando Docker, PostgreSQL y Prisma.

## Decisiones base

- Motor de base de datos: PostgreSQL.
- Ejecucion local: Docker Compose.
- Modelado y migraciones: Prisma.
- Administracion e inspeccion manual: DBeaver.

## Archivos preparados en el proyecto

- `docker-compose.yml`
- `.env.example`
- `prisma/schema.prisma`
- `prisma/seed.sql`

## Proceso recomendado

### 1. Levantar PostgreSQL en Docker

El proyecto incluye un `docker-compose.yml` con un contenedor dedicado para la app.

Se usa el puerto `5433` para evitar conflicto con otros contenedores locales que ya usan `5432`.

Comando:

```bash
docker compose up -d
```

### 2. Crear variables de entorno locales

Copiar `.env.example` a un archivo `.env` y ajustar credenciales si hace falta.

La variable mas importante para backend y Prisma es:

```env
DATABASE_URL="postgresql://finanzas_user:finanzas_password@localhost:5433/finanzas_personales?schema=public"
```

### 3. Definir el esquema

El esquema inicial se mantiene en `prisma/schema.prisma`.

Este archivo es la fuente de verdad tecnica del modelo de base de datos para el backend.

### 4. Crear la primera migracion

Cuando el proyecto backend exista y Prisma este instalado, el flujo recomendado sera:

```bash
npx prisma migrate dev --name init
```

Esto generara la primera migracion versionada y aplicara el esquema sobre PostgreSQL.

### 5. Cargar datos semilla

Despues de la migracion, se cargan categorias base para que el sistema pueda operar desde el inicio.

Ejemplo de carga manual:

```bash
docker exec -i finanzas_postgres psql -U finanzas_user -d finanzas_personales < prisma/seed.sql
```

### 6. Verificar con DBeaver

Crear una conexion nueva con estos datos:

- Host: `localhost`
- Puerto: `5433`
- Base de datos: `finanzas_personales`
- Usuario: `finanzas_user`
- Contraseña: `finanzas_password`

## Rol de cada herramienta

### Docker Compose

Levanta y mantiene el contenedor PostgreSQL de forma repetible.

### Prisma

Define el esquema y versiona cambios mediante migraciones.

### DBeaver

Sirve para inspeccionar tablas, ejecutar consultas y verificar datos. No debe ser la fuente principal del esquema.

## Flujo correcto de trabajo

1. Levantar contenedor con Docker.
2. Ajustar `.env`.
3. Mantener el modelo en Prisma.
4. Crear migraciones.
5. Aplicar seed inicial.
6. Verificar con DBeaver.

## Lo que no se recomienda

- Crear tablas manualmente en DBeaver como mecanismo principal.
- Reutilizar una base de otro proyecto para esta app.
- Mezclar cambios manuales no versionados con migraciones de Prisma.
