/** Trage URL + anon key ein (oder per Query ?url=&key= nur für lokale Demo). */
const params = new URLSearchParams(location.search);
const SUPABASE_URL = params.get('url') || 'https://YOUR_PROJECT.supabase.co';
const SUPABASE_ANON = params.get('key') || 'YOUR_ANON_KEY';

async function load() {
  const tb = document.getElementById('tb');
  const err = document.getElementById('err');
  tb.innerHTML = '';
  err.textContent = '';
  try {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/candidates?select=first_name,last_name,email,qualification_score,status&order=created_at.desc`,
      {
        headers: {
          apikey: SUPABASE_ANON,
          Authorization: `Bearer ${SUPABASE_ANON}`,
        },
      }
    );
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const rows = await res.json();
    for (const r of rows) {
      const tr = document.createElement('tr');
      tr.innerHTML = `<td>${r.first_name} ${r.last_name}</td><td>${r.email}</td><td>${r.qualification_score ?? '—'}</td><td>${r.status}</td>`;
      tb.appendChild(tr);
    }
  } catch (e) {
    err.textContent = String(e.message || e);
  }
}

load();
