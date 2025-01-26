const express = require("express");
const User = require("../models/User");
const Product = require("../models/product");
const Cart = require("../models/cart");

const router = express.Router();

// Get all users
router.get("/", async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


//registration

router.post("/api/auth/register", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ message: "Invalid email format" });
  }

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const newUser = new User({ email, password });
    await newUser.save();

    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error registering user" });
  }
});

//login
router.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  try {
    const user = await User.findOne({ email });
    console.log(user, "GOT USER");
    if (!user) {
      return res
        .status(400)
        .json({ message: "No user exists with this email" });
    }

    if (user.password !== password) {
      return res.status(401).json({ message: "Incorrect password" });
    }

    // For simplicity, this login route just returns a success message.
    // In a real-world application, this route would probably return a session ID or a JWT token.
    res.status(200).json({ message: "User logged in successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error logging in user" });
  }
});

router.post("/api/auth/logout", (req, res) => {
  // For simplicity, this logout route just returns a success message.
  // In a real-world application, this route would probably invalidate a user's session or JWT token.
  res.status(200).json({ message: "User logged out successfully" });
});

//adding to cart


router.post("/api/cart/add", async (req, res) => {
    const { name, material, price, quantity, userId } = req.body;

    try {
        const newProduct = new Product({
            name,
            material,
            price,
            quantity
        });
        
        const savedProduct = await newProduct.save();

        // Push the product to the user's cart
        const userCart = await Cart.findOne({ userId });
        if (!userCart) {
            const newCart = new Cart({ 
                userId, 
                products: [savedProduct._id]
            });
            await newCart.save();
        } else {
            userCart.products.push(savedProduct._id);
            await userCart.save();
        }

        res.status(201).json({ message: "Product added to cart" });
    } catch (error) {
        res.status(500).json({ message: "Error adding product to cart" });
    }
});

module.exports = router;
