'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Posts', {
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
      caption: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      mediaUrl: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      mediaType: {
        type: Sequelize.ENUM('image', 'video'),
        allowNull: true,
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });

    // Feed query hits this constantly — index createdAt DESC for the ORDER BY
    await queryInterface.addIndex('Posts', ['userId']);
    await queryInterface.addIndex('Posts', ['createdAt']);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('Posts');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_Posts_mediaType";');
  },
};
