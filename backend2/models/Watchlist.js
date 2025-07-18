module.exports = (sequelize, DataTypes) => {
  const Watchlist = sequelize.define('Watchlist', {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true
    },
    user_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
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
    }
  }, {
    tableName: 'watchlists',
    timestamps: true,
    underscored: true,
    indexes: [
      {
        fields: ['user_id']
      },
      {
        fields: ['from_currency', 'to_currency']
      },
      {
        unique: true,
        fields: ['user_id', 'from_currency', 'to_currency'],
        name: 'unique_user_currency_pair'
      }
    ]
  });

  Watchlist.associate = function(models) {
    Watchlist.belongsTo(models.User, {
      foreignKey: 'user_id',
      as: 'user'
    });
  };

  return Watchlist;
}; 