const express = require("express");
const path = require("path");
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static("public/uploads"));
app.use(express.static("public"));

// EJS beállítás
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Routes
const authRoutes = require("./routes/authRoutes");
const plantRoutes = require("./routes/plantRoutes");
const shopRoutes = require("./routes/shopRoutes");
const wikiRoutes = require("./routes/wikiRoutes");
const nutrientRoutes = require("./routes/nutrientRoutes");

app.use("/api/auth", authRoutes);
app.use("/api/plants", plantRoutes);
app.use("/api/shop", shopRoutes);
app.use("/api/wiki", wikiRoutes);
app.use("/api/nutrients", nutrientRoutes);

app.get("/", (req, res) => {
  res.render("index");
});

module.exports = app;
