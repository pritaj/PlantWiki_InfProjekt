const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { User } = require("../models");
require("dotenv").config();

// Regisztráció
const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Létezik-e már az email?
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: "Ez az email már foglalt!" });
    }

    // Jelszó titkosítás
    const hashedPassword = await bcrypt.hash(password, 10);

    // User létrehozása
    const user = await User.create({
      username,
      email,
      password: hashedPassword,
    });

    res.status(201).json({ message: "Sikeres regisztráció!", userId: user.id });
  } catch (err) {
    res.status(500).json({ message: "Szerver hiba!", error: err.message });
  }
};

const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findByPk(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "Felhasználó nem található!" });
    }

    // Jelenlegi jelszó ellenőrzés
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Hibás jelenlegi jelszó!" });
    }

    // Új jelszó titkosítás
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await user.update({ password: hashedPassword });

    res.json({ message: "Jelszó sikeresen megváltoztatva!" });
  } catch (err) {
    res.status(500).json({ message: "Szerver hiba!", error: err.message });
  }
};

// Login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Létezik-e a user?
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(400).json({ message: "Hibás email vagy jelszó!" });
    }

    // Jelszó ellenőrzés
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Hibás email vagy jelszó!" });
    }

    // JWT token generálás
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN },
    );

    res.json({ message: "Sikeres bejelentkezés!", token });
  } catch (err) {
    res.status(500).json({ message: "Szerver hiba!", error: err.message });
  }
};

const me = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: ["id", "username", "email", "role"],
    });
    if (!user) {
      return res.status(404).json({ message: "Felhasználó nem található!" });
    }
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Szerver hiba!", error: err.message });
  }
};

module.exports = { register, login, me, changePassword };
