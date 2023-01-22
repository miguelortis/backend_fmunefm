const mongoose = require('mongoose')
//
const roleSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    options: {
      type: Array,
      default: [1, 2, 3],
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
)

const model = mongoose.model('role', roleSchema, 'roles')

module.exports = model
