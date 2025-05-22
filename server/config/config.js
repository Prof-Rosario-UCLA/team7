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
  }
};