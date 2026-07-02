export default (sequelize, DataTypes) => {
  const Follow = sequelize.define(
    "Follow",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      followerId: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      followingId: {
        type: DataTypes.UUID,
        allowNull: false,
      },
    },
    {
      tableName: "Follows",
      timestamps: true,
      updatedAt: false,
    }
  );

  Follow.associate = (models) => {
    Follow.belongsTo(models.User, {
      foreignKey: "followerId",
      as: "Follower",
    });

    Follow.belongsTo(models.User, {
      foreignKey: "followingId",
      as: "Following",
    });
  };

  return Follow;
};