# Historias de Usuario

## HU-01. Autenticacion y acceso

Como usuario quiero registrarme e iniciar sesion de forma segura para que mis datos financieros esten protegidos.

### Criterios de aceptacion

```gherkin
Escenario: registro e inicio de sesion exitoso
  Dado que soy un usuario nuevo
  Cuando creo mi cuenta con credenciales validas
  Entonces el sistema debe permitirme acceder a mis funcionalidades personales

Escenario: credenciales invalidas
  Dado que intento iniciar sesion
  Cuando ingreso credenciales incorrectas
  Entonces el sistema debe denegar el acceso y mostrar un mensaje claro
```

## HU-02. Registro de transacciones

Como usuario quiero registrar ingresos y gastos con monto, fecha y categoria para llevar control de mi flujo de efectivo.

### Criterios de aceptacion

```gherkin
Escenario: registro de gasto o ingreso valido
  Dado que estoy autenticado
  Cuando registro una transaccion con monto, fecha y categoria validos
  Entonces el sistema debe guardarla y actualizar mi saldo

Escenario: confirmacion de registro
  Dado que envio una transaccion valida
  Cuando el sistema completa el registro
  Entonces debo recibir confirmacion de que la transaccion fue almacenada
```

## HU-03. Gestion de categorias

Como usuario quiero clasificar mis transacciones para identificar patrones de gasto e ingreso.

### Criterios de aceptacion

```gherkin
Escenario: uso de categorias predefinidas
  Dado que voy a registrar una transaccion
  Cuando selecciono una categoria del sistema
  Entonces la categoria debe quedar asociada a la transaccion

Escenario: creacion de categoria personalizada
  Dado que necesito una categoria propia
  Cuando creo una nueva categoria valida
  Entonces el sistema debe permitir usarla en futuros registros
```

## HU-04. Presupuestos por categoria

Como usuario quiero definir presupuestos por categoria para controlar mis gastos.

### Criterios de aceptacion

```gherkin
Escenario: definicion de presupuesto
  Dado que deseo controlar una categoria de gasto
  Cuando defino un limite para un periodo
  Entonces el sistema debe registrar ese presupuesto

Escenario: seguimiento del consumo
  Dado que existe un presupuesto activo
  Cuando se registran gastos en esa categoria
  Entonces el sistema debe mostrar el porcentaje consumido
```

## HU-05. Visualizacion de informes

Como usuario quiero visualizar informes y graficos de ingresos y gastos para entender mi situacion financiera.

### Criterios de aceptacion

```gherkin
Escenario: consulta de reporte por periodo
  Dado que tengo transacciones registradas
  Cuando consulto mis informes para un periodo
  Entonces el sistema debe mostrar ingresos, gastos y balance

Escenario: visualizacion clara
  Dado que abro la seccion de reportes
  Cuando reviso los datos
  Entonces debo poder entender la distribucion de mis movimientos por categoria o periodo
```

## HU-06. Metas de ahorro

Como usuario quiero establecer metas de ahorro y seguir su progreso para alcanzar objetivos financieros.

### Criterios de aceptacion

```gherkin
Escenario: creacion de meta
  Dado que deseo ahorrar para un objetivo
  Cuando defino nombre, monto objetivo y fecha esperada
  Entonces el sistema debe crear la meta

Escenario: seguimiento de avance
  Dado que tengo una meta activa
  Cuando consulto su estado
  Entonces el sistema debe mostrar el avance acumulado y el faltante
```

## HU-07. Alertas y notificaciones

Como usuario quiero recibir alertas cuando me acerque a limites de presupuesto o cuando haya eventos relevantes para actuar a tiempo.

### Criterios de aceptacion

```gherkin
Escenario: alerta por umbral de presupuesto
  Dado que tengo un presupuesto definido
  Cuando mis gastos alcanzan al menos el 80 por ciento del limite
  Entonces el sistema debe generar una alerta visible

Escenario: configuracion de notificaciones
  Dado que deseo controlar como recibo avisos
  Cuando configuro mis preferencias
  Entonces el sistema debe respetar el canal seleccionado
```

## HU-08. Acceso multiplataforma

Como usuario quiero acceder al sistema desde web y movil para usarlo en cualquier momento y lugar.

### Criterios de aceptacion

```gherkin
Escenario: disponibilidad en diferentes plataformas
  Dado que utilizo distintos dispositivos
  Cuando ingreso a la aplicacion
  Entonces las funciones principales deben estar disponibles de forma consistente
```

## HU-09. Seguridad de la informacion

Como usuario quiero que mis datos financieros esten protegidos para confiar en la aplicacion.

### Criterios de aceptacion

```gherkin
Escenario: proteccion de informacion sensible
  Dado que almaceno informacion financiera
  Cuando uso el sistema
  Entonces mis datos deben estar protegidos mediante controles de seguridad adecuados

Escenario: opcion de seguridad reforzada
  Dado que deseo mayor proteccion
  Cuando activo mecanismos adicionales de seguridad
  Entonces el sistema debe requerirlos en el acceso correspondiente
```

## HU-10. Panel de control

Como usuario quiero un panel de control con resumen de mi estado financiero para tener una vision clara y rapida.

### Criterios de aceptacion

```gherkin
Escenario: resumen financiero inicial
  Dado que he iniciado sesion
  Cuando accedo al panel principal
  Entonces debo ver saldos, presupuestos y metas relevantes
```
