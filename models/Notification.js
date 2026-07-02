export default (sequelize, DataTypes) => {
  const Notification = sequelize.define(
    "Notification",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      recipientId: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      actorId: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      type: {
        type: DataTypes.ENUM("follow", "like", "comment"),
        allowNull: false,
      },
      postId: {
        type: DataTypes.UUID,
        allowNull: true,
      },
      commentId: {
        type: DataTypes.UUID,
        allowNull: true,
      },
      isRead: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
    },
    {
      tableName: "Notifications",
      timestamps: true,
    }
  );

  Notification.associate = (models) => {
    Notification.belongsTo(models.User, {
      foreignKey: "recipientId",
      as: "Recipient",
    });

    Notification.belongsTo(models.User, {
      foreignKey: "actorId",
      as: "Actor",
    });

    Notification.belongsTo(models.Post, {
      foreignKey: "postId",
      as: "Post",
    });

    Notification.belongsTo(models.Comment, {
      foreignKey: "commentId",
      as: "Comment",
    });
  };

  return Notification;
};