import { DataTypes, Model } from 'sequelize';
import sequelize from '../utils/connect.js'; 

class User extends Model {}

User.init(
  {
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false
    }
  },
  {
    sequelize,
    tableName: 'user'
  }
);

export default User;
