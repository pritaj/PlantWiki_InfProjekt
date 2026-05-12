const express = require("express");
const router = express.Router();
const {
  getPlantReviews,
  getProductReviews,
  createReview,
  deleteReview,
  updateReview,
} = require("../controllers/reviewController");
const authMiddleware = require("../middleware/authMiddleware");

router.put("/:id", authMiddleware, updateReview);
// Publikus végpontok
router.get("/plants/:plantId", getPlantReviews);
router.get("/products/:productId", getProductReviews);

// Védett végpontok
router.post("/", authMiddleware, createReview);
router.delete("/:id", authMiddleware, deleteReview);

module.exports = router;
