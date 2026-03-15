# Reglas de Negocio y Casos de Borde

## Reglas de negocio

### RN-01. Propiedad de datos

Cada usuario solo puede ver y gestionar su propia informacion financiera.

### RN-02. Validez de transacciones

Toda transaccion debe registrarse con informacion minima suficiente para ser interpretada y consolidada correctamente.

### RN-03. Montos validos

Los montos deben ser positivos y coherentes con el tipo de operacion registrada.

### RN-04. Categorizacion obligatoria

Toda transaccion operativa debe quedar asociada a una categoria valida.

### RN-05. Impacto en saldos

Un ingreso incrementa el saldo disponible y un gasto lo reduce.

### RN-06. Presupuestos por periodo

Los presupuestos deben evaluarse dentro del periodo configurado y solo contra gastos de la categoria correspondiente.

### RN-07. Alertas de presupuesto

Cuando el gasto acumulado alcance un umbral relevante, el sistema debe notificar al usuario de forma visible.

### RN-08. Metas de ahorro

El progreso de una meta debe calcularse en funcion del monto objetivo y del ahorro acumulado asociado.

### RN-09. Consistencia de reportes

Los reportes deben reflejar la informacion registrada por el usuario en el periodo consultado.

### RN-10. Seguridad y confianza

La aplicacion no debe exponer datos financieros sensibles a terceros ni permitir accesos no autorizados.

## Casos de borde

### CB-01. Credenciales incorrectas

Si el usuario ingresa credenciales invalidas, el sistema debe rechazar el acceso sin revelar informacion sensible.

### CB-02. Monto invalido

Si el usuario intenta registrar un monto vacio, cero, negativo o mal formado, el sistema debe impedir el registro.

### CB-03. Categoria inexistente o no permitida

Si la categoria seleccionada no existe o no corresponde al usuario, la transaccion no debe guardarse.

### CB-04. Fecha invalida

Si la fecha de una transaccion es inconsistente con las reglas del sistema, debe mostrarse error y evitar el registro.

### CB-05. Datos incompletos

Si faltan datos minimos obligatorios, la operacion no debe completarse.

### CB-06. Duplicidad operacional

Si el usuario repite accidentalmente una accion de registro, el sistema debe minimizar el riesgo de duplicar movimientos.

### CB-07. Presupuesto inexistente

Si una categoria no tiene presupuesto definido, el sistema no debe generar alertas de limite para esa categoria.

### CB-08. Sobrepaso del presupuesto

Si el gasto supera el presupuesto, el sistema debe seguir registrando la transaccion pero informar claramente la situacion.

### CB-09. Meta vencida o no alcanzada

Si llega la fecha esperada y la meta no se cumple, el sistema debe mostrar el estado correspondiente sin perder el historial.

### CB-10. Ausencia de datos

Si el usuario aun no tiene transacciones, presupuestos o metas, el sistema debe mostrar estados vacios utiles y comprensibles.

## Restricciones y consideraciones

- La seguridad de acceso es obligatoria desde el inicio.
- La aplicacion debe priorizar claridad de uso antes que complejidad funcional.
- Las futuras fases pueden ampliar capacidad tecnica, pero no deben contradecir estas reglas funcionales base.
- El MVP debe conservar trazabilidad suficiente para evolucionar hacia reportes, presupuestos y metas mas avanzadas.
