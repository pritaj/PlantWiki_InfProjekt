const express = require("express");
const router = express.Router();

// Admin védelem middleware
function adminGuard(req, res, next) {
  const token =
    req.cookies?.token || req.headers["authorization"]?.split(" ")[1];

  if (!token) {
    return res.redirect("/auth/login");
  }

  try {
    const jwt = require("jsonwebtoken");
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== "admin") {
      return res.redirect("/");
    }
    next();
  } catch (err) {
    return res.redirect("/auth/login");
  }
}

router.get("/", (req, res) => {
  res.render("admin/index");
});

router.get("/plants", (req, res) => {
  res.render("admin/plants");
});

router.get("/products", (req, res) => {
  res.render("admin/products");
});

router.get("/wiki", (req, res) => {
  res.render("admin/wiki");
});

router.get("/orders", (req, res) => {
  res.render("admin/orders");
});

router.get("/stats", (req, res) => {
  res.render("admin/stats");
});

router.get("/users", (req, res) => {
  res.render("admin/users");
});

module.exports = router;
