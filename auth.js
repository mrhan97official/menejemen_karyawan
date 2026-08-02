(function () {
  'use strict';

  const AUTH_KEY = 'karyawanku_auth_v1';
  const LOGIN_PAGE = 'login.html';
  const DEFAULT_PAGE = 'dashboard.html';
  const SESSION_DURATION_MS = 8 * 60 * 60 * 1000;
  const VALID_ROLES = new Set([
    'Pembuat Aplikasi',
    'Owner',
    'Manajer',
    'Kasir',
    'Karyawan'
  ]);

  function parseStoredAuth() {
    try {
      const value = localStorage.getItem(AUTH_KEY);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      return null;
    }
  }

  function getAuth() {
    const auth = parseStoredAuth();

    if (!auth || !VALID_ROLES.has(auth.role)) {
      return null;
    }

    if (auth.expiresAt && Date.now() >= Number(auth.expiresAt)) {
      clearAuth();
      return null;
    }

    return auth;
  }

  function setAuth(user) {
    if (!user || !VALID_ROLES.has(user.role)) {
      throw new Error('Role login tidak valid.');
    }

    const auth = {
      username: String(user.username || '').trim(),
      name: String(user.name || user.username || '').trim(),
      role: user.role,
      loggedInAt: Date.now(),
      expiresAt: Date.now() + SESSION_DURATION_MS
    };

    localStorage.setItem(AUTH_KEY, JSON.stringify(auth));
    return auth;
  }

  function clearAuth() {
    localStorage.removeItem(AUTH_KEY);
  }

  function roleList(value) {
    return String(value || '')
      .split(',')
      .map((role) => role.trim())
      .filter(Boolean);
  }

  function isAllowed(role, allowedValue) {
    const allowedRoles = roleList(allowedValue);
    return allowedRoles.includes('*') || allowedRoles.includes(role);
  }

  function loginUrl() {
    const currentFile = window.location.pathname.split('/').pop() || DEFAULT_PAGE;
    const next = `${currentFile}${window.location.search}${window.location.hash}`;
    return `${LOGIN_PAGE}?next=${encodeURIComponent(next)}`;
  }

  function applyElementVisibility(element, role) {
    if (!(element instanceof Element) || !element.matches('[data-roles]')) return;

    const visible = isAllowed(role, element.dataset.roles);
    element.hidden = !visible;
    element.classList.toggle('role-hidden', !visible);
    element.setAttribute('aria-hidden', String(!visible));
  }

  function applyRoleVisibility(auth, root = document) {
    document.documentElement.dataset.userRole = auth.role;

    if (root instanceof Element && root.matches('[data-roles]')) {
      applyElementVisibility(root, auth.role);
    }

    root.querySelectorAll?.('[data-roles]').forEach((element) => {
      applyElementVisibility(element, auth.role);
    });

    document.querySelectorAll('[data-auth-name]').forEach((element) => {
      element.textContent = auth.name || auth.username;
    });

    document.querySelectorAll('[data-auth-role]').forEach((element) => {
      element.textContent = auth.role;
    });
  }

  function protectPage() {
    const body = document.body;
    if (!body || body.dataset.authPage === 'login') return;

    const auth = getAuth();

    if (!auth) {
      window.location.replace(loginUrl());
      return;
    }

    const allowedRoles = body.dataset.allowedRoles || '*';

    if (!isAllowed(auth.role, allowedRoles)) {
      window.location.replace(`${DEFAULT_PAGE}?access=denied`);
      return;
    }

    applyRoleVisibility(auth);

    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node instanceof Element) applyRoleVisibility(auth, node);
        });
      });
    });
    observer.observe(document.body, { childList: true, subtree: true });

    document.documentElement.dataset.authReady = 'true';
    document.dispatchEvent(new CustomEvent('karyawanku:authready', { detail: auth }));
  }

  function logout() {
    clearAuth();
    window.location.replace(LOGIN_PAGE);
  }

  document.addEventListener('click', (event) => {
    const logoutButton = event.target.closest('[data-logout]');
    if (!logoutButton) return;

    event.preventDefault();
    logout();
  });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', protectPage, { once: true });
  } else {
    protectPage();
  }

  window.KaryawanKuAuth = Object.freeze({
    AUTH_KEY,
    VALID_ROLES: [...VALID_ROLES],
    getAuth,
    setAuth,
    clearAuth,
    logout,
    isAllowed,
    applyRoleVisibility
  });
})();
