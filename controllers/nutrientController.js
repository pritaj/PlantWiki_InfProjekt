const { Nutrient, Plant } = require("../models");

// Összes tápanyagadat listázása
const getAllNutrients = async (req, res) => {
    try {
        const nutrients = await Nutrient.findAll({
            include: [{ model: Plant, attributes: ["id", "name"] }],
        });
        res.json(nutrients);
    } catch (err) {
        res.status(500).json({ message: "Szerver hiba!", error: err.message });
    }
};

// Egy növény tápanyagigénye
const getNutrientByPlantId = async (req, res) => {
    try {
        const nutrient = await Nutrient.findOne({
            where: { plantId: req.params.plantId },
            include: [{ model: Plant, attributes: ["id", "name"] }],
        });
        if (!nutrient) {
            return res.status(404).json({ message: "Tápanyagadat nem található!" });
        }
        res.json(nutrient);
    } catch (err) {
        res.status(500).json({ message: "Szerver hiba!", error: err.message });
    }
};

// Tápanyagadat hozzáadása (csak admin)
const createNutrient = async (req, res) => {
    try {
        const {
            plantId,
            nitrogen,
            phosphorus,
            potassium,
            ph_min,
            ph_max,
            watering_amount,
            fertilizing_frequency,
        } = req.body;

        // Létezik-e már ehhez a növényhez?
        const existing = await Nutrient.findOne({ where: { plantId } });
        if (existing) {
            return res
                .status(400)
                .json({ message: "Ehhez a növényhez már van tápanyagadat!" });
        }

        const nutrient = await Nutrient.create({
            plantId,
            nitrogen,
            phosphorus,
            potassium,
            ph_min,
            ph_max,
            watering_amount,
            fertilizing_frequency,
        });
        res
            .status(201)
            .json({ message: "Tápanyagadat sikeresen hozzáadva!", nutrient });
    } catch (err) {
        res.status(500).json({ message: "Szerver hiba!", error: err.message });
    }
};

// Tápanyag kalkulátor
const calculateNutrients = async (req, res) => {
    try {
        const { plantId, area, pot_count } = req.body;
        // area = terület m2-ben, pot_count = cserépszám

        const nutrient = await Nutrient.findOne({ where: { plantId } });
        if (!nutrient) {
            return res
                .status(404)
                .json({ message: "Tápanyagadat nem található ehhez a növényhez!" });
        }

        const multiplier = area || pot_count || 1;

        const result = {
            nitrogen: (nutrient.nitrogen * multiplier).toFixed(2),
            phosphorus: (nutrient.phosphorus * multiplier).toFixed(2),
            potassium: (nutrient.potassium * multiplier).toFixed(2),
            watering_amount: (nutrient.watering_amount * multiplier).toFixed(2),
            ph_min: nutrient.ph_min,
            ph_max: nutrient.ph_max,
            fertilizing_frequency: nutrient.fertilizing_frequency,
            unit: area ? "m²" : "cserép",
            multiplier,
        };

        res.json({ message: "Kalkuláció kész!", result });
    } catch (err) {
        res.status(500).json({ message: "Szerver hiba!", error: err.message });
    }
};

module.exports = {
    getAllNutrients,
    getNutrientByPlantId,
    createNutrient,
    calculateNutrients,
};

