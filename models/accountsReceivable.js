const mongoose = require("mongoose");
///
const AccountsReceivableSchema = mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
    required: true,
  },
  idCard: {
    type: String,
    required: true,
  },
  year: {
    type: String,
    required: true,
  },
  month: {
    type: String,
    required: true,
  },
  paymentDetails: {
    type: mongoose.Schema.Types.ObjectId,
  },
  controlNumber: {
    type: Number,
    required: true,
  },
  registrationDate: {
    type: Date,
    required: true,
  },
  debt: {
    type: Number,
    required: true,
  },
  rechargeAmount: {
    type: Number
  },
  fineAmount: {
    type: Number
  },
  interestAmount: {
    type: Number
  },
  discountAmount: {
    type: Number
  },
  //1: deuda pendiente, 2: por aprobar, 3: pagado, 4: rechazado
  status: {
    type: Number,
    required: true,
    default: 1,
  },
  typeOfService: {
    category: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    serviceDescription: {
      type: String,
      required: true,
    },
  },
});

const model = mongoose.model("accountsReceivable", AccountsReceivableSchema);

module.exports = model;
