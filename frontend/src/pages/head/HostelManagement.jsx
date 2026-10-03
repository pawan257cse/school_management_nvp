import React from 'react';
import { Building2, Bed, Users, ShieldAlert, CheckCircle2 } from 'lucide-react';

export default function HostelManagement() {
  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl border border-slate-800">
        <h1 className="text-2xl sm:text-3xl font-black font-heading tracking-tight flex items-center gap-3">
          <Building2 className="w-8 h-8 text-indigo-400" /> Student Hostel & Residence
        </h1>
        <p className="text-slate-300 text-sm mt-1 max-w-xl">
          Hostel room allocations, warden attendance, mess menu & resident safety tracking.
        </p>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm text-center space-y-3">
        <Bed className="w-12 h-12 text-indigo-600 mx-auto opacity-90" />
        <h3 className="text-base font-bold text-slate-900">Hostel Allocation Management System</h3>
        <p className="text-xs text-slate-500 max-w-md mx-auto">
          Currently managing residential facilities for NVP English Medium School students.
        </p>
      </div>
    </div>
  );
}