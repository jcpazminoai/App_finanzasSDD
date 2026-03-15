# Estados UI Frontend MVP

## Objetivo

Definir los estados de interfaz que faltan para completar el frontend MVP de Finanzas y evitar improvisacion durante el diseno visual final o la implementacion. Este documento complementa:

- `03_pantallas_frontend_mvp.md`
- `04_especificaciones_stitch_frontend.md`

## Criterios Generales

Cada pantalla del MVP debe contemplar, como minimo, estos estados:

- `loading`: mientras se cargan datos o se envia un formulario
- `empty`: cuando no existen datos aun
- `error`: cuando falla una consulta o una accion
- `success`: cuando una accion termina correctamente
- `validation`: cuando el usuario ingresa datos invalidos
- `confirm`: cuando una accion es sensible o destructiva

## 1. Login

### Estados requeridos

- Estado base con formulario limpio
- Estado `loading` al iniciar sesion
- Estado `error` por credenciales invalidas
- Estado `error` por fallo del servidor
- Estado de sesion expirada al volver a autenticarse

### Requisitos visuales

- Mensaje de error claro, breve y visible
- Boton principal con feedback de carga
- Inputs con validacion visual de campos vacios o correo invalido

## 2. Registro

### Estados requeridos

- Estado base con formulario limpio
- Estado `loading` al crear cuenta
- Estado `validation` para:
  - nombre vacio
  - correo invalido
  - contrasena debil
  - confirmacion que no coincide
- Estado `error` si el correo ya existe
- Estado `error` por fallo del servidor
- Estado `success` despues del registro

### Requisitos visuales

- Validaciones por campo, no solo mensaje global
- Feedback claro de exito al crear la cuenta
- Jerarquia visual que mantenga foco en el boton principal

## 3. Panel

### Estados requeridos

- Estado base con datos cargados
- Estado `loading` inicial
- Estado `empty` sin cuentas creadas
- Estado `empty` sin transacciones registradas
- Estado `error` si fallan metricas o resumen

### Requisitos visuales

- Empty state con CTA claro:
  - crear cuenta
  - registrar transaccion
- Skeletons o placeholders para metricas y listado reciente
- Mensaje de error con opcion de reintentar

## 4. Cuentas

### Estados requeridos

- Estado base con listado
- Estado `empty` sin cuentas
- Estado `loading` al consultar cuentas
- Estado de crear cuenta
- Estado de editar cuenta
- Estado `confirm` para archivar cuenta
- Estado `success` al crear, editar o archivar
- Estado `error` por fallo al guardar cambios

### Requisitos visuales

- CTA principal visible para crear cuenta
- Acciones secundarias discretas para editar y archivar
- Confirmacion clara para archivar
- Mensaje de empty state orientado a crear la primera cuenta

## 5. Categorias

### Estados requeridos

- Estado base con listado
- Estado `empty` sin categorias personalizadas
- Estado `loading` al consultar categorias
- Estado de crear categoria
- Estado de editar categoria
- Estado `confirm` para eliminar categoria
- Estado `error` cuando una categoria no puede eliminarse por tener transacciones asociadas
- Estado `success` al crear, editar o eliminar

### Requisitos visuales

- Diferenciar categorias globales y personalizadas
- Confirmacion clara para eliminacion
- Mensaje de error de negocio entendible
- CTA principal visible para crear nueva categoria

## 6. Nueva Transaccion

### Estados requeridos

- Estado base para `Gasto`
- Estado base para `Ingreso`
- Estado base para `Transferencia`
- Estado `loading` al guardar
- Estado `success` al guardar transaccion
- Estado `validation` para:
  - monto invalido
  - fecha vacia o invalida
  - cuenta no seleccionada
  - categoria no seleccionada cuando aplique
  - cuenta origen y destino iguales en transferencia
- Estado `error` de negocio:
  - cuenta no pertenece al usuario
  - categoria no valida para el tipo
  - fondos insuficientes si luego se decide mostrar esa restriccion
- Estado `empty` sin cuentas disponibles
- Estado `empty` sin categorias disponibles

### Requisitos visuales

- El monto debe ser el foco principal en todos los estados
- Cambio claro entre Gasto, Ingreso y Transferencia
- Si es Transferencia, mostrar cuenta origen y cuenta destino
- Feedback claro al guardar con exito o error

## 7. Resumen Mensual

### Estados requeridos

- Estado base con datos del mes
- Estado `loading` al cargar o cambiar de mes
- Estado `empty` para mes sin movimientos
- Estado `error` si falla la consulta
- Estado con pocas categorias o sin desglose suficiente

### Requisitos visuales

- Debe quedar claro si el mes fue positivo o negativo
- Empty state con mensaje orientado a registrar movimientos
- Cambio de mes visible y facil de usar
- Error con opcion de reintentar

## 8. Estados Transversales

### Loading

- Botones con spinner o feedback equivalente
- Skeletons para tarjetas, tablas y metricas
- No bloquear toda la interfaz si solo carga una seccion

### Empty

- Mensaje breve y accionable
- CTA asociado al siguiente paso natural
- Evitar pantallas vacias sin explicacion

### Error

- Mensajes claros, no tecnicos
- Explicar que accion fallo
- Incluir opcion de reintentar cuando tenga sentido

### Success

- Confirmacion breve y visible
- No interrumpir el flujo principal
- Preferir feedback liviano sobre modales innecesarios

### Confirmacion

- Reservar para acciones destructivas o sensibles
- Explicar claramente la consecuencia
- Diferenciar accion principal y accion de cancelar

## Prioridad Recomendada

### Prioridad 1

- `loading`
- `empty`
- `error`

### Prioridad 2

- validaciones de formularios
- confirmaciones de acciones destructivas

### Prioridad 3

- feedback de exito
- mensajes de negocio mas detallados

## Uso Recomendado

Este documento puede usarse de dos formas:

- como checklist para pedir iteraciones finales en Stitch
- como backlog de estados UI para implementar en el frontend real

## Cierre

El frontend MVP no queda realmente listo solo con las pantallas base. Para una implementacion consistente, cada pantalla debe contemplar tambien sus estados de carga, vacio, error, validacion, exito y confirmacion.
