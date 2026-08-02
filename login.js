(function () {
  'use strict';

  const form = document.getElementById('loginForm');
  if (!form) return;

  const usernameInput = document.getElementById('username');
  const passwordInput = document.getElementById('password');
  const submitButton = document.getElementById('loginSubmit');
  const message = document.getElementById('loginMessage');
  const apiMeta = document.querySelector('meta[name="apps-script-url"]');
  const API_URL = String(apiMeta && apiMeta.content || '').trim();

  function showMessage(text, type = 'error') {
    message.textContent = text;
    message.className = `login-message ${type}`;
    message.hidden = !text;
  }

  function setLoading(loading) {
    submitButton.disabled = loading;
    submitButton.classList.toggle('is-loading', loading);
    submitButton.querySelector('[data-button-label]').textContent = loading
      ? 'Memverifikasi...'
      : 'Masuk ke Aplikasi';
  }

  function getSafeRedirect() {
    const requested = new URLSearchParams(window.location.search).get('next');
    if (!requested) return 'index.html';

    try {
      const target = new URL(requested, window.location.href);
      if (target.origin !== window.location.origin) return 'index.html';
      return `${target.pathname.split('/').pop() || 'index.html'}${target.search}${target.hash}`;
    } catch (error) {
      return 'index.html';
    }
  }

  const existingAuth = window.KaryawanKuAuth && window.KaryawanKuAuth.getAuth();
  if (existingAuth) {
    window.location.replace(getSafeRedirect());
    return;
  }

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    showMessage('');

    const username = usernameInput.value.trim();
    const password = passwordInput.value;

    if (!username || !password) {
      showMessage('Username dan password wajib diisi.');
      return;
    }

    if (!API_URL || API_URL.includes('PASTE_URL_WEB_APP')) {
      showMessage('URL Google Apps Script belum diisi pada login.html.');
      return;
    }

    setLoading(true);

    try {
      // URLSearchParams memakai form-urlencoded dan tidak memicu preflight JSON.
      const payload = new URLSearchParams({
        action: 'login',
        username,
        password
      });

      const response = await fetch(API_URL, {
        method: 'POST',
        body: payload,
        redirect: 'follow'
      });

      const raw = await response.text();
      let result;

      try {
        result = JSON.parse(raw);
      } catch (error) {
        throw new Error('Respons API bukan JSON. Periksa URL deployment /exec.');
      }

      if (!result.success) {
        showMessage(result.message || 'Login gagal.');
        passwordInput.select();
        return;
      }

      const user = result.user || {
        username,
        name: username,
        role: result.role
      };

      window.KaryawanKuAuth.setAuth({
        username: user.username || username,
        name: user.name || user.username || username,
        role: user.role || result.role
      });

      showMessage('Login berhasil. Mengalihkan...', 'success');
      window.location.replace(getSafeRedirect());
    } catch (error) {
      console.error(error);
      showMessage(error.message || 'Tidak dapat terhubung ke server login.');
    } finally {
      setLoading(false);
    }
  });
})();
