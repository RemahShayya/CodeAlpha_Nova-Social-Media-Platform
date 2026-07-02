'use strict';
import env from '../config/env.js';

const adminName = env.ADMIN_NAME;
const adminEmail = env.ADMIN_EMAIL;
const adminPassword = env.ADMIN_PASSWORD;

const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    const passwordHash = await bcrypt.hash(adminPassword, env.SALT_ROUNDS);

    await queryInterface.bulkInsert('Users', [
      {
        id: uuidv4(),
        name: adminName,
        email: adminEmail,
        passwordHash,
        role: 'admin',
        isEmailVerified: true,
        bio: null,
        profilePicture: null,
        emailVerificationToken: null,
        emailVerificationTokenExpiresAt: null,
        passwordResetToken: null,
        passwordResetTokenExpiresAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('Users', { email: adminEmail });
  },
};
