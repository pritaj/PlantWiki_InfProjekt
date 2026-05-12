const { Plant } = require("../models");

// Összes növény listázása
const getAllPlants = async (req, res) => {
    try {
        const plants = await Plant.findAll();
        res.json(plants);
    } catch (err) {
        res.status(500).json({ message: "Szerver hiba!", error: err.message });
    }
};

// Egy növény lekérése
const getPlantById = async (req, res) => {
    try {
        const plant = await Plant.findByPk(req.params.id);
        if (!plant) {
            return res.status(404).json({ message: "Növény nem található!" });
        }
        res.json(plant);
    } catch (err) {
        res.status(500).json({ message: "Szerver hiba!", error: err.message });
    }
};

// Új növény hozzáadása
const createPlant = async (req, res) => {
    try {
        const {
            name,
            latin_name,
            description,
            type,
            difficulty,
            watering_frequency,
            sunlight,
        } = req.body;
        const plant = await Plant.create({
            name,
            latin_name,
            description,
            type,
            difficulty,
            watering_frequency,
            sunlight,
            image: req.file ? req.file.filename : null,
        });
        res.status(201).json({ message: "Növény sikeresen hozzáadva!", plant });
    } catch (err) {
        res.status(500).json({ message: "Szerver hiba!", error: err.message });
    }
};

// Növény szerkesztése
const updatePlant = async (req, res) => {
    try {
        const plant = await Plant.findByPk(req.params.id);
        if (!plant) {
            return res.status(404).json({ message: "Növény nem található!" });
        }
        const updateData = {
            name: req.body.name,
            latin_name: req.body.latin_name,
            description: req.body.description,
            type: req.body.type,
            difficulty: req.body.difficulty,
            watering_frequency: req.body.watering_frequency,
            sunlight: req.body.sunlight,
        };
        if (req.file) {
            updateData.image = req.file.filename;
        }
        await plant.update(updateData);
        res.json({ message: "Növény sikeresen frissítve!", plant });
    } catch (err) {
        console.error("Update error:", err);
        res.status(500).json({ message: "Szerver hiba!", error: err.message });
    }
};

// Növény törlése
const deletePlant = async (req, res) => {
    try {
        const plant = await Plant.findByPk(req.params.id);
        if (!plant) {
            return res.status(404).json({ message: "Növény nem található!" });
        }
        await plant.destroy();
        res.json({ message: "Növény sikeresen törölve!" });
    } catch (err) {
        res.status(500).json({ message: "Szerver hiba!", error: err.message });
    }
};

module.exports = {
    getAllPlants,
    getPlantById,
    createPlant,
    updatePlant,
    deletePlant,
};

