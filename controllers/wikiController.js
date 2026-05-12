const { WikiArticle, Disease, Plant } = require("../models");

// Összes cikk listázása
const getAllArticles = async (req, res) => {
  try {
    const articles = await WikiArticle.findAll({
      include: [{ model: Plant, attributes: ["id", "name"] }],
    });
    console.log("Articles:", articles.length);
    res.json(articles);
  } catch (err) {
    console.error("Wiki getAll error:", err.message);
    res.status(500).json({ message: "Szerver hiba!", error: err.message });
  }
};

// Egy cikk lekérése slug alapján
const getArticleBySlug = async (req, res) => {
  try {
    const article = await WikiArticle.findOne({
      where: { slug: req.params.slug },
      include: [{ model: Plant, attributes: ["id", "name"] }],
    });
    if (!article) {
      return res.status(404).json({ message: "Cikk nem található!" });
    }
    res.json(article);
  } catch (err) {
    res.status(500).json({ message: "Szerver hiba!", error: err.message });
  }
};

// Új cikk létrehozása (csak admin)
const createArticle = async (req, res) => {
  try {
    const { title, slug, content, category, plantId } = req.body;
    const article = await WikiArticle.create({
      title,
      slug,
      content,
      category,
      plantId: plantId || null,
      image: req.file ? req.file.filename : null,
    });
    res.status(201).json({ message: "Cikk sikeresen létrehozva!", article });
  } catch (err) {
    console.error("Wiki create error:", err);
    res.status(500).json({ message: "Szerver hiba!", error: err.message });
  }
};
// Cikk szerkesztése (csak admin)
const updateArticle = async (req, res) => {
  try {
    const article = await WikiArticle.findByPk(req.params.id);
    if (!article) {
      return res.status(404).json({ message: "Cikk nem található!" });
    }
    const updateData = {
      title: req.body.title,
      slug: req.body.slug,
      content: req.body.content,
      category: req.body.category,
      plantId: req.body.plantId || null,
    };
    if (req.file) {
      updateData.image = req.file.filename;
    }
    await article.update(updateData);
    res.json({ message: "Cikk sikeresen frissítve!", article });
  } catch (err) {
    res.status(500).json({ message: "Szerver hiba!", error: err.message });
  }
};

// Összes betegség listázása
const getAllDiseases = async (req, res) => {
  try {
    const diseases = await Disease.findAll();
    res.json(diseases);
  } catch (err) {
    res.status(500).json({ message: "Szerver hiba!", error: err.message });
  }
};

// Egy betegség lekérése
const getDiseaseById = async (req, res) => {
  try {
    const disease = await Disease.findByPk(req.params.id);
    if (!disease) {
      return res.status(404).json({ message: "Betegség nem található!" });
    }
    res.json(disease);
  } catch (err) {
    res.status(500).json({ message: "Szerver hiba!", error: err.message });
  }
};

// Új betegség hozzáadása (csak admin)
const createDisease = async (req, res) => {
  try {
    const { name, description, symptoms, treatment, prevention, type } =
      req.body;
    const disease = await Disease.create({
      name,
      description,
      symptoms,
      treatment,
      prevention,
      type,
    });
    res.status(201).json({ message: "Betegség sikeresen hozzáadva!", disease });
  } catch (err) {
    res.status(500).json({ message: "Szerver hiba!", error: err.message });
  }
};

// Cikk törlése
const deleteArticle = async (req, res) => {
  try {
    const article = await WikiArticle.findByPk(req.params.id);
    if (!article) {
      return res.status(404).json({ message: "Cikk nem található!" });
    }
    await article.destroy();
    res.json({ message: "Cikk sikeresen törölve!" });
  } catch (err) {
    res.status(500).json({ message: "Szerver hiba!", error: err.message });
  }
};

module.exports = {
  getAllArticles,
  getArticleBySlug,
  createArticle,
  updateArticle,
  getAllDiseases,
  getDiseaseById,
  createDisease,
  deleteArticle,
};
