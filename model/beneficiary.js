const mongoose = require("mongoose");

const BeneficiarySchema = mongoose.Schema({
  documentType: {
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
  userId: [
    {
      required: true,
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
    },
  ],
  status: {
    required: true,
    type: Boolean,
    default: false,
  },
});

const model = mongoose.model("beneficiary", BeneficiarySchema, "beneficiaries");

module.exports = model;
