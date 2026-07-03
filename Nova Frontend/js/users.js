/* ============================================================
   Nova — users: user card + follow/unfollow handlers.
   Depends on: api.js, ui.js, utils.js, auth.js
   ============================================================ */

/* User card. followState: 'following' | 'not-following' | null (hide button). */
const renderUserCard = (user, followState) => {
  let action = '';
  if (isUser() && followState !== null && user.id !== currentUserId()) {
    action = followState === 'following'
      ? '<button class="btn btn-secondary btn-sm follow-toggle" data-following="true">Following</button>'
      : '<button class="btn btn-primary btn-sm follow-toggle" data-following="false">Follow</button>';
  }
  return (
    '<div class="card user-card" data-user-id="' + user.id + '">' +
      '<a href="profile.html?id=' + user.id + '">' +
        '<img class="avatar avatar-md" src="' + avatarUrl(user.profilePicture) + '" alt="">' +
      '</a>' +
      '<div class="user-card-info">' +
        '<a href="profile.html?id=' + user.id + '">' + escapeHtml(user.name) + '</a>' +
        (user.bio ? '<div class="user-card-bio">' + escapeHtml(user.bio) + '</div>' : '') +
      '</div>' + action +
    '</div>'
  );
};

/* Fetch the id set of everyone the current user follows —
   used to seed follow-button state (backend has no per-user flag). */
const getMyFollowingIds = () => {
  if (!isUser()) return Promise.resolve(new Set());
  return apiGetFollowing(currentUserId())
    .then((list) => new Set(list.map((u) => u.id)))
    .catch(() => new Set());
};

/* Delegated follow/unfollow — bind once via initUserHandlers(). */
const initUserHandlers = () => {
  $(document).on('click', '.follow-toggle', function () {
    const $btn = $(this);
    const userId = $btn.closest('[data-user-id]').data('user-id');
    const following = $btn.data('following') === true;

    // Optimistic flip.
    setFollowBtn($btn, !following);
    const call = following ? apiUnfollowUser(userId) : apiFollowUser(userId);
    call.catch((err) => {
      // 409 = already following; 404 on unfollow = wasn't. Re-sync silently.
      if (err.status === 409) setFollowBtn($btn, true);
      else if (err.status === 404 && following) setFollowBtn($btn, false);
      else { setFollowBtn($btn, following); showToast(err.message, 'error'); }
    });
  });
};

const setFollowBtn = ($btn, following) => {
  $btn.data('following', following)
    .text(following ? 'Following' : 'Follow')
    .toggleClass('btn-secondary', following)
    .toggleClass('btn-primary', !following);
};
