const renderPostCard = (post) => {
  const author = post.User || { id: post.userId, name: 'User', profilePicture: null };
  const own = isOwnContent(author.id);
  const admin = isAdmin();
  const media = post.mediaType === 'video'
    ? '<video controls preload="metadata" src="' + mediaUrl(post.mediaUrl) + '"></video>'
    : '<img src="' + mediaUrl(post.mediaUrl) + '" alt="Post media" loading="lazy" onerror="this.style.display=\'none\'">';
  let menu = '';
  if (own && isUser()) {
    menu =
      '<div class="dropdown post-menu">' +
        '<button class="nav-icon-btn post-menu-btn" aria-label="Post options">⋯</button>' +
        '<div class="dropdown-menu">' +
          '<button class="dropdown-item post-edit">Edit caption</button>' +
          '<button class="dropdown-item danger post-delete">Delete post</button>' +
        '</div>' +
      '</div>';
  } else if (admin) {
    menu =
      '<div class="dropdown post-menu">' +
        '<button class="nav-icon-btn post-menu-btn" aria-label="Post options">⋯</button>' +
        '<div class="dropdown-menu">' +
          '<button class="dropdown-item danger post-admin-delete">Remove post</button>' +
        '</div>' +
      '</div>';
  }
  const actions = isUser()
    ? '<button class="post-action like-btn" aria-label="Like">' +
        '<span class="like-icon">♡</span> <span class="like-count"></span>' +
      '</button>'
    : '<span class="post-action"><span class="like-icon">♡</span> <span class="like-count"></span></span>';
  return (
    '<article class="card post-card" data-post-id="' + post.id + '" data-author-id="' + author.id + '">' +
      '<div class="post-head">' +
        '<a class="post-author" href="profile.html?id=' + author.id + '">' +
          '<img class="avatar avatar-md" src="' + avatarUrl(author.profilePicture) + '" alt="">' +
          '<div><div class="post-author-name">' + escapeHtml(author.name) + '</div>' +
          '<div class="post-time">' + formatDate(post.createdAt) + '</div></div>' +
        '</a>' + menu +
      '</div>' +
      '<a class="post-media" href="post.html?id=' + post.id + '">' + media + '</a>' +
      (post.caption ? '<p class="post-caption">' + escapeHtml(post.caption) + '</p>' : '') +
      '<div class="post-actions">' + actions +
        '<a class="post-action" href="post.html?id=' + post.id + '" aria-label="Comments">💬 <span class="comment-count"></span></a>' +
        '<button class="post-action view-likes-btn">View likes</button>' +
      '</div>' +
    '</article>'
  );
};
const hydratePostCard = ($card) => {
  const postId = $card.data('post-id');
  apiGetLikes(postId).then((likes) => {
    $card.find('.like-count').text(likes.length || '');
    const liked = likes.some((u) => u.id === currentUserId());
    setLikedState($card, liked);
  }).catch(() => {});
  apiGetComments(postId).then((comments) => {
    $card.find('.comment-count').text(comments.length || '');
  }).catch(() => {});
};
const setLikedState = ($card, liked) => {
  const $btn = $card.find('.like-btn');
  $btn.data('liked', liked);
  $btn.find('.like-icon').text(liked ? '♥' : '♡');
  $btn.toggleClass('liked', liked);
};
const initPostHandlers = () => {
  $(document).on('click', '.post-menu-btn', function (e) {
    e.stopPropagation();
    const $menu = $(this).siblings('.dropdown-menu');
    $('.dropdown-menu').not($menu).removeClass('open');
    $menu.toggleClass('open');
  });
  $(document).on('click', () => $('.post-card .dropdown-menu').removeClass('open'));
  $(document).on('click', '.like-btn', function () {
    const $card = $(this).closest('.post-card');
    const postId = $card.data('post-id');
    const liked = $(this).data('liked') === true;
    const $count = $card.find('.like-count');
    const current = parseInt($count.text(), 10) || 0;
    setLikedState($card, !liked);
    $count.text(liked ? (current - 1 || '') : current + 1);
    const call = liked ? apiUnlikePost(postId) : apiLikePost(postId);
    call.catch((err) => {
      setLikedState($card, liked);
      $count.text(current || '');
      if (err.status !== 409 && err.status !== 404) showToast(err.message, 'error');
    });
  });
  $(document).on('click', '.view-likes-btn', function () {
    const postId = $(this).closest('.post-card').data('post-id');
    apiGetLikes(postId).then((likes) => {
      const body = likes.length
        ? likes.map((u) =>
            '<a class="user-row" href="profile.html?id=' + u.id + '">' +
              '<img class="avatar avatar-md" src="' + avatarUrl(u.profilePicture) + '" alt="">' +
              '<span>' + escapeHtml(u.name) + '</span>' +
            '</a>'
          ).join('')
        : '<p class="text-muted text-center">No likes yet.</p>';
      showModal('Likes', body, null, null);
    }).catch((err) => showToast(err.message, 'error'));
  });
  $(document).on('click', '.post-delete', function () {
    const $card = $(this).closest('.post-card');
    confirmDialog('Delete post', 'This will permanently delete the post and its media.', 'Delete', () => {
      apiDeletePost($card.data('post-id'))
        .then(() => { $card.slideUp(200, () => $card.remove()); showToast('Post deleted.', 'success'); })
        .catch((err) => showToast(err.message, 'error'));
    });
  });
  $(document).on('click', '.post-admin-delete', function () {
    const $card = $(this).closest('.post-card');
    confirmDialog('Remove post', 'Remove this post as an administrator?', 'Remove', () => {
      apiAdminRemovePost($card.data('post-id'))
        .then(() => { $card.slideUp(200, () => $card.remove()); showToast('Post removed.', 'success'); })
        .catch((err) => showToast(err.message, 'error'));
    });
  });
  $(document).on('click', '.post-edit', function () {
    const $card = $(this).closest('.post-card');
    const postId = $card.data('post-id');
    const current = $card.find('.post-caption').text();
    showModal('Edit caption',
      '<div class="form-group"><textarea id="edit-caption" maxlength="1000">' + escapeHtml(current) + '</textarea>' +
      '<div class="char-counter" id="edit-caption-counter"></div></div>',
      'Save', () => {
        const caption = $('#edit-caption').val();
        if (caption.length > 1000) { showToast('Caption cannot exceed 1000 characters.', 'error'); return; }
        apiUpdatePost(postId, caption).then((post) => {
          closeModal();
          if (post.caption) {
            if ($card.find('.post-caption').length) $card.find('.post-caption').text(post.caption);
            else $card.find('.post-media').after('<p class="post-caption">' + escapeHtml(post.caption) + '</p>');
          } else {
            $card.find('.post-caption').remove();
          }
          showToast('Caption updated.', 'success');
        }).catch((err) => showToast(err.message, 'error'));
      });
    bindCharCounter($('#edit-caption'), $('#edit-caption-counter'), 1000);
  });
};
const createPostListLoader = ($container, $loadMoreBtn, fetchPage, emptyHtml) => {
  let page = 0, total = 0, pageSize = 10, loading = false;
  const loadNext = () => {
    if (loading) return;
    loading = true;
    const next = page + 1;
    if (next === 1) showSkeletonCards($container, 2, 'post');
    btnLoading($loadMoreBtn, true);
    fetchPage(next).then((res) => {
      if (next === 1) $container.empty();
      page = res.page; total = res.total; pageSize = res.pageSize;
      if (total === 0) { $container.html(emptyHtml); $loadMoreBtn.hide(); return; }
      res.posts.forEach((post) => {
        const $card = $(renderPostCard(post));
        $container.append($card);
        hydratePostCard($card);
      });
      $loadMoreBtn.toggle(page * pageSize < total);
    }).catch((err) => {
      if (next === 1) $container.empty();
      showToast(err.message, 'error');
    }).finally(() => {
      loading = false;
      btnLoading($loadMoreBtn, false);
    });
  };
  return { loadNext };
};
