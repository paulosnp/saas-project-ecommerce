-- Adicionar coluna de ordem de exibição aos planos
ALTER TABLE plans ADD COLUMN display_order INTEGER NOT NULL DEFAULT 0;

-- Definir ordem inicial dos planos existentes por preço
UPDATE plans SET display_order = sub.rn
FROM (
    SELECT id, ROW_NUMBER() OVER (ORDER BY price ASC) AS rn
    FROM plans
) sub
WHERE plans.id = sub.id;
