const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// mongoose.connect(process.env.SECRET_KEY, {
//   useNewUrlParser: true,
//   useUnifiedTopology: true,
// });

// const db = mongoose.connection;

// db.on("error", (err) => {
//   console.error(`Connection error: ${err.message}`);
//   process.exit(1);
// });

// db.once("open", () => {
//   console.log("Database connection successful");
// });

const userSchema = new Schema({
  password: {
    type: String,
    required: [true, "Password is required"],
  },
  email: {
    type: String,
    required: [true, "Email is required"],
    unique: true,
  },
  subscription: {
    type: String,
    enum: ["starter", "pro", "business"],
    default: "starter",
  },
  token: {
    type: String,
    default: null,
  },
});

const User = mongoose.model("user", userSchema);

module.exports = User;
