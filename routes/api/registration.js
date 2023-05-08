const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Joi = require("joi");
const gravatar = require("gravatar");
const multer = require("multer");
const path = require("path");
const jimp = require("jimp");
const { v4: uuidv4 } = require("uuid");

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

// Validation schema for user avatar patch
const avatarPatchSchema = Joi.object({
  avatar: Joi.any().required(),
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

    // Generate avatar URL using gravatar
    const avatarURL = gravatar.url(req.body.email, {
      s: "200",
      r: "pg",
      d: "retro",
    });

    // Hash password and create new user
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    const newUser = new User({
      email: req.body.email,
      password: hashedPassword,
      avatarURL: avatarURL,
    });
    const savedUser = await newUser.save();

    // Return success response
    return res.status(201).json({
      user: {
        email: savedUser.email,
        subscription: savedUser.subscription,
        avatarURL: savedUser.avatarURL,
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


const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./tmp");
  },
  filename: function (req, file, cb) {
    cb(null, uuidv4() + path.extname(file.originalname));
  },
});
const upload = multer({ storage: storage });

// PATCH /users/avatars
router.patch("/avatars", auth, upload.single("avatar"), async (req, res) => {
  try {    
    const { error } = avatarPatchSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }
    const avatarPath = path.join(__dirname, "../", req.file.path);
    const avatar = await jimp.read(avatarPath);
    await avatar.cover(250, 250).writeAsync(avatarPath);
    
    const avatarFileName = uuidv4() + path.extname(req.file.originalname);
    const avatarPublicPath = path.join(__dirname, "../public/avatars", avatarFileName);
    await jimp.read(avatarPath);
    await avatar.writeAsync(avatarPublicPath);
  
    req.user.avatarURL = `/avatars/${avatarFileName}`;
    await req.user.save();

    return res.status(200).json({ avatarURL: req.user.avatarURL });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

module.exports = router;
