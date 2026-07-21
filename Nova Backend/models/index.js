import { Sequelize, DataTypes } from 'sequelize';
import env from '../config/env.js';

import defineUser from './User.js';
import definePost from './Post.js';
import defineComment from './Comment.js';
import defineLike from './Like.js';
import defineFollow from './Follow.js';
import defineBlock from './Block.js';
import defineNotification from './Notification.js';

const sequelize = new Sequelize(env.DB_NAME, env.DB_USER, env.DB_PASSWORD, {
  host: env.DB_HOST,
  port: env.DB_PORT,
  dialect: 'postgres',
  dialectOptions:
    env.DB_HOST === 'localhost' || env.DB_HOST === '127.0.0.1'
      ? {}
      : { ssl: { require: true, rejectUnauthorized: false } },
  logging: env.NODE_ENV === 'development' ? console.log : false,
});

const User = defineUser(sequelize, DataTypes);
const Post = definePost(sequelize, DataTypes);
const Comment = defineComment(sequelize, DataTypes);
const Like = defineLike(sequelize, DataTypes);
const Follow = defineFollow(sequelize, DataTypes);
const Block = defineBlock(sequelize, DataTypes);
const Notification = defineNotification(sequelize, DataTypes);

const models = { User, Post, Comment, Like, Follow, Block, Notification };

Object.values(models).forEach((model) => {
  if (model.associate) model.associate(models);
});

export { sequelize, Sequelize };
export default models;