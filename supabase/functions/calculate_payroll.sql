-- Simplified monthly payroll math (NOT legal/tax advice)
CREATE OR REPLACE FUNCTION public.calculate_payroll(
  p_employee_id UUID,
  p_period_start DATE,
  p_period_end DATE
)
RETURNS TABLE (
  gross_salary NUMERIC(12,2),
  tax_deduction NUMERIC(12,2),
  social_security NUMERIC(12,2),
  net_salary NUMERIC(12,2)
)
LANGUAGE plpgsql
AS $$
DECLARE
  v_base NUMERIC(12,2);
  v_bonus NUMERIC(12,2);
  v_gross NUMERIC(12,2);
  v_tax NUMERIC(12,2);
  v_social NUMERIC(12,2);
  v_net NUMERIC(12,2);
  v_annual NUMERIC(14,2);
BEGIN
  SELECT s.base_salary, COALESCE(s.bonus, 0)
    INTO v_base, v_bonus
  FROM salary_data s
  WHERE s.employee_id = p_employee_id
    AND s.effective_from <= p_period_end
  ORDER BY s.effective_from DESC
  LIMIT 1;

  IF v_base IS NULL THEN
    RAISE EXCEPTION 'No salary_data for employee %', p_employee_id;
  END IF;

  v_gross := v_base + v_bonus;
  v_annual := v_gross * 12;

  IF v_annual < 60000 THEN
    v_tax := v_gross * 0.20;
  ELSIF v_annual < 100000 THEN
    v_tax := v_gross * 0.30;
  ELSE
    v_tax := v_gross * 0.40;
  END IF;

  v_social := v_gross * 0.193;
  v_net := v_gross - v_tax - v_social;

  RETURN QUERY SELECT v_gross, v_tax, v_social, v_net;
END;
$$;
