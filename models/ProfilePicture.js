const mongoose = require("mongoose");
//
const profilePicSchema = mongoose.Schema({
  patch: {
    type: String,
    required: true,
  },
  registrationDate: {
    type: Date,
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
  },
});

const model = mongoose.model("profile-picture", profilePicSchema, "profile-pictures");

module.exports = model;
