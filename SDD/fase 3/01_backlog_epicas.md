# Backlog por Epicas

## Objetivo

Organizar el trabajo del producto en bloques funcionales grandes que permitan planificar la implementacion de forma modular.

## EP-01. Identidad y acceso

Descripcion:
Gestiona registro, inicio de sesion, sesiones activas, recuperacion de acceso y controles basicos de seguridad.

Historias relacionadas:

- HU-01. Autenticacion y acceso
- HU-09. Seguridad de la informacion

Entregables esperados:

- registro de cuenta,
- login,
- renovacion y cierre de sesion,
- proteccion de rutas,
- recuperacion de contraseña.

## EP-02. Cuentas y saldos

Descripcion:
Gestiona cuentas financieras del usuario y la representacion consolidada de balance.

Historias relacionadas:

- HU-02. Registro de transacciones
- HU-10. Panel de control

Entregables esperados:

- creacion y edicion de cuentas,
- listado de cuentas,
- saldo actualizado por operacion.

## EP-03. Transacciones

Descripcion:
Gestiona ingresos, gastos, consulta de movimientos y operaciones de actualizacion o eliminacion logica.

Historias relacionadas:

- HU-02. Registro de transacciones
- HU-03. Gestion de categorias

Entregables esperados:

- formulario de registro,
- API de transacciones,
- filtros de consulta,
- consistencia sobre saldos.

## EP-04. Categorias

Descripcion:
Gestiona categorias base y personalizadas para clasificacion de movimientos.

Historias relacionadas:

- HU-03. Gestion de categorias

Entregables esperados:

- carga de categorias predefinidas,
- CRUD de categorias personalizadas,
- validaciones de uso e integridad.

## EP-05. Reportes basicos

Descripcion:
Consolida informacion financiera del usuario para mostrar ingresos, gastos y balance por periodo.

Historias relacionadas:

- HU-05. Visualizacion de informes
- HU-10. Panel de control

Entregables esperados:

- resumen mensual,
- agregados por categoria,
- vista de dashboard basica.

## EP-06. Presupuestos

Descripcion:
Permite definir limites por categoria y periodo, y calcular nivel de consumo.

Historias relacionadas:

- HU-04. Presupuestos por categoria
- HU-07. Alertas y notificaciones

Entregables esperados:

- CRUD de presupuestos,
- calculo de porcentaje usado,
- resumen de estado por categoria.

## EP-07. Metas de ahorro

Descripcion:
Gestiona objetivos de ahorro, aportes y progreso.

Historias relacionadas:

- HU-06. Metas de ahorro

Entregables esperados:

- creacion de metas,
- registro de aportes,
- calculo de avance.

## EP-08. Notificaciones

Descripcion:
Gestiona alertas visibles y canales de aviso para eventos financieros relevantes.

Historias relacionadas:

- HU-07. Alertas y notificaciones

Entregables esperados:

- generacion de alertas,
- consulta de bandeja,
- marcado de lectura.

## EP-09. Seguridad reforzada

Descripcion:
Amplia los controles de autenticacion y proteccion sobre cuentas y sesiones.

Historias relacionadas:

- HU-09. Seguridad de la informacion

Entregables esperados:

- bloqueo por intentos,
- gestion de sesiones,
- auditoria de eventos,
- MFA opcional.

## Alcance por fase

### Incluido en MVP

- EP-01
- EP-02
- EP-03
- EP-04
- EP-05 parcial

### Posterior al MVP

- EP-06
- EP-07
- EP-08
- EP-09 avanzado
