const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Plant = sequelize.define("Plant", {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    latin_name: {
        type: DataTypes.STRING,
    },
    description: {
        type: DataTypes.TEXT,
    },
    type: {
        type: DataTypes.ENUM(
            "beltéri",
            "kültéri",
            "vízinövény",
            "kaktusz",
            "egyéb",
        ),
        defaultValue: "egyéb",
    },
    difficulty: {
        type: DataTypes.ENUM("kezdő", "haladó", "expert"),
        defaultValue: "kezdő",
    },
    watering_frequency: {
        type: DataTypes.STRING,
    },
    sunlight: {
        type: DataTypes.ENUM("árnyékos", "félárnyékos", "napos"),
        defaultValue: "félárnyékos",
    },
    image: {
        type: DataTypes.STRING,
    },
});

module.exports = Plant;

