const { Favorite, Plant, Product } = require("../models");

// Kedvencek listázása
const getFavorites = async (req, res) => {
  try {
    const favorites = await Favorite.findAll({
      where: { userId: req.user.id },
      include: [
        {
          model: Plant,
          attributes: ["id", "name", "image", "type", "difficulty"],
        },
        {
          model: Product,
          attributes: ["id", "name", "image", "price", "category"],
        },
      ],
    });
    res.json(favorites);
  } catch (err) {
    res.status(500).json({ message: "Szerver hiba!", error: err.message });
  }
};

// Kedvenchoz adás
const addFavorite = async (req, res) => {
  try {
    const { plantId, productId } = req.body;

    if (!plantId && !productId) {
      return res
        .status(400)
        .json({ message: "Növény vagy termék ID szükséges!" });
    }

    // Már kedvenc-e?
    const existing = await Favorite.findOne({
      where: {
        userId: req.user.id,
        ...(plantId ? { plantId } : { productId }),
      },
    });

    if (existing) {
      return res.status(400).json({ message: "Már kedvenc!" });
    }

    const favorite = await Favorite.create({
      userId: req.user.id,
      plantId: plantId || null,
      productId: productId || null,
    });

    res.status(201).json({ message: "Kedvencekhez adva!", favorite });
  } catch (err) {
    res.status(500).json({ message: "Szerver hiba!", error: err.message });
  }
};

// Kedvencből törlés
const removeFavorite = async (req, res) => {
  try {
    const favorite = await Favorite.findOne({
      where: {
        id: req.params.id,
        userId: req.user.id,
      },
    });

    if (!favorite) {
      return res.status(404).json({ message: "Kedvenc nem található!" });
    }

    await favorite.destroy();
    res.json({ message: "Eltávolítva a kedvencekből!" });
  } catch (err) {
    res.status(500).json({ message: "Szerver hiba!", error: err.message });
  }
};

// Kedvenc-e már?
const checkFavorite = async (req, res) => {
  try {
    const { plantId, productId } = req.query;
    const favorite = await Favorite.findOne({
      where: {
        userId: req.user.id,
        ...(plantId ? { plantId } : { productId }),
      },
    });
    res.json({
      isFavorite: !!favorite,
      favoriteId: favorite ? favorite.id : null,
    });
  } catch (err) {
    res.status(500).json({ message: "Szerver hiba!", error: err.message });
  }
};

module.exports = {
  getFavorites,
  addFavorite,
  removeFavorite,
  checkFavorite,
};
