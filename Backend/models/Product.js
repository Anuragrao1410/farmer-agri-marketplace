const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  quantity: {
    type: Number,
    required: true
  },
  unit: {
    type: String,
    default: "kg"
  },
  description: {
    type: String
  },
  farmer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Farmer",
    required: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model("Product", productSchema);