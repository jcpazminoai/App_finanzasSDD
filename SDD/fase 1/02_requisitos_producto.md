# Requisitos del Producto

## Requisitos funcionales

### RF-01. Autenticacion y acceso

El sistema debe permitir a los usuarios registrarse, iniciar sesion y acceder de manera segura a su informacion financiera.

### RF-02. Registro de transacciones

El sistema debe permitir registrar ingresos y gastos indicando como minimo monto, fecha, categoria y descripcion opcional.

### RF-03. Gestion de categorias

El sistema debe incluir categorias predefinidas y permitir al usuario crear, editar y usar categorias personalizadas.

### RF-04. Calculo de saldos

El sistema debe actualizar el saldo disponible de las cuentas del usuario con base en las transacciones registradas.

### RF-05. Presupuestos por categoria

El sistema debe permitir definir limites de gasto por categoria y periodo.

### RF-06. Alertas por presupuesto

El sistema debe advertir al usuario cuando el gasto de una categoria alcance o supere umbrales relevantes del presupuesto, especialmente el 80%.

### RF-07. Metas de ahorro

El sistema debe permitir crear metas de ahorro con monto objetivo y fecha esperada de cumplimiento.

### RF-08. Seguimiento de metas

El sistema debe mostrar el avance de cada meta y el esfuerzo de ahorro requerido para cumplirla.

### RF-09. Informes financieros

El sistema debe permitir visualizar reportes de ingresos, gastos, ahorro y balance por periodo.

### RF-10. Panel de control

El sistema debe ofrecer un resumen de saldos, gastos, presupuestos y metas activas.

### RF-11. Notificaciones

El sistema debe notificar eventos relevantes asociados a presupuestos, metas y otros recordatorios financieros.

### RF-12. Compatibilidad multiplataforma

El sistema debe poder usarse desde web y dispositivos moviles, manteniendo una experiencia funcional consistente.

## Requisitos no funcionales

### RNF-01. Seguridad

Los datos financieros del usuario deben protegerse mediante autenticacion segura, cifrado y conexiones protegidas.

### RNF-02. Rendimiento

Las operaciones y consultas principales deben responder en tiempos adecuados para una experiencia fluida.

### RNF-03. Usabilidad

La aplicacion debe ser intuitiva para usuarios con distintos niveles de experiencia digital.

### RNF-04. Disponibilidad

El sistema debe estar disponible de forma confiable para consultas y registro de movimientos.

### RNF-05. Escalabilidad

La solucion debe poder soportar crecimiento de usuarios y volumen de transacciones.

### RNF-06. Consistencia

La informacion mostrada en saldos, reportes, presupuestos y metas debe mantenerse alineada con las transacciones registradas.

### RNF-07. Privacidad

El tratamiento de datos debe respetar principios de privacidad y control por parte del usuario.

## Reglas funcionales generales

- Una transaccion debe pertenecer a un usuario autenticado.
- Un gasto o ingreso debe asociarse a una categoria valida.
- Un monto invalido no debe ser aceptado.
- Las acciones del usuario deben reflejarse en el saldo y en la informacion consolidada correspondiente.
- Los datos financieros deben permanecer asociados a su propietario y no ser visibles para otros usuarios.

## Priorizacion de negocio

### Prioridad alta

- autenticacion,
- registro de transacciones,
- categorias,
- calculo de saldos.

### Prioridad media

- presupuestos,
- alertas,
- reportes,
- metas de ahorro.

### Prioridad baja o posterior

- exportaciones avanzadas,
- personalizacion profunda,
- analitica avanzada,
- recomendaciones inteligentes.
