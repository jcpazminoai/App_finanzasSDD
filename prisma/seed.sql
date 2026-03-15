CREATE EXTENSION IF NOT EXISTS pgcrypto;

INSERT INTO categories ("id", "user_id", "name", "kind", "icon", "is_builtin", "created_at", "updated_at")
VALUES
  (gen_random_uuid()::text, NULL, 'Salario', 'INCOME', 'salary', true, NOW(), NOW()),
  (gen_random_uuid()::text, NULL, 'Ventas', 'INCOME', 'sales', true, NOW(), NOW()),
  (gen_random_uuid()::text, NULL, 'Intereses', 'INCOME', 'interest', true, NOW(), NOW()),
  (gen_random_uuid()::text, NULL, 'Alimentacion', 'EXPENSE', 'food', true, NOW(), NOW()),
  (gen_random_uuid()::text, NULL, 'Transporte', 'EXPENSE', 'transport', true, NOW(), NOW()),
  (gen_random_uuid()::text, NULL, 'Vivienda', 'EXPENSE', 'home', true, NOW(), NOW()),
  (gen_random_uuid()::text, NULL, 'Servicios', 'EXPENSE', 'utilities', true, NOW(), NOW()),
  (gen_random_uuid()::text, NULL, 'Entretenimiento', 'EXPENSE', 'fun', true, NOW(), NOW()),
  (gen_random_uuid()::text, NULL, 'Salud', 'EXPENSE', 'health', true, NOW(), NOW()),
  (gen_random_uuid()::text, NULL, 'Educacion', 'EXPENSE', 'education', true, NOW(), NOW())
ON CONFLICT ("user_id", "name", "kind") DO NOTHING;
