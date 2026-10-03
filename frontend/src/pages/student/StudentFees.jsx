import React, { useState, useEffect } from 'react';
import { 
  Receipt, ArrowLeft, RefreshCw, CheckCircle2, Download, Printer, Eye
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { getMyFeesApi } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export default function StudentFees() {
  const { user } = useAuth();
  const [ledger, setLedger] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedReceipt, setSelectedReceipt] = useState(null);

  const backTarget = user?.role === 'HEAD' 
    ? '/head-fee-management' 
    : user?.role === 'PRINCIPAL' 
    ? '/principal-dashboard' 
    : '/student-dashboard';

  useEffect(() => {
    const fetchFees = async () => {
      try {
        setLoading(true);
        const res = await getMyFeesApi();
        if (res.data?.success) setLedger(res.data.ledger);
      } catch (err) {
        console.error('Error fetching student fee status:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchFees();
  }, []);

  return (
    <div className="space-y-6 pb-12 select-none">
      {/* Header */}
      <div className="flex items-center justify-between bg-white p-5 rounded-3xl border border-slate-200 shadow-xs">
        <div>
          <Link to={backTarget} className="text-slate-500 hover:text-slate-800 text-xs flex items-center gap-1 font-bold mb-1">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to {user?.role === 'HEAD' || user?.role === 'PRINCIPAL' ? 'Head Admin Portal' : 'Dashboard'}
          </Link>
          <h1 className="text-2xl font-heading font-black text-slate-900 flex items-center gap-2.5">
            <Receipt className="w-7 h-7 text-emerald-600" />
            My Fee Ledger & Payment Receipts
          </h1>
          <p className="text-slate-500 text-xs mt-0.5">
            Academic Session {ledger?.academicYear || '2026-2027'} • Class {ledger?.className} ({ledger?.section})
          </p>
        </div>
      </div>

      {loading ? (
        <div className="p-16 text-center text-slate-500 font-medium bg-white rounded-3xl border border-slate-200">
          <RefreshCw className="w-8 h-8 mx-auto mb-3 animate-spin text-emerald-600" />
          Loading your personal fee ledger...
        </div>
      ) : !ledger ? (
        <div className="p-16 text-center text-slate-500 font-medium bg-white rounded-3xl border border-slate-200">
          Fee ledger record unavailable.
        </div>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-[11px] font-extrabold uppercase text-slate-400 tracking-wider">Total Base Fee</span>
              <div className="text-2xl font-black font-heading text-slate-900 mt-1">
                ₹{ledger.totalBaseFee?.toLocaleString('en-IN')}
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">Base Fee Structure</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-amber-200 bg-amber-50/20 shadow-xs">
              <span className="text-[11px] font-extrabold uppercase text-amber-800 tracking-wider">Scholarship / Discount</span>
              <div className="text-2xl font-black font-heading text-amber-600 mt-1">
                -₹{ledger.discountAmount?.toLocaleString('en-IN')}
              </div>
              <p className="text-[11px] text-amber-700 font-semibold mt-0.5">{ledger.discountReason || 'Approved Scholarship'}</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-emerald-200 bg-emerald-50/20 shadow-xs">
              <span className="text-[11px] font-extrabold uppercase text-emerald-800 tracking-wider">Total Paid Amount</span>
              <div className="text-2xl font-black font-heading text-emerald-600 mt-1">
                ₹{ledger.totalPaid?.toLocaleString('en-IN')}
              </div>
              <p className="text-[11px] text-emerald-700 font-semibold mt-0.5">Cleared at School Counter</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-rose-200 bg-rose-50/20 shadow-xs">
              <span className="text-[11px] font-extrabold uppercase text-rose-800 tracking-wider">Remaining Dues</span>
              <div className="text-2xl font-black font-heading text-rose-600 mt-1">
                ₹{ledger.pendingAmount?.toLocaleString('en-IN')}
              </div>
              <p className="text-[11px] text-rose-700 font-bold mt-0.5">
                {ledger.pendingAmount === 0 ? 'Fully Cleared ✓' : 'Pending Payment'}
              </p>
            </div>
          </div>

          {/* Installment Breakdown */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 space-y-3">
            <h3 className="font-heading font-bold text-sm text-slate-900">Installments Schedule & Status</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {ledger.installments?.map((inst) => (
                <div key={inst.installmentNo} className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 text-xs">{inst.title}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase border ${
                      inst.status === 'Paid' 
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                        : inst.status === 'Partial'
                        ? 'bg-amber-50 text-amber-700 border-amber-200'
                        : 'bg-rose-50 text-rose-700 border-rose-200'
                    }`}>
                      {inst.status}
                    </span>
                  </div>
                  <div className="text-lg font-bold text-slate-900">₹{inst.amount?.toLocaleString('en-IN')}</div>
                  <div className="text-[10px] text-slate-400">Due Date: {inst.dueDate ? new Date(inst.dueDate).toLocaleDateString('en-IN') : 'N/A'}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Payment Receipts */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 space-y-4">
            <h3 className="font-heading font-bold text-sm text-slate-900">Payment Receipts History</h3>
            {ledger.paymentHistory?.length === 0 ? (
              <p className="text-xs text-slate-400">No payment receipts issued yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-slate-100 text-slate-600 font-bold uppercase text-[10px]">
                    <tr>
                      <th className="py-3 px-4">Receipt No</th>
                      <th className="py-3 px-4">Category</th>
                      <th className="py-3 px-4">Payment Method</th>
                      <th className="py-3 px-4">Date</th>
                      <th className="py-3 px-4">Amount</th>
                      <th className="py-3 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-800">
                    {ledger.paymentHistory.map((p) => (
                      <tr key={p._id} className="hover:bg-slate-50">
                        <td className="py-3 px-4 font-mono font-bold text-emerald-700">{p.receiptNo}</td>
                        <td className="py-3 px-4">{p.feeType}</td>
                        <td className="py-3 px-4 font-semibold text-slate-700">{p.paymentMethod}</td>
                        <td className="py-3 px-4 font-mono text-slate-500">
                          {new Date(p.paymentDate).toLocaleDateString('en-IN')}
                        </td>
                        <td className="py-3 px-4 font-black text-slate-900">
                          ₹{p.amount?.toLocaleString('en-IN')}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => setSelectedReceipt(p)}
                            className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-[11px] font-bold inline-flex items-center gap-1"
                          >
                            <Printer className="w-3 h-3" /> View & Print
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}

      {/* Printable Receipt Modal for Student */}
      {selectedReceipt && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-8 shadow-2xl space-y-6 border border-slate-200">
            <div className="text-center border-b pb-4 border-slate-200 space-y-1">
              <div className="flex items-center justify-center gap-2">
                <img src="/logo.png" alt="NVP Logo" className="w-8 h-8 object-contain" />
                <h2 className="text-xl font-heading font-black text-slate-900 tracking-tight">NVP ENGLISH MEDIUM SCHOOL</h2>
              </div>
              <p className="text-[11px] text-slate-500 font-semibold">Nimbi Jodhan, Ladnun, Nagaur, Rajasthan - 341316</p>
              <p className="text-[11px] font-black text-emerald-700 uppercase tracking-widest pt-1">
                OFFICIAL FEE PAYMENT RECEIPT ({selectedReceipt.academicYear || '2026-2027'})
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <p className="text-slate-400 text-[10px] uppercase font-bold">Receipt Number</p>
                <p className="font-mono font-bold text-slate-900 text-sm">{selectedReceipt.receiptNo}</p>
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
                <p className="font-bold text-slate-900">{selectedReceipt.className} - {selectedReceipt.section || 'A'}</p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
              <span className="font-bold text-slate-800 text-sm">Amount Paid:</span>
              <span className="text-2xl font-heading font-black text-emerald-600">
                ₹{selectedReceipt.amount?.toLocaleString('en-IN')}
              </span>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setSelectedReceipt(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-100"
              >
                Close
              </button>
              <button
                onClick={() => window.print()}
                className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-1.5 shadow-md"
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
