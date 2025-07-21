module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: true,
      unique: true,
      validate: {
        isEmail: true
      }
    },
    phone: {
      type: DataTypes.STRING(20),
      allowNull: true,
      unique: true,
      validate: {
        is: /^1[3-9]\d{9}$/ // 中国手机号验证
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
    },
    is_phone_verified: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    is_email_verified: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    last_login_at: {
      type: DataTypes.DATE,
      allowNull: true
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
        unique: true,
        fields: ['phone']
      },
      {
        fields: ['is_active']
      },
      {
        fields: ['is_phone_verified']
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