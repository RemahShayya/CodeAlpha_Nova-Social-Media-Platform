'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Likes', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      userId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id',
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },
      postId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'Posts',
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

    // Unique composite index — same role as a unique constraint in EF Core's OnModelCreating.
    // Prevents a user liking the same post twice at the DB level, not just the service layer.
    await queryInterface.addIndex('Likes', ['userId', 'postId'], {
      unique: true,
      name: 'likes_userId_postId_unique',
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('Likes');
  },
};
