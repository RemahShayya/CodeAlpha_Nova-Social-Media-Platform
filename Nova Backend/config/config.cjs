require('dotenv').config();

const isLocal =
  process.env.DB_HOST === 'localhost' || process.env.DB_HOST === '127.0.0.1';

const base = {
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  dialect: 'postgres',
  dialectOptions: isLocal
    ? {}
    : { ssl: { require: true, rejectUnauthorized: false } },
};

module.exports = {
  development: base,
  production: base,
};