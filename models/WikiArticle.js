const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const WikiArticle = sequelize.define("WikiArticle", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  slug: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false,
  },

  image: {
    type: DataTypes.STRING,
  },

  category: {
    type: DataTypes.ENUM(
      "öntözés",
      "betegségek",
      "kártevők",
      "szaporítás",
      "szezonális gondozás",
      "egyéb",
    ),
    defaultValue: "egyéb",
  },
  plantId: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
});

module.exports = WikiArticle;

