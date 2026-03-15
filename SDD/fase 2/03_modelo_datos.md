# Modelo de Datos

## Objetivo

Definir las entidades persistentes necesarias para soportar el dominio financiero del producto, manteniendo integridad, trazabilidad y capacidad de reporte.

## Motor de base de datos seleccionado

El sistema utilizara PostgreSQL como motor de base de datos principal.

### Motivos de seleccion

- Soporta integridad transaccional fuerte para operaciones financieras.
- Maneja correctamente relaciones complejas entre entidades del dominio.
- Permite consultas agregadas y analiticas adecuadas para reportes.
- Tiene madurez, estabilidad y buen ecosistema para aplicaciones de negocio.

## Principios de modelado

- Cada registro financiero pertenece a un usuario.
- Las transacciones son la fuente principal para calcular saldos y reportes.
- Las relaciones deben ser explicitadas por claves foraneas o equivalentes.
- Se permite borrado logico en entidades relevantes para conservar historial.

## Entidades principales

### Usuario

Representa a la persona propietaria de la informacion financiera.

Campos relevantes:

- identificador,
- nombre,
- email unico,
- credenciales seguras,
- moneda preferida,
- configuracion regional,
- marcas de auditoria.

### Sesion de usuario

Representa sesiones activas o renovables para autenticacion persistente y revocacion.

Campos relevantes:

- identificador,
- usuario asociado,
- token o referencia de renovacion,
- agente de usuario,
- direccion de red,
- fecha de creacion,
- fecha de revocacion.

### Cuenta

Representa una fuente o destino de dinero del usuario.

Campos relevantes:

- identificador,
- usuario asociado,
- nombre,
- tipo de cuenta,
- moneda,
- saldo actual,
- estado archivado.

### Categoria

Permite clasificar ingresos y gastos.

Tipos:

- global o sembrada por el sistema,
- personalizada por usuario.

Campos relevantes:

- identificador,
- usuario propietario opcional,
- nombre,
- tipo de movimiento,
- icono opcional,
- indicador de categoria base.

### Transaccion

Representa un ingreso, gasto o transferencia.

Campos relevantes:

- identificador,
- usuario,
- cuenta,
- categoria,
- fecha,
- monto,
- tipo,
- descripcion,
- notas,
- indicadores auxiliares,
- referencia a transferencia relacionada,
- auditoria y borrado logico.

### Adjunto de transaccion

Representa archivos o comprobantes asociados a una transaccion.

Campos relevantes:

- identificador,
- transaccion,
- nombre de archivo,
- ubicacion,
- tipo,
- tamaño,
- fecha de carga.

### Etiqueta

Permite clasificacion libre adicional sobre transacciones.

### Presupuesto

Representa el limite de gasto por categoria y periodo.

Campos relevantes:

- usuario,
- categoria,
- periodo,
- fecha de inicio,
- limite,
- indicador de arrastre.

### Meta de ahorro

Representa un objetivo financiero del usuario.

Campos relevantes:

- usuario,
- nombre,
- monto objetivo,
- monto actual,
- fecha objetivo,
- estado.

### Aporte a meta

Representa movimientos aplicados al avance de una meta.

### Notificacion

Representa alertas o mensajes del sistema para el usuario.

Campos relevantes:

- usuario,
- tipo,
- mensaje,
- estado de lectura,
- fecha de emision.

## Relaciones principales

- Un usuario tiene muchas sesiones.
- Un usuario tiene muchas cuentas.
- Un usuario tiene muchas categorias personalizadas.
- Un usuario tiene muchas transacciones.
- Una cuenta tiene muchas transacciones.
- Una categoria puede ser usada por muchas transacciones.
- Un usuario tiene muchos presupuestos.
- Un usuario tiene muchas metas de ahorro.
- Una meta puede tener muchos aportes.
- Un usuario tiene muchas notificaciones.

## Reglas de persistencia

- `email` de usuario debe ser unico.
- No deben existir categorias duplicadas del mismo tipo para el mismo usuario.
- Un presupuesto debe ser unico por usuario, categoria y periodo.
- Las transacciones deben quedar indexadas por usuario y fecha para soportar consulta y reporte.
- Los aportes a metas deben poder relacionarse opcionalmente con transacciones.

## Implicaciones de dominio

- El saldo de una cuenta depende del historial de transacciones.
- Los reportes dependen de agregaciones por fecha, categoria y tipo.
- Las transferencias requieren relacionar un movimiento origen con un movimiento espejo o equivalente.
- Las alertas de presupuesto y progreso de metas dependen de datos transaccionales consistentes.

## Recomendaciones de evolucion

- Mantener historico suficiente para auditoria.
- Preparar indices para consultas por usuario, cuenta, categoria y periodo.
- Evitar duplicar logica financiera en varias tablas sin una fuente de verdad clara.
