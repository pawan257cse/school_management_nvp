const express = require('express');
const router = express.Router();
const InventoryItem = require('../models/InventoryItem');
const StockTransaction = require('../models/StockTransaction');
const Supplier = require('../models/Supplier');
const { protect } = require('../middleware/auth');
const checkRole = require('../middleware/checkRole');

// @route   GET /api/inventory/items
// @desc    Get all inventory items with optional search, category filter, low stock filter
// @access  Private
router.get('/items', protect, async (req, res) => {
  try {
    const { category, search, lowStock } = req.query;
    let query = {};

    if (category && category !== 'All') query.category = category;
    if (lowStock === 'true') {
      query.$expr = { $lte: ['$availableQuantity', '$minimumStockLevel'] };
    }
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { itemCode: { $regex: search, $options: 'i' } },
        { bookAuthor: { $regex: search, $options: 'i' } },
        { bookISBN: { $regex: search, $options: 'i' } }
      ];
    }

    const items = await InventoryItem.find(query).sort({ createdAt: -1 });

    const totalValuation = items.reduce((sum, item) => sum + (item.availableQuantity * item.purchasePrice), 0);
    const lowStockCount = items.filter(item => item.availableQuantity <= item.minimumStockLevel).length;

    res.json({
      success: true,
      count: items.length,
      totalValuation,
      lowStockCount,
      items
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/inventory/items
// @desc    Add new inventory item
// @access  Private (HEAD, PRINCIPAL, ACCOUNTANT, STORE_MANAGER)
router.post('/items', protect, async (req, res) => {
  try {
    const data = req.body;
    if (!data.name || !data.category) {
      return res.status(400).json({ success: false, message: 'Item name and category are required.' });
    }

    // Auto generate code if missing
    if (!data.itemCode) {
      const catCode = data.category.substring(0, 3).toUpperCase();
      data.itemCode = `INV-${catCode}-${Date.now().toString().slice(-4)}`;
    }

    data.availableQuantity = Number(data.quantity || 0);
    data.createdBy = req.user._id;

    const item = await InventoryItem.create(data);

    // Initial stock in transaction
    if (item.quantity > 0) {
      await StockTransaction.create({
        item: item._id,
        itemName: item.name,
        itemCode: item.itemCode,
        type: 'STOCK_IN',
        quantity: item.quantity,
        previousQuantity: 0,
        newQuantity: item.quantity,
        unitPrice: item.purchasePrice,
        totalValue: item.quantity * item.purchasePrice,
        recipientOrSupplier: item.supplierName || 'Initial Stocking',
        reason: 'Initial Item Creation',
        performedBy: req.user._id,
        performedByName: req.user.name
      });
    }

    res.status(201).json({ success: true, message: 'Inventory item added successfully.', item });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   PUT /api/inventory/items/:id
// @desc    Update item details
// @access  Private
router.put('/items/:id', protect, async (req, res) => {
  try {
    const item = await InventoryItem.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Item not found.' });
    }

    Object.assign(item, req.body);
    await item.save();

    res.json({ success: true, message: 'Inventory item updated successfully.', item });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/inventory/stock-movement
// @desc    Perform Stock In / Stock Out / Adjustment transaction
// @access  Private
router.post('/stock-movement', protect, async (req, res) => {
  try {
    const { itemId, type, quantity, reason, recipientOrSupplier, unitPrice } = req.body;

    const item = await InventoryItem.findById(itemId);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Inventory item not found.' });
    }

    const qtyNum = Number(quantity);
    if (isNaN(qtyNum) || qtyNum <= 0) {
      return res.status(400).json({ success: false, message: 'Valid quantity is required.' });
    }

    const prevQty = item.availableQuantity;
    let newQty = prevQty;

    if (type === 'STOCK_IN') {
      newQty = prevQty + qtyNum;
      item.quantity += qtyNum;
    } else if (type === 'STOCK_OUT') {
      if (prevQty < qtyNum) {
        return res.status(400).json({ success: false, message: `Insufficient stock! Only ${prevQty} ${item.unit} available.` });
      }
      newQty = prevQty - qtyNum;
      if (item.category === 'Uniform / School Dress') {
        item.uniformIssuedQuantity = (item.uniformIssuedQuantity || 0) + qtyNum;
      }
    } else if (type === 'ADJUSTMENT') {
      newQty = qtyNum;
    }

    item.availableQuantity = newQty;
    await item.save();

    const price = unitPrice || item.purchasePrice || 0;
    const tx = await StockTransaction.create({
      item: item._id,
      itemName: item.name,
      itemCode: item.itemCode,
      type,
      quantity: qtyNum,
      previousQuantity: prevQty,
      newQuantity: newQty,
      unitPrice: price,
      totalValue: qtyNum * price,
      recipientOrSupplier: recipientOrSupplier || '',
      reason: reason || type,
      performedBy: req.user._id,
      performedByName: req.user.name
    });

    res.json({
      success: true,
      message: `Stock movement recorded (${type}). Updated available stock: ${newQty} ${item.unit}.`,
      item,
      transaction: tx
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/inventory/transactions
// @desc    Get stock transaction history
// @access  Private
router.get('/transactions', protect, async (req, res) => {
  try {
    const transactions = await StockTransaction.find().sort({ date: -1 }).limit(100);
    res.json({ success: true, count: transactions.length, transactions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/inventory/suppliers
// @desc    Get all suppliers
// @access  Private
router.get('/suppliers', protect, async (req, res) => {
  try {
    const suppliers = await Supplier.find().sort({ name: 1 });
    res.json({ success: true, count: suppliers.length, suppliers });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/inventory/suppliers
// @desc    Create supplier
// @access  Private
router.post('/suppliers', protect, async (req, res) => {
  try {
    const supplier = await Supplier.create(req.body);
    res.status(201).json({ success: true, message: 'Supplier created successfully.', supplier });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
