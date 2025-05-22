'use strict';

const Car = (sequelize, DataTypes) => {
  const Car = sequelize.define(
    'Car', 
    {
      license_plate_num: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
      },
      car_color: {
        type: DataTypes.STRING,
        allowNull: true
      },
      car_model: {
        type: DataTypes.STRING,
        allowNull: true
      }
    },
    {
      tableName: 'cars',
      timestamps: true
    }
  );

  Car.associate = (models) => {
    Car.belongsToMany(models.User, {
      through: models.Driver,
      foreignKey: 'car_id',
      otherKey: 'user_id'
    });

    Car.hasMany(models.Citation, {
      foreignKey: 'car_id',
      as: 'citations'
    });
  };

  return Car;
};

export default Car;
