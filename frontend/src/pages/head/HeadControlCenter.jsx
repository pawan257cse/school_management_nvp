import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  Users, UserCheck, School, BookOpen, Clock, FileText, 
  Receipt, Package, Library, Bus, Bell, ShieldCheck, 
  Activity, Settings, Award, CheckSquare, ChevronRight,
  TrendingUp, Sparkles, Building, ArrowUpRight
} from 'lucide-react';
import { getDashboardStatsApi, getInventoryItemsApi, getLibraryBooksApi } from '../../services/api';

export default function HeadControlCenter() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [inventoryStats, setInventoryStats] = useState({ count: 0, lowStockCount: 0 });
  const [libraryStats, setLibraryStats] = useState({ totalCopies: 0, availableCopies: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadControlCenterData() {
      try {
        setLoading(true);
        const [sRes, iRes, lRes] = await Promise.allSettled([
          getDashboardStatsApi(),
          getInventoryItemsApi(),
          getLibraryBooksApi()
        ]);

        if (sRes.status === 'fulfilled' && sRes.value.data?.success) {
          setStats(sRes.value.data.stats);
        }
        if (iRes.status === 'fulfilled' && iRes.value.data?.success) {
          setInventoryStats({
            count: iRes.value.data.count || 0,
            lowStockCount: iRes.value.data.lowStockCount || 0
          });
        }
        if (lRes.status === 'fulfilled' && lRes.value.data?.success) {
          setLibraryStats({
            totalCopies: lRes.value.data.totalCopies || 0,
            availableCopies: lRes.value.data.availableCopies || 0
          });
        }
      } catch (err) {
        console.error('Control center data load error:', err);
      } finally {
        setLoading(false);
      }
    }
    loadControlCenterData();
  }, []);

  const gLower = (user?.gender || '').toLowerCase();
  const nLower = (user?.name || '').toLowerCase();
  const isFemale = gLower === 'female' || gLower === 'f' || nLower.startsWith('mrs') || nLower.startsWith('ms') || nLower.startsWith('miss');
  const honorific = isFemale ? "Ma'am" : "Sir";

  const erpModules = [
    {
      category: 'Academic & Curriculum',
      modules: [
        {
          title: 'Class Timetable & Schedule',
          desc: 'Manage P1-P8 period timings, teacher duties, subject allocations & lunch breaks for PG to Class 7.',
          icon: Clock,
          color: 'bg-indigo-50 text-indigo-600 border-indigo-200 hover:border-indigo-400',
          path: '/academic/timetable',
          stat: 'P1-P8 Active'
        },
        {
          title: 'Classes & Standards',
          desc: '10 Active Standards (PG, LKG, UKG, Class 1-7), sections, class teacher assignments & attendance rights.',
          icon: School,
          color: 'bg-purple-50 text-purple-600 border-purple-200 hover:border-purple-400',
          path: '/head/classes',
          stat: '10 Active Classes'
        },
        {
          title: 'Subjects & Syllabus',
          desc: 'English, Hindi, Maths, Science, Social Science, Sanskrit, Computer, EVS & Rhymes subject master.',
          icon: BookOpen,
          color: 'bg-amber-50 text-amber-600 border-amber-200 hover:border-amber-400',
          path: '/head/subjects',
          stat: '14 Core Subjects'
        },
        {
          title: 'Exams & Timetable',
          desc: 'Unit Tests, Half Yearly & Final Annual examination schedules, date-sheets & invigilation.',
          icon: FileText,
          color: 'bg-rose-50 text-rose-600 border-rose-200 hover:border-rose-400',
          path: '/exams',
          stat: 'Session 2026-27'
        }
      ]
    },
    {
      category: 'Student & Faculty Management',
      modules: [
        {
          title: 'Student Directory',
          desc: 'Admissions register, roll numbers, student bio, guardian contact details & portal credentials.',
          icon: Users,
          color: 'bg-blue-50 text-blue-600 border-blue-200 hover:border-blue-400',
          path: '/students',
          stat: `${stats?.totalStudents || 0} Students`
        },
        {
          title: 'Teachers & Faculty',
          desc: '10 Official school teachers, qualifications, assigned subjects, class teacher duties & login accounts.',
          icon: UserCheck,
          color: 'bg-emerald-50 text-emerald-600 border-emerald-200 hover:border-emerald-400',
          path: '/head/teachers',
          stat: `${stats?.totalTeachers || 10} Faculty Members`
        },
        {
          title: 'Student Promotions',
          desc: 'Batch promote students from current academic year to next standard with full history logs.',
          icon: TrendingUp,
          color: 'bg-teal-50 text-teal-600 border-teal-200 hover:border-teal-400',
          path: '/promotions',
          stat: 'Academic Batch'
        },
        {
          title: 'Teacher Attendance',
          desc: 'Mark daily faculty attendance, check-in timestamps, leave requests & duty status.',
          icon: CheckSquare,
          color: 'bg-indigo-50 text-indigo-600 border-indigo-200 hover:border-indigo-400',
          path: '/head/teacher-attendance',
          stat: 'Daily Faculty Check'
        }
      ]
    },
    {
      category: 'Store, Inventory & Library ERP',
      modules: [
        {
          title: 'Store & Inventory Management',
          desc: 'Manage school dresses/uniforms, books, stationery, robotics/computer lab items, stock in/out & low stock alerts.',
          icon: Package,
          color: 'bg-amber-50 text-amber-700 border-amber-200 hover:border-amber-400',
          path: '/inventory',
          stat: `${inventoryStats.count} Items (${inventoryStats.lowStockCount} Low)`
        },
        {
          title: 'Library & Book Issue Register',
          desc: 'Book catalogue, author & ISBN records, issue/return transactions to students & teachers, overdue fines.',
          icon: Library,
          color: 'bg-purple-50 text-purple-700 border-purple-200 hover:border-purple-400',
          path: '/library',
          stat: `${libraryStats.availableCopies}/${libraryStats.totalCopies} Copies Free`
        }
      ]
    },
    {
      category: 'Finance, Transport & Communication',
      modules: [
        {
          title: 'Fees & Finance Ledger',
          desc: 'Class-wise fee structures, fee collection receipts, outstanding balance register & collection reports.',
          icon: Receipt,
          color: 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:border-emerald-400',
          path: '/fees',
          stat: 'Ledger & Receipts'
        },
        {
          title: 'Transport & Fleet',
          desc: 'School bus fleet, driver details, routes & commuting student rosters.',
          icon: Bus,
          color: 'bg-cyan-50 text-cyan-700 border-cyan-200 hover:border-cyan-400',
          path: '/transport',
          stat: 'Bus Routes'
        },
        {
          title: 'Notice Board & Alerts',
          desc: 'Publish school notices, urgent announcements & instant holiday declarations for all portals.',
          icon: Bell,
          color: 'bg-rose-50 text-rose-700 border-rose-200 hover:border-rose-400',
          path: '/notifications/notices',
          stat: 'Alerts & Broadcast'
        }
      ]
    },
    {
      category: 'System Governance & Security',
      modules: [
        {
          title: 'Role & Permissions (RBAC)',
          desc: 'Configure multi-role access control for Head, Principal, Teachers, Accountant & Librarians.',
          icon: ShieldCheck,
          color: 'bg-slate-100 text-slate-800 border-slate-300 hover:border-slate-500',
          path: '/head/security',
          stat: 'RBAC Policy'
        },
        {
          title: 'Audit Logs & Transactions',
          desc: 'Track system audit trail, user actions, inventory entries & fee updates timestamped.',
          icon: Activity,
          color: 'bg-slate-100 text-slate-800 border-slate-300 hover:border-slate-500',
          path: '/head/activity',
          stat: 'Audit Trail'
        },
        {
          title: 'School Profile Settings',
          desc: 'NVP English Medium School branding, logo, affiliation details & academic session config.',
          icon: Building,
          color: 'bg-slate-100 text-slate-800 border-slate-300 hover:border-slate-500',
          path: '/config/school-info',
          stat: 'Nimbi Jodhan'
        }
      ]
    }
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Executive Control Header */}
      <div className="p-5 sm:p-7 rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border border-slate-800">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-3 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-bold uppercase tracking-wider">
              Head Control Center
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-extrabold">
              Complete School ERP Master Hub
            </span>
          </div>
          <h1 className="font-heading font-black text-2xl sm:text-3xl tracking-tight mt-2">
            Hello, {user?.name || 'Head Admin'} {honorific}!
          </h1>
          <p className="text-slate-300 text-xs sm:text-sm mt-1 font-medium">
            NVP School Master Management Hub — Centralized control center for all 13 ERP modules & operations.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => navigate('/head-dashboard')}
            className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold border border-white/20 transition flex items-center gap-1.5"
          >
            <span>Executive Dashboard</span> &rarr;
          </button>
        </div>
      </div>

      {/* Grid of ERP Modules by Category */}
      <div className="space-y-8">
        {erpModules.map((cat, cIdx) => (
          <div key={cIdx} className="space-y-3">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <h2 className="text-xs font-black uppercase tracking-wider text-slate-600">
                {cat.category}
              </h2>
              <span className="text-[11px] font-bold text-slate-400">
                {cat.modules.length} Modules Available
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {cat.modules.map((mod, mIdx) => {
                const Icon = mod.icon;
                return (
                  <div
                    key={mIdx}
                    onClick={() => navigate(mod.path)}
                    className={`p-5 rounded-2xl bg-white border transition-all duration-200 shadow-xs hover:shadow-md cursor-pointer flex flex-col justify-between group ${mod.color}`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <div className="p-2.5 rounded-xl bg-white shadow-xs shrink-0 group-hover:scale-110 transition-transform">
                          <Icon className="w-5 h-5" />
                        </div>
                        <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md bg-white/80 border border-slate-200">
                          {mod.stat}
                        </span>
                      </div>

                      <h3 className="font-bold text-slate-900 text-sm tracking-tight flex items-center justify-between group-hover:text-indigo-600 transition-colors">
                        <span>{mod.title}</span>
                        <ArrowUpRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </h3>

                      <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                        {mod.desc}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-slate-700 group-hover:text-indigo-600">
                      <span>Open Module</span>
                      <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
