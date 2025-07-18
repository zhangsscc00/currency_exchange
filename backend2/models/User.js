module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true
      }
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    password_hash: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    default_currency: {
      type: DataTypes.STRING(3),
      allowNull: true,
      defaultValue: 'USD'
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    }
  }, {
    tableName: 'users',
    timestamps: true,
    underscored: true,
    indexes: [
      {
        unique: true,
        fields: ['email']
      },
      {
        fields: ['is_active']
      }
    ]
  });

  User.associate = function(models) {
    User.hasMany(models.ExchangeTransaction, {
      foreignKey: 'user_id',
      as: 'exchangeTransactions'
    });
    User.hasMany(models.Watchlist, {
      foreignKey: 'user_id',
      as: 'watchlists'
    });
  };

  return User;
}; 