const mongoose = require("mongoose");
//
const serviceSchema = mongoose.Schema({
  creationDate: {
    type: Date,
    required: true,
    default: Date.now(),
  },
  ModificationDate: {
    type: Date,
    default: Date.now(),
  },
  price: {
    type: Number,
    required: true,
  },
  name: {
    unique: true,
    type: String,
    required: true,
  },
  status: {
    type: Boolean,
    required: true,
    default: true,
  },
});

const model = mongoose.model("service", serviceSchema, "services");

module.exports = model;
