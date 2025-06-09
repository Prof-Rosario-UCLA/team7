// loads variables from .env
import dotenv from 'dotenv';
dotenv.config();

export default {
  development: {
    username: process.env.DB_USER || 'devuser',
    password: process.env.DB_PASS || 'devpass',
    database: process.env.DB_NAME || 'devdb',
    host: process.env.DB_HOST || 'localhost',
    dialect: 'postgres'
  },
  production: {
    username: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    host: `/cloudsql/${process.env.INSTANCE_CONNECTION_NAME}`, // Cloud SQL Unix socket
    dialect: 'postgres',
    dialectOptions: {
      // Cloud SQL over Unix socket requires this
      socketPath: `/cloudsql/${process.env.INSTANCE_CONNECTION_NAME}`
    }
  }
};