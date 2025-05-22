'use strict';

const Driver = (sequelize, DataTypes) => {
  const Driver = sequelize.define(
    'Driver',
    {
      car_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'cars',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onDelete: 'CASCADE'
      }
    },
    {
      tableName: 'drivers',
      timestamps: true,
      indexes: [
        {
          unique: true,
          fields: ['car_id', 'user_id']
        }
      ]
    }
  );

  Driver.associate = (models) => {
    Driver.belongsTo(models.Car, { foreignKey: 'car_id' });
    Driver.belongsTo(models.User, { foreignKey: 'user_id' });
  };

  return Driver;
};

export default Driver;
