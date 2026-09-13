import React from 'react';
import { getUsersApi, getClassesApi, getSubjectsApi, getQuestionPapersApi, getResultsApi } from '../../services/api';
import { Download, FileSpreadsheet, FileText, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function PrincipalReports() {
  const { showToast } = useAuth();

  const exportReport = async (type) => {
    try {
      let data = [];
      let filename = `nvp_school_${type}_report`;

      if (type === 'teachers') {
        const res = await getUsersApi({ role: 'TEACHER' });
        data = res.data.users;
      } else if (type === 'classes') {
        const res = await getClassesApi();
        data = res.data.classes;
      } else if (type === 'subjects') {
        const res = await getSubjectsApi();
        data = res.data.subjects;
      } else if (type === 'papers') {
        const res = await getQuestionPapersApi();
        data = res.data.papers;
      } else if (type === 'results') {
        const res = await getResultsApi();
        data = res.data.results;
      }

      if (!data || data.length === 0) {
        showToast('No records available for export.', 'info');
        return;
      }

      const keys = Object.keys(data[0]);
      const headers = keys.join(',');
      const rows = data.map(row =>
        keys.map(k => {
          let val = row[k];
          if (typeof val === 'object' && val !== null) val = JSON.stringify(val);
          return `"${String(val || '').replace(/"/g, '""')}"`;
        }).join(',')
      );

      const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n');
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', `${filename}_${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      showToast(`${type.toUpperCase()} report exported successfully to CSV.`, 'success');
    } catch (err) {
      showToast('Export failed.', 'error');
    }
  };

  const reportCards = [
    { id: 'teachers', title: 'Teacher Roster Report', desc: 'Export full list of teachers, employee IDs, qualifications, and assigned classes.', icon: FileSpreadsheet, color: 'bg-blue-50 border-blue-200 text-blue-700' },
    { id: 'classes', title: 'Class Directory Report', desc: 'Export class standards, sections, student count, and class teacher mappings.', icon: FileSpreadsheet, color: 'bg-purple-50 border-purple-200 text-purple-700' },
    { id: 'subjects', title: 'Subject Syllabus Catalog', desc: 'Export all subject codes, syllabus assignments, and active status.', icon: FileSpreadsheet, color: 'bg-indigo-50 border-indigo-200 text-indigo-700' },
    { id: 'papers', title: 'Question Paper Bank Audit', desc: 'Export question papers created, authoring teachers, review status, and total marks.', icon: FileText, color: 'bg-amber-50 border-amber-200 text-amber-700' },
    { id: 'results', title: 'Student Exam Results Report', desc: 'Export exam performance records, calculated percentages, grades, and pass/fail summary.', icon: CheckCircle2, color: 'bg-emerald-50 border-emerald-200 text-emerald-700' }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-heading font-extrabold text-xl sm:text-2xl text-slate-900">
          Academic Report Generation & CSV Export
        </h2>
        <p className="text-xs text-slate-500">Download formatted CSV reports for offline analysis and school records.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reportCards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.id} className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className={`p-3 rounded-xl w-fit ${card.color}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="font-heading font-bold text-base text-slate-900">{card.title}</h3>
                <p className="text-xs text-slate-500 leading-relaxed">{card.desc}</p>
              </div>

              <button
                onClick={() => exportReport(card.id)}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-md transition-all"
              >
                <Download className="w-4 h-4 text-blue-400" />
                <span>Export CSV File</span>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
