/* ============================================================
   Nova — admin: navbar, renderers, and moderation handlers.
   Admin pages live at /pages/admin/, one level deeper than the
   social pages — every relative path here accounts for that.
   Depends on: api.js, ui.js, utils.js, auth.js
   ============================================================ */

// Avatar/media helpers with admin-depth relative fallback.
const adminAvatarUrl = (profilePicture) =>
  profilePicture ? mediaUrl(profilePicture) : '../../assets/default-avatar.svg';

/* Admin navbar + tab bar. active: 'dashboard'|'users'|'posts'|'comments'|'create-admin' */
const renderAdminNav = (active) => {
  const $host = $('#app-navbar');
  if (!$host.length) return;

  const tab = (file, label) =>
    '<a href="' + file + '" class="tab' + (active === file.replace('.html', '') ? ' active' : '') + '">' + label + '</a>';

  $host.html(
    '<nav class="navbar"><div class="navbar-inner">' +
      '<a href="dashboard.html" class="nav-brand">' +
        '<img src="../../assets/nova-logo.png" alt="Nova"><span>Nova <span class="gradient-text">Admin</span></span>' +
      '</a>' +
      '<div class="nav-actions">' +
        '<button class="btn btn-ghost btn-sm" id="admin-logout">Log out</button>' +
      '</div>' +
    '</div></nav>'
  );

  $('#admin-logout').on('click', logout);

  const $tabs = $('#admin-tabs');
  if ($tabs.length) {
    $tabs.html(
      '<div class="tabs" style="flex-wrap: wrap;">' +
        tab('dashboard.html', 'Dashboard') +
        tab('users.html', 'Users') +
        tab('posts.html', 'Posts') +
        tab('comments.html', 'Comments') +
        tab('create-admin.html', 'Create admin') +
      '</div>'
    );
  }
};

/* ---------- Admin user row ---------- */
const renderAdminUserRow = (user) => {
  return (
    '<div class="card user-card" data-user-id="' + user.id + '">' +
      '<img class="avatar avatar-md" src="' + adminAvatarUrl(user.profilePicture) + '" alt="">' +
      '<div class="user-card-info">' +
        '<a href="../profile.html?id=' + user.id + '">' + escapeHtml(user.name) + '</a>' +
        '<div class="user-card-bio">' + escapeHtml(user.email || '') + '</div>' +
        '<div class="user-card-bio" style="font-size: var(--font-size-xs); color: var(--color-text-faint);">ID: ' + user.id + '</div>' +
      '</div>' +
      '<button class="btn btn-danger btn-sm admin-deactivate">Deactivate</button>' +
    '</div>'
  );
};

/* ---------- Admin post row ---------- */
const renderAdminPostRow = (post) => {
  const author = post.User || post.user || { name: 'User' };
  const thumb = post.mediaType === 'video'
    ? '<video src="' + mediaUrl(post.mediaUrl) + '" preload="metadata" muted style="width:72px;height:72px;object-fit:cover;border-radius:var(--radius-sm);"></video>'
    : '<img src="' + mediaUrl(post.mediaUrl) + '" alt="" style="width:72px;height:72px;object-fit:cover;border-radius:var(--radius-sm);">';

  return (
    '<div class="card user-card" data-post-id="' + post.id + '">' +
      thumb +
      '<div class="user-card-info">' +
        '<a href="../post.html?id=' + post.id + '">' + escapeHtml(truncate(post.caption || '(no caption)', 60)) + '</a>' +
        '<div class="user-card-bio">by ' + escapeHtml(author.name) + ' · ' + formatDate(post.createdAt) + '</div>' +
      '</div>' +
      '<button class="btn btn-danger btn-sm admin-remove-post">Remove</button>' +
    '</div>'
  );
};

/* ---------- Delegated admin handlers — bind once ---------- */
const initAdminHandlers = () => {
  // Deactivate user (soft delete)
  $(document).on('click', '.admin-deactivate', function () {
    const $row = $(this).closest('[data-user-id]');
    const userId = $row.data('user-id');
    confirmDialog('Deactivate user',
      'The account will be deactivated: they can\'t log in and disappear from all social queries. Their profile picture is deleted. You can restore them later by ID.',
      'Deactivate', () => {
        apiAdminRemoveUser(userId)
          .then(() => { $row.slideUp(200, () => $row.remove()); showToast('User deactivated.', 'success'); })
          .catch((err) => showToast(err.message, 'error'));
      });
  });

  // Remove post
  $(document).on('click', '.admin-remove-post', function () {
    const $row = $(this).closest('[data-post-id]');
    confirmDialog('Remove post', 'The post and its media file will be permanently deleted.', 'Remove', () => {
      apiAdminRemovePost($row.data('post-id'))
        .then(() => { $row.slideUp(200, () => $row.remove()); showToast('Post removed.', 'success'); })
        .catch((err) => showToast(err.message, 'error'));
    });
  });
};
