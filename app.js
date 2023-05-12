const express = require("express");
const mongoose = require("mongoose");
const logger = require("morgan");
const cors = require("cors");
require("dotenv").config();


const contactsRouter = require("./routes/api/contacts");
const usersRouter = require("./routes/api/registration");

const app = express();

mongoose.connect(process.env.SECRET_KEY, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

mongoose.connection.on("connected", () => {
  console.log("Database connection successful");
});

mongoose.connection.on("error", (err) => {
  console.error(`Database connection error: ${err}`);
  process.exit(1);
});

const formatsLogger = app.get("env") === "development" ? "dev" : "short";

app.use(logger(formatsLogger));
app.use(cors());
app.use(express.json());

app.use(express.static("public"));

app.use("/api/contacts", contactsRouter);
app.use("/api/users", usersRouter);

app.use((req, res) => {
  res.status(404).json({ message: "Not found" });
});

app.use((err, req, res, next) => {
  if (err.message.includes("Validation error")) {
    res.status(400).json({ message: err.message });
  }
  res.status(500).json({ message: err.message });
});

module.exports = app;
