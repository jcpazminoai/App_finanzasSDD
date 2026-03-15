# Pantallas Frontend MVP

## Objetivo

Traducir la especificacion funcional ya definida en `SDD/` a un inventario claro de pantallas del frontend MVP, con sus datos, acciones y dependencias sobre el backend.

Este documento no define aun el estilo visual final. Su funcion es servir como plano funcional para construir la interfaz en `app_finanzas/frontend`.

## Alcance del frontend MVP

Las pantallas minimas del MVP frontend son:

1. Login
2. Registro
3. Dashboard basico
4. Cuentas
5. Categorias
6. Nueva transaccion
7. Resumen mensual

## Flujo general

```text
Login / Registro
        |
        v
   Dashboard
   |   |   |
   |   |   +--> Resumen mensual
   |   |
   |   +------> Cuentas
   |
   +----------> Categorias
   |
   +----------> Nueva transaccion
```

## Matriz Pantalla-Backend

| Pantalla | Queries | Mutations |
|---|---|---|
| Login | - | `login` |
| Registro | - | `register` |
| Dashboard | `currentUser`, `accounts`, `monthlySummary` | - |
| Cuentas | `accounts` | `createAccount`, `updateAccount`, `archiveAccount` |
| Categorias | `categories` | `createCategory`, `updateCategory`, `deleteCategory` |
| Nueva transaccion | `accounts`, `categories` | `createTransaction` |
| Resumen mensual | `monthlySummary` | - |

## Pantallas

## 1. Login

### Objetivo

Permitir que un usuario existente inicie sesion de forma segura.

### Datos que muestra

- formulario de email
- formulario de contrasena
- mensaje de error si las credenciales son invalidas

### Acciones del usuario

- escribir email
- escribir contrasena
- enviar formulario
- navegar a registro

### Integracion backend

- mutation `login`

### Estados UI

- inicial vacio
- cargando envio
- error de autenticacion

### Regla funcional

- un login exitoso debe entregar token y acceso al resto de pantallas privadas

### Criterio de terminado

- login valido navega al dashboard
- login invalido muestra error claro y controlado

## 2. Registro

### Objetivo

Permitir crear una cuenta nueva para acceder al sistema.

### Datos que muestra

- formulario de nombre
- formulario de email
- formulario de contrasena
- mensaje de error si el email ya existe o si hay datos invalidos

### Acciones del usuario

- escribir nombre
- escribir email
- escribir contrasena
- enviar formulario
- navegar a login

### Integracion backend

- mutation `register`

### Estados UI

- inicial vacio
- cargando envio
- error de validacion
- error por email duplicado

### Regla funcional

- el registro debe autenticar al usuario al finalizar o dejarlo listo para entrar al sistema con la sesion creada

### Criterio de terminado

- registro valido crea usuario y permite entrar al dashboard

## 3. Dashboard Basico

### Objetivo

Mostrar una vista rapida del estado financiero del usuario al entrar.

### Datos que muestra

- datos del usuario autenticado
- cuentas principales con saldo
- resumen mensual actual:
  - ingresos
  - gastos
  - balance
- acceso rapido a registrar una transaccion

### Acciones del usuario

- ir a cuentas
- ir a categorias
- ir a nueva transaccion
- ir a resumen mensual

### Integracion backend

- query `currentUser`
- query `accounts`
- query `monthlySummary`

### Estados UI

- carga inicial
- estado vacio si no hay cuentas
- estado vacio si no hay transacciones del mes

### Regla funcional

- los saldos y resumen deben venir del backend, no calcularse en frontend como fuente de verdad

### Criterio de terminado

- el dashboard refleja informacion real disponible del usuario autenticado

## 4. Cuentas

### Objetivo

Permitir crear, consultar, editar y archivar cuentas financieras del usuario.

### Datos que muestra

- listado de cuentas
- nombre
- tipo
- moneda
- saldo
- estado archivada/no archivada

### Acciones del usuario

- crear cuenta
- editar cuenta
- archivar cuenta

### Integracion backend

- query `accounts`
- mutation `createAccount`
- mutation `updateAccount`
- mutation `archiveAccount`

### Estados UI

- lista vacia si el usuario no tiene cuentas
- confirmacion de guardado
- error si intenta operar sobre cuenta invalida

### Reglas funcionales

- solo se muestran cuentas del usuario autenticado
- una cuenta archivada sigue pudiendo verse, pero debe quedar claramente marcada

### Criterio de terminado

- el usuario crea, consulta, actualiza y archiva sus cuentas sin afectar cuentas ajenas

## 5. Categorias

### Objetivo

Permitir consultar categorias disponibles y administrar categorias personalizadas.

### Datos que muestra

- categorias base del sistema
- categorias personalizadas del usuario
- tipo de categoria:
  - ingreso
  - gasto
- icono si existe

### Acciones del usuario

- crear categoria personalizada
- editar categoria personalizada
- eliminar categoria personalizada

### Integracion backend

- query `categories`
- mutation `createCategory`
- mutation `updateCategory`
- mutation `deleteCategory`

### Estados UI

- listado agrupado o filtrado por tipo
- error si existe duplicado invalido
- error si se intenta eliminar categoria en uso

### Reglas funcionales

- las categorias base no deben mostrarse como editables o eliminables
- una categoria con movimientos o presupuestos asociados no debe eliminarse

### Criterio de terminado

- el usuario distingue categorias base de categorias propias y administra solo las suyas

## 6. Nueva Transaccion

### Objetivo

Permitir registrar ingresos, gastos y transferencias.

### Datos que muestra

- selector de cuenta
- selector de categoria
- fecha
- monto
- tipo
- descripcion
- notas
- cuenta destino cuando sea transferencia

### Acciones del usuario

- registrar ingreso
- registrar gasto
- registrar transferencia

### Integracion backend

- query `accounts`
- query `categories`
- mutation `createTransaction`

### Estados UI

- formulario vacio
- formulario cargando
- error por cuenta invalida
- error por categoria invalida
- error por monto o fecha invalida
- confirmacion de registro exitoso

### Reglas funcionales

- las transferencias requieren cuenta destino
- una transferencia no puede usar la misma cuenta como origen y destino
- una categoria debe corresponder al tipo de operacion
- el frontend no recalcula saldos como fuente de verdad; solo refleja la respuesta posterior del backend

### Criterio de terminado

- un ingreso o gasto valido queda registrado y el usuario recibe confirmacion clara

## 7. Resumen Mensual

### Objetivo

Permitir consultar el resultado financiero del mes.

### Datos que muestra

- selector de periodo
- ingresos totales
- gastos totales
- balance
- agregado por categoria

### Acciones del usuario

- cambiar mes consultado
- revisar distribucion por categoria

### Integracion backend

- query `monthlySummary`

### Estados UI

- carga de reporte
- estado vacio si el mes no tiene movimientos

### Reglas funcionales

- el resumen debe reflejar solo movimientos del usuario autenticado
- las transferencias no deben contarse como ingreso ni gasto global

### Criterio de terminado

- el resumen mensual coincide con las transacciones reales del periodo

## Navegacion minima recomendada

- ruta publica `/login`
- ruta publica `/registro`
- ruta privada `/dashboard`
- ruta privada `/cuentas`
- ruta privada `/categorias`
- ruta privada `/transacciones/nueva`
- ruta privada `/reportes/resumen-mensual`

## Estados transversales del frontend

Todas las pantallas privadas deben contemplar:

- carga inicial
- error de autenticacion o sesion expirada
- error de autorizacion
- error de validacion de formulario
- estado vacio cuando no hay datos

## Prioridad de implementacion

Orden recomendado para construir frontend:

1. Login
2. Registro
3. Layout privado y proteccion de rutas
4. Dashboard basico
5. Cuentas
6. Categorias
7. Nueva transaccion
8. Resumen mensual

## Resultado esperado de este documento

Con esta definicion ya se puede:

- diseñar visualmente las pantallas del MVP
- construir el frontend sin ambiguedad funcional fuerte
- mapear cada vista con sus operaciones GraphQL reales
- organizar backlog de componentes, rutas y formularios
