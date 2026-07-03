/* Nova — shared utilities */

// Relative time: "just now", "5m", "2h", "3d", or "Jan 15"
const formatDate = (timestamp) => {
  const date = new Date(timestamp);
  const diff = (Date.now() - date.getTime()) / 1000;

  if (diff < 60) return 'just now';
  if (diff < 3600) return Math.floor(diff / 60) + 'm ago';
  if (diff < 86400) return Math.floor(diff / 3600) + 'h ago';
  if (diff < 7 * 86400) return Math.floor(diff / 86400) + 'd ago';

  const opts = { month: 'short', day: 'numeric' };
  if (date.getFullYear() !== new Date().getFullYear()) opts.year = 'numeric';
  return date.toLocaleDateString(undefined, opts);
};

// Server stores relative paths like "uploads/xyz.jpg" — prefix with host.
const mediaUrl = (path) => {
  if (!path) return '';
  return BASE_URL + '/' + String(path).replace(/\\/g, '/');
};

const avatarUrl = (profilePicture) => {
  return profilePicture ? mediaUrl(profilePicture) : '../assets/default-avatar.svg';
};

// Same helper for pages living at the project root (index.html)
const avatarUrlRoot = (profilePicture) => {
  return profilePicture ? mediaUrl(profilePicture) : 'assets/default-avatar.svg';
};

const truncate = (text, maxLength) => {
  if (!text) return '';
  return text.length > maxLength ? text.slice(0, maxLength - 1) + '…' : text;
};

// Escape user-generated strings before inserting into HTML templates.
const escapeHtml = (str) => {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
};

// Query-string param reader
const getQueryParam = (name) => new URLSearchParams(window.location.search).get(name);

// Debounce for search inputs
const debounce = (fn, wait) => {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), wait);
  };
};

const currentUserId = () => {
  const user = getUser();
  return user ? user.id : null;
};

const isOwnContent = (userId) => userId === currentUserId();
