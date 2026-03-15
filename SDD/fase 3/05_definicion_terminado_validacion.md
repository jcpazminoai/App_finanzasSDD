# Definicion de Terminado y Validacion

## Objetivo

Establecer cuando una tarea de Fase 3 puede considerarse lista para pasar a implementacion o cierre.

## Definicion de terminado por tarea

Una tarea se considera terminada cuando cumple todos estos puntos:

1. El objetivo funcional de la tarea esta resuelto.
2. La salida respeta la historia de usuario o capacidad a la que da soporte.
3. Las reglas de negocio aplicables fueron consideradas.
4. Los errores comunes del flujo tienen comportamiento controlado.
5. Existe una manera verificable de validar el resultado.

## Validaciones minimas esperadas

### Para identidad

- registro exitoso,
- rechazo de email duplicado,
- login exitoso,
- rechazo de credenciales invalidas,
- acceso denegado en rutas privadas sin autenticacion.

### Para cuentas

- una cuenta valida se crea correctamente,
- cada cuenta queda asociada a su usuario,
- un usuario no accede a cuentas de otro usuario.

### Para categorias

- existen categorias base usables,
- una categoria personalizada valida se crea,
- se rechazan duplicados invalidos segun reglas.

### Para transacciones

- una transaccion valida se persiste,
- una transaccion invalida se rechaza,
- el saldo cambia segun el tipo de movimiento,
- la consulta devuelve solo movimientos del usuario.

### Para reportes

- el resumen mensual coincide con las transacciones del periodo,
- el agregado por categoria conserva consistencia numerica,
- el dashboard refleja informacion real disponible.

## Reglas de calidad

- No cerrar tareas con validaciones omitidas en flujos criticos.
- No aceptar salidas que contradigan la Fase 1 o la Fase 2.
- No introducir complejidad que no agregue valor al MVP acordado.
- Mantener trazabilidad entre tarea, modulo y capacidad funcional.

## Criterio para pasar a Fase 4

La Fase 3 queda suficientemente preparada cuando:

1. Existe backlog con identificadores claros.
2. Las tareas del MVP estan ordenadas por dependencia.
3. Cada tarea tiene objetivo y criterio de finalizacion.
4. La cobertura del MVP es visible y trazable.
5. Hay reglas explicitas para validar cada entrega.
