import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  UserPlus, UserCheck, CreditCard, PackagePlus, 
  BookPlus, Shirt, Bell, FileText, PlusCircle, X, Clock, Calendar
} from 'lucide-react';

export default function QuickActionsModal({ isOpen, onClose }) {
  const navigate = useNavigate();

  if (!isOpen) return null;

  const quickActions = [
    {
      title: 'New Student Admission',
      desc: 'Register a new student, assign roll number, class & parent details.',
      icon: UserPlus,
      color: 'bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-600 hover:text-white',
      path: '/students'
    },
    {
      title: 'Add Teacher / Faculty',
      desc: 'Create new teacher profile, login credentials & subject assignment.',
      icon: UserCheck,
      color: 'bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-600 hover:text-white',
      path: '/head/teachers'
    },
    {
      title: 'Collect Student Fee',
      desc: 'Record fee payment, generate receipt and update outstanding balance.',
      icon: CreditCard,
      color: 'bg-purple-50 text-purple-600 border-purple-200 hover:bg-purple-600 hover:text-white',
      path: '/fees'
    },
    {
      title: 'Add Store Inventory Item',
      desc: 'Add new item to school store, set min stock level & unit price.',
      icon: PackagePlus,
      color: 'bg-amber-50 text-amber-600 border-amber-200 hover:bg-amber-600 hover:text-white',
      path: '/inventory'
    },
    {
      title: 'Add Book to Library',
      desc: 'Add new book title, author, ISBN & total copies to library catalogue.',
      icon: BookPlus,
      color: 'bg-indigo-50 text-indigo-600 border-indigo-200 hover:bg-indigo-600 hover:text-white',
      path: '/library'
    },
    {
      title: 'Uniform / Dress Stock In',
      desc: 'Update school dress sizes, stock in & student issue records.',
      icon: Shirt,
      color: 'bg-teal-50 text-teal-600 border-teal-200 hover:bg-teal-600 hover:text-white',
      path: '/inventory'
    },
    {
      title: 'Publish School Notice',
      desc: 'Issue notice/announcement for students, teachers or all parents.',
      icon: Bell,
      color: 'bg-rose-50 text-rose-600 border-rose-200 hover:bg-rose-600 hover:text-white',
      path: '/notifications/notices'
    },
    {
      title: 'Edit Class Timetable',
      desc: 'Modify period schedules, teacher duties & subject allocations.',
      icon: Clock,
      color: 'bg-cyan-50 text-cyan-600 border-cyan-200 hover:bg-cyan-600 hover:text-white',
      path: '/academic/timetable'
    }
  ];

  const handleActionClick = (path) => {
    onClose();
    navigate(path);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm transition-opacity" onClick={onClose} />

      <div className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden transform transition-all z-10 p-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-5">
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-md border border-indigo-100">
              Administrative Quick Hub
            </span>
            <h2 className="text-lg font-black text-slate-900 mt-1">1-Click Quick ERP Actions</h2>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[65vh] overflow-y-auto pr-1">
          {quickActions.map((action, idx) => {
            const Icon = action.icon;
            return (
              <div
                key={idx}
                onClick={() => handleActionClick(action.path)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer group flex items-start gap-3.5 ${action.color}`}
              >
                <div className="p-2.5 rounded-xl bg-white shadow-xs shrink-0 group-hover:scale-110 transition-transform">
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm tracking-tight">{action.title}</h3>
                  <p className="text-xs opacity-80 mt-0.5 leading-snug">{action.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
