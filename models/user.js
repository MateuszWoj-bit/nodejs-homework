const mongoose = require("mongoose");
const Schema = mongoose.Schema;
// const gravatar = require("gravatar");

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
  avatarURL: {
    type: String,
  },
});

// userSchema.pre("save", async function (next) {
//   if (!this.avatarURL) {
//     this.avatarURL = gravatar.url(this.email, {
//       s: "200",
//       r: "pg",
//       d: "retro",
//     });
//   }
//   next();
// });

const User = mongoose.model("user", userSchema);

module.exports = User;
