const mongoose = require("mongoose");
//
const beginningOftheYearSchema = mongoose.Schema({
  month: {
    type: Number,
    required: true,
  },
  registrationDate: {
    type: Date,
    required: true,
  },
});

const model = mongoose.model("beginning_Of_the_Year", beginningOftheYearSchema);

module.exports = model;
