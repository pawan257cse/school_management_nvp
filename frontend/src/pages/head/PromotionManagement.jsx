import React, { useState, useEffect } from 'react';
import { getPromotionsApi, executePromotionApi, getClassesApi, getStudentsApi } from '../../services/api';
import { TrendingUp, ArrowRight, CheckCircle2, History, Users, AlertCircle } from 'lucide-react';

export default function PromotionManagement() {
  const [promotions, setPromotions] = useState([]);
  const [classes, setClasses] = useState([]);
  const [fromClassId, setFromClassId] = useState('');
  const [toClassId, setToClassId] = useState('');
  const [studentsInClass, setStudentsInClass] = useState([]);
  const [selectedStudentIds, setSelectedStudentIds] = useState([]);
  const [academicYearFrom, setAcademicYearFrom] = useState('2025-2026');
  const [academicYearTo, setAcademicYearTo] = useState('2026-2027');
  const [loading, setLoading] = useState(true);
  const [isPromoting, setIsPromoting] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const fetchClassesAndHistory = async () => {
    try {
      setLoading(true);
      const [promRes, classRes] = await Promise.all([
        getPromotionsApi(),
        getClassesApi()
      ]);
      if (promRes.data.success) setPromotions(promRes.data.promotions);
      if (classRes.data.success) {
        setClasses(classRes.data.classes);
        if (classRes.data.classes.length >= 2) {
          setFromClassId(classRes.data.classes[0]._id);
          setToClassId(classRes.data.classes[1]._id);
        }
      }
    } catch (err) {
      console.error('Failed to load promotions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClassesAndHistory();
  }, []);

  // When fromClassId changes, fetch active students
  useEffect(() => {
    if (!fromClassId) return;
    const loadClassStudents = async () => {
      try {
        const res = await getStudentsApi({ classId: fromClassId, status: 'active' });
        if (res.data.success) {
          setStudentsInClass(res.data.students);
          setSelectedStudentIds(res.data.students.map(s => s._id)); // default select all
        }
      } catch (err) {
        console.error('Failed loading class students:', err);
      }
    };
    loadClassStudents();
  }, [fromClassId]);

  const handleToggleStudent = (id) => {
    if (selectedStudentIds.includes(id)) {
      setSelectedStudentIds(selectedStudentIds.filter(sId => sId !== id));
    } else {
      setSelectedStudentIds([...selectedStudentIds, id]);
    }
  };

  const handleSelectAll = () => {
    if (selectedStudentIds.length === studentsInClass.length) {
      setSelectedStudentIds([]);
    } else {
      setSelectedStudentIds(studentsInClass.map(s => s._id));
    }
  };

  const handleExecutePromotion = async () => {
    if (fromClassId === toClassId) {
      alert('Source class and Destination class cannot be the same!');
      return;
    }

    if (selectedStudentIds.length === 0) {
      alert('Please select at least one student to promote.');
      return;
    }

    if (!window.confirm(`Are you sure you want to promote ${selectedStudentIds.length} students to the next class?`)) {
      return;
    }

    try {
      setIsPromoting(true);
      setFeedback(null);
      const res = await executePromotionApi({
        fromClassId,
        toClassId,
        academicYearFrom,
        academicYearTo,
        studentIds: selectedStudentIds,
        remarks: `Batch promotion for session ${academicYearFrom} -> ${academicYearTo}`
      });

      if (res.data.success) {
        setFeedback({ type: 'success', message: res.data.message });
        fetchClassesAndHistory();
        // reload current class students
        const stRes = await getStudentsApi({ classId: fromClassId, status: 'active' });
        if (stRes.data.success) {
          setStudentsInClass(stRes.data.students);
          setSelectedStudentIds(stRes.data.students.map(s => s._id));
        }
      }
    } catch (err) {
      setFeedback({ type: 'error', message: err.response?.data?.message || 'Error executing promotion' });
    } finally {
      setIsPromoting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 text-white shadow-xl">
        <div>
          <span className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 text-xs font-bold uppercase tracking-wider">
            Academic Session Transition
          </span>
          <h1 className="text-2xl sm:text-3xl font-heading font-black mt-2">Student Promotions</h1>
          <p className="text-xs text-slate-300 mt-1">Batch promote students to higher grades based on academic progression.</p>
        </div>
      </div>

      {feedback && (
        <div className={`p-4 rounded-2xl text-xs font-bold flex items-center gap-2 ${
          feedback.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'
        }`}>
          {feedback.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <AlertCircle className="w-4 h-4 text-rose-600" />}
          {feedback.message}
        </div>
      )}

      {/* Promotion Action Card */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-6">
        <h2 className="font-heading font-bold text-sm text-slate-900 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-blue-600" />
          Batch Class Promotion Wizard
        </h2>

        {/* Class Selection Controls */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center p-4 rounded-xl bg-slate-50 border border-slate-100">
          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">From Class (Current)</label>
            <select
              value={fromClassId}
              onChange={(e) => setFromClassId(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              {classes.map((c) => (
                <option key={c._id} value={c._id}>Class {c.name} - {c.section}</option>
              ))}
            </select>
          </div>

          <div className="hidden md:flex justify-center items-center pt-5">
            <ArrowRight className="w-5 h-5 text-blue-600" />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">To Class (Promoted To)</label>
            <select
              value={toClassId}
              onChange={(e) => setToClassId(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              {classes.map((c) => (
                <option key={c._id} value={c._id}>Class {c.name} - {c.section}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Target Academic Session</label>
            <input
              type="text"
              value={academicYearTo}
              onChange={(e) => setAcademicYearTo(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Student Selection Roster */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-bold text-slate-700">
              Select Students to Promote ({selectedStudentIds.length} of {studentsInClass.length} selected)
            </h3>
            <button
              onClick={handleSelectAll}
              className="text-xs font-bold text-blue-600 hover:text-blue-700"
            >
              {selectedStudentIds.length === studentsInClass.length ? 'Deselect All' : 'Select All'}
            </button>
          </div>

          {studentsInClass.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400 bg-slate-50 rounded-xl">
              No active students enrolled in this source class.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 max-h-60 overflow-y-auto pr-1">
              {studentsInClass.map((st) => {
                const isSelected = selectedStudentIds.includes(st._id);
                return (
                  <div
                    key={st._id}
                    onClick={() => handleToggleStudent(st._id)}
                    className={`p-3 rounded-xl border transition cursor-pointer flex items-center justify-between ${
                      isSelected
                        ? 'bg-blue-50/80 border-blue-200 text-blue-950 font-bold'
                        : 'bg-white border-slate-200 text-slate-600'
                    }`}
                  >
                    <div>
                      <p className="text-xs font-bold">{st.name}</p>
                      <p className="text-[10px] text-slate-400">Roll #{st.rollNo} | {st.admissionNo}</p>
                    </div>
                    <div className={`w-5 h-5 rounded-md flex items-center justify-center border text-xs font-bold ${
                      isSelected ? 'bg-blue-600 text-white border-blue-600' : 'border-slate-300'
                    }`}>
                      {isSelected && '✓'}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="flex justify-end pt-4 border-t border-slate-100">
          <button
            onClick={handleExecutePromotion}
            disabled={isPromoting || selectedStudentIds.length === 0}
            className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold text-xs shadow-lg shadow-blue-500/20 transition cursor-pointer"
          >
            <TrendingUp className="w-4 h-4" />
            <span>{isPromoting ? 'Promoting Students...' : `Promote ${selectedStudentIds.length} Selected Students`}</span>
          </button>
        </div>
      </div>

      {/* Promotion History Log */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
        <h2 className="font-heading font-bold text-sm text-slate-900 flex items-center gap-2">
          <History className="w-4 h-4 text-slate-600" />
          Past Promotion Execution Records
        </h2>

        {promotions.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-400">No promotions recorded yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-100 text-slate-600 font-bold uppercase text-[11px]">
                <tr>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">From Class</th>
                  <th className="px-4 py-3">To Class</th>
                  <th className="px-4 py-3">Promoted Count</th>
                  <th className="px-4 py-3">Session</th>
                  <th className="px-4 py-3">Remarks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {promotions.map((pr) => (
                  <tr key={pr._id} className="hover:bg-slate-50/80 transition">
                    <td className="px-4 py-3 font-mono text-slate-600">
                      {new Date(pr.promotionDate).toLocaleDateString('en-IN')}
                    </td>
                    <td className="px-4 py-3 font-bold text-slate-800">{pr.fromClassName}</td>
                    <td className="px-4 py-3 font-bold text-blue-600">{pr.toClassName}</td>
                    <td className="px-4 py-3">
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-extrabold text-[11px] border border-emerald-200">
                        {pr.promotedCount} Students
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-500 font-semibold">{pr.academicYearFrom} → {pr.academicYearTo}</td>
                    <td className="px-4 py-3 text-slate-500 italic max-w-xs truncate">{pr.remarks || '—'}</td>
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
