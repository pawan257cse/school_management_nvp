import React from 'react';
import { Landmark, TrendingUp, DollarSign, ArrowUpRight, ArrowDownRight, CreditCard, ShieldCheck } from 'lucide-react';

export default function AccountsManagement() {
  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-slate-900 via-slate-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl border border-slate-800">
        <h1 className="text-2xl sm:text-3xl font-black font-heading tracking-tight flex items-center gap-3">
          <Landmark className="w-8 h-8 text-indigo-400" /> Accounts & Finance System
        </h1>
        <p className="text-slate-300 text-sm mt-1 max-w-xl">
          School revenue tracking, staff payroll disbursements, bank reconciliations & expense ledger.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Collection</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 mt-3">₹ 14,85,000</p>
          <p className="text-[11px] text-emerald-600 font-bold mt-1">Academic Session 2026-27</p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Payroll Expenses</span>
            <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
              <ArrowDownRight className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 mt-3">₹ 3,40,000 / mo</p>
          <p className="text-[11px] text-rose-500 font-bold mt-1">10 Active Staff Members</p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Net Reserve</span>
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 mt-3">₹ 11,45,000</p>
          <p className="text-[11px] text-indigo-600 font-bold mt-1">Verified Audit Ready</p>
        </div>
      </div>
    </div>
  );
}