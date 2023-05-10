const jwt = require("jsonwebtoken");
const User = require("../models/user");
const secret = process.env.SECRET;
require("dotenv").config();
const checkToken = async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const decodedToken = jwt.verify(token, secret);
    const user = await User.findById(decodedToken.id);
    if (!user || user.token !== token) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    req.user = user;
    next();
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports = checkToken;