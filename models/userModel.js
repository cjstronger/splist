const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  password: {
    type: String,
    required: "A password is required",
  },
  email: {
    type: String,
    required: "An email is required",
    validate: [
      function (val) {
        return val.match(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/);
      },
      "Email must be valid",
    ],
  },
  name: {
    type: String,
    max: 40,
  },
});

const User = mongoose.model("User", userSchema);

module.exports = User;
