const mongoose = require("mongoose");
//
const BeneficiarySchema = mongoose.Schema({
  documentType: {
    type: String,
    required: true,
    trim: true,
  },
  idCard: {
    type: String,
    required: true,
    trim: true,
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
  gender: {
    type: String,
    required: true,
    upperCase: true,
    trim: true,
  },
  dateBirth: {
    type: Date,
    required: true,
  },
  placeBirth: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
  },
  userId: [
    {
      _id: false,
      user: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
      relationship: {
        type: String,
      },
    },
  ],
  medicalConsultations: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "MedicalConsultation",
    },
  ],
  status: {
    type: Boolean,
    default: false,
  },
},
{
  timestamps: true,
  versionKey: false,
  });

const model = mongoose.model("beneficiary", BeneficiarySchema, "beneficiaries");

module.exports = model;
