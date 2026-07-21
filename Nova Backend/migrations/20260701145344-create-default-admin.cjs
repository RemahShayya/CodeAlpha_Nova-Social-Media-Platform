'use strict';

const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    const passwordHash = await bcrypt.hash('Admin@1234', 12);

    await queryInterface.bulkInsert('Users', [
      {
        id: uuidv4(),
        name: 'Super Admin',
        email: 'admin@nova.com',
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
    await queryInterface.bulkDelete('Users', { email: 'admin@nova.com' });
  },
};
