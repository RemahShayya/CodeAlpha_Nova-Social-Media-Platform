/**
 * Strips sensitive fields from a User instance before returning it to the
 * client — the equivalent of a response DTO in ASP.NET Core.
 *
 * Previously duplicated in both jwtService.js and userService.js.
 * Extracted here so both services import from one place instead of
 * maintaining two copies that could drift apart.
 */
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
