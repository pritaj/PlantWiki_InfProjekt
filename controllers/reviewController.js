const { Review, User } = require("../models");

// Értékelések lekérése növényhez
const getPlantReviews = async (req, res) => {
  try {
    const reviews = await Review.findAll({
      where: { plantId: req.params.plantId },
      include: [{ model: User, attributes: ["username"] }],
      order: [["createdAt", "DESC"]],
    });
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ message: "Szerver hiba!", error: err.message });
  }
};

const updateReview = async (req, res) => {
  try {
    const review = await Review.findByPk(req.params.id);
    if (!review) {
      return res.status(404).json({ message: "Értékelés nem található!" });
    }
    if (review.userId !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ message: "Nincs jogosultságod!" });
    }
    await review.update({
      rating: req.body.rating,
      comment: req.body.comment,
    });
    res.json({ message: "Értékelés frissítve!", review });
  } catch (err) {
    res.status(500).json({ message: "Szerver hiba!", error: err.message });
  }
};

// Értékelések lekérése termékhez
const getProductReviews = async (req, res) => {
  try {
    const reviews = await Review.findAll({
      where: { productId: req.params.productId },
      include: [{ model: User, attributes: ["username"] }],
      order: [["createdAt", "DESC"]],
    });
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ message: "Szerver hiba!", error: err.message });
  }
};

// Új értékelés hozzáadása
const createReview = async (req, res) => {
  try {
    const { plantId, productId, rating, comment } = req.body;

    // Csak növény VAGY termék lehet
    if (!plantId && !productId) {
      return res
        .status(400)
        .json({ message: "Növény vagy termék ID szükséges!" });
    }

    // Már értékelte-e?
    const existing = await Review.findOne({
      where: {
        userId: req.user.id,
        ...(plantId ? { plantId } : { productId }),
      },
    });
    if (existing) {
      return res.status(400).json({ message: "Már értékelted ezt!" });
    }

    const review = await Review.create({
      userId: req.user.id,
      plantId: plantId || null,
      productId: productId || null,
      rating,
      comment,
    });

    res.status(201).json({ message: "Értékelés sikeresen hozzáadva!", review });
  } catch (err) {
    res.status(500).json({ message: "Szerver hiba!", error: err.message });
  }
};

// Értékelés törlése
const deleteReview = async (req, res) => {
  try {
    const review = await Review.findByPk(req.params.id);
    if (!review) {
      return res.status(404).json({ message: "Értékelés nem található!" });
    }
    if (review.userId !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ message: "Nincs jogosultságod!" });
    }
    await review.destroy();
    res.json({ message: "Értékelés törölve!" });
  } catch (err) {
    res.status(500).json({ message: "Szerver hiba!", error: err.message });
  }
};

module.exports = {
  getPlantReviews,
  getProductReviews,
  createReview,
  deleteReview,
  updateReview,
};
