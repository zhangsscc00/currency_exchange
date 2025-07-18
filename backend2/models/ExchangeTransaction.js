module.exports = (sequelize, DataTypes) => {
  const ExchangeTransaction = sequelize.define('ExchangeTransaction', {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true
    },
    user_id: {
      type: DataTypes.BIGINT,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    reference_number: {
      type: DataTypes.STRING(255),
      allowNull: true,
      unique: true
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
    from_amount: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      validate: {
        min: 0
      }
    },
    to_amount: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      validate: {
        min: 0
      }
    },
    exchange_rate: {
      type: DataTypes.DECIMAL(15, 6),
      allowNull: false,
      validate: {
        min: 0
      }
    },
    fee_amount: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: true,
      validate: {
        min: 0
      }
    },
    status: {
      type: DataTypes.ENUM('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'CANCELLED'),
      allowNull: false,
      defaultValue: 'PENDING'
    },
    completed_at: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    tableName: 'exchange_transactions',
    timestamps: true,
    underscored: true,
    hooks: {
      beforeCreate: (transaction) => {
        if (!transaction.reference_number) {
          transaction.reference_number = `TXN-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
        }
      }
    },
    indexes: [
      {
        fields: ['user_id']
      },
      {
        unique: true,
        fields: ['reference_number']
      },
      {
        fields: ['status']
      },
      {
        fields: ['created_at']
      },
      {
        fields: ['from_currency', 'to_currency']
      }
    ]
  });

  ExchangeTransaction.associate = function(models) {
    ExchangeTransaction.belongsTo(models.User, {
      foreignKey: 'user_id',
      as: 'user'
    });
  };

  return ExchangeTransaction;
}; 