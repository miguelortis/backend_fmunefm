const mongoose = require("mongoose");
////////moment/////////////
const moment = require("moment");
//
const oldUserSchema = mongoose.Schema({
  tipodocument: {
    type: String,
    required: true,
    upperCase: true,
  },
  cedula: {
    type: String,
    unique: true,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
  direccion: {
    type: String,
  },
  email: {
    type: String,
    trim: true,
    unique: true,
    required: true,
  },
  sexo: {
    type: String,
    upperCase: true,
  },
  placeBirth: {
    type: String,
    upperCase: true,
  },
  nacimiento: {
    type: Date,
  }, 
  edocivil: {
    type: String,
  },
  categoria: {
    type: String,
  },
  tipopersonal: {
    type: String,
  },
  plan: {
    type: String,
  },
  afiliados: [
    {
      _id: false,
      beneficiary: { type: mongoose.Schema.Types.ObjectId, ref: "beneficiary" },
      relationship: {
        type: String,
      },
    },
  ],
},
{
  timestamps: true,
  versionKey: false,
  });

const model = mongoose.model("old-User", oldUserSchema, "old-users");

module.exports = model;
