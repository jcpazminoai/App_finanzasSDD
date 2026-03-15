# Tareas del MVP

## Objetivo

Definir tareas pequenas y verificables para construir el MVP inicial del sistema.

## Modulo de identidad y acceso

### T3-001. Modelo de usuario y sesiones

- Objetivo: preparar entidades persistentes para usuarios y sesiones.
- Resultado esperado: el sistema puede almacenar usuarios y sesiones activas o renovables.
- Criterio de finalizacion: existen estructuras persistentes y validacion minima de unicidad por email.

### T3-002. Registro de usuario

- Objetivo: permitir creacion de cuenta con datos basicos.
- Resultado esperado: un visitante puede crear su cuenta.
- Criterio de finalizacion: el registro persiste usuario valido y rechaza email duplicado.

### T3-003. Inicio de sesion

- Objetivo: autenticar al usuario y emitir credenciales de acceso.
- Resultado esperado: el usuario puede autenticarse y operar en contexto privado.
- Criterio de finalizacion: login exitoso entrega acceso; login invalido devuelve error controlado.

### T3-004. Proteccion de rutas privadas

- Objetivo: asegurar que solo usuarios autenticados accedan a recursos privados.
- Resultado esperado: queries y mutations privadas verifican autenticacion.
- Criterio de finalizacion: las operaciones protegidas rechazan accesos anonimos.

## Modulo de cuentas

### T3-005. Estructura de cuentas

- Objetivo: permitir representar cuentas financieras del usuario.
- Resultado esperado: el sistema puede crear y listar cuentas.
- Criterio de finalizacion: cada cuenta queda asociada a un usuario y posee saldo inicial coherente.

### T3-006. CRUD basico de cuentas

- Objetivo: permitir crear, consultar y editar cuentas.
- Resultado esperado: el usuario administra sus cuentas base.
- Criterio de finalizacion: operaciones CRUD basicas funcionan dentro del contexto del usuario.

## Modulo de categorias

### T3-007. Carga de categorias base

- Objetivo: sembrar categorias iniciales del sistema.
- Resultado esperado: existen categorias listas para usar al registrar transacciones.
- Criterio de finalizacion: el sistema expone categorias predefinidas de ingreso y gasto.

### T3-008. Categorias personalizadas

- Objetivo: permitir creacion de categorias propias.
- Resultado esperado: el usuario amplía su clasificacion financiera.
- Criterio de finalizacion: una categoria personalizada puede crearse y consultarse sin duplicados invalidos.

## Modulo de transacciones

### T3-009. Modelo de transacciones

- Objetivo: preparar entidad de ingresos y gastos.
- Resultado esperado: el sistema puede persistir movimientos financieros.
- Criterio de finalizacion: una transaccion valida puede almacenarse con usuario, cuenta, categoria y monto.

### T3-010. Registro de ingresos y gastos

- Objetivo: implementar la operacion principal de registrar transacciones.
- Resultado esperado: el usuario puede guardar ingresos y gastos desde el sistema.
- Criterio de finalizacion: al registrar una transaccion valida, esta queda persistida y confirmada.

### T3-011. Validaciones de transacciones

- Objetivo: impedir registros inconsistentes.
- Resultado esperado: montos, categorias, fechas y pertenencia de cuenta son validados.
- Criterio de finalizacion: solicitudes invalidas son rechazadas con mensajes controlados.

### T3-012. Actualizacion automatica de saldos

- Objetivo: reflejar el impacto financiero de cada operacion.
- Resultado esperado: ingresos incrementan saldo y gastos lo reducen.
- Criterio de finalizacion: el saldo de la cuenta cambia correctamente tras cada registro.

### T3-013. Consulta de transacciones

- Objetivo: permitir revisar movimientos registrados.
- Resultado esperado: el usuario puede listar y filtrar sus transacciones.
- Criterio de finalizacion: existe consulta por periodo y filtros basicos.

## Modulo de reportes basicos

### T3-014. Resumen mensual

- Objetivo: consolidar ingresos, gastos y balance por mes.
- Resultado esperado: el usuario puede conocer su resultado financiero del periodo.
- Criterio de finalizacion: el sistema devuelve totales consistentes con las transacciones registradas.

### T3-015. Agregado por categoria

- Objetivo: mostrar distribucion de movimientos por categoria.
- Resultado esperado: el usuario identifica patrones principales de gasto o ingreso.
- Criterio de finalizacion: el sistema consolida montos por categoria para un periodo consultado.

### T3-016. Dashboard basico

- Objetivo: mostrar una vista resumida del estado financiero.
- Resultado esperado: el usuario ve saldos y resumen reciente al ingresar.
- Criterio de finalizacion: existe una query o vista consolidada para el panel principal.

## Calidad minima del MVP

### T3-017. Manejo de errores y estados vacios

- Objetivo: asegurar mensajes claros y comportamiento estable.
- Resultado esperado: el usuario entiende errores y ausencia de datos.
- Criterio de finalizacion: los casos comunes de error y listas vacias tienen respuesta controlada.

### T3-018. Pruebas de flujos criticos

- Objetivo: validar el recorrido minimo del usuario.
- Resultado esperado: los flujos de registro, login, creacion de cuenta financiera, registro de transaccion y resumen mensual son verificables.
- Criterio de finalizacion: existen pruebas o validaciones repetibles sobre los flujos criticos.
