const mongoose = require("mongoose");
////////moment/////////////
const moment = require("moment");
//
const UserSchema = mongoose.Schema({
  user:{
    type: mongoose.Schema.Types.ObjectId,
    ref: "beneficiary",
    required: true,
  },
  /* documentType: {
    type: String,
    required: true,
    upperCase: true,
  }, */
  userName: {
    type: String,
    unique: true,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  /* name: {
    type: String,
    required: true,
    upperCase: true,
  },
  lastName: {
    type: String,
    required: true,
    upperCase: true,
  }, */
  address: {
    type: String,
    upperCase: true,
  },
  email: {
    type: String,
    upperCase: true,
    trim: true,
    unique: true,
    required: true,
  },
  /* sex: {
    type: String,
    upperCase: true,
  },
  placeBirth: {
    type: String,
    upperCase: true,
  },
  dateBirth: {
    type: Date,
  }, */
  civilStatus: {
    type: String,
    upperCase: true,
  },
  category: {
    type: String,
    upperCase: true,
  },
  personalType: {
    type: String,
    upperCase: true,
  },
  package: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "package",
  },
  /* phone: {
    type: String,
    required: true,
  }, */
  role: {
    name: { 
      type: String, 
      default: "USER" 
    },
    options: { 
      type: Array, 
      default: [1, 2, 3] },
  },
  paymentFrequency: {
    type: Number,
    default: 1,
  },
  beneficiaries: [
    {
      _id: false,
      beneficiary: { type: mongoose.Schema.Types.ObjectId, ref: "beneficiary" },
      relationship: {
        type: String,
      },
    },
  ],
  /* medicalConsultations: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "MedicalConsultation",
    },
  ], */
  unefmDate: {
    type: Date,
    required: true,
  },
  //1: pendiente por verificar, 2: verificado, 3: rechazado, 4: suspendido
  status: {
    type: Number,
    default: 1,
  },
},
{
  timestamps: true,
  versionKey: false,
  });

const model = mongoose.model("user", UserSchema);

module.exports = model;
