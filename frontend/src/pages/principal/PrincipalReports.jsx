import React, { useState, useEffect } from 'react';
import { 
  getReportsDataApi, getClassesApi, getUsersApi, getFeePaymentsApi, getResultsApi 
} from '../../services/api';
import { 
  Download, FileSpreadsheet, FileText, CheckCircle2, Printer, Filter, Search, Calendar,
  Users, Layers, BookOpen, Award, ShieldAlert, Bus, Package, Library, Activity, Sparkles,
  RefreshCw, Check, X, ChevronRight, FileBadge
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function PrincipalReports() {
  const { showToast } = useAuth();
  const [loading, setLoading] = useState(false);
  const [classes, setClasses] = useState([]);

  // Report Selection state
  const [selectedReportId, setSelectedReportId] = useState('school-master-summary');

  // Filters State
  const [academicYear, setAcademicYear] = useState('2026-2027');
  const [selectedClassId, setSelectedClassId] = useState('');
  const [selectedSection, setSelectedSection] = useState('A');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Report Data
  const [reportData, setReportData] = useState({
    summary: {},
    records: [],
    count: 0
  });

  // 26 Complete ERP Reports Catalog Definitions
  const reportsCatalog = [
    // 1. Executive Master Report
    {
      group: 'Master Executive',
      items: [
        { id: 'school-master-summary', name: 'Complete School Executive Summary', desc: 'Overall school summary combining Students, Teachers, Attendance %, Fee Realization, and Exam Results.', icon: Sparkles, color: 'text-amber-500 bg-amber-500/10' }
      ]
    },
    // 2. Student Reports
    {
      group: 'Student Reports',
      items: [
        { id: 'student-summary', name: 'Student Summary Report', desc: 'Total students, class-wise, section-wise breakdown, active/inactive list.', icon: Users, color: 'text-sky-500 bg-sky-500/10' },
        { id: 'student-admission', name: 'Student Admission Report', desc: 'New admissions, admission dates, class, and academic session registry.', icon: FileText, color: 'text-blue-500 bg-blue-500/10' },
        { id: 'student-attendance', name: 'Student Attendance Report', desc: 'Daily/Monthly present, absent, leave, and calculated attendance %.', icon: CheckCircle2, color: 'text-emerald-500 bg-emerald-500/10' },
        { id: 'student-academic', name: 'Student Academic & Grade Report', desc: 'Subject marks, calculated percentage, letter grade, and pass/fail summary.', icon: Award, color: 'text-indigo-500 bg-indigo-500/10' },
        { id: 'student-documents', name: 'Student Document Status Report', desc: 'Submitted/pending student documents (Aadhar, Birth Certificate, TC).', icon: FileBadge, color: 'text-teal-500 bg-teal-500/10' },
        { id: 'student-ledger', name: 'Student Fee Ledger History', desc: 'Individual student complete fee demand, discounts, and payment history.', icon: DollarSign, color: 'text-green-500 bg-green-500/10' }
      ]
    },
    // 3. Fee & Finance Reports
    {
      group: 'Fee & Financial Reports',
      items: [
        { id: 'fee-summary', name: 'Fee Summary & Demand Report', desc: 'Total fee demanded, paid fee, pending fee, and overdue fee summary.', icon: DollarSign, color: 'text-emerald-500 bg-emerald-500/10' },
        { id: 'fee-collection', name: 'Fee Collection Audit Log', desc: 'Daily, monthly, and yearly fee collection logs with payment methods.', icon: FileSpreadsheet, color: 'text-green-500 bg-green-500/10' },
        { id: 'class-fee', name: 'Class-Wise Fee Collection Report', desc: 'Each class total fee demand, realized collection, and pending due balance.', icon: Layers, color: 'text-purple-500 bg-purple-500/10' },
        { id: 'fee-due', name: 'Fee Due & Defaulters List', desc: 'List of students with pending/overdue fees and guardian contact numbers.', icon: AlertTriangle, color: 'text-rose-500 bg-rose-500/10' },
        { id: 'fee-receipt', name: 'Fee Receipts Audit Registry', desc: 'Computerized receipts generated registry with payment modes & reference numbers.', icon: Receipt, color: 'text-amber-500 bg-amber-500/10' }
      ]
    },
    // 4. Faculty & Academics Reports
    {
      group: 'Faculty & Class Reports',
      items: [
        { id: 'teacher-summary', name: 'Teacher Summary Roster', desc: 'Total teachers, employee IDs, qualifications, assigned subjects & classes.', icon: Users, color: 'text-purple-500 bg-purple-500/10' },
        { id: 'teacher-attendance', name: 'Teacher Attendance & Leave Log', desc: 'Teacher attendance logs, present days, absent days, and leave records.', icon: CheckCircle2, color: 'text-teal-500 bg-teal-500/10' },
        { id: 'class-summary', name: 'Class Directory & Teacher Mapping', desc: 'Class standards, sections, student count, and assigned class teacher.', icon: Layers, color: 'text-indigo-500 bg-indigo-500/10' },
        { id: 'subject-catalog', name: 'Subject & Teacher Catalog', desc: 'Subjects, codes, assigned teaching faculty, and class mapping.', icon: BookOpen, color: 'text-pink-500 bg-pink-500/10' },
        { id: 'syllabus-progress', name: 'Syllabus Completion Progress', desc: 'Completed topics/chapters, pending topics, and syllabus completion %.', icon: Activity, color: 'text-cyan-500 bg-cyan-500/10' }
      ]
    },
    // 5. Examinations & Timetable Reports
    {
      group: 'Exams & Timetable Reports',
      items: [
        { id: 'exam-summary', name: 'Exam Schedule & Timetable Report', desc: 'Scheduled exams, target classes, subjects, exam dates, and duration.', icon: Calendar, color: 'text-amber-500 bg-amber-500/10' },
        { id: 'exam-result', name: 'Exam Marks & Pass/Fail Report', desc: 'Student exam marks, percentage, letter grades, and pass/fail statistics.', icon: Award, color: 'text-emerald-500 bg-emerald-500/10' },
        { id: 'question-paper', name: 'Question Paper Bank Audit Report', desc: 'Question papers created, authoring teachers, review status, and marks.', icon: FileText, color: 'text-rose-500 bg-rose-500/10' },
        { id: 'timetable-schedule', name: 'School Timetable Master Schedule', desc: 'Class-wise and teacher-wise daily period schedules and rooms.', icon: Calendar, color: 'text-blue-500 bg-blue-500/10' }
      ]
    },
    // 6. Facilities & Operations Reports
    {
      group: 'Facilities & Logistics Reports',
      items: [
        { id: 'library-catalog', name: 'Library Book & Issue Register', desc: 'Available books, issued books, returned books, and overdue register.', icon: Library, color: 'text-cyan-500 bg-cyan-500/10' },
        { id: 'inventory-stock', name: 'Inventory & Stock Audit Report', desc: 'Available stock, issued equipment, damaged items, and low-stock alerts.', icon: Package, color: 'text-blue-500 bg-blue-500/10' },
        { id: 'transport-fleet', name: 'Transport Fleet & Student Route List', desc: 'Buses, routes, driver contacts, assigned commuting students.', icon: Bus, color: 'text-yellow-500 bg-yellow-500/10' },
        { id: 'certificates-issued', name: 'Certificates Issued Registry', desc: 'Issued Transfer Certificates (TC), Character Certificates, and Bonafide.', icon: FileBadge, color: 'text-teal-500 bg-teal-500/10' }
      ]
    },
    // 7. Security & Administration
    {
      group: 'Security & Audit Reports',
      items: [
        { id: 'user-activity', name: 'User System Activity Audit Log', desc: 'Admin & teacher system login history, data modifications, and action logs.', icon: ShieldAlert, color: 'text-slate-500 bg-slate-500/10' }
      ]
    }
  ];

  // Fetch Classes meta for filter dropdown
  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const res = await getClassesApi();
        if (res.data.success) setClasses(res.data.classes || []);
      } catch (err) {}
    };
    fetchClasses();
  }, []);

  // Fetch Report Data
  const fetchReportData = async () => {
    try {
      setLoading(true);
      const res = await getReportsDataApi({
        reportType: selectedReportId,
        classId: selectedClassId || undefined,
        section: selectedSection || undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        academicYear,
        search: searchQuery || undefined,
        status: statusFilter || undefined
      });

      if (res.data.success) {
        setReportData({
          summary: res.data.summary || {},
          records: res.data.records || [],
          count: res.data.count || 0
        });
      }
    } catch (err) {
      console.error('Failed to load report data:', err);
      showToast('Error generating report data.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReportData();
  }, [selectedReportId, selectedClassId, selectedSection, academicYear, statusFilter]);

  // Handle Export CSV
  const handleExportCSV = () => {
    if (!reportData.records || reportData.records.length === 0) {
      showToast('No records available to export.', 'info');
      return;
    }

    try {
      const firstRow = reportData.records[0];
      const keys = Object.keys(firstRow).filter(k => typeof firstRow[k] !== 'object' || firstRow[k] === null);
      const headers = keys.join(',');

      const rows = reportData.records.map(row => 
        keys.map(k => {
          let val = row[k];
          if (val === null || val === undefined) val = '';
          return `"${String(val).replace(/"/g, '""')}"`;
        }).join(',')
      );

      const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n');
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', `NVP_ERP_${selectedReportId}_${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      showToast('Report exported successfully to CSV/Excel.', 'success');
    } catch (err) {
      showToast('Failed to export CSV.', 'error');
    }
  };

  const currentReportMeta = reportsCatalog.flatMap(g => g.items).find(r => r.id === selectedReportId) || reportsCatalog[0].items[0];

  return (
    <div className="space-y-6 select-none pb-12">
      {/* Top Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4 border border-indigo-500/20">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[10px] font-black uppercase tracking-wider">
              NVP Executive Reporting Engine
            </span>
            <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[10px] font-bold">
              26 Dedicated ERP Reports
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-heading font-black mt-2 tracking-tight">
            Comprehensive School Reports & Analytics
          </h1>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl">
            Real-time reporting across Students, Attendance, Fee Realization, Academics, Staff, Fleet, Facilities, and System Audits.
          </p>
        </div>

        {/* Global Actions */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs border border-white/20 transition backdrop-blur-sm"
          >
            <Printer className="w-4 h-4 text-emerald-400" />
            <span>Print / PDF</span>
          </button>
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV / Excel</span>
          </button>
        </div>
      </div>

      {/* Main Layout: Report Selector Drawer + Report Content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Column: 26 Reports Catalog Directory */}
        <div className="lg:col-span-1 space-y-4">
          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3 max-h-[80vh] overflow-y-auto custom-scrollbar">
            <h3 className="font-heading font-bold text-xs text-slate-900 uppercase tracking-wider flex items-center justify-between border-b pb-2 border-slate-100">
              <span>Select ERP Report</span>
              <span className="text-[10px] text-indigo-600 font-bold bg-indigo-50 px-2 py-0.5 rounded-full">26 Reports</span>
            </h3>

            {reportsCatalog.map((group) => (
              <div key={group.group} className="space-y-1">
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-wider pt-2 px-2">
                  {group.group}
                </div>
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isSelected = selectedReportId === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setSelectedReportId(item.id)}
                      className={`w-full text-left p-2.5 rounded-xl text-xs font-semibold transition flex items-center justify-between group ${
                        isSelected 
                          ? 'bg-slate-900 text-white font-bold shadow-xs' 
                          : 'text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className={`p-1.5 rounded-lg shrink-0 ${item.color}`}>
                          <Icon className="w-3.5 h-3.5" />
                        </div>
                        <span className="truncate">{item.name}</span>
                      </div>
                      <ChevronRight className={`w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition ${isSelected ? 'text-white' : ''}`} />
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Report View & Universal Filters */}
        <div className="lg:col-span-3 space-y-6">
          {/* Universal Filters Bar */}
          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b pb-2 border-slate-100">
              <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <Filter className="w-4 h-4 text-indigo-600" />
                Universal Report Filters
              </span>
              <button 
                onClick={fetchReportData} 
                className="text-indigo-600 hover:text-indigo-700 text-xs font-bold flex items-center gap-1"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Refresh Data
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Academic Session</label>
                <select
                  value={academicYear}
                  onChange={(e) => setAcademicYear(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-xl border border-slate-300 text-xs font-bold bg-slate-50 focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="2026-2027">Session 2026-2027</option>
                  <option value="2025-2026">Session 2025-2026</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Class Filter</label>
                <select
                  value={selectedClassId}
                  onChange={(e) => setSelectedClassId(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-xl border border-slate-300 text-xs font-bold bg-slate-50 focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">All Classes (PG to 7)</option>
                  {classes.map(c => (
                    <option key={c._id} value={c._id}>Class {c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Section</label>
                <select
                  value={selectedSection}
                  onChange={(e) => setSelectedSection(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-xl border border-slate-300 text-xs font-bold bg-slate-50 focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="A">Section A</option>
                  <option value="B">Section B</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Search Keyword</label>
                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-2.5 top-2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search name, SRN..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-8 pr-2 py-1.5 rounded-xl border border-slate-300 text-xs font-semibold focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Report Metadata & Live View Card */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b pb-4 border-slate-100">
              <div>
                <span className="px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 text-[10px] font-bold uppercase">
                  Report ID: {currentReportMeta.id}
                </span>
                <h2 className="text-lg font-heading font-black text-slate-900 mt-1">
                  {currentReportMeta.name}
                </h2>
                <p className="text-xs text-slate-500">{currentReportMeta.desc}</p>
              </div>
              <div className="text-right shrink-0">
                <div className="text-2xl font-heading font-black text-indigo-900">{reportData.count} Records</div>
                <span className="text-[10px] text-slate-400 font-mono">Academic Year {academicYear}</span>
              </div>
            </div>

            {/* Live Data Display Table */}
            {loading ? (
              <div className="py-16 text-center text-xs text-slate-500 font-semibold">
                <RefreshCw className="w-8 h-8 mx-auto mb-3 animate-spin text-indigo-600" />
                Generating ERP report data...
              </div>
            ) : reportData.records.length === 0 ? (
              <div className="py-16 text-center text-xs text-slate-400">
                No matching report records found for the applied filters.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-700">
                  <thead className="bg-slate-100 text-slate-600 font-bold uppercase text-[10px]">
                    <tr>
                      <th className="px-4 py-3">#</th>
                      <th className="px-4 py-3">Record Details / Name</th>
                      <th className="px-4 py-3">Class / Reference</th>
                      <th className="px-4 py-3">Category / Identifier</th>
                      <th className="px-4 py-3 text-right">Status / Metric</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {reportData.records.slice(0, 100).map((row, idx) => (
                      <tr key={row._id || idx} className="hover:bg-slate-50/80 transition-colors">
                        <td className="px-4 py-3 font-mono text-slate-400">{idx + 1}</td>
                        <td className="px-4 py-3 font-bold text-slate-900">
                          {row.name || row.studentName || row.title || row.itemName || row.receiptNo || row.className || 'Record Entry'}
                        </td>
                        <td className="px-4 py-3 text-slate-600">
                          {row.class?.name ? `Class ${row.class.name} ${row.class.section || ''}` : row.className || row.route || '-'}
                        </td>
                        <td className="px-4 py-3 text-slate-500 font-mono">
                          {row.admissionNo || row.employeeId || row.code || row.paymentMethod || row.feeType || '-'}
                        </td>
                        <td className="px-4 py-3 text-right font-extrabold text-slate-900">
                          {row.amount ? `₹${row.amount.toLocaleString('en-IN')}` : row.status || row.studentCount || 'Active'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
