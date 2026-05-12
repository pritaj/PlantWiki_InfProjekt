const express = require("express");
const router = express.Router();
const {
    getAllNutrients,
    getNutrientByPlantId,
    createNutrient,
    calculateNutrients,
} = require("../controllers/nutrientController");
const authMiddleware = require("../middleware/authMiddleware");

// Publikus végpontok
router.get("/", getAllNutrients);
router.get("/:plantId", getNutrientByPlantId);

// Kalkulátor
router.post("/calculate", calculateNutrients);

// Védett végpontok (csak admin)
router.post("/", authMiddleware, createNutrient);

module.exports = router;

