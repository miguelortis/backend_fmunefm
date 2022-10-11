const mongoose = require("mongoose");
//
const ClinicHistorySchema = mongoose.Schema({
  DateOfElaboration: {
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

const model = mongoose.model(
  "ClinicHistory",
  ClinicHistorySchema,
  "ClinicsHistories"
);

module.exports = model;
