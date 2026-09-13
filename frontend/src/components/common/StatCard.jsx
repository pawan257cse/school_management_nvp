import React from 'react';

export default function StatCard({ title, value, subtitle, icon: Icon, color = 'blue', trend }) {
  const colorStyles = {
    blue: 'bg-blue-500/10 text-blue-600 border-blue-200',
    emerald: 'bg-emerald-500/10 text-emerald-600 border-emerald-200',
    amber: 'bg-amber-500/10 text-amber-600 border-amber-200',
    purple: 'bg-purple-500/10 text-purple-600 border-purple-200',
    rose: 'bg-rose-500/10 text-rose-600 border-rose-200',
    indigo: 'bg-indigo-500/10 text-indigo-600 border-indigo-200',
  };

  return (
    <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm hover:shadow-md transition-all duration-200">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">{title}</p>
          <h3 className="font-heading font-extrabold text-2xl sm:text-3xl text-slate-900 mt-1">{value}</h3>
        </div>
        <div className={`p-3 rounded-xl border ${colorStyles[color] || colorStyles.blue}`}>
          {Icon && <Icon className="w-6 h-6" />}
        </div>
      </div>
      {(subtitle || trend) && (
        <div className="mt-3 flex items-center justify-between text-xs pt-2 border-t border-slate-100">
          {subtitle && <span className="text-slate-500 font-medium">{subtitle}</span>}
          {trend && (
            <span className="font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
              {trend}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
