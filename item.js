const { DataTypes } = require("sequelize");
const sequelize = require("./sequelize");
const User = require("./user");

const Item = sequelize.define(
  "item",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    item: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    completed: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    timestamps: false,
  }
);

Item.belongsTo(User, { foreignKey: "userId" });

module.exports = Item;
