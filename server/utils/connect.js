const { Sequelize } = require('sequelize');
require('dotenv').config({ path: '../.env' });

let sequelize; //for caching

async function connectToDB() {
  if (sequelize) return sequelize;

  sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASS,
    {
      host: process.env.DB_HOST,
      dialect: 'postgres',
      logging: false
    }
  );

  try { // Checking if connected
    await sequelize.authenticate();
    console.log('Connected to the database');
    return sequelize;
  } catch (error) {
    console.error('Unable to connect to the database:', error);
    throw error;
  }
}

module.exports = { connectToDB };
