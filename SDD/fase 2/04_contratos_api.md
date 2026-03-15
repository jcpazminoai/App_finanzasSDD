# Contratos de API GraphQL

## Objetivo

Definir las operaciones principales que el backend debe exponer para soportar el producto. Los contratos estan orientados al dominio y se implementaran mediante GraphQL.

## Convenciones generales

- Todas las operaciones protegidas requieren autenticacion.
- Toda operacion debe ejecutarse en el contexto del usuario autenticado.
- Las respuestas deben distinguir entre errores de validacion, autenticacion, autorizacion y fallos internos.
- Las consultas de listas deben soportar filtros y paginacion cuando el volumen lo justifique.
- Queries y mutations no deben exponer directamente detalles de persistencia.

## Modulo de autenticacion

### `mutation register`

Crea una cuenta de usuario.

Entrada esperada:

- nombre,
- email,
- contraseña.

Salida esperada:

- identificador de usuario o estado de registro,
- confirmacion de creacion.

### `mutation login`

Inicia sesion y entrega credenciales de acceso.

Entrada esperada:

- email,
- contraseña.

Salida esperada:

- token de acceso,
- token de renovacion o sesion,
- informacion basica del usuario.

### `mutation refreshSession`

Renueva credenciales de acceso.

### `mutation logout`

Revoca la sesion actual o una sesion objetivo.

### `mutation requestPasswordReset`

Inicia recuperacion de contraseña.

### `mutation resetPassword`

Completa el cambio de contraseña mediante un token valido.

## Modulo de cuentas

### `query accounts`

Lista las cuentas del usuario.

### `mutation createAccount`

Crea una cuenta financiera.

### `mutation updateAccount`

Actualiza datos editables de una cuenta.

### `mutation archiveAccount`

Archiva o desactiva una cuenta.

## Modulo de categorias

### `query categories`

Lista categorias globales y personalizadas disponibles para el usuario.

### `mutation createCategory`

Crea una categoria personalizada.

### `mutation updateCategory`

Actualiza una categoria personalizada.

### `mutation deleteCategory`

Elimina o desactiva una categoria si las reglas de integridad lo permiten.

## Modulo de transacciones

### `mutation createTransaction`

Registra un ingreso o gasto.

Entrada esperada:

- cuenta,
- categoria,
- fecha,
- monto,
- tipo,
- descripcion opcional.

Salida esperada:

- identificador,
- datos persistidos,
- saldo resultante o confirmacion operativa.

### `query transactions`

Lista transacciones con filtros por:

- rango de fechas,
- categoria,
- cuenta,
- tipo.

### `query transaction`

Consulta detalle de una transaccion.

### `mutation updateTransaction`

Actualiza una transaccion existente bajo reglas de negocio.

### `mutation deleteTransaction`

Elimina logicamente una transaccion y ajusta el consolidado correspondiente.

### `mutation createTransfer`

Registra una transferencia entre cuentas del mismo usuario.

## Modulo de presupuestos

### `query budgets`

Lista presupuestos del usuario.

### `mutation createBudget`

Crea un presupuesto por categoria y periodo.

### `mutation updateBudget`

Actualiza limite o configuracion del presupuesto.

### `query budgetSummary`

Entrega consumo, disponible, porcentaje usado y estado por categoria.

## Modulo de metas de ahorro

### `query savingGoals`

Lista metas del usuario.

### `mutation createSavingGoal`

Crea una meta de ahorro.

### `mutation updateSavingGoal`

Actualiza estado, fecha o configuracion de una meta.

### `mutation addSavingGoalContribution`

Registra un aporte a una meta.

### `query savingGoal`

Consulta el detalle y avance de una meta.

## Modulo de reportes

### `query monthlySummary`

Entrega resumen mensual de ingresos, gastos y balance.

### `query reportByCategory`

Entrega agregados por categoria para un periodo.

### `query dashboard`

Entrega informacion consolidada para el panel principal.

## Modulo de notificaciones

### `query notifications`

Lista notificaciones del usuario.

### `mutation markNotificationAsRead`

Marca una notificacion como leida.

## Errores esperados

### `400`

Parametros invalidos o reglas de validacion incumplidas.

### `401`

Usuario no autenticado o credenciales vencidas.

### `403`

El usuario no tiene permiso sobre el recurso solicitado.

### `404`

Recurso inexistente o no visible para el usuario.

### `409`

Conflicto de estado, duplicidad o colision de operacion.

### `500`

Error interno no esperado.

## Operaciones prioritarias para el MVP

- `mutation register`
- `mutation login`
- `query accounts`
- `mutation createAccount`
- `query categories`
- `mutation createCategory`
- `mutation createTransaction`
- `query transactions`
- `query monthlySummary`
