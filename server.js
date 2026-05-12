require("dotenv").config();
const app = require("./app");
const sequelize = require("./config/db");

const PORT = process.env.PORT || 3000;

async function start() {
  try {
    await sequelize.authenticate();
    console.log("Adatbázis kapcsolat OK");
    await sequelize.sync({ force: false });
    console.log("Modellek szinkronizálva");
    app.listen(PORT, () => {
      console.log(`Szerver fut: http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error("Hiba indításkor:", err);
  }
}

start();
