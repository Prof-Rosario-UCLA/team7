'use strict';

const User = (sequelize, DataTypes) => {
  const User = sequelize.define(
    'User',
    {
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
          isEmail: true
        }
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false
      }
    },
    {
      tableName: 'user',
      timestamps: true
    }
  );

  User.associate = (models) => {
    User.belongsToMany(models.Car, {
      through: models.Driver,
      foreignKey: 'user_id',
      otherKey: 'car_id'
    });

    User.hasMany(models.Citation, {
      foreignKey: 'user_id',
      as: 'citations'
    });
  };

  return User;
};

export default User;