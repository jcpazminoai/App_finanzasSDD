# Base de Datos en Fase 4

## Pregunta

La base de datos se crea antes de la Fase 4 o dentro de la Fase 4.

## Respuesta

La base de datos se crea realmente dentro de la Fase 4.

## Diferencia importante

### Antes de Fase 4

Lo que existe es preparacion tecnica:

- decision de usar PostgreSQL,
- `docker-compose.yml`,
- `prisma/schema.prisma`,
- `.env.example`,
- documentacion del proceso.

Eso no significa que la base ya exista operativamente.

### Durante Fase 4

La base de datos pasa a existir de forma real cuando se ejecutan estos pasos:

1. levantar el contenedor PostgreSQL,
2. crear o inicializar la base configurada,
3. aplicar migraciones,
4. cargar datos semilla,
5. validar conexion desde backend y herramientas de administracion.

## Orden recomendado de ejecucion

### Paso 1

Levantar PostgreSQL con Docker:

```bash
docker compose up -d
```

### Paso 2

Configurar variables de entorno para backend y Prisma.

### Paso 3

Ejecutar la primera migracion del esquema.

Ejemplo esperado cuando el backend este listo:

```bash
npx prisma migrate dev --name init
```

### Paso 4

Cargar datos base, por ejemplo categorias iniciales.

### Paso 5

Verificar la base desde:

- backend,
- Prisma,
- DBeaver.

## Criterio practico

Si todavia no se ha levantado PostgreSQL ni se han aplicado migraciones, entonces la base de datos de la app aun no ha sido creada realmente.

## Conclusion

La creacion real de la base de datos es una tarea de implementacion y por tanto pertenece a la Fase 4.
