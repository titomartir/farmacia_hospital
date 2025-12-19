-- Agregar columna sexo a detalle_consolidado si no existe
ALTER TABLE detalle_consolidado
ADD COLUMN IF NOT EXISTS sexo VARCHAR(1);

-- Comentario de la columna
COMMENT ON COLUMN detalle_consolidado.sexo IS 'Sexo del paciente: M (Masculino) o F (Femenino)';
