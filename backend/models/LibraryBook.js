const mongoose = require('mongoose');

const libraryBookSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  author: { type: String, required: true, trim: true },
  isbn: { type: String, default: '', trim: true },
  bookCode: { type: String, required: true, unique: true, trim: true },
  category: { type: String, default: 'General Literature' },
  classStandard: { type: String, default: 'All' },
  subject: { type: String, default: 'General' },
  publisher: { type: String, default: '' },
  totalCopies: { type: Number, required: true, default: 1 },
  availableCopies: { type: Number, required: true, default: 1 },
  rackLocation: { type: String, default: 'Shelf A-1' },
  price: { type: Number, default: 0 },
  status: { type: String, enum: ['AVAILABLE', 'ISSUED', 'OUT_OF_STOCK'], default: 'AVAILABLE' }
}, { timestamps: true });

module.exports = mongoose.model('LibraryBook', libraryBookSchema);
