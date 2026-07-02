'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Blocks', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      blockerId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id',
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },
      blockedId: {
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

    // Unique composite index — prevents duplicate block records at the DB level
    await queryInterface.addIndex('Blocks', ['blockerId', 'blockedId'], {
      unique: true,
      name: 'blocks_blockerId_blockedId_unique',
    });

    // CHECK constraint to prevent self-block
    await queryInterface.sequelize.query(`
      ALTER TABLE "Blocks"
      ADD CONSTRAINT "blocks_no_self_block"
      CHECK ("blockerId" != "blockedId");
    `);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('Blocks');
  },
};
