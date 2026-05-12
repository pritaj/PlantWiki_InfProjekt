const { Product, Order, OrderItem } = require("../models");

// Összes termék listázása
const getAllProducts = async (req, res) => {
  try {
    const products = await Product.findAll();
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: "Szerver hiba!", error: err.message });
  }
};

// Egy termék lekérése
const getProductById = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Termék nem található!" });
    }
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: "Szerver hiba!", error: err.message });
  }
};

// Új termék hozzáadása (csak admin)
const createProduct = async (req, res) => {
  try {
    const { name, description, price, stock, category } = req.body;
    const product = await Product.create({
      name,
      description,
      price,
      stock,
      category,
      image: req.file ? req.file.filename : null,
    });
    res.status(201).json({ message: "Termék sikeresen hozzáadva!", product });
  } catch (err) {
    res.status(500).json({ message: "Szerver hiba!", error: err.message });
  }
};

// Rendelés leadása
const createOrder = async (req, res) => {
  try {
    const { items, shipping_address } = req.body;
    // items = [{ productId: 1, quantity: 2 }, ...]

    // Termékek és árak lekérése
    let total_price = 0;
    const orderItems = [];

    for (const item of items) {
      const product = await Product.findByPk(item.productId);
      if (!product) {
        return res
          .status(404)
          .json({ message: `Termék nem található: ${item.productId}` });
      }
      if (product.stock < item.quantity) {
        return res
          .status(400)
          .json({ message: `Nincs elegendő készlet: ${product.name}` });
      }
      total_price += product.price * item.quantity;
      orderItems.push({
        productId: item.productId,
        quantity: item.quantity,
        price: product.price,
      });
    }

    // Rendelés létrehozása
    const order = await Order.create({
      userId: req.user.id,
      total_price,
      shipping_address,
    });

    // Rendelési tételek létrehozása + készlet csökkentése
    for (const item of orderItems) {
      await OrderItem.create({ orderId: order.id, ...item });
      await Product.decrement("stock", {
        by: item.quantity,
        where: { id: item.productId },
      });
    }

    res.status(201).json({
      message: "Rendelés sikeresen leadva!",
      orderId: order.id,
      total_price,
    });
  } catch (err) {
    res.status(500).json({ message: "Szerver hiba!", error: err.message });
  }
};

// Rendelési előzmények
const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.findAll({
      where: { userId: req.user.id },
      include: [{ model: OrderItem, include: [Product] }],
    });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: "Szerver hiba!", error: err.message });
  }
};

// Termék törlése
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Termék nem található!" });
    }
    await product.destroy();
    res.json({ message: "Termék sikeresen törölve!" });
  } catch (err) {
    res.status(500).json({ message: "Szerver hiba!", error: err.message });
  }
};

// Rendelés státusz frissítése
const updateOrderStatus = async (req, res) => {
  try {
    const order = await Order.findByPk(req.params.id);
    if (!order) {
      return res.status(404).json({ message: "Rendelés nem található!" });
    }
    await order.update({ status: req.body.status });
    res.json({ message: "Státusz sikeresen frissítve!", order });
  } catch (err) {
    res.status(500).json({ message: "Szerver hiba!", error: err.message });
  }
};

// Összes rendelés (admin)
const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.findAll({
      include: [{ model: OrderItem, include: [Product] }],
    });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: "Szerver hiba!", error: err.message });
  }
};

// Termék szerkesztése
const updateProduct = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Termék nem található!" });
    }
    const updateData = {
      name: req.body.name,
      description: req.body.description,
      price: req.body.price,
      stock: req.body.stock,
      category: req.body.category,
    };
    if (req.file) {
      updateData.image = req.file.filename;
    }
    await product.update(updateData);
    res.json({ message: "Termék sikeresen frissítve!", product });
  } catch (err) {
    console.error("Update error:", err);
    res.status(500).json({ message: "Szerver hiba!", error: err.message });
  }
};

module.exports = {
  getAllProducts,
  getProductById,
  createProduct,
  createOrder,
  getMyOrders,
  deleteProduct,
  updateOrderStatus,
  getAllOrders,
  updateProduct,
};

