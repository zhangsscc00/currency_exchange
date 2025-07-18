module.exports = (sequelize, DataTypes) => {
  const ExchangeRate = sequelize.define('ExchangeRate', {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true
    },
    from_currency: {
      type: DataTypes.STRING(3),
      allowNull: false,
      validate: {
        len: [3, 3],
        isAlpha: true,
        isUppercase: true
      }
    },
    to_currency: {
      type: DataTypes.STRING(3),
      allowNull: false,
      validate: {
        len: [3, 3],
        isAlpha: true,
        isUppercase: true
      }
    },
    rate: {
      type: DataTypes.DECIMAL(15, 6),
      allowNull: false,
      validate: {
        min: 0
      }
    },
    source_provider: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    valid_until: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    tableName: 'exchange_rates',
    timestamps: true,
    underscored: true,
    indexes: [
      {
        fields: ['from_currency', 'to_currency']
      },
      {
        fields: ['created_at']
      }
    ]
  });

  ExchangeRate.associate = function(models) {
    // ExchangeRate doesn't have direct foreign key relationships
    // but references currency codes
  };

  return ExchangeRate;
}; 