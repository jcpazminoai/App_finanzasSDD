# Arquitectura del Sistema

## Vista general

La solucion se plantea como una aplicacion con cliente frontend y backend hexagonal apoyado en una base de datos PostgreSQL.

```text
Cliente Web / Movil
        |
        v
GraphQL API
        |
        +--> Adaptador GraphQL
                |
                v
        Casos de uso / Dominio
                |
                +--> Identidad y sesiones
                +--> Transacciones y saldos
                +--> Categorias
                +--> Presupuestos
                +--> Metas de ahorro
                +--> Reportes
                +--> Notificaciones
                |
                v
        Adaptadores de persistencia y servicios externos
        |
        v
PostgreSQL
```

## Componentes logicos

### Cliente

Responsable de:

- autenticacion del usuario,
- formularios de registro y consulta,
- visualizacion de reportes,
- dashboard resumido,
- configuracion de preferencias.

Debe consumir la API y manejar estados como carga, exito, error y estados vacios.

### Adaptador GraphQL

Responsable de:

- exponer queries y mutations del dominio,
- traducir solicitudes del cliente a casos de uso,
- validar datos de entrada,
- asegurar autorizacion por usuario,
- consolidar respuestas para cliente.

No debe contener logica financiera critica. Su funcion es orquestar entrada y salida hacia el dominio.

### Capa de dominio

Responsable de coordinar reglas del negocio:

- impacto de ingresos y gastos en saldos,
- asociacion de categorias,
- calculo de consumo presupuestal,
- avance de metas,
- generacion de alertas y resumentes.

Esta capa debe permanecer independiente de GraphQL, ORM o proveedor de base de datos.

### Adaptadores de salida

Responsables de conectar el dominio con:

- base de datos,
- servicios de correo,
- canales de notificacion,
- almacenamiento de archivos,
- herramientas de monitoreo.

### Persistencia

Responsable de almacenar entidades de negocio con integridad referencial y trazabilidad.

PostgreSQL es adecuado porque:

- hay relaciones claras entre usuarios, cuentas, categorias y transacciones,
- se requieren restricciones e indices,
- los reportes dependen de consultas agregadas consistentes,
- ofrece transacciones robustas y madurez suficiente para un dominio financiero.

### Servicios auxiliares

- correo electronico para verificacion y recuperacion,
- motor de notificaciones para alertas,
- almacenamiento de adjuntos si se habilitan comprobantes,
- monitoreo y logging operativo.

## Estilo arquitectonico recomendado

### Fase inicial

Se recomienda un backend unico, pero organizado con arquitectura hexagonal. Esto mantiene bajo control la operacion del MVP sin mezclar el dominio con el framework.

### Evolucion futura

Si el producto crece, la separacion por puertos y adaptadores permite extraer primero componentes como:

- notificaciones,
- reportes,
- autenticacion,
- adjuntos o archivos.

## Flujos principales

### Registro de transaccion

1. El cliente envia la solicitud autenticada.
2. El adaptador GraphQL recibe la mutation y valida estructura y contexto.
3. La capa de dominio registra la transaccion.
4. Se actualiza el saldo de la cuenta afectada.
5. Se recalculan indicadores asociados.
6. GraphQL responde con confirmacion y datos persistidos.

### Consulta de reporte

1. El cliente solicita un periodo y filtros.
2. GraphQL valida autorizacion y parametros.
3. El modulo de reportes consolida ingresos, gastos y balance.
4. La respuesta entrega resumen y desgloses para visualizacion.

### Alerta de presupuesto

1. Se registra o actualiza un gasto.
2. El sistema calcula el acumulado de la categoria para el periodo.
3. Si el umbral configurado es alcanzado, se genera una notificacion.
4. La alerta queda disponible para el usuario en su panel o bandeja.

## Consideraciones de integracion

- El frontend no debe calcular saldos como fuente de verdad.
- Las operaciones sensibles deben pasar por backend autenticado.
- Las notificaciones pueden ejecutarse sin bloquear la operacion principal.
- Los reportes deben aprovechar consultas agregadas e indices adecuados.
- Los resolvers GraphQL deben delegar siempre en casos de uso o servicios de dominio.

## Decision de despliegue

Se recomienda separar al menos:

- aplicacion cliente,
- servicio backend con GraphQL,
- base de datos,
- servicios de soporte operados por configuracion.

Esto facilita mantenimiento, escalado y proteccion de secretos.
