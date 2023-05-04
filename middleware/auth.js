const jwt = require("jsonwebtoken");
const User = require("../models/user");

function auth(req, res, next) {
  const token = req.headers.authorization;
  if (!token) {
    return res.status(401).json({ message: "Not authorized" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.userId;

    User.findById(userId, (err, user) => {
      if (err) {
        return res.status(401).json({ message: "Not authorized" });
      }
      if (!user) {
        return res.status(401).json({ message: "Not authorized" });
      }

      req.user = user;
      next();
    });
  } catch (err) {
    return res.status(401).json({ message: "Not authorized" });
  }
}

module.exports = auth;
