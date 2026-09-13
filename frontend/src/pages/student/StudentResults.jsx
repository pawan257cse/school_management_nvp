import React, { useState, useEffect } from 'react';
import { 
  Award, 
  Calendar, 
  ArrowLeft, 
  RefreshCw, 
  CheckCircle2, 
  FileText,
  Printer
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { getStudentResultsApi } from '../../services/api';

export default function StudentResults() {
  const [results, setResults] = useState([]);
  const [studentInfo, setStudentInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const res = await getStudentResultsApi();
        if (res.data?.success) {
          setResults(res.data.results || []);
          setStudentInfo({
            studentName: res.data.studentName,
            className: res.data.className,
            rollNo: res.data.rollNo
          });
        }
      } catch (err) {
        console.error('Error fetching results:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchResults();
  }, []);

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <Link to="/student-dashboard" className="text-slate-500 hover:text-slate-800 text-sm flex items-center gap-1 font-medium mb-1">
            <ArrowLeft className="w-4 h-4" /> Student Portal
          </Link>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2.5">
            <Award className="w-7 h-7 text-indigo-600" />
            My Examination Results & Report Card
          </h1>
          <p className="text-slate-600 text-sm mt-0.5">
            Official periodic assessments, subject-wise scores, percentage, and teacher evaluations.
          </p>
        </div>

        <button
          onClick={() => window.print()}
          className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-sm transition"
        >
          <Printer className="w-4 h-4" />
          <span>Print Marksheet</span>
        </button>
      </div>

      {loading ? (
        <div className="p-12 text-center text-slate-500 font-medium bg-white rounded-2xl border border-slate-200">
          <RefreshCw className="w-8 h-8 mx-auto mb-3 animate-spin text-indigo-600" />
          Loading report card...
        </div>
      ) : results.length === 0 ? (
        <div className="p-12 text-center text-slate-500 font-medium bg-white rounded-2xl border border-slate-200">
          No examination results evaluated yet for your profile. Check back after periodic assessments!
        </div>
      ) : (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-base">Periodic Assessment - 1 (2026-2027)</h3>
                <span className="text-xs text-slate-500">Student: {studentInfo?.studentName} | Roll #{studentInfo?.rollNo}</span>
              </div>
              <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs uppercase border border-emerald-200">
                Passed With Distinction
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-100 text-slate-600 font-bold uppercase text-[10px]">
                  <tr>
                    <th className="py-3 px-4">Subject</th>
                    <th className="py-3 px-4">Faculty</th>
                    <th className="py-3 px-4 text-center">Maximum Marks</th>
                    <th className="py-3 px-4 text-center">Marks Obtained</th>
                    <th className="py-3 px-4 text-center">Percentage</th>
                    <th className="py-3 px-4 text-center">Grade</th>
                    <th className="py-3 px-4 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                  {results.map((r, i) => (
                    <tr key={i} className="hover:bg-slate-50">
                      <td className="py-3.5 px-4 font-bold text-slate-900 text-sm">{r.subject}</td>
                      <td className="py-3.5 px-4 text-slate-600">{r.teacher}</td>
                      <td className="py-3.5 px-4 text-center font-mono">{r.totalMarks}</td>
                      <td className="py-3.5 px-4 text-center font-mono font-black text-indigo-700 text-sm">{r.obtainedMarks}</td>
                      <td className="py-3.5 px-4 text-center font-mono font-bold">{r.percentage}%</td>
                      <td className="py-3.5 px-4 text-center">
                        <span className="px-2 py-0.5 rounded font-black text-xs bg-indigo-50 text-indigo-700 border border-indigo-200">
                          {r.grade}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-emerald-50 text-emerald-700 border border-emerald-200">
                          {r.passStatus}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
