import React, { useState, useEffect } from 'react';
import { Save, Award } from 'lucide-react';

export default function ResultEntryTable({ totalMarks = 100, records = [], onSave, loading }) {
  const [marksList, setMarksList] = useState(records);

  useEffect(() => {
    setMarksList(records);
  }, [records]);

  const handleMarkChange = (index, value) => {
    const obtained = Math.min(Math.max(Number(value) || 0, 0), totalMarks);
    const percentage = Math.round((obtained / totalMarks) * 100 * 10) / 10;
    let grade = 'F';
    if (percentage >= 90) grade = 'A+';
    else if (percentage >= 80) grade = 'A';
    else if (percentage >= 70) grade = 'B';
    else if (percentage >= 60) grade = 'C';
    else if (percentage >= 33) grade = 'D';

    const passStatus = percentage >= 33 ? 'pass' : 'fail';

    const updated = [...marksList];
    updated[index] = {
      ...updated[index],
      obtainedMarks: obtained,
      percentage,
      grade,
      passStatus
    };
    setMarksList(updated);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden space-y-4">
      {/* Header Bar */}
      <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
        <div className="flex items-center gap-2">
          <Award className="w-5 h-5 text-blue-600" />
          <span className="font-heading font-bold text-sm text-slate-900">Student Exam Scores (Max: {totalMarks} Marks)</span>
        </div>

        <button
          type="button"
          disabled={loading}
          onClick={() => onSave(marksList)}
          className="flex items-center gap-2 px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-600/30 transition-all disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          <span>Save & Calculate Grades</span>
        </button>
      </div>

      {/* Entry Table */}
      {marksList.length === 0 ? (
        <div className="p-12 text-center bg-slate-50/50 space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 mx-auto flex items-center justify-center">
            <Award className="w-6 h-6" />
          </div>
          <h4 className="font-heading font-bold text-slate-800 text-sm">No Students Enrolled in This Class</h4>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Currently, no students have been added to this class standard. When school administration admits students, they will automatically appear here for exam mark entry.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-100/70 text-slate-600 font-bold uppercase text-[11px] border-b border-slate-200">
              <tr>
                <th className="px-5 py-3">Roll No</th>
                <th className="px-5 py-3">Student Name</th>
                <th className="px-5 py-3">Obtained Marks</th>
                <th className="px-5 py-3">Percentage</th>
                <th className="px-5 py-3">Grade</th>
                <th className="px-5 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {marksList.map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-3 font-mono font-bold text-slate-900">{row.rollNo}</td>
                  <td className="px-5 py-3 font-semibold text-slate-900">{row.studentName}</td>
                  <td className="px-5 py-3">
                    <input
                      type="number"
                      min="0"
                      max={totalMarks}
                      value={row.obtainedMarks ?? ''}
                      onChange={(e) => handleMarkChange(idx, e.target.value)}
                      className="w-24 px-3 py-1.5 text-xs font-bold rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 bg-white"
                    />
                  </td>
                  <td className="px-5 py-3 font-bold text-slate-900">{row.percentage || 0}%</td>
                  <td className="px-5 py-3">
                    <span className={`px-2.5 py-1 rounded-lg text-xs font-extrabold ${
                      row.grade === 'A+' || row.grade === 'A' ? 'bg-emerald-100 text-emerald-800' :
                      row.grade === 'B' || row.grade === 'C' ? 'bg-blue-100 text-blue-800' :
                      row.grade === 'D' ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'
                    }`}>
                      {row.grade || 'F'}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase ${
                      row.passStatus === 'pass' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'
                    }`}>
                      {row.passStatus || 'fail'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
