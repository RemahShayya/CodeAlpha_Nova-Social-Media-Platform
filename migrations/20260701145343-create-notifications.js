'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Notifications', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      recipientId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'Users', key: 'id' },
        onDelete: 'CASCADE',
      },
      actorId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'Users', key: 'id' },
        onDelete: 'CASCADE',
      },
      type: {
        type: Sequelize.ENUM('follow', 'like', 'comment'),
        allowNull: false,
      },
      postId: {
        type: Sequelize.UUID,
        allowNull: true,
        references: { model: 'Posts', key: 'id' },
        onDelete: 'CASCADE',
      },
      commentId: {
        type: Sequelize.UUID,
        allowNull: true,
        references: { model: 'Comments', key: 'id' },
        onDelete: 'CASCADE',
      },
      isRead: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
    });

    // Not unique — a user can be notified about the same actor/type more than
    // once (e.g. liking, unliking, liking again). These just speed up the
    // two read patterns: "my notifications" and "my unread notifications".
    await queryInterface.addIndex('Notifications', ['recipientId', 'createdAt'], {
      name: 'notifications_recipient_created_idx',
    });
    await queryInterface.addIndex('Notifications', ['recipientId', 'isRead'], {
      name: 'notifications_recipient_unread_idx',
    });

    // Same spirit as the Follows/Blocks self-reference CHECK constraints —
    // a user should never generate a notification for themselves.
    await queryInterface.sequelize.query(
      'ALTER TABLE "Notifications" ADD CONSTRAINT "notifications_no_self_notify_check" CHECK ("recipientId" <> "actorId");'
    );
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('Notifications');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_Notifications_type";');
  },
};