const sequelize = require("../config/db");
const User = require("./User");
const Plant = require("./Plant");
const Product = require("./Product");
const Order = require("./Order");
const OrderItem = require("./OrderItem");
const WikiArticle = require("./WikiArticle");
const Disease = require("./Disease");
const Nutrient = require("./Nutrient");
const Review = require("./Review");
const Favorite = require("./Favorite");

// Kapcsolatok
User.hasMany(Order, { foreignKey: "userId" });
Order.belongsTo(User, { foreignKey: "userId" });

Order.hasMany(OrderItem, { foreignKey: "orderId" });
OrderItem.belongsTo(Order, { foreignKey: "orderId" });

Product.hasMany(OrderItem, { foreignKey: "productId" });
OrderItem.belongsTo(Product, { foreignKey: "productId" });

Plant.hasMany(WikiArticle, { foreignKey: "plantId" });
WikiArticle.belongsTo(Plant, { foreignKey: "plantId" });

Plant.hasOne(Nutrient, { foreignKey: "plantId" });
Nutrient.belongsTo(Plant, { foreignKey: "plantId" });

User.hasMany(Review, { foreignKey: "userId" });
Review.belongsTo(User, { foreignKey: "userId" });

Plant.hasMany(Review, { foreignKey: "plantId" });
Review.belongsTo(Plant, { foreignKey: "plantId" });

Product.hasMany(Review, { foreignKey: "productId" });
Review.belongsTo(Product, { foreignKey: "productId" });

User.hasMany(Favorite, { foreignKey: "userId" });
Favorite.belongsTo(User, { foreignKey: "userId" });

Plant.hasMany(Favorite, { foreignKey: "plantId" });
Favorite.belongsTo(Plant, { foreignKey: "plantId" });

Product.hasMany(Favorite, { foreignKey: "productId" });
Favorite.belongsTo(Product, { foreignKey: "productId" });

module.exports = {
  sequelize,
  User,
  Plant,
  Product,
  Order,
  OrderItem,
  WikiArticle,
  Disease,
  Nutrient,
  Review,
  Favorite,
};
