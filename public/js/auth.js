// ============================================================
//  auth.js — Authentication (Register, Login, Logout, Session)
// ============================================================

import { supabase } from './supabase.js';
import { loadCart, clearLocalCart } from './cart.js';

// ── Ambil session user saat ini ──
export async function getSession() {
  const { data: { session } } = await supabase.auth.getSession();
  return session;
}

// ── Ambil user saat ini ──
export async function getUser() {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

// ── Register ──
export async function register({ fullName, email, password }) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName }
    }
  });
  if (error) throw error;
  return data;
}

// ── Login ──
export async function login({ email, password }) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });
  if (error) throw error;
  return data;
}

// ── Logout ──
export async function logout() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
  clearLocalCart();
  updateAuthUI(null);
}

// ── Update tampilan UI sesuai status login ──
export function updateAuthUI(user) {
  const avatarBtn    = document.getElementById('avatarBtn');
  const menuLogin    = document.getElementById('menuLogin');
  const menuLogout   = document.getElementById('menuLogout');
  const menuUserName = document.getElementById('menuUserName');
  const displayName  = document.getElementById('displayName');

  if (user) {
    // Tampilkan inisial di avatar
    const name = user.user_metadata?.full_name || user.email;
    const initials = name.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase();
    if (avatarBtn) {
      avatarBtn.innerHTML = `<span style="font-size:0.7rem;font-weight:700;color:var(--wood)">${initials}</span>`;
      avatarBtn.style.borderColor = 'var(--wood)';
    }
    // Tampilkan nama & tombol logout
    if (displayName) displayName.textContent = name.split(' ')[0];
    menuLogin?.classList.add('d-none');
    menuLogout?.classList.remove('d-none');
    menuUserName?.classList.remove('d-none');
  } else {
    // Reset avatar
    if (avatarBtn) {
      avatarBtn.innerHTML = `<i class="bi bi-person"></i>`;
      avatarBtn.style.borderColor = '';
    }
    menuLogin?.classList.remove('d-none');
    menuLogout?.classList.add('d-none');
    menuUserName?.classList.add('d-none');
  }
}

// ── Init Auth: cek session saat halaman load ──
export async function initAuth() {
  const session = await getSession();
  updateAuthUI(session?.user ?? null);

  if (session?.user) {
    await loadCart(session.user.id);
  }

  // Dengarkan perubahan auth state (login/logout/refresh)
  supabase.auth.onAuthStateChange(async (event, session) => {
    updateAuthUI(session?.user ?? null);

    if (event === 'SIGNED_IN' && session?.user) {
      await loadCart(session.user.id);
    }
    if (event === 'SIGNED_OUT') {
      clearLocalCart();
    }
  });
}

// ── Handle form Login ──
export function initLoginForm() {
  const form = document.getElementById('loginForm');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email    = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;
    const errEl    = document.getElementById('loginError');
    const btn      = form.querySelector('button[type=submit]');

    try {
      btn.disabled = true;
      btn.textContent = 'Masuk...';
      errEl?.classList.add('d-none');

      await login({ email, password });

      // Tutup modal setelah login berhasil
      const modal = bootstrap.Modal.getInstance(document.getElementById('authModal'));
      modal?.hide();

    } catch (err) {
      if (errEl) {
        errEl.textContent = err.message === 'Invalid login credentials'
          ? 'Email atau password salah.'
          : err.message;
        errEl.classList.remove('d-none');
      }
    } finally {
      btn.disabled = false;
      btn.textContent = 'Masuk';
    }
  });
}

// ── Handle form Register ──
export function initRegisterForm() {
  const form = document.getElementById('registerForm');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const fullName = document.getElementById('registerName').value.trim();
    const email    = document.getElementById('registerEmail').value.trim();
    const password = document.getElementById('registerPassword').value;
    const errEl    = document.getElementById('registerError');
    const btn      = form.querySelector('button[type=submit]');

    try {
      btn.disabled = true;
      btn.textContent = 'Mendaftar...';
      errEl?.classList.add('d-none');

      await register({ fullName, email, password });

      // Tampilkan pesan sukses
      form.innerHTML = `
        <div class="text-center py-3">
          <i class="bi bi-check-circle-fill" style="font-size:2rem;color:var(--wood)"></i>
          <p class="mt-3 mb-1" style="font-weight:600">Pendaftaran Berhasil!</p>
          <p style="font-size:0.85rem;color:var(--dark-gray)">
            Cek email <strong>${email}</strong> untuk verifikasi akun.
          </p>
        </div>`;

    } catch (err) {
      if (errEl) {
        errEl.textContent = err.message;
        errEl.classList.remove('d-none');
      }
    } finally {
      btn.disabled = false;
      btn.textContent = 'Buat Akun';
    }
  });
}

// ── Handle tombol Logout ──
export function initLogoutBtn() {
  document.querySelectorAll('.btn-logout').forEach(btn => {
    btn.addEventListener('click', async () => {
      await logout();
    });
  });
}