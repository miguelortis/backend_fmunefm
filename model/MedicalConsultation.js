const mongoose = require("mongoose");

const MedicalConsultationSchema = mongoose.Schema({
  queryType: {
    type: String,
    required: true,
  },
  idCardPatient: {
    type: String,
    required: true,
  },
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "beneficiary",
    required: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
    required: true,
  },
  patientType: {
    type: String,
    required: true,
    trim: true,
  },
  status: {
    type: String,
    default: "Pendiente",
    required: true,
  },
  registrationDate: {
    type: Date,
    default: Date.now(),
    required: true,
  },
});

const model = mongoose.model(
  "MedicalConsultation",
  MedicalConsultationSchema,
  "MedicalConsultations"
);

module.exports = model;
