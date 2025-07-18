// models/currency.js

module.exports = (sequelize, DataTypes) => {
  const Currency = sequelize.define('Currency', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    code: {
      type: DataTypes.CHAR(3),
      allowNull: false,
      unique: true,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  }, {
    tableName: 'currencies',
    timestamps: false,
  });

  // Optional association
  Currency.associate = function(models) {
    Currency.hasMany(models.ExchangeRate, {
      foreignKey: 'currency_id',
      as: 'exchangeRates',
    });
  };

  return Currency;
};