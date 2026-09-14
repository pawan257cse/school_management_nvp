import React, { useState, useEffect } from 'react';
import { 
  Package, Plus, Search, Filter, AlertTriangle, ArrowUpRight, 
  ArrowDownLeft, RefreshCw, Shirt, BookOpen, Truck, ShieldCheck, CheckCircle2
} from 'lucide-react';
import { 
  getInventoryItemsApi, createInventoryItemApi, updateInventoryItemApi, 
  recordStockMovementApi, getStockTransactionsApi, getSuppliersApi, createSupplierApi 
} from '../../services/api';

export default function InventoryManagement() {
  const [activeTab, setActiveTab] = useState('items'); // 'items' | 'uniform' | 'movement' | 'suppliers'
  const [items, setItems] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [lowStockOnly, setLowStockOnly] = useState(false);
  const [summary, setSummary] = useState({ totalValuation: 0, lowStockCount: 0 });

  const [showItemModal, setShowItemModal] = useState(false);
  const [showMovementModal, setShowMovementModal] = useState(false);
  const [showSupplierModal, setShowSupplierModal] = useState(false);
  const [selectedItemForMovement, setSelectedItemForMovement] = useState(null);

  const [newItem, setNewItem] = useState({
    name: '',
    category: 'Stationery',
    quantity: 10,
    minimumStockLevel: 5,
    unit: 'Pcs',
    purchasePrice: 0,
    supplierName: '',
    location: 'Main Store',
    bookAuthor: '',
    bookISBN: '',
    bookClass: '',
    uniformSize: '',
    uniformGender: 'Unisex'
  });

  const [movementForm, setMovementForm] = useState({
    itemId: '',
    type: 'STOCK_IN',
    quantity: 1,
    reason: '',
    recipientOrSupplier: ''
  });

  const [newSupplier, setNewSupplier] = useState({
    name: '',
    contactPerson: '',
    phone: '',
    email: '',
    address: ''
  });

  const [feedback, setFeedback] = useState(null);

  const fetchInventoryData = async () => {
    try {
      setLoading(true);
      const [iRes, tRes, sRes] = await Promise.allSettled([
        getInventoryItemsApi({ category: categoryFilter, search, lowStock: lowStockOnly }),
        getStockTransactionsApi(),
        getSuppliersApi()
      ]);

      if (iRes.status === 'fulfilled' && iRes.value.data?.success) {
        setItems(iRes.value.data.items);
        setSummary({
          totalValuation: iRes.value.data.totalValuation || 0,
          lowStockCount: iRes.value.data.lowStockCount || 0
        });
      }
      if (tRes.status === 'fulfilled' && tRes.value.data?.success) {
        setTransactions(tRes.value.data.transactions);
      }
      if (sRes.status === 'fulfilled' && sRes.value.data?.success) {
        setSuppliers(sRes.value.data.suppliers);
      }
    } catch (err) {
      console.error('Failed fetching inventory data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventoryData();
  }, [categoryFilter, lowStockOnly]);

  const handleCreateItem = async (e) => {
    e.preventDefault();
    if (!newItem.name || !newItem.category) return;
    try {
      const res = await createInventoryItemApi(newItem);
      if (res.data?.success) {
        setFeedback({ type: 'success', message: `Item "${newItem.name}" added to store inventory successfully.` });
        setShowItemModal(false);
        setNewItem({
          name: '',
          category: 'Stationery',
          quantity: 10,
          minimumStockLevel: 5,
          unit: 'Pcs',
          purchasePrice: 0,
          supplierName: '',
          location: 'Main Store',
          bookAuthor: '',
          bookISBN: '',
          bookClass: '',
          uniformSize: '',
          uniformGender: 'Unisex'
        });
        fetchInventoryData();
      }
    } catch (err) {
      setFeedback({ type: 'error', message: err.response?.data?.message || 'Failed to add item.' });
    }
  };

  const handleStockMovement = async (e) => {
    e.preventDefault();
    if (!movementForm.itemId || !movementForm.quantity) return;
    try {
      const res = await recordStockMovementApi(movementForm);
      if (res.data?.success) {
        setFeedback({ type: 'success', message: res.data.message });
        setShowMovementModal(false);
        fetchInventoryData();
      }
    } catch (err) {
      setFeedback({ type: 'error', message: err.response?.data?.message || 'Stock transaction failed.' });
    }
  };

  const handleCreateSupplier = async (e) => {
    e.preventDefault();
    if (!newSupplier.name) return;
    try {
      const res = await createSupplierApi(newSupplier);
      if (res.data?.success) {
        setFeedback({ type: 'success', message: `Supplier "${newSupplier.name}" added.` });
        setShowSupplierModal(false);
        setNewSupplier({ name: '', contactPerson: '', phone: '', email: '', address: '' });
        fetchInventoryData();
      }
    } catch (err) {
      setFeedback({ type: 'error', message: 'Failed to add supplier.' });
    }
  };

  const categories = [
    'All', 'Books', 'Uniform / School Dress', 'Stationery', 
    'Lab Equipment', 'Robotics Equipment', 'Computer Equipment', 'Furniture', 'Other Items'
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="p-5 sm:p-7 rounded-3xl bg-gradient-to-r from-slate-900 via-amber-950 to-slate-900 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold uppercase tracking-wider">
              School Store ERP
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-semibold">
              Live Stock Tracking
            </span>
          </div>
          <h1 className="font-heading font-black text-2xl sm:text-3xl tracking-tight mt-2">
            Store & Inventory Management
          </h1>
          <p className="text-slate-300 text-xs sm:text-sm mt-1 font-medium">
            Manage school uniforms, textbooks, stationery, robotics/lab equipment, stock logs & supplier directory.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setShowItemModal(true)}
            className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-amber-950 text-xs font-black shadow-md transition flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Add Inventory Item</span>
          </button>
          <button
            onClick={() => {
              setMovementForm({ itemId: items[0]?._id || '', type: 'STOCK_IN', quantity: 1, reason: '', recipientOrSupplier: '' });
              setShowMovementModal(true);
            }}
            className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold border border-white/20 transition flex items-center gap-1.5"
          >
            <ArrowUpRight className="w-4 h-4 text-emerald-400" />
            <span>Stock In / Out</span>
          </button>
        </div>
      </div>

      {feedback && (
        <div className={`p-4 rounded-2xl text-xs font-bold flex items-center justify-between ${
          feedback.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'
        }`}>
          <span>{feedback.message}</span>
          <button onClick={() => setFeedback(null)} className="text-slate-400 hover:text-slate-600">✕</button>
        </div>
      )}

      {/* KPI Vital Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Total Items Registered</span>
          <div className="text-2xl font-black text-slate-900 mt-1">{summary.totalValuation > 0 ? items.length : items.length} Items</div>
          <span className="text-[11px] text-slate-500 font-medium">Across all categories</span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-amber-200 bg-amber-50/20 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-amber-700 flex items-center gap-1">
            <AlertTriangle className="w-3.5 h-3.5" />
            Low Stock Alerts
          </span>
          <div className="text-2xl font-black text-amber-900 mt-1">{summary.lowStockCount} Items</div>
          <button onClick={() => setLowStockOnly(!lowStockOnly)} className="text-[11px] text-amber-700 font-bold hover:underline">
            {lowStockOnly ? 'Show All Items' : 'Filter Low Stock Only'}
          </button>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Total Inventory Value</span>
          <div className="text-2xl font-black text-emerald-700 mt-1">₹ {summary.totalValuation.toLocaleString('en-IN')}</div>
          <span className="text-[11px] text-emerald-600 font-semibold">Estimated Valuation</span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Registered Suppliers</span>
          <div className="text-2xl font-black text-indigo-700 mt-1">{suppliers.length} Vendors</div>
          <button onClick={() => setShowSupplierModal(true)} className="text-[11px] text-indigo-600 font-bold hover:underline">
            + Add New Supplier
          </button>
        </div>
      </div>

      {/* Main Tabs Navigation */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-3 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            <button
              onClick={() => { setActiveTab('items'); setCategoryFilter('All'); }}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                activeTab === 'items' ? 'bg-amber-600 text-white shadow-xs' : 'text-slate-600 bg-white border border-slate-200 hover:bg-slate-100'
              }`}
            >
              All Items ({items.length})
            </button>

            <button
              onClick={() => { setActiveTab('uniform'); setCategoryFilter('Uniform / School Dress'); }}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                activeTab === 'uniform' ? 'bg-amber-600 text-white shadow-xs' : 'text-slate-600 bg-white border border-slate-200 hover:bg-slate-100'
              }`}
            >
              School Dress / Uniform
            </button>

            <button
              onClick={() => setActiveTab('movement')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                activeTab === 'movement' ? 'bg-amber-600 text-white shadow-xs' : 'text-slate-600 bg-white border border-slate-200 hover:bg-slate-100'
              }`}
            >
              Stock Log History ({transactions.length})
            </button>

            <button
              onClick={() => setActiveTab('suppliers')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                activeTab === 'suppliers' ? 'bg-amber-600 text-white shadow-xs' : 'text-slate-600 bg-white border border-slate-200 hover:bg-slate-100'
              }`}
            >
              Suppliers ({suppliers.length})
            </button>
          </div>

          {/* Category Dropdown */}
          <div className="flex items-center gap-2">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 bg-white focus:outline-none"
            >
              {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>
          </div>
        </div>

        {/* Tab 1: All Items */}
        {(activeTab === 'items' || activeTab === 'uniform') && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse min-w-[700px]">
              <thead className="bg-slate-100 text-slate-700 font-bold uppercase text-[10px]">
                <tr>
                  <th className="py-3 px-4">Code</th>
                  <th className="py-3 px-4">Item Name</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Stock Level</th>
                  <th className="py-3 px-4">Unit Price</th>
                  <th className="py-3 px-4">Location</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                {items.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="py-8 text-center text-slate-400 font-medium">
                      No items found in store inventory. Click "+ Add Inventory Item" to register stock.
                    </td>
                  </tr>
                ) : (
                  items.map((item) => {
                    const isLow = item.availableQuantity <= item.minimumStockLevel;
                    return (
                      <tr key={item._id} className="hover:bg-slate-50/80 transition">
                        <td className="py-3 px-4 font-mono font-bold text-slate-600">{item.itemCode}</td>
                        <td className="py-3 px-4 font-bold text-slate-900">
                          {item.name}
                          {item.uniformSize && <span className="ml-1 text-[10px] bg-slate-100 text-slate-700 font-bold px-1.5 py-0.5 rounded">Size: {item.uniformSize} ({item.uniformGender})</span>}
                          {item.bookAuthor && <span className="block text-[10px] text-slate-500 font-normal">Author: {item.bookAuthor}</span>}
                        </td>
                        <td className="py-3 px-4">
                          <span className="bg-slate-100 text-slate-700 font-bold px-2 py-0.5 rounded text-[10px]">
                            {item.category}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-mono">
                          <span className={`font-bold ${isLow ? 'text-amber-700 font-black' : 'text-slate-900'}`}>
                            {item.availableQuantity} {item.unit}
                          </span>
                          <span className="text-[10px] text-slate-400 block">Min: {item.minimumStockLevel}</span>
                        </td>
                        <td className="py-3 px-4 font-mono font-bold text-slate-800">
                          ₹ {item.purchasePrice || 0}
                        </td>
                        <td className="py-3 px-4 text-slate-600">{item.location || 'Main Store'}</td>
                        <td className="py-3 px-4">
                          {isLow ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-100 text-amber-800 border border-amber-300">
                              Low Stock
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-300">
                              In Stock
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <button
                            onClick={() => {
                              setSelectedItemForMovement(item);
                              setMovementForm({
                                itemId: item._id,
                                type: 'STOCK_IN',
                                quantity: 1,
                                reason: '',
                                recipientOrSupplier: ''
                              });
                              setShowMovementModal(true);
                            }}
                            className="px-2.5 py-1 rounded-lg bg-amber-50 hover:bg-amber-600 hover:text-white text-amber-800 font-bold text-xs transition border border-amber-200"
                          >
                            Update Stock
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab 2: Stock Logs */}
        {activeTab === 'movement' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse min-w-[650px]">
              <thead className="bg-slate-100 text-slate-700 font-bold uppercase text-[10px]">
                <tr>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Item Name</th>
                  <th className="py-3 px-4">Quantity</th>
                  <th className="py-3 px-4">Previous &rarr; New</th>
                  <th className="py-3 px-4">Supplier / Recipient</th>
                  <th className="py-3 px-4">Performed By</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                {transactions.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="py-8 text-center text-slate-400 font-medium">No stock movement logs recorded.</td>
                  </tr>
                ) : (
                  transactions.map(tx => (
                    <tr key={tx._id} className="hover:bg-slate-50 transition">
                      <td className="py-3 px-4 font-mono text-slate-500">
                        {new Date(tx.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                          tx.type === 'STOCK_IN' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' : 'bg-rose-100 text-rose-800 border border-rose-200'
                        }`}>
                          {tx.type}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-900">{tx.itemName} ({tx.itemCode})</td>
                      <td className="py-3 px-4 font-mono font-bold text-slate-900">{tx.quantity}</td>
                      <td className="py-3 px-4 font-mono text-slate-600">{tx.previousQuantity} &rarr; <span className="font-bold text-slate-900">{tx.newQuantity}</span></td>
                      <td className="py-3 px-4 text-slate-700">{tx.recipientOrSupplier || '—'}</td>
                      <td className="py-3 px-4 text-slate-600 font-semibold">{tx.performedByName || 'Admin'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab 3: Suppliers */}
        {activeTab === 'suppliers' && (
          <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {suppliers.length === 0 ? (
              <div className="col-span-full py-8 text-center text-slate-400 font-medium">
                No suppliers registered. Click "+ Add New Supplier" above to add vendors.
              </div>
            ) : (
              suppliers.map(sup => (
                <div key={sup._id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-1">
                  <h4 className="font-bold text-slate-900 text-sm">{sup.name}</h4>
                  <p className="text-xs text-slate-600 font-semibold">Contact: {sup.contactPerson || '—'}</p>
                  <p className="text-xs text-slate-500 font-mono">Phone: {sup.phone || '—'}</p>
                  <p className="text-xs text-slate-500">{sup.address || '—'}</p>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Modal 1: Add Item */}
      {showItemModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm" onClick={() => setShowItemModal(false)} />
          <div className="relative w-full max-w-lg bg-white rounded-3xl p-6 shadow-2xl z-10 border border-slate-200 space-y-4">
            <h3 className="font-bold text-lg text-slate-900">Add New Inventory Item</h3>
            <form onSubmit={handleCreateItem} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Item Name *</label>
                <input
                  type="text"
                  required
                  value={newItem.name}
                  onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                  placeholder="e.g. Class 1 English Textbook or School Uniform Shirt"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Category *</label>
                  <select
                    value={newItem.category}
                    onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  >
                    {categories.filter(c => c !== 'All').map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Unit *</label>
                  <input
                    type="text"
                    value={newItem.unit}
                    onChange={(e) => setNewItem({ ...newItem, unit: e.target.value })}
                    placeholder="Pcs, Sets, Pairs, Boxes"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Initial Quantity</label>
                  <input
                    type="number"
                    value={newItem.quantity}
                    onChange={(e) => setNewItem({ ...newItem, quantity: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-500 focus:outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Min Stock Alert</label>
                  <input
                    type="number"
                    value={newItem.minimumStockLevel}
                    onChange={(e) => setNewItem({ ...newItem, minimumStockLevel: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-500 focus:outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Price (₹)</label>
                  <input
                    type="number"
                    value={newItem.purchasePrice}
                    onChange={(e) => setNewItem({ ...newItem, purchasePrice: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-500 focus:outline-none font-mono"
                  />
                </div>
              </div>

              {newItem.category === 'Uniform / School Dress' && (
                <div className="grid grid-cols-2 gap-3 p-3 bg-amber-50/50 rounded-xl border border-amber-200">
                  <div>
                    <label className="block font-bold text-amber-900 mb-1">Uniform Size</label>
                    <input
                      type="text"
                      value={newItem.uniformSize}
                      onChange={(e) => setNewItem({ ...newItem, uniformSize: e.target.value })}
                      placeholder="Size 24, 26, 28, S, M, L"
                      className="w-full px-3 py-1.5 rounded-lg border border-amber-300 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-amber-900 mb-1">Gender</label>
                    <select
                      value={newItem.uniformGender}
                      onChange={(e) => setNewItem({ ...newItem, uniformGender: e.target.value })}
                      className="w-full px-3 py-1.5 rounded-lg border border-amber-300 text-xs"
                    >
                      <option value="Unisex">Unisex</option>
                      <option value="Boys">Boys</option>
                      <option value="Girls">Girls</option>
                    </select>
                  </div>
                </div>
              )}

              <div className="flex gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowItemModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-300 font-bold text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold shadow-md"
                >
                  Save Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: Stock Movement */}
      {showMovementModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm" onClick={() => setShowMovementModal(false)} />
          <div className="relative w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl z-10 border border-slate-200 space-y-4">
            <h3 className="font-bold text-lg text-slate-900">Record Stock Movement</h3>
            <form onSubmit={handleStockMovement} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Select Item *</label>
                <select
                  value={movementForm.itemId}
                  onChange={(e) => setMovementForm({ ...movementForm, itemId: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                >
                  {items.map(i => <option key={i._id} value={i._id}>{i.name} ({i.itemCode}) - Avail: {i.availableQuantity} {i.unit}</option>)}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Transaction Type *</label>
                  <select
                    value={movementForm.type}
                    onChange={(e) => setMovementForm({ ...movementForm, type: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-500 focus:outline-none font-bold"
                  >
                    <option value="STOCK_IN">STOCK IN (Add Stock)</option>
                    <option value="STOCK_OUT">STOCK OUT (Issue / Distribute)</option>
                    <option value="ADJUSTMENT">ADJUSTMENT (Reset Stock)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Quantity *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={movementForm.quantity}
                    onChange={(e) => setMovementForm({ ...movementForm, quantity: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-500 focus:outline-none font-mono font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Supplier or Recipient Name</label>
                <input
                  type="text"
                  value={movementForm.recipientOrSupplier}
                  onChange={(e) => setMovementForm({ ...movementForm, recipientOrSupplier: e.target.value })}
                  placeholder="Vendor Name (for Stock In) or Student/Staff Name (for Stock Out)"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Reason / Notes</label>
                <input
                  type="text"
                  value={movementForm.reason}
                  onChange={(e) => setMovementForm({ ...movementForm, reason: e.target.value })}
                  placeholder="e.g. New purchase from vendor or Issued to Class 2 student"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              <div className="flex gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowMovementModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-300 font-bold text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold shadow-md"
                >
                  Confirm Movement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 3: Add Supplier */}
      {showSupplierModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm" onClick={() => setShowSupplierModal(false)} />
          <div className="relative w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl z-10 border border-slate-200 space-y-4">
            <h3 className="font-bold text-lg text-slate-900">Add Supplier / Vendor</h3>
            <form onSubmit={handleCreateSupplier} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Supplier / Firm Name *</label>
                <input
                  type="text"
                  required
                  value={newSupplier.name}
                  onChange={(e) => setNewSupplier({ ...newSupplier, name: e.target.value })}
                  placeholder="e.g. Raj Publications or Modern Uniform Traders"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Contact Person</label>
                  <input
                    type="text"
                    value={newSupplier.contactPerson}
                    onChange={(e) => setNewSupplier({ ...newSupplier, contactPerson: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Phone</label>
                  <input
                    type="text"
                    value={newSupplier.phone}
                    onChange={(e) => setNewSupplier({ ...newSupplier, phone: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none font-mono"
                  />
                </div>
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Address</label>
                <input
                  type="text"
                  value={newSupplier.address}
                  onChange={(e) => setNewSupplier({ ...newSupplier, address: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>
              <div className="flex gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowSupplierModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-300 font-bold text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold shadow-md"
                >
                  Save Supplier
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
