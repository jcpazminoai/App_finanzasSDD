# Plan De Trabajo Frontend

## Objetivo

Construir el frontend MVP de Finanzas tomando como base:

- backend MVP ya implementado y validado
- pantallas visuales exportadas desde Stitch
- documentacion funcional y visual existente en `SDD/fase 4`

Este plan organiza el trabajo para pasar de un frontend vacio a un frontend funcional, conectado al backend y con cobertura de estados de interfaz esenciales.

## Referencias De Trabajo

- `D:\pazmiÃ±o\SDD-DesarrolloDirigidoEspecs\SDD\fase 4\03_pantallas_frontend_mvp.md`
- `D:\pazmiÃ±o\SDD-DesarrolloDirigidoEspecs\SDD\fase 4\04_especificaciones_stitch_frontend.md`
- `D:\pazmiÃ±o\SDD-DesarrolloDirigidoEspecs\SDD\fase 4\05_estados_ui_frontend_mvp.md`
- `D:\pazmiÃ±o\SDD-DesarrolloDirigidoEspecs\SDD\fase 4\pantallas`
- `D:\pazmiÃ±o\SDD-DesarrolloDirigidoEspecs\app_finanzas\backend\README.md`

## Alcance Del MVP Frontend

El frontend MVP debe cubrir estas pantallas funcionales:

- Login
- Registro
- Panel
- Cuentas
- Categorias
- Nueva Transaccion
- Resumen Mensual

Tambien debe consumir correctamente las operaciones backend ya disponibles:

- `register`
- `login`
- `currentUser`
- `accounts`
- `createAccount`
- `updateAccount`
- `archiveAccount`
- `categories`
- `createCategory`
- `updateCategory`
- `deleteCategory`
- `transactions`
- `createTransaction`
- `monthlySummary`

## Fase 1. Preparacion Tecnica Del Frontend

### Objetivo

Dejar lista la base del proyecto frontend para empezar a montar pantallas e integracion.

### Tareas

- definir stack del frontend
- inicializar proyecto en `app_finanzas/frontend`
- configurar estructura de carpetas
- configurar variables de entorno del cliente
- configurar cliente GraphQL
- definir sistema base de estilos
- preparar layout principal y rutas

### Entregable

Frontend inicializado y ejecutando localmente con estructura limpia y lista para integracion.

## Fase 2. Base Visual Y Estructural

### Objetivo

Convertir las pantallas exportadas desde Stitch en componentes o vistas reales del frontend.

### Tareas

- revisar exportacion visual descargada
- decidir que partes se convierten en layout, componentes y paginas
- construir layout principal:
  - barra lateral
  - encabezado
  - contenedores de contenido
- crear sistema visual base:
  - colores
  - tipografia
  - espaciados
  - botones
  - inputs
  - tarjetas
  - tablas
- montar vistas estaticas iniciales para:
  - Login
  - Registro
  - Panel
  - Cuentas
  - Categorias
  - Nueva Transaccion
  - Resumen Mensual

### Entregable

Pantallas base visibles dentro del frontend con consistencia visual y navegacion funcional.

## Fase 3. Autenticacion

### Objetivo

Conectar el flujo de autenticacion del frontend con el backend.

### Tareas

- implementar formulario de login
- implementar formulario de registro
- conectar `login`
- conectar `register`
- guardar token de acceso
- adjuntar token a requests GraphQL
- resolver sesion autenticada con `currentUser`
- proteger rutas privadas
- manejar redireccion entre rutas publicas y privadas

### Entregable

Usuario puede registrarse, iniciar sesion, mantener sesion activa y acceder a las pantallas protegidas.

## Fase 4. Implementacion Del Panel

### Objetivo

Construir la vista principal del producto conectada a datos reales.

### Tareas

- mostrar informacion resumida del usuario autenticado
- consumir `accounts` para bloques de saldo
- consumir `transactions` para recientes
- consumir `monthlySummary` para resumen del mes
- agregar accesos rapidos:
  - registrar transaccion
  - crear cuenta
  - ver resumen mensual

### Entregable

Panel funcional conectado al backend con datos reales del usuario.

## Fase 5. Implementacion De Cuentas

### Objetivo

Permitir al usuario administrar sus cuentas desde el frontend.

### Tareas

- listar cuentas
- crear cuenta
- editar cuenta
- archivar cuenta
- refrescar estado despues de acciones
- mostrar saldos y tipos de cuenta de forma clara

### Entregable

CRUD funcional de cuentas consumiendo el backend real.

## Fase 6. Implementacion De Categorias

### Objetivo

Permitir administrar categorias personales y visualizar categorias disponibles.

### Tareas

- listar categorias globales y personalizadas
- crear categoria
- editar categoria
- eliminar categoria
- manejar error de negocio cuando no se puede eliminar una categoria usada

### Entregable

Gestion de categorias completa desde el frontend.

## Fase 7. Implementacion De Transacciones

### Objetivo

Permitir registrar y consultar movimientos financieros reales.

### Tareas

- implementar formulario de nueva transaccion
- soportar tipos:
  - gasto
  - ingreso
  - transferencia
- conectar `createTransaction`
- conectar `transactions`
- manejar cambio dinamico del formulario segun tipo
- reflejar correctamente cuentas, categorias y transferencias

### Entregable

Flujo de registro de transacciones funcional y alineado con reglas del backend.

## Fase 8. Implementacion Del Resumen Mensual

### Objetivo

Mostrar al usuario un resumen mensual claro y util.

### Tareas

- conectar `monthlySummary`
- mostrar ingresos del mes
- mostrar gastos del mes
- mostrar balance del mes
- mostrar desglose por categorias
- permitir cambio de mes

### Entregable

Vista de resumen mensual conectada al backend y coherente con el diseno aprobado.

## Fase 9. Estados De Interfaz Pendientes

### Nota Importante

Faltan sobre todo estados de interfaz, no pantallas base. Estos pendientes deben incluirse dentro de la implementacion y no dejarse para el final sin plan.

### Estados pendientes por cubrir

#### Autenticacion

- login con error de credenciales
- registro con validaciones por campo
- carga al enviar formulario
- sesion expirada

#### Panel

- carga inicial
- sin cuentas creadas
- sin transacciones registradas
- error al cargar metricas o resumen

#### Cuentas

- lista vacia
- crear cuenta
- editar cuenta
- confirmar archivar cuenta
- feedback de exito o error
- reactivar cuentas archivadas desde una vista o filtro de archivadas

#### Categorias

- lista vacia
- crear categoria
- editar categoria
- confirmar eliminacion
- error por categoria con transacciones asociadas
- definir en una version futura el catalogo visual de iconos para categorias y su selector en UI

#### Nueva Transaccion

- gasto
- ingreso
- transferencia
- validaciones de formulario
- carga al guardar
- exito al guardar
- error de negocio
- sin cuentas disponibles
- sin categorias disponibles

#### Resumen Mensual

- mes sin movimientos
- carga
- error
- cambio de mes
- pocas categorias o sin desglose suficiente

#### Estados transversales

- `loading`
- `empty`
- `error`
- `success`
- `validation`
- `confirm`

### Entregable

Frontend con estados reales de uso y no solo pantallas felices.

## Fase 10. Integracion Final Y Verificacion

### Objetivo

Cerrar el frontend MVP con validacion funcional completa.

### Tareas

- probar flujo completo:
  - registro
  - login
  - crear cuenta
  - crear categoria
  - crear transaccion
  - ver panel
  - ver resumen mensual
- revisar coherencia visual entre pantallas
- verificar responsive basico web y mobile
- corregir errores de integracion
- documentar como ejecutar frontend

### Entregable

Frontend MVP funcional, conectado al backend y validado en flujo critico.

## Orden Recomendado De Ejecucion

1. Preparacion tecnica del frontend
2. Base visual y estructural
3. Autenticacion
4. Panel
5. Cuentas
6. Categorias
7. Nueva Transaccion
8. Resumen Mensual
9. Estados de interfaz pendientes
10. Integracion final y verificacion

## Criterio De Terminado

El frontend puede considerarse listo para MVP cuando:

- todas las pantallas base estan implementadas
- el frontend consume el backend real
- el usuario puede autenticarse
- el usuario puede gestionar cuentas, categorias y transacciones
- el usuario puede consultar su resumen mensual
- existen estados de carga, vacio, error y validacion en las vistas principales
- el flujo critico completo funciona sin depender de mocks
