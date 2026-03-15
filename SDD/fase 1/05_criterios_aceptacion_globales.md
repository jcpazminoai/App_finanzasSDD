# Criterios de Aceptacion Globales

## Criterios generales del producto

- El sistema permite a un usuario autenticado registrar y consultar su informacion financiera personal.
- El sistema almacena ingresos y gastos con los datos minimos requeridos para su posterior analisis.
- El usuario puede clasificar sus movimientos para entender patrones de gasto e ingreso.
- El sistema mantiene una representacion coherente de saldos, movimientos y datos consolidados.
- El usuario puede identificar con claridad su estado financiero a partir de la informacion mostrada.
- La informacion sensible se trata con medidas adecuadas de seguridad y privacidad.

## Criterios por capacidad

### Acceso

- El usuario puede registrarse e iniciar sesion correctamente.
- El acceso con credenciales incorrectas es rechazado.

### Transacciones

- El usuario puede registrar ingresos y gastos validos.
- Las transacciones invalidas no se guardan.
- El sistema confirma cuando un registro fue exitoso.

### Categorias

- Existen categorias predefinidas listas para usar.
- El usuario puede disponer de categorias personalizadas.

### Presupuestos

- El usuario puede definir limites por categoria.
- El sistema informa el avance del consumo presupuestal.
- El sistema genera alertas cuando corresponde.

### Metas

- El usuario puede crear y consultar metas de ahorro.
- El sistema muestra progreso y faltante de cada meta.

### Reportes

- El usuario puede consultar ingresos, gastos y balance por periodo.
- La informacion presentada coincide con las transacciones registradas.

### Panel

- El panel principal muestra un resumen claro de la situacion financiera del usuario.

## Criterios especificos del MVP inicial

- El MVP debe incluir autenticacion basica funcional.
- El MVP debe permitir registrar ingresos y gastos.
- El MVP debe incluir categorias iniciales para clasificar transacciones.
- El MVP debe actualizar saldos de manera consistente.
- El MVP debe ofrecer al menos una vista simple de ingresos y gastos.

## Condiciones de salida de Fase 1

La Fase 1 puede considerarse suficientemente definida cuando:

1. El alcance del producto y del MVP esta claramente delimitado.
2. Las historias de usuario principales estan documentadas.
3. Las reglas de negocio y casos de borde mas relevantes estan explicitados.
4. Los criterios de aceptacion permiten validar si una implementacion cumple o no la intencion del producto.
5. La documentacion evita mezclar detalles tecnicos propios de Fase 2.
