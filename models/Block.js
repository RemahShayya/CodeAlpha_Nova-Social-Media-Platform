export default (sequelize, DataTypes) => {
  const Block = sequelize.define(
    "Block",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      blockerId: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      blockedId: {
        type: DataTypes.UUID,
        allowNull: false,
      },
    },
    {
      tableName: "Blocks",
      timestamps: true,
      updatedAt: false,
    }
  );

  Block.associate = (models) => {
    Block.belongsTo(models.User, {
      foreignKey: "blockerId",
      as: "Blocker",
    });

    Block.belongsTo(models.User, {
      foreignKey: "blockedId",
      as: "Blocked",
    });
  };

  return Block;
};