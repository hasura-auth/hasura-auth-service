const dotenv = require('dotenv');

const { env } = process;
dotenv.config();

module.exports = {
  development: {
    dialect: env.DB_DIALECT,
    username: env.DB_USER,
    password: env.DB_PASSWORD,
    host: env.DB_HOST,
    database: env.DB_DATABASE,
    schema: env.DB_SCHEMA
  }
};
