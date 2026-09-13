import React, { useState, useEffect } from 'react';
import { 
  Receipt, 
  IndianRupee, 
  Calendar, 
  ArrowLeft, 
  RefreshCw, 
  CheckCircle2, 
  Download,
  AlertCircle
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { getStudentFeesApi } from '../../services/api';

export default function StudentFees() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFees = async () => {
      try {
        const res = await getStudentFeesApi();
        if (res.data?.success) setData(res.data);
      } catch (err) {
        console.error('Error fetching student fee status:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchFees();
  }, []);

  const summary = data?.summary || { totalFee: 4500, paidFee: 4500, pendingDues: 0, status: 'Clear' };
  const payments = data?.payments || [];

  return (
    <div className="space-y-6 pb-12">
      <div className="flex items-center justify-between bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <Link to="/student-dashboard" className="text-slate-500 hover:text-slate-800 text-sm flex items-center gap-1 font-medium mb-1">
            <ArrowLeft className="w-4 h-4" /> Student Portal
          </Link>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2.5">
            <Receipt className="w-7 h-7 text-teal-600" />
            My Fee Ledger & Payment Receipts
          </h1>
          <p className="text-slate-600 text-sm mt-0.5">
            View applicable quarterly fees, cleared payment receipts, and balance status.
          </p>
        </div>
      </div>

      {/* Fee Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-xs font-black uppercase text-slate-500 tracking-wider">Applicable Tuition Fee</span>
          <div className="text-3xl font-black font-heading text-slate-900 mt-2 font-mono">
            ₹{summary.totalFee?.toLocaleString('en-IN')}
          </div>
          <p className="text-xs text-slate-500 mt-1">Quarterly Assessment Rate</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-emerald-200 shadow-sm bg-emerald-50/20">
          <span className="text-xs font-black uppercase text-emerald-800 tracking-wider">Total Paid Amount</span>
          <div className="text-3xl font-black font-heading text-emerald-700 mt-2 font-mono">
            ₹{summary.paidFee?.toLocaleString('en-IN')}
          </div>
          <p className="text-xs text-emerald-600 font-semibold mt-1">Cleared at Fee Counter</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-teal-200 shadow-sm bg-teal-50/20">
          <span className="text-xs font-black uppercase text-teal-800 tracking-wider">Outstanding Dues</span>
          <div className="text-3xl font-black font-heading text-teal-700 mt-2 font-mono">
            ₹{summary.pendingDues?.toLocaleString('en-IN')}
          </div>
          <p className="text-xs text-teal-600 font-bold mt-1">
            {summary.pendingDues === 0 ? 'All Dues Fully Cleared' : 'Pending Payment'}
          </p>
        </div>
      </div>

      {/* Payment Receipts History */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden space-y-4">
        <div className="p-5 bg-slate-50 border-b border-slate-200">
          <h3 className="font-bold text-slate-900 text-sm">Official Cleared Fee Receipts</h3>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-500 font-medium">
            <RefreshCw className="w-8 h-8 mx-auto mb-3 animate-spin text-teal-600" />
            Loading receipts...
          </div>
        ) : payments.length === 0 ? (
          <div className="p-12 text-center text-slate-500 font-medium">
            No payment receipts logged yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-100 text-slate-600 font-bold uppercase text-[10px]">
                <tr>
                  <th className="py-3 px-4">Receipt Number</th>
                  <th className="py-3 px-4">Fee Category</th>
                  <th className="py-3 px-4">Payment Method</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                {payments.map((p) => (
                  <tr key={p._id} className="hover:bg-slate-50">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900">{p.receiptNo}</td>
                    <td className="py-3.5 px-4">{p.feeType || 'Tuition Fee (Q1)'}</td>
                    <td className="py-3.5 px-4 font-semibold text-slate-700">{p.paymentMethod || 'UPI'}</td>
                    <td className="py-3.5 px-4 font-mono text-slate-500">
                      {new Date(p.paymentDate).toLocaleDateString('en-IN')}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-black text-emerald-700 text-sm">
                      ₹{p.amount?.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {p.status || 'Completed'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
