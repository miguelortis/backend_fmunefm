const mongoose = require("mongoose");
//
const packageSchema = mongoose.Schema({
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
  services: [
    {
      _id: false,
      service: { type: mongoose.Schema.Types.ObjectId, ref: "service" },
      frequency: {
        type: Number,
      },
    },
  ],
  users: [
    {
      type: mongoose.Schema.Types.ObjectId, 
      ref: "user" ,
    },
  ],
});

const model = mongoose.model("package", packageSchema, "packages");

module.exports = model;
