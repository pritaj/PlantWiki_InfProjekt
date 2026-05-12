const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Disease = sequelize.define("Disease", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
  },
  symptoms: {
    type: DataTypes.TEXT,
  },
  treatment: {
    type: DataTypes.TEXT,
  },
  prevention: {
    type: DataTypes.TEXT,
  },
  type: {
    type: DataTypes.ENUM("betegség", "kártevő", "gombás", "vírusos", "egyéb"),
    defaultValue: "egyéb",
  },
});

module.exports = Disease;

