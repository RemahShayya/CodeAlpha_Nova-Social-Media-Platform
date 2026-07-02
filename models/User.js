export default (sequelize, DataTypes) => {
  const User = sequelize.define(
    "User",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      passwordHash: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      role: {
        type: DataTypes.ENUM("user", "admin"),
        allowNull: false,
        defaultValue: "user",
      },
      bio: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      profilePicture: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      isEmailVerified: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      emailVerificationToken: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      emailVerificationTokenExpiresAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      passwordResetToken: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      passwordResetTokenExpiresAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      tableName: "Users",
      paranoid: true,
      timestamps: true,
    }
  );

  User.associate = (models) => {
    // One user writes many posts
    User.hasMany(models.Post, {
      foreignKey: "userId",
      onDelete: "CASCADE",
    });

    // One user writes many comments
    User.hasMany(models.Comment, {
      foreignKey: "userId",
      onDelete: "CASCADE",
    });

    // One user gives many likes
    User.hasMany(models.Like, {
      foreignKey: "userId",
      onDelete: "CASCADE",
    });

    // Follows
    User.hasMany(models.Follow, {
      foreignKey: "followerId",
      as: "Following",
      onDelete: "CASCADE",
    });

    User.hasMany(models.Follow, {
      foreignKey: "followingId",
      as: "Followers",
      onDelete: "CASCADE",
    });

    // Blocks
    User.hasMany(models.Block, {
      foreignKey: "blockerId",
      as: "BlockedByMe",
      onDelete: "CASCADE",
    });

    User.hasMany(models.Block, {
      foreignKey: "blockedId",
      as: "BlockedMe",
      onDelete: "CASCADE",
    });
  };

  return User;
};