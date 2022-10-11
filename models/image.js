const mongoose = require("mongoose");
//
const imageSchema = mongoose.Schema({
  patch: {
    type: String,
    required: true,
  },
  registrationDate: {
    type: Date,
    required: true,
  },
  type: {
    type: Number,
    required: true,
  }
});

const model = mongoose.model("image", imageSchema, "images");

module.exports = model;
