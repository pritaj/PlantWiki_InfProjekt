const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Nutrient = sequelize.define("Nutrient", {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    plantId: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    nitrogen: {
        type: DataTypes.FLOAT,
        comment: "Nitrogén igény (g/l)",
    },
    phosphorus: {
        type: DataTypes.FLOAT,
        comment: "Foszfor igény (g/l)",
    },
    potassium: {
        type: DataTypes.FLOAT,
        comment: "Kálium igény (g/l)",
    },
    ph_min: {
        type: DataTypes.FLOAT,
        comment: "Minimális pH",
    },
    ph_max: {
        type: DataTypes.FLOAT,
        comment: "Maximális pH",
    },
    watering_amount: {
        type: DataTypes.FLOAT,
        comment: "Öntözési mennyiség (liter/hét)",
    },
    fertilizing_frequency: {
        type: DataTypes.STRING,
        comment: "Trágyázási gyakoriság",
    },
});

module.exports = Nutrient;

