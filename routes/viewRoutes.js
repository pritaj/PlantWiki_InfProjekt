const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
  res.render("index");
});

router.get("/plants", (req, res) => {
  res.render("plants/index");
});

router.get("/shop", (req, res) => {
  res.render("shop/index");
});

router.get("/wiki", (req, res) => {
  res.render("wiki/index");
});

router.get("/shop/:id", (req, res) => {
  res.render("shop/detail");
});

router.get("/nutrients", (req, res) => {
  res.render("nutrients/index");
});

router.get("/auth/login", (req, res) => {
  res.render("auth/login");
});

router.get("/auth/register", (req, res) => {
  res.render("auth/register");
});

router.get("/profile", (req, res) => {
  res.render("profile");
});

router.get("/plants/:id", (req, res) => {
  res.render("plants/detail");
});

router.get("/wiki/:slug", (req, res) => res.render("wiki/detail"));

router.get("/favorites", (req, res) => res.render("favorites"));

module.exports = router;
