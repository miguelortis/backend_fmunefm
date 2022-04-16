const mongoose = require("mongoose");

const AppointmentSchema = mongoose.Schema({
  ref: {
    type: String,
    required: true,
  },
  idCard: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  lastName: {
    type: String,
    required: true,
    trim: true,
  },
  relationship: {
    type: String,
    required: true,
  },
  sex: {
    type: String,
    required: true,
  },
  dateBirth: {
    type: String,
    required: true,
  },
  registrationDate: {
    type: Date,
    default: Date.now(),
    required: true,
  },
  userId: {
    required: true,
    type: mongoose.Schema.Types.ObjectId,
  },
  status: {
    required: true,
    type: Boolean,
    default: false,
  },
});

const model = mongoose.model("Appointment", AppointmentSchema, "Appointments");

module.exports = model;
