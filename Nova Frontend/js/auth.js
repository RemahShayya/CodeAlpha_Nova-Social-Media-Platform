const getToken = () => localStorage.getItem(TOKEN_KEY);
const getUser = () => {
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try { return JSON.parse(raw); } catch { return null; }
};
const setSession = (token, user) => {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
};
const updateStoredUser = (user) => {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
};
const clearSession = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
};
const isLoggedIn = () => !!getToken();
const isAdmin = () => { const u = getUser(); return !!u && u.role === 'admin'; };
const isUser = () => { const u = getUser(); return !!u && u.role === 'user'; };
/* ---- Route guards ----
   Pages live in /pages/ (and /pages/admin/), so guard redirects
   are computed relative to the current path depth. */
const pagePath = (file) => {
  const inAdmin = window.location.pathname.includes('/pages/admin/');
  const inPages = window.location.pathname.includes('/pages/');
  if (inAdmin) return '../' + file;
  if (inPages) return file;
  return 'pages/' + file;
};
const goHome = () => {
  window.location.href = isAdmin() ? pagePath('admin/dashboard.html') : pagePath('feed.html');
};
const requireAuth = () => {
  if (!isLoggedIn()) { window.location.href = pagePath('login.html'); return false; }
  return true;
};
const requireUser = () => {
  if (!requireAuth()) return false;
  if (!isUser()) { window.location.href = pagePath('unauthorized.html'); return false; }
  return true;
};
const requireAdmin = () => {
  if (!requireAuth()) return false;
  if (!isAdmin()) { window.location.href = pagePath('unauthorized.html'); return false; }
  return true;
};
const redirectIfLoggedIn = () => {
  if (isLoggedIn()) { goHome(); return true; }
  return false;
};
const logout = () => {
  clearSession();
  window.location.href = pagePath('login.html');
};
