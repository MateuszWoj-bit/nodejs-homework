const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Joi = require("joi");


const router = express.Router();
const User = require("../../models/user");
const auth = require("../../middleware/auth");

// Validation schema for user registration
const userRegistrationSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

// Validation schema for user login
const userLoginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

// User registration endpoint
router.post("/signup", async (req, res) => {
  try {
    // Validate request body
    const { error } = userRegistrationSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    // Check if user with email already exists
    const existingUser = await User.findOne({ email: req.body.email });
    if (existingUser) {
      return res.status(409).json({ message: "Email in use" });
    }

    // Hash password and create new user
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    const newUser = new User({
      email: req.body.email,
      password: hashedPassword,
    });
    const savedUser = await newUser.save();

    // Return success response
    return res.status(201).json({
      user: {
        email: savedUser.email,
        subscription: savedUser.subscription,
      },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

// User login endpoint
router.post("/login", async (req, res) => {
  try {
    // Validate request body
    const { error } = userLoginSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    // Find user by email
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      return res.status(401).json({ message: "Email or password is wrong" });
    }

    // Compare passwords
    const passwordsMatch = await bcrypt.compare(
      req.body.password,
      user.password
    );
    if (!passwordsMatch) {
      return res.status(401).json({ message: "Email or password is wrong" });
    }

    // Create JWT token and save it in user object
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET);
    user.token = token;
    await user.save();

    // Return success response
    return res.status(200).json({
      token,
      user: {
        email: user.email,
        subscription: user.subscription,
      },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

// Logout endpoint
router.get("/logout", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(401).json({ message: "Not authorized" });
    }
    user.tokens = [];
    await user.save();
    res.sendStatus(204);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
});

// Current user endpoint
router.get("/users/current", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(401).json({ message: "Not authorized" });
    }
    res
      .status(200)
      .json({ email: user.email, subscription: user.subscription });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
