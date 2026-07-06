const sanitizeUser = (user) => {
  const {
    passwordHash,
    emailVerificationToken,
    emailVerificationTokenExpiresAt,
    passwordResetToken,
    passwordResetTokenExpiresAt,
    ...safe
  } = user.toJSON();
  return safe;
};

export default sanitizeUser;
