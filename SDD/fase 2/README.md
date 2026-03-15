# Fase 2 - Planificar

Este directorio contiene los documentos de la Fase 2 del enfoque SDD para el Sistema de Finanzas Personales.

La finalidad de esta fase es convertir la intencion funcional definida en la Fase 1 en una propuesta tecnica clara, coherente y ejecutable. Aqui se define como construir el sistema, que modulos lo componen, como se relacionan los datos y que contratos tecnicos deben respetarse.

## Documentos

- `01_plan_tecnico_general.md`: panorama tecnico del sistema, modulos, decisiones y alcance del MVP.
- `02_arquitectura_sistema.md`: arquitectura logica, componentes y flujo entre cliente, backend hexagonal, GraphQL y persistencia.
- `03_modelo_datos.md`: entidades principales, relaciones y reglas de persistencia.
- `04_contratos_api.md`: contratos funcionales de la API para autenticacion, transacciones, categorias, presupuestos, metas y reportes.
- `05_seguridad_calidad_operacion.md`: lineamientos no funcionales, seguridad, observabilidad y despliegue.
- `06_stack_tecnologico.md`: stack tecnologico objetivo del MVP y decisiones concretas de plataforma.
- `07_proceso_creacion_base_datos.md`: proceso recomendado para crear la base de datos con Docker, PostgreSQL y Prisma.

## Fuente base

Estos documentos fueron derivados de:

- la Fase 1 ubicada en `SDD/fase 1`,
- `ejemplo/docs/0_docAppFinanzas`,
- `ejemplo/docs/2_Diseño_funcional_técnico`.

## Alcance de esta fase

Estos archivos describen el enfoque tecnico del producto, pero todavia no descomponen el trabajo en tareas detalladas de implementacion. Esa descomposicion corresponde a la Fase 3.
