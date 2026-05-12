const express = require("express");
const router = express.Router();
const {
    getAllPlants,
    getPlantById,
    createPlant,
    updatePlant,
    deletePlant,
} = require("../controllers/plantController");
const authMiddleware = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");

// Publikus végpontok
router.get("/", getAllPlants);
router.get("/:id", getPlantById);

// Védett végpontok (kell token)
router.post("/", authMiddleware, upload.single("image"), createPlant);
router.put("/:id", authMiddleware, upload.single("image"), updatePlant);
router.delete("/:id", authMiddleware, deletePlant);

module.exports = router;

