const mongoose = require("mongoose");

const bookSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  author: String,
  publishedYear: { type: Number }, // <-- Fix: Use 'Number'
  quantity: { type: Number, default: 5 }, // <-- Fix: Define as a type/default
  status: { type: String, default: "available" },
  amount: Number,
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
}, { timestamps: true });

module.exports = mongoose.model("Book", bookSchema);