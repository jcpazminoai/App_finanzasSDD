# Plan Tecnico General

## Objetivo tecnico

Construir una plataforma de finanzas personales que permita registrar movimientos financieros, organizarlos por categoria, calcular saldos, controlar presupuestos, seguir metas de ahorro y presentar reportes, manteniendo seguridad, consistencia y capacidad de evolucion por fases.

## Enfoque de solucion

Se propone una arquitectura con frontend cliente, backend hexagonal, capa GraphQL, base de datos PostgreSQL y servicios auxiliares para autenticacion extendida, notificaciones y reportes.

El sistema debe priorizar:

- consistencia de datos financieros,
- simplicidad de uso en el MVP,
- seguridad de acceso y proteccion de datos,
- capacidad de extender funciones sin rehacer el nucleo.

## Modulos funcionales

### 1. Identidad y acceso

Responsable de registro, autenticacion, manejo de sesiones, recuperacion de acceso y controles de seguridad.

### 2. Cuentas y saldos

Responsable de representar cuentas del usuario y mantener su balance actualizado a partir de transacciones.

### 3. Transacciones

Responsable del registro, consulta, actualizacion y eliminacion logica de ingresos, gastos y transferencias.

### 4. Categorias

Responsable de administrar categorias globales y personalizadas para clasificar movimientos.

### 5. Presupuestos

Responsable de definir limites por categoria y periodo, calcular consumo y determinar estado presupuestal.

### 6. Metas de ahorro

Responsable de almacenar objetivos de ahorro, aportes, avance y estado de cumplimiento.

### 7. Reportes y analitica

Responsable de consolidar informacion por periodo, categoria y tendencia para presentar reportes utiles.

### 8. Notificaciones

Responsable de emitir alertas por presupuestos, metas y recordatorios relevantes.

### 9. Panel principal

Responsable de orquestar una vista resumida del estado financiero del usuario.

## Alcance tecnico del MVP

Para el MVP inicial se implementaran primero:

- identidad y acceso basico,
- cuentas basicas,
- registro de ingresos y gastos,
- categorias predefinidas y personalizadas simples,
- calculo de saldos,
- consulta simple de movimientos,
- resumen basico de ingresos y gastos.

Quedan planificados para iteraciones posteriores:

- presupuestos completos,
- alertas automaticas avanzadas,
- metas de ahorro completas,
- exportacion PDF o Excel,
- panel enriquecido,
- notificaciones multicanal robustas,
- capacidades moviles avanzadas u offline.

## Decisiones tecnicas principales

- Arquitectura hexagonal para aislar el dominio financiero de framework, transporte y persistencia.
- GraphQL como interfaz principal entre cliente y backend para resolver vistas compuestas y consultas agregadas.
- NestJS como framework principal del backend.
- React con Next.js como framework principal del frontend.
- PostgreSQL como base de datos principal para asegurar integridad transaccional, relaciones de negocio y consultas agregadas confiables.
- Autenticacion basada en token de acceso y sesion renovable.
- Soft delete en entidades sensibles para conservar trazabilidad.
- Adaptadores separados para GraphQL, persistencia, notificaciones y servicios externos.

## Dependencias tecnicas previstas

- servicio de correo para verificacion, recuperacion y notificaciones,
- proveedor de notificaciones push si se habilita canal movil,
- almacenamiento de adjuntos si se incluyen comprobantes,
- infraestructura de despliegue con base de datos y manejo de secretos.

## Riesgos tecnicos

- inconsistencias de saldo si no se controla correctamente el impacto de cada transaccion,
- complejidad creciente al introducir transferencias, presupuestos y metas sobre el mismo modelo financiero,
- riesgo de exponer datos sensibles si autenticacion, sesiones y autorizacion no se disenan desde el inicio,
- degradacion de rendimiento en reportes si las agregaciones no se planifican adecuadamente,
- resolvers GraphQL demasiado acoplados al almacenamiento si no se respeta la separacion hexagonal.

## Resultado esperado de la Fase 2

Al finalizar esta fase debe existir un marco tecnico suficiente para:

1. diseñar la implementacion sin ambiguedades mayores,
2. dividir el trabajo por modulos y tareas,
3. validar si una solucion futura respeta la intencion del producto y las restricciones no funcionales.
