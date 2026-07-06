const notificationText = (n) => {
  const actor = '<b>' + escapeHtml(n.Actor ? n.Actor.name : 'Someone') + '</b>';
  if (n.type === 'follow') return actor + ' started following you';
  if (n.type === 'like') return actor + ' liked your post';
  if (n.type === 'comment') return actor + ' commented on your post';
  return actor + ' interacted with you';
};
const notificationTarget = (n) => {
  if ((n.type === 'like' || n.type === 'comment') && n.postId) return 'post.html?id=' + n.postId;
  if (n.type === 'follow' && n.actorId) return 'profile.html?id=' + n.actorId;
  return null;
};
const renderNotification = (n) => {
  return (
    '<div class="notification-card' + (n.isRead ? '' : ' unread') + '" data-notification-id="' + n.id + '" data-target="' + (notificationTarget(n) || '') + '">' +
      '<img class="avatar avatar-md" src="' + avatarUrl(n.Actor ? n.Actor.profilePicture : null) + '" alt="">' +
      '<div class="notification-text">' + notificationText(n) +
        '<div class="post-time">' + formatDate(n.createdAt) + '</div>' +
      '</div>' +
      (n.isRead ? '' : '<span class="unread-dot"></span>') +
    '</div>'
  );
};
const initNotificationHandlers = () => {
  $(document).on('click', '.notification-card', function () {
    const $card = $(this);
    const id = $card.data('notification-id');
    const target = $card.data('target');
    const go = () => { if (target) window.location.href = target; };
    if ($card.hasClass('unread')) {
      apiMarkNotificationRead(id)
        .then(() => {
          $card.removeClass('unread').find('.unread-dot').remove();
          go();
        })
        .catch(() => go());
    } else {
      go();
    }
  });
};
