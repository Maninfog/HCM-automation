const CFG = window.HCM_CONFIG;
if (!CFG) {
  document.body.innerHTML = '<p>Fehlende config.js — bitte config.example.js kopieren.</p>';
  throw new Error('HCM_CONFIG missing');
}

async function loadPositions() {
  const res = await fetch(
    `${CFG.supabaseUrl}/rest/v1/positions?status=eq.vacant&select=id,position_title`,
    {
      headers: {
        apikey: CFG.supabaseAnonKey,
        Authorization: `Bearer ${CFG.supabaseAnonKey}`,
      },
    }
  );
  if (!res.ok) throw new Error('Positions laden fehlgeschlagen: ' + res.status);
  const data = await res.json();
  const sel = document.getElementById('positionId');
  sel.innerHTML = '<option value="">Bitte wählen…</option>';
  for (const p of data) {
    const o = document.createElement('option');
    o.value = p.id;
    o.textContent = p.position_title;
    sel.appendChild(o);
  }
}

document.getElementById('form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const btn = document.getElementById('btn');
  const ok = document.getElementById('ok');
  const er = document.getElementById('er');
  ok.style.display = 'none';
  er.style.display = 'none';
  btn.disabled = true;
  const fd = new FormData(e.target);
  const payload = Object.fromEntries(fd.entries());
  try {
    const res = await fetch(CFG.n8nWebhookApply, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const t = await res.text();
      throw new Error(t || 'HTTP ' + res.status);
    }
    ok.style.display = 'block';
    e.target.reset();
  } catch (err) {
    er.textContent = String(err.message || err);
    er.style.display = 'block';
  } finally {
    btn.disabled = false;
  }
});

loadPositions().catch((err) => {
  document.getElementById('er').textContent = String(err);
  document.getElementById('er').style.display = 'block';
});
