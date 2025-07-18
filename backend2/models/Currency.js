module.exports = (sequelize, DataTypes) => {
  const Currency = sequelize.define('Currency', {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true
    },
    code: {
      type: DataTypes.STRING(3),
      allowNull: false,
      unique: true,
      validate: {
        len: [3, 3],
        isAlpha: true,
        isUppercase: true
      }
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    symbol: {
      type: DataTypes.STRING(10),
      allowNull: false
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    }
  }, {
    tableName: 'currencies',
    timestamps: true,
    underscored: true,
    indexes: [
      {
        unique: true,
        fields: ['code']
      },
      {
        fields: ['is_active']
      }
    ]
  });

  // No associations for Currency as it's referenced by other tables
  Currency.associate = function(models) {
    // Currency is referenced by other models but doesn't have direct associations
  };

  return Currency;
}; 