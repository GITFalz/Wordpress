const VIEW_SELECTOR = '#view';
const TOKEN_KEY = 'auth_token';
const USER_KEY = 'auth_user';
const EXP_KEY = 'auth_token_exp'; // ISO string for absolute expiration

const view = document.getElementById('view');

function setToken(token) {
    if (!token) return;
    localStorage.setItem(TOKEN_KEY, token);
}

export function getToken() {
    return localStorage.getItem(TOKEN_KEY);
}

function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

function setUser(user) {
  if (!user) return;
  sessionStorage.setItem(USER_KEY, JSON.stringify(user));
}

function getUser() {
  const raw = sessionStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function clearUser() {
  sessionStorage.removeItem(USER_KEY);
}

function setExp(iso) {
  if (!iso) return;
  localStorage.setItem(EXP_KEY, iso);
}

function getExp() {
  return localStorage.getItem(EXP_KEY);
}

function clearExp() {
  localStorage.removeItem(EXP_KEY);
}

let logoutTimer = null;
function scheduleAutoLogout() {
  if (logoutTimer) {
    clearTimeout(logoutTimer);
    logoutTimer = null;
  }
  const expIso = getExp();
  if (!expIso) return;

  const msLeft = new Date(expIso).getTime() - Date.now();
  if (msLeft <= 0) {
    doLogout();
    return;
  }
  logoutTimer = setTimeout(doLogout, msLeft);
}

function doLogout() {
  clearToken();
  clearUser();
  clearExp();
  if (logoutTimer) clearTimeout(logoutTimer);
  logoutTimer = null;

  // Optional: revoke on server
  // fetch('/api/logout', { method: 'POST', credentials: 'include' }).catch(() => {});

  loadLogin(true);
}

function loadLogin(push = true) {
    htmx.ajax('GET', '/partials/auth/login', {
        target: VIEW_SELECTOR,
        swap: 'innerHTML',
        pushUrl: push ? '#/auth/login' : false,
    });
}

function loadDashboard(push = true) {
    htmx.ajax('GET', '/partials/dashboard', {
        target: VIEW_SELECTOR,
        swap: 'innerHTML',
        pushUrl: push ? '#/dashboard' : false,
    });
}

// Attach Authorization header to all HTMX requests
document.body.addEventListener('htmx:configRequest', (e) => {
  const token = getToken();
  if (token) {
    e.detail.headers['Authorization'] = `Bearer ${token}`;
  }
  // If your API/partials require cookies too
  e.detail.credentials = 'include';
});

// Handle responses from the login form
document.body.addEventListener('htmx:afterRequest', (e) => {
  const elt = e.target;
  if (!elt) return;

  if (elt.id === 'login-form') {
    const xhr = e.detail.xhr;

    if (xhr.status >= 200 && xhr.status < 300) {
      let payload = null;
      try {
        payload = JSON.parse(xhr.responseText);
      } catch {
        // not JSON - treat as failure
      }

      if (payload?.token) setToken(payload.token);
      if (payload?.user) setUser(payload.user);
      if (payload?.expirationDate) setExp(payload.expirationDate);

      scheduleAutoLogout();

      loadDashboard(true);
      return;
    }

    // Error feedback
    let message = 'Login failed. Please check your email and password.';
    try {
      const err = JSON.parse(xhr.responseText);
      if (err?.message) message = err.message;
    } catch {}
    const errorEl = elt.querySelector('[data-role="form-error"]');
    if (errorEl) {
      errorEl.textContent = message;
      errorEl.classList.remove('hidden');
    } else {
      alert(message);
    }
  }
});

// Global 401 handler: if a protected partial rejects the token, log out
document.body.addEventListener('htmx:responseError', (e) => {
  if (e.detail.xhr?.status === 401) {
    doLogout();
  }
});

// Logout via delegated click
document.body.addEventListener('click', (e) => {
  const btn = e.target.closest("[data-action='logout']");
  if (!btn) return;
  doLogout();
});

// Boot: load initial view based on token presence/validity
document.addEventListener('DOMContentLoaded', () => {
  const token = getToken();
  const expIso = getExp();
  const isExpired = expIso ? Date.now() >= new Date(expIso).getTime() : false;

  if (!token || isExpired) {
    doLogout(); // will load login
    return;
  }

  scheduleAutoLogout();

  // Show dashboard on boot
  loadDashboard(false);
  if (!location.hash || location.hash === '#/') {
    history.replaceState({}, '', '#/dashboard');
  }
});