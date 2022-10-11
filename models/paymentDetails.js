const mongoose = require("mongoose");
//
const paymentDetailsSchema = mongoose.Schema({
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
  debtDetails: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "accountsReceivable",
    }
  ],
  controlNumber: {
    type: Number,
    required: true,
  },
  registrationDate: {
    type: Date,
    required: true,
  },

  paymentInfo: {
    type: Object,
    required: true,
  }
});

const model = mongoose.model("paymentDetails", paymentDetailsSchema);

module.exports = model;
