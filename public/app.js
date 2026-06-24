const API = 'http://localhost:3000';

// ── Tabs ─────────────────────────────────────
document.querySelectorAll('.tab').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.tab').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById('panel-' + btn.dataset.tab).classList.add('active');
    document.querySelectorAll('.result').forEach(r => r.classList.add('hidden'));
  });
});

// ── Kubur ────────────────────────────────────
document.getElementById('form-kubur').addEventListener('submit', async e => {
  e.preventDefault();
  const btn = document.getElementById('btn-kubur');
  const pesan = document.getElementById('pesan').value.trim();
  const tanggal = document.getElementById('tanggal').value;

  btn.disabled = true;
  btn.textContent = 'Mengubur...';
  document.getElementById('result-kubur').classList.add('hidden');

  try {
    const res = await fetch(`${API}/capsule`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pesan, tanggal_buka: new Date(tanggal).toISOString() })
    });
    const data = await res.json();

    if (res.ok) {
      document.getElementById('result-id').textContent = data.id_kapsul;
      document.getElementById('result-kubur').classList.remove('hidden');
      e.target.reset();
    } else {
      alert(data.notifikasi || 'Gagal mengubur kapsul');
    }
  } catch {
    alert('Tidak bisa terhubung ke server. Pastikan server berjalan.');
  } finally {
    btn.disabled = false;
    btn.textContent = 'Kubur Kapsul';
  }
});

// Copy ID
document.getElementById('copy-btn').addEventListener('click', () => {
  const id = document.getElementById('result-id').textContent;
  navigator.clipboard.writeText(id).then(() => {
    const btn = document.getElementById('copy-btn');
    btn.textContent = 'Tersalin!';
    setTimeout(() => btn.textContent = 'Salin', 1500);
  });
});

// ── Buka ─────────────────────────────────────
let timer = null;

document.getElementById('form-buka').addEventListener('submit', async e => {
  e.preventDefault();
  const btn = document.getElementById('btn-buka');
  const id = document.getElementById('capsule-id').value.trim();

  ['result-ok', 'result-lock', 'result-err'].forEach(id => {
    document.getElementById(id).classList.add('hidden');
  });
  if (timer) clearInterval(timer);

  btn.disabled = true;
  btn.textContent = 'Mencari...';

  try {
    const res = await fetch(`${API}/capsule/${id}`);
    const data = await res.json();

    if (res.status === 200) {
      document.getElementById('isi-pesan').textContent = data.isi_rahasia;
      document.getElementById('result-ok').classList.remove('hidden');

    } else if (res.status === 403) {
      const openDate = new Date(data.baru_boleh_dibuka_pada);
      document.getElementById('lock-date').textContent = openDate.toLocaleString('id-ID', {
        day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
      });
      document.getElementById('result-lock').classList.remove('hidden');

      const tick = () => {
        const diff = openDate - new Date();
        if (diff <= 0) { document.getElementById('countdown').textContent = 'Sudah bisa dibuka!'; clearInterval(timer); return; }
        const d = Math.floor(diff / 86400000);
        const h = Math.floor((diff % 86400000) / 3600000);
        const m = Math.floor((diff % 3600000) / 60000);
        const s = Math.floor((diff % 60000) / 1000);
        document.getElementById('countdown').textContent =
          (d ? d + 'h ' : '') + pad(h) + 'j ' + pad(m) + 'm ' + pad(s) + 'd';
      };
      tick();
      timer = setInterval(tick, 1000);

    } else {
      document.getElementById('err-msg').textContent = data.notifikasi || 'Terjadi kesalahan';
      document.getElementById('result-err').classList.remove('hidden');
    }
  } catch {
    document.getElementById('err-msg').textContent = 'Tidak bisa terhubung ke server.';
    document.getElementById('result-err').classList.remove('hidden');
  } finally {
    btn.disabled = false;
    btn.textContent = 'Buka Kapsul';
  }
});

function pad(n) { return String(n).padStart(2, '0'); }
