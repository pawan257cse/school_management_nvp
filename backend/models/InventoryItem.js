const mongoose = require('mongoose');

const inventoryItemSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  itemCode: { type: String, required: true, unique: true, trim: true },
  category: {
    type: String,
    enum: ['Books', 'Uniform / School Dress', 'Stationery', 'Lab Equipment', 'Robotics Equipment', 'Computer Equipment', 'Furniture', 'Other Items'],
    required: true,
    default: 'Stationery'
  },
  quantity: { type: Number, required: true, default: 0 },
  availableQuantity: { type: Number, required: true, default: 0 },
  minimumStockLevel: { type: Number, default: 5 },
  unit: { type: String, default: 'Pcs' }, // Pcs, Sets, Boxes, Kg, etc.
  purchasePrice: { type: Number, default: 0 },
  sellingPrice: { type: Number, default: 0 },
  supplier: { type: mongoose.Schema.Types.ObjectId, ref: 'Supplier', default: null },
  supplierName: { type: String, default: '' },
  location: { type: String, default: 'Main Store' }, // Storage rack / room
  status: { type: String, enum: ['IN_STOCK', 'LOW_STOCK', 'OUT_OF_STOCK'], default: 'IN_STOCK' },

  // Book Specific Fields
  bookAuthor: { type: String, default: '' },
  bookISBN: { type: String, default: '' },
  bookClass: { type: String, default: '' },
  bookSubject: { type: String, default: '' },
  bookPublisher: { type: String, default: '' },

  // Uniform Specific Fields
  uniformSize: { type: String, default: '' }, // S, M, L, XL, 24, 26, 28, etc.
  uniformGender: { type: String, enum: ['Boys', 'Girls', 'Unisex', 'All'], default: 'Unisex' },
  uniformIssuedQuantity: { type: Number, default: 0 },

  notes: { type: String, default: '' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

inventoryItemSchema.pre('save', function (next) {
  if (this.availableQuantity <= 0) {
    this.status = 'OUT_OF_STOCK';
  } else if (this.availableQuantity <= this.minimumStockLevel) {
    this.status = 'LOW_STOCK';
  } else {
    this.status = 'IN_STOCK';
  }
  next();
});

module.exports = mongoose.model('InventoryItem', inventoryItemSchema);
