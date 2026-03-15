# Especificaciones Para Stitch - Diseno Visual Frontend MVP

## Objetivo

Definir las especificaciones necesarias para usar Stitch en la generacion del diseno visual del frontend MVP de la app de finanzas personales.

Este documento toma como base el archivo [03_pantallas_frontend_mvp.md](/D:/pazmiño/SDD-DesarrolloDirigidoEspecs/SDD/fase%204/03_pantallas_frontend_mvp.md) y traduce sus necesidades funcionales a instrucciones visuales y prompts accionables para Stitch.

## Contexto del producto

- Producto: aplicacion web de finanzas personales.
- Objetivo del MVP: permitir registro, login, gestion de cuentas, categorias, transacciones y resumen mensual.
- Usuario objetivo: personas que quieren controlar ingresos, gastos y balance de forma simple, clara y confiable.
- Sensacion esperada: claridad, orden, confianza, control financiero y baja friccion.

## Direccion visual global

- Estilo general: moderno, limpio, profesional y calmado.
- Evitar: apariencia bancaria rigida, dashboards sobrecargados, exceso de tarjetas, exceso de colores fuertes.
- Tono visual: financiero personal, cercano, organizado, util y comprensible.
- Jerarquia: alta legibilidad, llamadas a la accion claras, agrupacion por bloques funcionales.
- Densidad: media; suficiente informacion sin saturacion.
- Enfoque UX: formularios rapidos, vistas resumidas, acciones frecuentes visibles.

## Sistema visual recomendado

- Tipografia:
  - sans-serif moderna, clara y elegante
  - buena legibilidad en desktop y mobile
  - fuerte jerarquia entre titulo, subtitulo, labels y datos numericos

- Paleta sugerida:
  - fondo principal claro o ligeramente tintado
  - color primario sobrio: azul petroleo, azul profundo o verde azulado
  - color secundario neutro: arena, gris suave o marfil
  - color de exito: verde controlado
  - color de alerta: coral suave o rojo sobrio
  - color para ingresos: verde
  - color para gastos: rojo/coral
  - color para transferencias: azul grisaceo o neutro

- Componentes clave:
  - sidebar o top navigation simple
  - cards informativas con numeros principales
  - tablas/listas limpias
  - formularios con labels claros
  - botones primarios notorios y secundarios discretos
  - chips o badges para estado, tipo y categoria

- Visualizacion de datos:
  - resumen mensual con KPIs
  - agregado por categoria con barras o donuts simples
  - balances y montos muy legibles

- Responsive:
  - desktop primero
  - adaptacion clara a tablet y mobile
  - navegacion compacta para pantallas pequenas

## Pantallas a disenar

- Login
- Registro
- Dashboard basico
- Cuentas
- Categorias
- Nueva transaccion
- Resumen mensual

## Estrategia de Prompt recomendada:

### Prompt Inicial (Estructura)

Define el proposito, el estilo visual y las secciones clave.

Ejemplo base adaptado al proyecto:

"Crea una interfaz web moderna para una app de finanzas personales. Debe transmitir claridad, confianza y control financiero. Usa un estilo limpio, profesional y amigable, con colores sobrios y acentos en verde y coral. Incluye navegacion clara, tarjetas resumen, formularios bien jerarquizados y componentes listos para desktop y mobile."

### Iteraciones de Estilo

Pide ajustes sobre lo generado.

Ejemplos:

- "Haz la interfaz mas editorial y sofisticada, con mas espacio en blanco y menos apariencia de panel corporativo."
- "Cambia la tipografia a una sans-serif elegante y mejora la jerarquia visual de los montos."
- "Haz que los botones primarios se vean mas claros y accionables."
- "Reduce el ruido visual y simplifica las tarjetas del dashboard."
- "Haz la version mobile mas compacta y con mejor prioridad de acciones."

### Refinamiento de Contenido

Selecciona textos especificos dentro de la herramienta para editarlos o generar variaciones.

Ejemplos:

- "Haz que los textos del dashboard suenen mas claros y orientados al control de gastos."
- "Reescribe los labels del formulario de transaccion para que sean mas directos."
- "Genera variantes de textos vacios para cuentas y resumen mensual."
- "Ajusta los textos de error para que se vean serios pero faciles de entender."

### Finalizacion

Solicita la previsualizacion en distintos dispositivos y exporta a Google AI Studio para obtener el codigo funcional.

Indicacion sugerida:

"Genera variantes responsive para desktop, tablet y mobile. Verifica consistencia visual entre pantallas y exporta la propuesta lista para implementacion."

## Prompts por pantalla

## 1. Login

### Prompt Inicial

"Crea una pantalla de login para una app web de finanzas personales. Debe verse moderna, profesional y confiable. Usa una composicion limpia, con formulario central o layout dividido, campos para email y contrasena, boton principal de ingreso y acceso visible a registro. La interfaz debe sentirse segura, simple y elegante."

### Elementos obligatorios

- titulo claro
- campos de email y contrasena
- CTA principal para iniciar sesion
- enlace a registro
- opcion de mostrar error de credenciales

### Iteraciones sugeridas

- "Hazla mas premium y menos generica."
- "Dale una identidad financiera personal, no corporativa."
- "Haz mas evidente el boton principal."

## 2. Registro

### Prompt Inicial

"Crea una pantalla de registro para una app web de finanzas personales. Debe sentirse simple, segura y de baja friccion. Incluye campos para nombre, email y contrasena, con una composicion limpia y moderna. La pantalla debe conectarse visualmente con login y transmitir confianza."

### Elementos obligatorios

- nombre
- email
- contrasena
- CTA principal de registro
- enlace a login
- espacio para errores de validacion

### Iteraciones sugeridas

- "Haz el formulario mas amigable y menos tecnico."
- "Mejora la percepcion de seguridad y onboarding."

## 3. Dashboard Basico

### Prompt Inicial

"Crea un dashboard principal para una app de finanzas personales. Debe mostrar una vista clara y util del estado financiero del usuario. Incluye bienvenida breve, tarjetas con ingresos, gastos y balance, listado resumido de cuentas, acceso rapido para registrar transacciones y un bloque de resumen mensual. El estilo debe ser limpio, moderno y enfocado en datos faciles de leer."

### Elementos obligatorios

- saludo o encabezado de bienvenida
- KPIs de ingresos, gastos y balance
- bloque de cuentas
- CTA para nueva transaccion
- acceso a resumen mensual
- estructura responsive

### Iteraciones sugeridas

- "Haz el dashboard mas claro para alguien no experto en finanzas."
- "Reduce saturacion visual y prioriza numeros importantes."
- "Haz que los datos se lean mejor en mobile."

## 4. Cuentas

### Prompt Inicial

"Crea una pantalla de gestion de cuentas para una app de finanzas personales. Debe permitir listar cuentas y mostrar nombre, tipo, moneda, saldo y estado archivado. Incluye acciones visuales para crear, editar y archivar cuentas. El diseno debe ser ordenado, facil de escanear y con foco en la lectura del saldo."

### Elementos obligatorios

- listado de cuentas
- CTA para crear cuenta
- accion de editar
- accion de archivar
- estados vacios
- indicacion visual de cuenta archivada

### Iteraciones sugeridas

- "Haz la lista mas clara y menos parecida a una tabla corporativa."
- "Resalta mejor el saldo y el tipo de cuenta."

## 5. Categorias

### Prompt Inicial

"Crea una pantalla para gestionar categorias financieras en una app de finanzas personales. Debe diferenciar visualmente categorias base del sistema y categorias creadas por el usuario. Incluye listado por tipo, iconos, badges y acciones para crear, editar y eliminar categorias personalizadas. Debe sentirse flexible, clara y util para clasificar movimientos."

### Elementos obligatorios

- categorias de ingreso y gasto
- diferenciacion visual entre base y personalizadas
- CTA para crear categoria
- acciones de editar y eliminar solo en categorias personalizadas

### Iteraciones sugeridas

- "Haz mas evidente la diferencia entre categorias base y personalizadas."
- "Mejora la organizacion por tipo con agrupacion visual mas clara."

## 6. Nueva Transaccion

### Prompt Inicial

"Crea una pantalla o formulario principal para registrar transacciones en una app de finanzas personales. Debe permitir crear ingresos, gastos y transferencias. Incluye selectors para cuenta y categoria, fecha, monto, tipo, descripcion, notas y cuenta destino cuando el tipo sea transferencia. Debe verse rapida de usar, muy clara y confiable."

### Elementos obligatorios

- selector de tipo
- cuenta
- categoria
- fecha
- monto
- descripcion
- notas
- cuenta destino para transferencia
- CTA principal de guardar

### Iteraciones sugeridas

- "Haz el formulario mas rapido de completar."
- "Haz mas clara la diferencia entre ingreso, gasto y transferencia."
- "Refuerza el feedback visual de error y validacion."

## 7. Resumen Mensual

### Prompt Inicial

"Crea una pantalla de resumen mensual para una app de finanzas personales. Debe mostrar ingresos, gastos, balance y distribucion por categoria del periodo. Incluye selector de mes, tarjetas KPI, grafico simple por categoria y una composicion visual clara, moderna y muy legible. Debe permitir entender el estado financiero del mes en pocos segundos."

### Elementos obligatorios

- selector de periodo
- ingresos
- gastos
- balance
- agregado por categoria
- estado vacio si no hay movimientos

### Iteraciones sugeridas

- "Haz los datos mas interpretables en mobile."
- "Reduce el ruido de los graficos y prioriza claridad."
- "Haz el balance mas protagonista visualmente."

## Reglas para Stitch durante el diseno

- mantener consistencia entre todas las pantallas
- reutilizar componentes comunes
- usar un mismo lenguaje visual en formularios, tablas, cards y navegacion
- priorizar claridad sobre decoracion
- no usar layouts recargados
- disenar pensando en datos reales del backend actual
- contemplar estados vacios, errores y carga
- contemplar pantallas responsive

## Textos funcionales a tener en cuenta

- los montos deben ser faciles de leer
- ingresos, gastos y balance deben tener colores consistentes
- mensajes de error deben ser claros y breves
- estados vacios deben orientar la siguiente accion

## Entregables esperados desde Stitch

- una propuesta visual consistente para todas las pantallas del MVP
- variantes responsive de desktop y mobile
- estructura reutilizable de componentes
- navegacion coherente entre pantallas
- base exportable para posterior implementacion

## Resultado esperado

Con este documento Stitch deberia poder generar:

- una linea visual consistente para el frontend MVP
- las pantallas necesarias del producto
- iteraciones controladas sobre estilo, contenido y jerarquia
- una base visual lista para pasar luego a implementacion o refinamiento manual
