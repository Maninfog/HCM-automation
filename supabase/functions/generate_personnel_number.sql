-- RPC-friendly: returns next personnel number string (EMP######)
CREATE OR REPLACE FUNCTION public.generate_personnel_number()
RETURNS VARCHAR(20)
LANGUAGE plpgsql
AS $$
DECLARE
  new_number VARCHAR(20);
  counter INTEGER;
BEGIN
  SELECT COALESCE(MAX(
    CASE
      WHEN personnel_number ~ '^EMP[0-9]+$'
        THEN SUBSTRING(personnel_number FROM 4)::INTEGER
      ELSE NULL
    END
  ), 0) + 1
  INTO counter
  FROM employees;

  new_number := 'EMP' || LPAD(counter::TEXT, 6, '0');
  RETURN new_number;
END;
$$;
