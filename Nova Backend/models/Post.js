export default (sequelize, DataTypes) => {
  const Post = sequelize.define(
    "Post",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      userId: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      caption: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      mediaUrl: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      mediaType: {
        type: DataTypes.ENUM("image", "video"),
        allowNull: true,
      },
    },
    {
      tableName: "Posts",
      timestamps: true,
    }
  );

  Post.associate = (models) => {
    // Post belongs to the user who wrote it
    Post.belongsTo(models.User, {
      foreignKey: "userId",
    });

    // Post has many comments and likes
    Post.hasMany(models.Comment, {
      foreignKey: "postId",
      onDelete: "CASCADE",
    });

    Post.hasMany(models.Like, {
      foreignKey: "postId",
      onDelete: "CASCADE",
    });
  };

  return Post;
};