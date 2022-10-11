const mongoose = require("mongoose");
//
const exchangeRateSchema = mongoose.Schema({
  dateBCV: {
    type: Date,
    required: true,
  },
  registrationDate: {
    type: Date,
    required: true,
    unique: true,
  },
  price: {
    type: Number,
    required: true,
  },
  currency: {
    type: String,
    required: true,
  },
  old_rates: [
    {
      _id: false,
      dateBCV: {
        type: Date,
        required: true,
      },
      registrationDate: {
        type: Date,
        required: true,
        unique: true,
      },
      price: {
        type: Number,
        required: true,
      },
      currency: {
        type: String,
        required: true,
      },
      updateType: {
        type: String,
        required: true,
      },
    },
  ],
});

const model = mongoose.model("exchange_rate", exchangeRateSchema, "exchange_rates");

module.exports = model;
