// models/exchangeRate.js

module.exports = (sequelize, DataTypes) => {
  const ExchangeRate = sequelize.define('ExchangeRate', {
    currency_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      references: {
        model: 'currencies', // name of the table, not the model
        key: 'id',
      },
    },
    date: {
      type: DataTypes.INTEGER, // Format: YYYYMMDD
      allowNull: false,
      primaryKey: true,
    },
    rate: {
      type: DataTypes.DOUBLE,
      allowNull: false,
    },
  }, {
    tableName: 'exchange_rate',
    timestamps: false,
  });

  // Setup association (optional but recommended)
  ExchangeRate.associate = function(models) {
    ExchangeRate.belongsTo(models.Currency, {
      foreignKey: 'currency_id',
      as: 'currency',
    });
  };

  return ExchangeRate;
};