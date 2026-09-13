import React, { useState, useEffect } from 'react';
import { getFeePaymentsApi, getFeeStructuresApi, recordFeePaymentApi, getStudentsApi, getClassesApi, createFeeStructureApi } from '../../services/api';
import { DollarSign, Receipt, PlusCircle, Search, CreditCard, CheckCircle2, Filter, Printer, Download } from 'lucide-react';

export default function FeeManagement() {
  const [payments, setPayments] = useState([]);
  const [structures, setStructures] = useState([]);
  const [payments30d, setPayments30d] = useState(0);
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('payments'); // 'payments' | 'structures'
  const [loading, setLoading] = useState(true);
  const [isCollectModalOpen, setIsCollectModalOpen] = useState(false);
  const [isStructureModalOpen, setIsStructureModalOpen] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState(null);

  const [collectForm, setCollectForm] = useState({
    studentId: '',
    amount: '',
    feeType: 'Tuition Fee (Q1)',
    paymentMethod: 'Cash',
    remarks: ''
  });

  const [structureForm, setStructureForm] = useState({
    title: '',
    class: '',
    amount: '',
    feeType: 'Tuition',
    frequency: 'Quarterly',
    academicYear: '2026-2027'
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [payRes, structRes, studRes, classRes] = await Promise.all([
        getFeePaymentsApi({ search: search || undefined }),
        getFeeStructuresApi(),
        getStudentsApi(),
        getClassesApi()
      ]);

      if (payRes.data.success) {
        setPayments(payRes.data.payments);
        setPayments30d(payRes.data.payments30d || 0);
      }
      if (structRes.data.success) setStructures(structRes.data.structures);
      if (studRes.data.success) setStudents(studRes.data.students);
      if (classRes.data.success) setClasses(classRes.data.classes);
    } catch (err) {
      console.error('Failed to load fee information:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchData();
  };

  const handleCollectSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await recordFeePaymentApi(collectForm);
      if (res.data.success) {
        setSelectedReceipt(res.data.payment);
        setIsCollectModalOpen(false);
        fetchData();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error recording fee payment');
    }
  };

  const handleStructureSubmit = async (e) => {
    e.preventDefault();
    try {
      await createFeeStructureApi(structureForm);
      setIsStructureModalOpen(false);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Error creating fee structure');
    }
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-gradient-to-r from-emerald-950 via-slate-900 to-teal-950 text-white shadow-xl">
        <div>
          <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold uppercase tracking-wider">
            Fee & Accounts Collection
          </span>
          <h1 className="text-2xl sm:text-3xl font-heading font-black mt-2">Fees & Receipts Portal</h1>
          <p className="text-xs text-slate-300 mt-1">Manage class fee structures, collect fees, and issue instant computerized receipts.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              setStructureForm({ title: '', class: classes[0]?._id || '', amount: 4500, feeType: 'Tuition', frequency: 'Quarterly', academicYear: '2026-2027' });
              setIsStructureModalOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs border border-white/20 transition backdrop-blur-sm"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Set Fee Structure</span>
          </button>
          <button
            onClick={() => {
              setCollectForm({ studentId: students[0]?._id || '', amount: 4500, feeType: 'Tuition Fee (Q1)', paymentMethod: 'Cash', remarks: '' });
              setIsCollectModalOpen(true);
            }}
            className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-500/30 transition cursor-pointer"
          >
            <Receipt className="w-4 h-4" />
            <span>Collect Fee / New Receipt</span>
          </button>
        </div>
      </div>

      {/* 30-Day Metrics Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <span className="text-[11px] font-black text-slate-600 uppercase tracking-wider">Payments (Last 30 Days)</span>
          <div className="text-2xl font-heading font-black text-emerald-700 mt-1">
            ₹{payments30d.toLocaleString('en-IN')}
          </div>
          <p className="text-[11px] text-slate-600 font-semibold mt-0.5">Total collected this month</p>
        </div>
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <span className="text-[11px] font-black text-slate-600 uppercase tracking-wider">Total Receipts Issued</span>
          <div className="text-2xl font-heading font-black text-slate-900 mt-1">
            {payments.length} Receipts
          </div>
          <p className="text-[11px] text-slate-600 font-semibold mt-0.5">Recorded in system</p>
        </div>
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <span className="text-[11px] font-black text-slate-600 uppercase tracking-wider">Configured Class Structures</span>
          <div className="text-2xl font-heading font-black text-blue-700 mt-1">
            {structures.length} Classes
          </div>
          <p className="text-[11px] text-slate-600 font-semibold mt-0.5">Active payment categories</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={() => setActiveTab('payments')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
              activeTab === 'payments' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-700 bg-slate-100 hover:bg-slate-200'
            }`}
          >
            Payment Receipts History
          </button>
          <button
            onClick={() => setActiveTab('structures')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
              activeTab === 'structures' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-700 bg-slate-100 hover:bg-slate-200'
            }`}
          >
            Class Fee Structures
          </button>
        </div>

        {activeTab === 'payments' && (
          <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-80">
              <Search className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
              <input
                type="text"
                placeholder="Search receipt no, student..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-900 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
              />
            </div>
            <button type="submit" className="px-4 py-2 bg-slate-900 text-white text-xs font-bold rounded-xl hover:bg-slate-800 shadow-sm">
              Search
            </button>
          </form>
        )}
      </div>

      {/* Tab Content: Payments */}
      {activeTab === 'payments' && (
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
          <h2 className="font-heading font-bold text-sm text-slate-900 flex items-center gap-2">
            <Receipt className="w-4 h-4 text-emerald-600" />
            Recent Fee Transactions
          </h2>

          {loading ? (
            <div className="py-12 text-center text-xs text-slate-500 font-semibold">Loading fee receipts...</div>
          ) : payments.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-400">No payment receipts found. Click "Collect Fee" to record one.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-100 text-slate-600 font-bold uppercase text-[11px]">
                  <tr>
                    <th className="px-4 py-3">Receipt No</th>
                    <th className="px-4 py-3">Student Name</th>
                    <th className="px-4 py-3">Class</th>
                    <th className="px-4 py-3">Amount</th>
                    <th className="px-4 py-3">Payment Date</th>
                    <th className="px-4 py-3">Method</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Receipt</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {payments.map((p) => (
                    <tr key={p._id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-4 py-3 font-mono font-bold text-emerald-700">{p.receiptNo}</td>
                      <td className="px-4 py-3 font-bold text-slate-900">{p.studentName}</td>
                      <td className="px-4 py-3 text-slate-600">{p.className}</td>
                      <td className="px-4 py-3 font-extrabold text-slate-900">₹{p.amount?.toLocaleString('en-IN')}</td>
                      <td className="px-4 py-3 text-slate-500 font-mono">
                        {new Date(p.paymentDate).toLocaleDateString('en-IN')}
                      </td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-semibold">
                          {p.paymentMethod}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-50 text-emerald-700 border border-emerald-200">
                          {p.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => setSelectedReceipt(p)}
                          className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-bold inline-flex items-center gap-1"
                        >
                          <Printer className="w-3 h-3" /> View Receipt
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Tab Content: Structures */}
      {activeTab === 'structures' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {structures.map((s) => (
            <div key={s._id} className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-blue-50 text-blue-700 border border-blue-200">
                    Class {s.class?.name} - {s.class?.section}
                  </span>
                  <h3 className="font-bold text-slate-900 mt-1.5">{s.title}</h3>
                </div>
                <div className="text-right">
                  <div className="text-xl font-heading font-black text-emerald-600">₹{s.amount?.toLocaleString('en-IN')}</div>
                  <span className="text-[10px] text-slate-400 uppercase">{s.frequency}</span>
                </div>
              </div>
              <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-500 flex justify-between">
                <span>Fee Type: <strong>{s.feeType}</strong></span>
                <span>Session: <strong>{s.academicYear}</strong></span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Collect Fee Modal */}
      {isCollectModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-lg font-heading font-black text-slate-900">Record Student Fee Payment</h3>
            <form onSubmit={handleCollectSubmit} className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Select Student *</label>
                <select
                  required
                  value={collectForm.studentId}
                  onChange={(e) => setCollectForm({ ...collectForm, studentId: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                >
                  <option value="">Choose Student</option>
                  {students.map((st) => (
                    <option key={st._id} value={st._id}>
                      {st.name} (Class {st.class?.name} - Roll #{st.rollNo})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Amount (₹) *</label>
                  <input
                    type="number"
                    required
                    value={collectForm.amount}
                    onChange={(e) => setCollectForm({ ...collectForm, amount: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Payment Method</label>
                  <select
                    value={collectForm.paymentMethod}
                    onChange={(e) => setCollectForm({ ...collectForm, paymentMethod: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                  >
                    <option value="Cash">Cash</option>
                    <option value="UPI">UPI / QR</option>
                    <option value="Net Banking">Net Banking</option>
                    <option value="Cheque">Cheque</option>
                    <option value="Card">Debit / Credit Card</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Fee Type</label>
                <input
                  type="text"
                  value={collectForm.feeType}
                  onChange={(e) => setCollectForm({ ...collectForm, feeType: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Remarks / Transaction Ref</label>
                <input
                  type="text"
                  placeholder="e.g. Paid in full counter receipt"
                  value={collectForm.remarks}
                  onChange={(e) => setCollectForm({ ...collectForm, remarks: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsCollectModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-500/20"
                >
                  Generate Receipt & Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Fee Structure Modal */}
      {isStructureModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-lg font-heading font-black text-slate-900">Define Class Fee Structure</h3>
            <form onSubmit={handleStructureSubmit} className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Fee Structure Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Class 8 Tuition Fee"
                  value={structureForm.title}
                  onChange={(e) => setStructureForm({ ...structureForm, title: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Class *</label>
                  <select
                    required
                    value={structureForm.class}
                    onChange={(e) => setStructureForm({ ...structureForm, class: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                  >
                    <option value="">Select Class</option>
                    {classes.map((c) => (
                      <option key={c._id} value={c._id}>Class {c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Amount (₹) *</label>
                  <input
                    type="number"
                    required
                    value={structureForm.amount}
                    onChange={(e) => setStructureForm({ ...structureForm, amount: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Fee Category</label>
                  <select
                    value={structureForm.feeType}
                    onChange={(e) => setStructureForm({ ...structureForm, feeType: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                  >
                    <option value="Tuition">Tuition</option>
                    <option value="Admission">Admission</option>
                    <option value="Exam">Exam</option>
                    <option value="Transport">Transport</option>
                    <option value="Activity">Activity</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Frequency</label>
                  <select
                    value={structureForm.frequency}
                    onChange={(e) => setStructureForm({ ...structureForm, frequency: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                  >
                    <option value="Quarterly">Quarterly</option>
                    <option value="Monthly">Monthly</option>
                    <option value="Half-Yearly">Half-Yearly</option>
                    <option value="Annually">Annually</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsStructureModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold"
                >
                  Save Fee Structure
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Printable Receipt Preview Modal */}
      {selectedReceipt && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-8 shadow-2xl space-y-6 border border-slate-200">
            {/* School Receipt Header */}
            <div className="text-center border-b pb-4 border-slate-200">
              <h2 className="text-xl font-heading font-black text-slate-900 uppercase">NVP ENGLISH MEDIUM SCHOOL</h2>
              <p className="text-xs text-slate-500">NIMBI JODHAN, LADNUN, RAJASTHAN</p>
              <p className="text-[11px] font-bold text-emerald-700 uppercase mt-1 tracking-wider">OFFICIAL FEE PAYMENT RECEIPT</p>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <p className="text-slate-400 text-[10px] uppercase font-bold">Receipt Number</p>
                <p className="font-mono font-bold text-slate-900">{selectedReceipt.receiptNo}</p>
              </div>
              <div>
                <p className="text-slate-400 text-[10px] uppercase font-bold">Payment Date</p>
                <p className="font-bold text-slate-900">{new Date(selectedReceipt.paymentDate).toLocaleDateString('en-IN')}</p>
              </div>
              <div>
                <p className="text-slate-400 text-[10px] uppercase font-bold">Student Name</p>
                <p className="font-bold text-slate-900">{selectedReceipt.studentName}</p>
              </div>
              <div>
                <p className="text-slate-400 text-[10px] uppercase font-bold">Class & Section</p>
                <p className="font-bold text-slate-900">{selectedReceipt.className}</p>
              </div>
              <div>
                <p className="text-slate-400 text-[10px] uppercase font-bold">Payment Method</p>
                <p className="font-bold text-slate-900">{selectedReceipt.paymentMethod}</p>
              </div>
              <div>
                <p className="text-slate-400 text-[10px] uppercase font-bold">Fee Category</p>
                <p className="font-bold text-slate-900">{selectedReceipt.feeType}</p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between">
              <span className="font-bold text-slate-700 text-sm">Total Paid Amount:</span>
              <span className="text-2xl font-heading font-black text-emerald-600">
                ₹{selectedReceipt.amount?.toLocaleString('en-IN')}
              </span>
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-400 pt-4 border-t border-slate-100">
              <span>Status: <strong className="text-emerald-600 uppercase">Paid & Verified</strong></span>
              <span>Authorized Signature: ____________</span>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setSelectedReceipt(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold"
              >
                Close
              </button>
              <button
                onClick={() => window.print()}
                className="px-5 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold flex items-center gap-1.5"
              >
                <Printer className="w-4 h-4" /> Print Receipt
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
