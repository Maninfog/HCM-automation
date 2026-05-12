const params = new URLSearchParams(location.search);
const employeeId = params.get('employeeId');
document.getElementById('out').textContent = employeeId
  ? 'Beispiel: GET /rest/v1/payroll_runs?employee_id=eq.' + employeeId
  : 'Query ?employeeId=<uuid> anhängen.';
