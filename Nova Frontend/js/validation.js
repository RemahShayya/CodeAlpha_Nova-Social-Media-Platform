const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
const setFieldError = ($input, message) => {
  const $group = $input.closest('.form-group');
  $group.addClass('has-error');
  $group.find('.field-error').text(message);
};
const clearFieldError = ($input) => {
  $input.closest('.form-group').removeClass('has-error');
};
const clearAllErrors = ($form) => $form.find('.form-group').removeClass('has-error');
const validateRequired = ($input, label) => {
  if (!$input.val().trim()) { setFieldError($input, label + ' is required.'); return false; }
  clearFieldError($input); return true;
};
const validateEmailField = ($input) => {
  const v = $input.val().trim();
  if (!v) { setFieldError($input, 'Email is required.'); return false; }
  if (!isValidEmail(v)) { setFieldError($input, 'Enter a valid email address.'); return false; }
  clearFieldError($input); return true;
};
const validatePasswordField = ($input, minLength = 8) => {
  const v = $input.val();
  if (!v) { setFieldError($input, 'Password is required.'); return false; }
  if (v.length < minLength) { setFieldError($input, 'Password must be at least ' + minLength + ' characters.'); return false; }
  clearFieldError($input); return true;
};
const validatePasswordsMatch = ($password, $confirm) => {
  if ($password.val() !== $confirm.val()) {
    setFieldError($confirm, 'Passwords do not match.'); return false;
  }
  clearFieldError($confirm); return true;
};
const validateMaxLength = ($input, max, label) => {
  if ($input.val().length > max) {
    setFieldError($input, label + ' cannot exceed ' + max + ' characters.'); return false;
  }
  clearFieldError($input); return true;
};
const bindCharCounter = ($input, $counter, max) => {
  const update = () => {
    const len = $input.val().length;
    $counter.text(len + ' / ' + max).toggleClass('over', len > max);
  };
  $input.on('input', update);
  update();
};
const bindPasswordToggles = () => {
  $(document).on('click', '.password-toggle', function () {
    const $input = $(this).siblings('input');
    const isPw = $input.attr('type') === 'password';
    $input.attr('type', isPw ? 'text' : 'password');
    $(this).text(isPw ? '🙈' : '👁');
  });
};
const validateImageFile = (file, maxMB) => {
  const allowed = ['image/jpeg', 'image/png', 'image/webp'];
  if (!allowed.includes(file.type)) return 'Only JPEG, PNG, and WebP images are allowed.';
  if (file.size > maxMB * 1024 * 1024) return 'Image must be under ' + maxMB + 'MB.';
  return null;
};
const validateMediaFile = (file, maxMB) => {
  const allowed = ['image/jpeg', 'image/png', 'image/webp', 'video/mp4', 'video/quicktime'];
  if (!allowed.includes(file.type)) return 'Only JPEG, PNG, WebP images or MP4/MOV videos are allowed.';
  if (file.size > maxMB * 1024 * 1024) return 'File must be under ' + maxMB + 'MB.';
  return null;
};
