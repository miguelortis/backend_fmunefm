const mongoose = require("mongoose");
//
const appointmentsSchema = mongoose.Schema({
  // id del usuario (medico especialista)
  specialistUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
    required: true,
  },
  //ej.: ginecologia, cardiologia, etc...
  medicalSpecialist: {
    type: String,
    required: true,
  },
  //fecha de la cita
  appointmentDate: {
    type: String,
    required: true,
  },
  //cedula del paciente
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "beneficiary",
    required: true,
  },
  //id de usuario titular
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
    required: true,
  },
//titular o beneficiario
  patientType: {
    type: String,
    required: true,
    trim: true,
  },
  //1: pendiente, 2: asistida, 3: rechazado, 4: suspendido
  status: {
    type: Number,
    default: 1,
  },
  registrationDate: {
    type: Date,
    default: Date.now(),
    required: true,
  },
},
{
  timestamps: true,
  versionKey: false,
  });

const model = mongoose.model("appointment", appointmentsSchema, 'appointments' );

module.exports = model;
