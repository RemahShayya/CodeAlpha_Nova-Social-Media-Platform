const showToast = (message, type = "info") => {
  if (!$("#toast-container").length)
    $("body").append('<div id="toast-container"></div>');
  const $toast = $(
    '<div class="toast toast-' +
      type +
      '" role="status">' +
      escapeHtml(message) +
      "</div>",
  );
  $("#toast-container").append($toast);
  setTimeout(() => {
    $toast.addClass("leaving");
    setTimeout(() => $toast.remove(), 300);
  }, 3000);
};
const showModal = (
  title,
  bodyHTML,
  confirmText,
  onConfirm,
  confirmClass = "btn-primary",
) => {
  closeModal();
  const $backdrop = $(
    '<div class="modal-backdrop" id="app-modal">' +
      '<div class="modal" role="dialog" aria-modal="true">' +
      '<div class="modal-header">' +
      "<h3>" +
      escapeHtml(title) +
      "</h3>" +
      '<button class="modal-close" aria-label="Close">&times;</button>' +
      "</div>" +
      '<div class="modal-body">' +
      bodyHTML +
      "</div>" +
      (confirmText
        ? '<div class="modal-footer">' +
          '<button class="btn btn-ghost modal-cancel">Cancel</button>' +
          '<button class="btn ' +
          confirmClass +
          ' modal-confirm">' +
          escapeHtml(confirmText) +
          "</button>" +
          "</div>"
        : "") +
      "</div>" +
      "</div>",
  );
  $("body").append($backdrop);
  $backdrop.on("click", (e) => {
    if (e.target === $backdrop[0]) closeModal();
  });
  $backdrop.find(".modal-close, .modal-cancel").on("click", closeModal);
  if (onConfirm) {
    $backdrop.find(".modal-confirm").on("click", () => {
      onConfirm();
    });
  }
  return $backdrop;
};
const closeModal = () => $("#app-modal").remove();
const confirmDialog = (title, message, confirmText, onConfirm) =>
  showModal(
    title,
    "<p>" + escapeHtml(message) + "</p>",
    confirmText,
    () => {
      closeModal();
      onConfirm();
    },
    "btn-danger",
  );
const showSpinner = () => {
  if (!$("#spinner-overlay").length) {
    $("body").append(
      '<div id="spinner-overlay"><div class="orbit-spinner"></div></div>',
    );
  }
};
const hideSpinner = () => $("#spinner-overlay").remove();
const btnLoading = ($btn, loading) => {
  if (loading) {
    if (!$btn.find(".btn-spinner").length) {
      $btn
        .wrapInner('<span class="btn-label"></span>')
        .append('<span class="btn-spinner"></span>');
    }
    $btn.addClass("loading").prop("disabled", true);
  } else {
    $btn.removeClass("loading").prop("disabled", false);
  }
};
const skeletonPostCard = () =>
  '<div class="skeleton-card">' +
  '<div class="skeleton-row">' +
  '<div class="skeleton skeleton-circle"></div>' +
  '<div class="skeleton skeleton-line short"></div>' +
  "</div>" +
  '<div class="skeleton skeleton-block"></div>' +
  "</div>";
const skeletonUserRow = () =>
  '<div class="skeleton-card">' +
  '<div class="skeleton-row" style="margin-bottom:0">' +
  '<div class="skeleton skeleton-circle"></div>' +
  '<div class="skeleton skeleton-line"></div>' +
  "</div>" +
  "</div>";
const showSkeletonCards = ($container, count = 3, kind = "post") => {
  const tpl = kind === "user" ? skeletonUserRow : skeletonPostCard;
  let html = "";
  for (let i = 0; i < count; i++) html += tpl();
  $container.html('<div class="skeleton-group">' + html + "</div>");
};
const hideSkeletons = ($container) =>
  $container.find(".skeleton-group").remove();
const emptyStateHtml = (icon, title, subtitle, ctaHtml = "") =>
  '<div class="empty-state">' +
  '<div class="empty-icon">' +
  icon +
  "</div>" +
  "<h3>" +
  escapeHtml(title) +
  "</h3>" +
  (subtitle ? "<p>" + escapeHtml(subtitle) + "</p>" : "") +
  ctaHtml +
  "</div>";
/* ---------- Navbar ----------
   Rendered into <header id="app-navbar"></header> on every
   in-app page. Role-aware: admins get the admin panel link
   and no social icons; users get the full social nav. */
const renderNavbar = (activePage = "") => {
  const $host = $("#app-navbar");
  if (!$host.length) return;
  const user = getUser();
  const admin = isAdmin();
  const act = (p) => (p === activePage ? " active" : "");
  const socialIcons = admin
    ? ""
    : '<a href="feed.html" class="nav-icon-btn' +
      act("feed") +
      '" title="Home" aria-label="Home">⌂</a>' +
      '<a href="search.html" class="nav-icon-btn' +
      act("search") +
      '" title="Search" aria-label="Search">⌕</a>' +
      '<a href="create-post.html" class="nav-icon-btn' +
      act("create") +
      '" title="Create post" aria-label="Create post">＋</a>' +
      '<a href="notifications.html" class="nav-icon-btn' +
      act("notifications") +
      '" title="Notifications" aria-label="Notifications">♡<span class="badge hidden" id="unread-badge"></span></a>';
  const adminLink = admin
    ? '<a href="admin/dashboard.html" class="btn btn-secondary btn-sm">Admin panel</a>'
    : "";
  $host.html(
    '<nav class="navbar"><div class="navbar-inner">' +
      '<a href="' +
      (admin ? "admin/dashboard.html" : "feed.html") +
      '" class="nav-brand">' +
      '<img src="../assets/nova-logo.png" alt="Nova">' +
      "<span>Nova</span>" +
      "</a>" +
      '<div class="nav-actions">' +
      socialIcons +
      adminLink +
      '<div class="dropdown">' +
      '<button class="nav-icon-btn nav-avatar always-visible" id="nav-avatar-btn" aria-label="Account menu">' +
      '<img class="avatar avatar-sm" src="' +
      avatarUrl(user && user.profilePicture) +
      '" alt="">' +
      "</button>" +
      '<div class="dropdown-menu" id="nav-dropdown">' +
      (admin
        ? ""
        : '<a class="dropdown-item" href="profile.html">My profile</a>') +
      (admin
        ? ""
        : '<a class="dropdown-item" href="edit-profile.html">Edit profile</a>') +
      '<button class="dropdown-item danger" id="nav-logout">Log out</button>' +
      "</div>" +
      "</div>" +
      "</div>" +
      "</div></nav>",
  );
  if (!admin && $("#app-bottomnav").length) {
    $("#app-bottomnav").html(
      '<nav class="bottom-nav"><div class="bottom-nav-inner">' +
        '<a href="feed.html" class="nav-icon-btn' +
        act("feed") +
        '" aria-label="Home">⌂</a>' +
        '<a href="search.html" class="nav-icon-btn' +
        act("search") +
        '" aria-label="Search">⌕</a>' +
        '<a href="create-post.html" class="nav-icon-btn' +
        act("create") +
        '" aria-label="Create post">＋</a>' +
        '<a href="notifications.html" class="nav-icon-btn' +
        act("notifications") +
        '" aria-label="Notifications">♡</a>' +
        '<a href="profile.html" class="nav-icon-btn' +
        act("profile") +
        '" aria-label="Profile">' +
        '<img class="avatar avatar-sm" src="' +
        avatarUrl(user && user.profilePicture) +
        '" alt="">' +
        "</a>" +
        "</div></nav>",
    );
  }
  $("#nav-avatar-btn").on("click", (e) => {
    e.stopPropagation();
    $("#nav-dropdown").toggleClass("open");
  });
  $(document).on("click", () => $("#nav-dropdown").removeClass("open"));
  $("#nav-logout").on("click", logout);
  if (!admin && isLoggedIn()) {
    apiGetUnreadCount()
      .then((res) => {
        const count = res && res.count;
        if (count > 0)
          $("#unread-badge")
            .text(count > 99 ? "99+" : count)
            .removeClass("hidden");
      })
      .catch(() => {
      });
  }
  initAutoHideNav();
};
const initAutoHideNav = () => {
  let lastY = window.scrollY;
  let ticking = false;
  $(window).on("scroll", () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      const y = window.scrollY;
      const $nav = $(".navbar");
      if (y > lastY && y > 80) {
        $nav.addClass("nav-hidden");
      } else if (y < lastY) {
        $nav.removeClass("nav-hidden");
      }
      lastY = y;
      ticking = false;
    });
  });
};
