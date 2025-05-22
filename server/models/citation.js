'use strict';

const Citation = (sequelize, DataTypes) => {
  const Citation = sequelize.define(
    'Citation',
    {
      blob: {
        type: DataTypes.STRING, // a blob referenced by a url or file key
        allowNull: true
      },
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      car_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'cars',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      timestamp: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
      },
      location: {
        type: DataTypes.STRING,
        allowNull: false
      },
      status: {
        type: DataTypes.ENUM('submitted', 'rejected', 'accepted'),
        allowNull: false,
        defaultValue: 'submitted'
      },
      violation: {
        type: DataTypes.ENUM('speeding', 'parking', 'signal', 'other'),
        allowNull: false
      },
      notes: {
        type: DataTypes.TEXT,
        allowNull: true
      }
    },
    {
      tableName: 'citations',
      timestamps: true
    }
  );

  Citation.associate = (models) => {
    Citation.belongsTo(models.User, {
      foreignKey: 'user_id',
      as: 'user'
    });
    Citation.belongsTo(models.Car, {
      foreignKey: 'car_id',
      as: 'car'
    });
  };

  return Citation;
};

export default Citation;
