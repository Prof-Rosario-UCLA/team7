'use strict';

const Citation = (sequelize, DataTypes) => {
  const Citation = sequelize.define(
    'Citation',
    {
      blob: {
        type: DataTypes.BLOB,
        allowNull: true,
        comment: 'Binary data for uploaded media'
      },
      media_type: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: 'MIME type of the uploaded media'
      },
      media_filename: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: 'Original filename of the uploaded media'
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
        type: DataTypes.GEOGRAPHY('POINT', 4326),
        allowNull: false
      },
      status: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'submitted',
        validate: {
          isIn: [['submitted', 'rejected', 'accepted']]
        }
      },
      violation: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          isIn: [['speeding', 'parking', 'signal', 'other']]
        }
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
