const mongoose = require("mongoose");
//
const exchangeRateSchema = mongoose.Schema({
    idCard: {
        type: Date,
        required: true,
    },
    registrationYear: {
        type: Date,
        required: true,
        unique: true,
    },
    registrationMonth: {
        type: Number,
        required: true,
    },
    payrollNumber: {
        type: String,
        required: true,
    },
    debt: {
        type: String,
        required: true,
    },
    rechargeAmount: {
        type: String,
        required: true,
    },
    fineAmount: {
        type: String,
        required: true,
    },
    interestAmount: {
        type: String,
        required: true,
    },
    discountAmount: {
        type: String,
        required: true,
    },
    paidOut: {
        type: String,
        required: true,
    },
    dateOfIssue: {
        type: String,
        required: true,
    },

});

const model = mongoose.model("exchange_rate", exchangeRateSchema, "exchange_rates");

module.exports = model;
