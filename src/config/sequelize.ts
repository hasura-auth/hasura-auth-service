import { Dialect, Sequelize } from 'sequelize';

const { env } = process;

const sequelize = new Sequelize(env.DB_DATABASE, env.DB_USER, env.DB_PASSWORD, {
  host: env.DB_HOST,
  dialect: env.DB_DIALECT as Dialect,
  logging: false,
  storage: env.DB_STORAGE,
  sync: { force: false },
  logQueryParameters: false
});

export default sequelize;
