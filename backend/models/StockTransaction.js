const mongoose = require('mongoose');

const stockTransactionSchema = new mongoose.Schema({
  item: { type: mongoose.Schema.Types.ObjectId, ref: 'InventoryItem', required: true },
  itemName: { type: String, required: true },
  itemCode: { type: String, required: true },
  type: { type: String, enum: ['STOCK_IN', 'STOCK_OUT', 'ADJUSTMENT'], required: true },
  quantity: { type: Number, required: true },
  previousQuantity: { type: Number, required: true },
  newQuantity: { type: Number, required: true },
  unitPrice: { type: Number, default: 0 },
  totalValue: { type: Number, default: 0 },
  recipientOrSupplier: { type: String, default: '' }, // Name of student/staff/supplier
  reason: { type: String, default: '' },
  performedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  performedByName: { type: String, default: 'Admin' },
  date: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('StockTransaction', stockTransactionSchema);
