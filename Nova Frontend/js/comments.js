const renderComment = (comment) => {
  const author = comment.User || { id: comment.userId, name: 'User', profilePicture: null };
  const own = isOwnContent(author.id);
  const admin = isAdmin();
  let actions = '';
  if (own && isUser()) {
    actions =
      '<div class="comment-actions">' +
        '<button class="comment-edit">Edit</button>' +
        '<button class="comment-delete danger">Delete</button>' +
      '</div>';
  } else if (admin) {
    actions =
      '<div class="comment-actions">' +
        '<button class="comment-admin-delete danger">Remove</button>' +
      '</div>';
  }
  return (
    '<div class="comment-card" data-comment-id="' + comment.id + '">' +
      '<a href="profile.html?id=' + author.id + '">' +
        '<img class="avatar avatar-sm" src="' + avatarUrl(author.profilePicture) + '" alt="">' +
      '</a>' +
      '<div class="comment-body">' +
        '<div class="comment-head">' +
          '<a href="profile.html?id=' + author.id + '">' + escapeHtml(author.name) + '</a>' +
          '<span class="post-time">' + formatDate(comment.createdAt) + '</span>' +
        '</div>' +
        '<p class="comment-content">' + escapeHtml(comment.content) + '</p>' +
        actions +
      '</div>' +
    '</div>'
  );
};
const loadComments = (postId, $container) => {
  return apiGetComments(postId).then((comments) => {
    if (!comments.length) {
      $container.html(emptyStateHtml('💬', 'No comments yet', isUser() ? 'Be the first to say something.' : ''));
      return comments;
    }
    $container.html(comments.map(renderComment).join(''));
    return comments;
  }).catch((err) => {
    $container.html(emptyStateHtml('⚠️', 'Could not load comments', err.message));
    throw err;
  });
};
const initCommentHandlers = (postId, $list, onCountChange) => {
  $(document).on('click', '.comment-delete', function () {
    const $card = $(this).closest('.comment-card');
    confirmDialog('Delete comment', 'This comment will be permanently removed.', 'Delete', () => {
      apiDeleteComment($card.data('comment-id'))
        .then(() => {
          $card.slideUp(150, () => {
            $card.remove();
            if (!$list.find('.comment-card').length) loadComments(postId, $list);
          });
          showToast('Comment deleted.', 'success');
          if (onCountChange) onCountChange(-1);
        })
        .catch((err) => showToast(err.message, 'error'));
    });
  });
  $(document).on('click', '.comment-admin-delete', function () {
    const $card = $(this).closest('.comment-card');
    confirmDialog('Remove comment', 'Remove this comment as an administrator?', 'Remove', () => {
      apiAdminRemoveComment($card.data('comment-id'))
        .then(() => {
          $card.slideUp(150, () => {
            $card.remove();
            if (!$list.find('.comment-card').length) loadComments(postId, $list);
          });
          showToast('Comment removed.', 'success');
          if (onCountChange) onCountChange(-1);
        })
        .catch((err) => showToast(err.message, 'error'));
    });
  });
  $(document).on('click', '.comment-edit', function () {
    const $card = $(this).closest('.comment-card');
    if ($card.find('.comment-edit-form').length) return;
    const $content = $card.find('.comment-content');
    const original = $content.text();
    $content.hide();
    $card.find('.comment-actions').hide();
    $content.after(
      '<div class="comment-edit-form">' +
        '<textarea maxlength="500" style="min-height:60px">' + escapeHtml(original) + '</textarea>' +
        '<div class="char-counter"></div>' +
        '<div style="display:flex;gap:var(--space-2);margin-top:var(--space-2)">' +
          '<button class="btn btn-primary btn-sm comment-save">Save</button>' +
          '<button class="btn btn-ghost btn-sm comment-cancel">Cancel</button>' +
        '</div>' +
      '</div>'
    );
    const $form = $card.find('.comment-edit-form');
    bindCharCounter($form.find('textarea'), $form.find('.char-counter'), 500);
    const restore = () => { $form.remove(); $content.show(); $card.find('.comment-actions').show(); };
    $form.find('.comment-cancel').on('click', restore);
    $form.find('.comment-save').on('click', function () {
      const content = $form.find('textarea').val().trim();
      if (!content) { showToast('Comment cannot be empty.', 'error'); return; }
      if (content.length > 500) { showToast('Comment cannot exceed 500 characters.', 'error'); return; }
      btnLoading($(this), true);
      apiUpdateComment($card.data('comment-id'), content)
        .then((updated) => { $content.text(updated.content); restore(); showToast('Comment updated.', 'success'); })
        .catch((err) => { btnLoading($(this), false); showToast(err.message, 'error'); });
    });
  });
};
