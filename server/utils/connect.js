import { Sequelize, DataTypes } from 'sequelize';
import dotenv from 'dotenv';
dotenv.config();

const isProd = process.env.GAE_ENV === 'standard'; // ✅ true on GAE

let sequelize;

if (isProd) {
  console.log('🏠 Using DB host:', process.env.DB_HOST);
  sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASS,
    {
      host: process.env.DB_HOST, // e.g., localhost
      dialect: 'postgres',
      logging: false,
    }
  );
}

// Register models
import defineUser     from '../models/user.js';
import defineCar      from '../models/car.js';
import defineCitation from '../models/citation.js';
import defineDriver   from '../models/driver.js';

const User     = defineUser(sequelize, DataTypes);
const Car      = defineCar(sequelize, DataTypes);
const Citation = defineCitation(sequelize, DataTypes);
const Driver   = defineDriver(sequelize, DataTypes);

// Setup associations
const models = { User, Car, Citation, Driver };
if (User.associate)     User.associate(models);
if (Car.associate)      Car.associate(models);
if (Citation.associate) Citation.associate(models);
if (Driver.associate)   Driver.associate(models);

export default sequelize;
