const apiRequest = (path, { method = 'GET', data = null, isForm = false, auth = true } = {}) => {
  const settings = {
    url: API_URL + path,
    method,
    headers: {},
  };
  if (auth && getToken()) {
    settings.headers['Authorization'] = 'Bearer ' + getToken();
  }
  if (data !== null) {
    if (isForm) {
      settings.data = data;
      settings.processData = false;
      settings.contentType = false;
    } else {
      settings.data = JSON.stringify(data);
      settings.contentType = 'application/json';
    }
  }
  return new Promise((resolve, reject) => {
    $.ajax(settings)
      .done((res) => resolve(res))
      .fail((xhr) => {
        if (xhr.status === 401 && auth) {
          clearSession();
          window.location.href = pagePath('login.html');
          return;
        }
        const message =
          (xhr.responseJSON && xhr.responseJSON.message) ||
          (xhr.status === 0 ? 'Cannot reach the server. Is it running?' :
            'Something went wrong. Please try again.');
        reject({ message, status: xhr.status });
      });
  });
};
const apiRegister = (name, email, password) =>
  apiRequest('/auth/register', { method: 'POST', data: { name, email, password }, auth: false });
const apiVerifyEmail = (token) =>
  apiRequest('/auth/verify-email?token=' + encodeURIComponent(token), { auth: false });
const apiResendVerification = (email) =>
  apiRequest('/auth/resend-verification', { method: 'POST', data: { email }, auth: false });
const apiLogin = (email, password) =>
  apiRequest('/auth/login', { method: 'POST', data: { email, password }, auth: false });
const apiForgotPassword = (email) =>
  apiRequest('/auth/forgot-password', { method: 'POST', data: { email }, auth: false });
const apiResetPassword = (token, password) =>
  apiRequest('/auth/reset-password?token=' + encodeURIComponent(token), { method: 'POST', data: { password }, auth: false });
const apiGetMe = () => apiRequest('/users/me');
const apiUpdateMe = (formData) =>
  apiRequest('/users/me', { method: 'PUT', data: formData, isForm: true });
const apiDeleteProfilePicture = () =>
  apiRequest('/users/me/profile-picture', { method: 'DELETE' });
const apiSearchUsers = (q, page = 1, pageSize = 10) =>
  apiRequest('/users/search?q=' + encodeURIComponent(q) + '&page=' + page + '&pageSize=' + pageSize);
const apiGetUser = (id) => apiRequest('/users/' + id);
const apiGetFollowers = (id) => apiRequest('/users/' + id + '/followers');
const apiGetFollowing = (id) => apiRequest('/users/' + id + '/following');
const apiGetUserPosts = (id, page = 1, pageSize = 12) =>
  apiRequest('/users/' + id + '/posts?page=' + page + '&pageSize=' + pageSize);
const apiFollowUser = (id) => apiRequest('/users/' + id + '/follow', { method: 'POST' });
const apiUnfollowUser = (id) => apiRequest('/users/' + id + '/follow', { method: 'DELETE' });
const apiBlockUser = (id) => apiRequest('/users/' + id + '/block', { method: 'POST' });
const apiUnblockUser = (id) => apiRequest('/users/' + id + '/block', { method: 'DELETE' });
const apiCreatePost = (formData) =>
  apiRequest('/posts', { method: 'POST', data: formData, isForm: true });
const apiGetFeed = (page = 1, pageSize = 10) =>
  apiRequest('/posts?page=' + page + '&pageSize=' + pageSize);
const apiSearchPosts = (q, page = 1, pageSize = 10) =>
  apiRequest('/posts/search?q=' + encodeURIComponent(q) + '&page=' + page + '&pageSize=' + pageSize);
const apiGetPost = (id) => apiRequest('/posts/' + id);
const apiUpdatePost = (id, caption) =>
  apiRequest('/posts/' + id, { method: 'PUT', data: { caption } });
const apiDeletePost = (id) => apiRequest('/posts/' + id, { method: 'DELETE' });
const apiCreateComment = (postId, content) =>
  apiRequest('/posts/' + postId + '/comments', { method: 'POST', data: { content } });
const apiGetComments = (postId) => apiRequest('/posts/' + postId + '/comments');
const apiUpdateComment = (id, content) =>
  apiRequest('/comments/' + id, { method: 'PUT', data: { content } });
const apiDeleteComment = (id) => apiRequest('/comments/' + id, { method: 'DELETE' });
const apiLikePost = (postId) => apiRequest('/posts/' + postId + '/like', { method: 'POST' });
const apiUnlikePost = (postId) => apiRequest('/posts/' + postId + '/like', { method: 'DELETE' });
const apiGetLikes = (postId) => apiRequest('/posts/' + postId + '/likes');
const apiGetNotifications = (page = 1, pageSize = 20) =>
  apiRequest('/notifications?page=' + page + '&pageSize=' + pageSize);
const apiGetUnreadCount = () => apiRequest('/notifications/unread-count');
const apiMarkAllNotificationsRead = () =>
  apiRequest('/notifications/read-all', { method: 'PUT' });
const apiMarkNotificationRead = (id) =>
  apiRequest('/notifications/' + id + '/read', { method: 'PUT' });
const apiCreateAdmin = (name, email, password) =>
  apiRequest('/admin/create-admin', { method: 'POST', data: { name, email, password } });
const apiAdminRemoveUser = (id) => apiRequest('/admin/users/' + id, { method: 'DELETE' });
const apiAdminRestoreUser = (id) => apiRequest('/admin/users/' + id + '/restore', { method: 'POST' });
const apiAdminRemovePost = (id) => apiRequest('/admin/posts/' + id, { method: 'DELETE' });
const apiAdminRemoveComment = (id) => apiRequest('/admin/comments/' + id, { method: 'DELETE' });
const apiGetDeactivatedUsers = (q = '', page = 1, pageSize = 20) =>
  apiRequest('/admin/users/deactivated?q=' + encodeURIComponent(q) + '&page=' + page + '&pageSize=' + pageSize);