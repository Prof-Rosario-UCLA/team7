require('dotenv').config({ path: '../.env' }); // loads variables from .env

module.exports = {
  development: {
    username: process.env.DB_USER || 'devuser',
    password: process.env.DB_PASS || 'devpass',
    database: process.env.DB_NAME || 'devdb',
    host: process.env.DB_HOST || 'localhost',
    dialect: 'postgres'
  }
};