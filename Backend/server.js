const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const Farmer = require("./models/Farmer");
const Product = require("./models/Product");
const User = require("./models/User");
const Order = require("./models/Order");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    message: "Agri Marketplace API is running"
  });
});

mongoose.connect("mongodb://127.0.0.1:27017/farmer_marketplace")
  .then(() => {
    console.log("MongoDB connected");
  })
  .catch((err) => {
    console.log("MongoDB connection error:", err);
  });

// Get Products with Search and Filter

app.get("/api/products", async (req, res) => {
  try {
    const { name, category } = req.query;

    let filter = {};

    if (name) {
      filter.name = { $regex: name, $options: "i" };
    }

    if (category) {
      filter.category = { $regex: category, $options: "i" };
    }

    const products = await Product.find(filter).populate(
      "farmer",
      "name phone email address"
    );

    res.json(products);

  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch products",
      error: error.message
    });
  }
});

// Register User
app.post("/api/users/register", async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      role,
      phone,
      address
    } = req.body;

    if (role === "farmer" && (!phone || !address)) {
      return res.status(400).json({
        message: "Phone and address are required for farmers"
      });
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        message: "User already exists"
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      name,
      email,
      password: hashedPassword,
      role
    });

    await user.save();

    let farmerId = null;

    if (role === "farmer") {
      const farmer = new Farmer({
        name,
        email,
        phone,
        address
      });

      await farmer.save();
      farmerId = farmer._id;
    }

    res.status(201).json({
      message: "User registered successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        farmerId: farmerId
      }
    });

  } catch (error) {
    console.log("Registration Error:", error.message);

    res.status(400).json({
      message: "Registration failed",
      error: error.message
    });
  }
});

// Add Farmer
app.post("/api/farmers", async (req, res) => {
  try {
    const farmer = new Farmer(req.body);
    await farmer.save();

    res.status(201).json({
      message: "Farmer added successfully",
      farmer
    });
  } catch (error) {
    res.status(400).json({
      message: "Failed to add farmer",
      error: error.message
    });
  }
});

// Get Farmers
app.get("/api/farmers", async (req, res) => {
  try {
    const farmers = await Farmer.find();

    res.json(farmers);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch farmers",
      error: error.message
    });
  }
});
// Update Farmer

app.put("/api/farmers/:id", async (req, res) => {
  try {
    const farmer = await Farmer.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!farmer) {
      return res.status(404).json({
        message: "Farmer not found"
      });
    }

    res.json({
      message: "Farmer updated successfully",
      farmer
    });

  } catch (error) {
    res.status(400).json({
      message: "Failed to update farmer",
      error: error.message
    });
  }
});
// Delete Farmer

app.delete("/api/farmers/:id", async (req, res) => {
  try {
    const farmer = await Farmer.findByIdAndDelete(req.params.id);

    if (!farmer) {
      return res.status(404).json({
        message: "Farmer not found"
      });
    }

    res.json({
      message: "Farmer deleted successfully"
    });

  } catch (error) {
    res.status(400).json({
      message: "Failed to delete farmer",
      error: error.message
    });
  }
});

// Add Product

app.post("/api/products", async (req, res) => {
  try {
    const {
      name,
      category,
      price,
      quantity,
      unit,
      description,
      farmer
    } = req.body;

    if (!farmer) {
      return res.status(400).json({
        message: "Farmer ID is required"
      });
    }

    const farmerExists = await Farmer.findById(farmer);

    if (!farmerExists) {
      return res.status(400).json({
        message: "Farmer not found"
      });
    }

    const product = new Product({
      name,
      category,
      price,
      quantity,
      unit,
      description,
      farmer
    });

    await product.save();

    res.status(201).json({
      message: "Product added successfully",
      product
    });

  } catch (error) {
    console.log("Add Product Error:", error.message);

    res.status(400).json({
      message: "Failed to add product",
      error: error.message
    });
  }
});

// Login User

// Login User

app.post("/api/users/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({
        message: "Invalid email or password"
      });
    }

    const isPasswordCorrect = await bcrypt.compare(
      password,
      user.password
    );

    if (!isPasswordCorrect) {
      return res.status(400).json({
        message: "Invalid email or password"
      });
    }

    let farmerId = null;

    if (user.role === "farmer") {
      const farmer = await Farmer.findOne({
        email: user.email
      });

      if (farmer) {
        farmerId = farmer._id;
      }
    }

    res.json({
      message: "Login successful",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        farmerId: farmerId
      }
    });

  } catch (error) {
    res.status(500).json({
      message: "Login failed",
      error: error.message
    });
  }
});

// Create Order

app.post("/api/orders", async (req, res) => {
  try {
    const { buyer, product, quantity, totalPrice } = req.body;

    const order = new Order({
      buyer,
      product,
      quantity,
      totalPrice
    });

    await order.save();

    res.status(201).json({
      message: "Order placed successfully",
      order
    });

  } catch (error) {
    res.status(400).json({
      message: "Failed to place order",
      error: error.message
    });
  }
});

// Get Orders
app.get("/api/orders", async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("buyer", "name email role")
      .populate("product", "name category price unit");

    res.json(orders);

  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch orders",
      error: error.message
    });
  }
});

// Get Orders by Buyer
app.get("/api/orders/buyer/:buyerId", async (req, res) => {
  try {
    const orders = await Order.find({
      buyer: req.params.buyerId
    })
      .populate("buyer", "name email role")
      .populate("product", "name category price unit");

    res.json(orders);

  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch buyer orders",
      error: error.message
    });
  }
});

// Get Orders by Farmer
app.get("/api/orders/farmer/:farmerId", async (req, res) => {
  try {
    // Login user ko find karo
    const user = await User.findById(req.params.farmerId);

    if (!user) {
      return res.status(404).json({
        message: "Farmer user not found"
      });
    }

    // User email se farmer profile find karo
    const farmer = await Farmer.findOne({
      email: user.email
    });

    if (!farmer) {
      return res.status(404).json({
        message: "Farmer profile not found"
      });
    }

    // Farmer ke products find karo
    const products = await Product.find({
      farmer: farmer._id
    }).select("_id");

    const productIds = products.map(
      (product) => product._id
    );

    // Products ke orders find karo
    const orders = await Order.find({
      product: { $in: productIds }
    })
      .populate("buyer", "name email role")
      .populate("product", "name category price unit");

    res.json(orders);

  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch farmer orders",
      error: error.message
    });
  }
});

// Update Order Status
app.put("/api/orders/:id", async (req, res) => {
  try {
    const { status } = req.body;

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );

    if (!order) {
      return res.status(404).json({
        message: "Order not found"
      });
    }

    res.json({
      message: "Order status updated successfully",
      order
    });

  } catch (error) {
    res.status(400).json({
      message: "Failed to update order",
      error: error.message
    });
  }
});

// Delete Order
app.delete("/api/orders/:id", async (req, res) => {
  try {
    const order = await Order.findByIdAndDelete(req.params.id);

    if (!order) {
      return res.status(404).json({
        message: "Order not found"
      });
    }

    res.json({
      message: "Order deleted successfully"
    });

  } catch (error) {
    res.status(400).json({
      message: "Failed to delete order",
      error: error.message
    });
  }
});
// Get Products
app.get("/api/products", async (req, res) => {
  try {
    const products = await Product.find().populate("farmer");

    res.json(products);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch products",
      error: error.message
    });
  }
});
// Update Product

app.put("/api/products/:id", async (req, res) => {
  try {
    const { farmerId, name, price, quantity, description } = req.body;

    if (!farmerId) {
      return res.status(400).json({
        message: "Farmer ID is required"
      });
    }

    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        message: "Product not found"
      });
    }

    if (product.farmer.toString() !== farmerId) {
      return res.status(403).json({
        message: "You can only edit your own products"
      });
    }

    product.name = name;
    product.price = price;
    product.quantity = quantity;
    product.description = description;

    await product.save();

    res.json({
      message: "Product updated successfully",
      product
    });

  } catch (error) {
    res.status(400).json({
      message: "Failed to update product",
      error: error.message
    });
  }
});

// Delete Product
app.delete("/api/products/:id", async (req, res) => {
  try {
    const { farmerId } = req.body;

    if (!farmerId) {
      return res.status(400).json({
        message: "Farmer ID is required"
      });
    }

    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        message: "Product not found"
      });
    }

    if (product.farmer.toString() !== farmerId) {
      return res.status(403).json({
        message: "You can only delete your own products"
      });
    }

    await Product.findByIdAndDelete(req.params.id);

    res.json({
      message: "Product deleted successfully"
    });

  } catch (error) {
    res.status(400).json({
      message: "Failed to delete product",
      error: error.message
    });
  }
});

const PORT = 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});