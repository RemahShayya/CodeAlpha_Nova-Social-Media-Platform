import Mailjet from 'node-mailjet';
import env from '../config/env.js';

const mailjet = Mailjet.apiConnect(env.MAILJET_API_KEY, env.MAILJET_SECRET_KEY);


export const sendVerificationEmail = async (toEmail, toName, token) => {
  const verificationUrl = `${env.APP_URL}/api/auth/verify-email?token=${token}`;

  try {
    const result = await mailjet.post('send', { version: 'v3.1' }).request({
      Messages: [
        {
          From: { Email: env.MAIL_FROM_EMAIL, Name: env.MAIL_FROM_NAME },
          To: [{ Email: toEmail, Name: toName }],
          Subject: 'Verify your Nova account',
          HTMLPart: `
            <h2>Welcome to Nova, ${toName}!</h2>
            <p>Please verify your email address by clicking the link below:</p>
            <a href="${verificationUrl}">Verify Email</a>
            <p>This link expires in 24 hours.</p>
          `,
        },
      ],
    });
    console.log('Mailjet response:', JSON.stringify(result.body));
  } catch (err) {
    console.error('Mailjet error status:', err.statusCode);
    console.error('Mailjet error message:', JSON.stringify(err.response?.body ?? err.message));
  }
};


export const sendPasswordResetEmail = async (toEmail, toName, token) => {
  const resetUrl = `${env.APP_URL}/api/auth/reset-password?token=${token}`;

  await mailjet.post('send', { version: 'v3.1' }).request({
    Messages: [
      {
        From: { Email: env.MAIL_FROM_EMAIL, Name: env.MAIL_FROM_NAME },
        To: [{ Email: toEmail, Name: toName }],
        Subject: 'Reset your Nova password',
        HTMLPart: `
          <h2>Password Reset Request</h2>
          <p>Hi ${toName}, click the link below to reset your password:</p>
          <a href="${resetUrl}">Reset Password</a>
          <p>This link expires in 1 hour.</p>
          <p>If you did not request a password reset, ignore this email.</p>
        `,
      },
    ],
  });
};
