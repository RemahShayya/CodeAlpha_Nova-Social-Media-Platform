'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Follows', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      followerId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id',
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },
      followingId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id',
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });

    // Unique composite index — prevents duplicate follows at the DB level
    await queryInterface.addIndex('Follows', ['followerId', 'followingId'], {
      unique: true,
      name: 'follows_followerId_followingId_unique',
    });

    // CHECK constraint to prevent self-follow.
    // Service layer checks first; this is the DB safety net (same pattern as a
    // SQL CHECK constraint backing up a domain rule in EF Core).
    await queryInterface.sequelize.query(`
      ALTER TABLE "Follows"
      ADD CONSTRAINT "follows_no_self_follow"
      CHECK ("followerId" != "followingId");
    `);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('Follows');
  },
};
