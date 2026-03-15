# Orden de Ejecucion - Fase 4

## Objetivo

Definir el orden recomendado para ejecutar la implementacion real del proyecto sin mezclar documentacion con codigo.

## Carpeta objetivo de implementacion

Toda la implementacion del producto debe crearse dentro de:

- `app_finanzas/`

Estructura objetivo inicial:

- `app_finanzas/backend`
- `app_finanzas/frontend`

## Secuencia recomendada

### 1. Crear estructura base del proyecto

Crear la carpeta raiz de implementacion y separar backend y frontend.

Resultado esperado:

- estructura inicial del producto creada,
- documentacion separada del codigo.

### 2. Inicializar backend

Crear el proyecto base del backend con NestJS, organizandolo segun arquitectura hexagonal.

Resultado esperado:

- proyecto backend inicializado,
- estructura por dominio, aplicacion e infraestructura preparada.

### 3. Inicializar frontend

Crear el proyecto base del frontend con React y Next.js.

Resultado esperado:

- proyecto frontend inicializado,
- estructura lista para autenticacion, formularios y dashboard.

### 4. Crear base de datos real

Levantar PostgreSQL con Docker y aplicar el esquema definido para la app.

Resultado esperado:

- contenedor PostgreSQL funcionando,
- base de datos de la app creada,
- esquema inicial aplicado.

### 5. Configurar persistencia del backend

Integrar Prisma con PostgreSQL y conectar el backend al esquema real.

Resultado esperado:

- backend conectado a la base de datos,
- migraciones listas y ejecutables,
- seed inicial disponible.

### 6. Implementar modulos del MVP

Construir primero:

- autenticacion,
- cuentas,
- categorias,
- transacciones,
- reportes basicos.

### 7. Conectar frontend con backend

Implementar integracion GraphQL entre cliente y servidor.

Resultado esperado:

- login funcional,
- registro de transacciones funcional,
- consulta de resumen funcional.

### 8. Validar flujos criticos

Probar el flujo minimo del MVP:

- registro,
- login,
- creacion de cuenta,
- registro de gasto o ingreso,
- consulta de resumen mensual.

### 9. Ajustar y preparar despliegue local

Dejar el entorno local repetible para futuras iteraciones.

Resultado esperado:

- proyecto levanta localmente,
- dependencias y configuracion estan claras,
- base de datos y servicios auxiliares son reutilizables.

## Resumen

La base de datos no se crea antes de la Fase 4 como parte operativa. Su creacion real ocurre dentro de esta fase, una vez que se inicia la implementacion del sistema.
