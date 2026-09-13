import React, { useState, useEffect } from 'react';
import { getClassesApi, getSubjectsApi, getResultsApi, saveResultsApi, getStudentsApi } from '../../services/api';
import ResultEntryTable from '../../components/results/ResultEntryTable';
import { useAuth } from '../../context/AuthContext';
import { Award, BookOpen, School } from 'lucide-react';

export default function TeacherResults() {
  const { showToast } = useAuth();
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [selectedClassId, setSelectedClassId] = useState('');
  const [selectedSubjectId, setSelectedSubjectId] = useState('');
  const [examName, setExamName] = useState('Unit Test I');
  const [totalMarks, setTotalMarks] = useState(100);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchDropdowns = async () => {
      try {
        const [cRes, sRes] = await Promise.all([
          getClassesApi(),
          getSubjectsApi()
        ]);
        if (cRes.data.success && cRes.data.classes.length > 0) {
          setClasses(cRes.data.classes);
          setSelectedClassId(cRes.data.classes[0]._id);
        }
        if (sRes.data.success && sRes.data.subjects.length > 0) {
          setSubjects(sRes.data.subjects);
          setSelectedSubjectId(sRes.data.subjects[0]._id);
        }
      } catch (err) {
        showToast('Failed to load classes or subjects.', 'error');
      }
    };
    fetchDropdowns();
  }, []);

  useEffect(() => {
    if (selectedClassId && selectedSubjectId && examName) {
      loadResults();
    }
  }, [selectedClassId, selectedSubjectId, examName]);

  const loadResults = async () => {
    try {
      setLoading(true);
      const res = await getResultsApi({ classId: selectedClassId, subjectId: selectedSubjectId, exam: examName });
      if (res.data.success && res.data.results.length > 0) {
        const existing = res.data.results[0];
        setTotalMarks(existing.totalMarks || 100);
        setRecords(existing.records || []);
      } else {
        // Fetch real students enrolled in this class
        const stRes = await getStudentsApi({ classId: selectedClassId, status: 'active' });
        if (stRes.data?.success && stRes.data.students && stRes.data.students.length > 0) {
          const defaultRecords = stRes.data.students.map(s => ({
            rollNo: s.rollNo ? String(s.rollNo) : '1',
            studentName: s.name,
            obtainedMarks: 0,
            percentage: 0,
            grade: 'F',
            passStatus: 'fail'
          }));
          setRecords(defaultRecords);
        } else {
          // No students enrolled yet in this class
          setRecords([]);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (updatedRecords) => {
    try {
      setLoading(true);
      await saveResultsApi({
        classId: selectedClassId,
        subjectId: selectedSubjectId,
        exam: examName,
        totalMarks: Number(totalMarks),
        records: updatedRecords
      });
      showToast('Student exam scores and calculated grades saved successfully.', 'success');
      loadResults();
    } catch (err) {
      showToast('Failed saving exam results.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-heading font-extrabold text-xl sm:text-2xl text-slate-900 flex items-center gap-2">
            <Award className="w-6 h-6 text-blue-600" />
            Student Exam Score Entry & Grading Portal
          </h2>
          <p className="text-xs text-slate-500">Record marks and auto-calculate student percentage, letter grade, and pass status.</p>
        </div>

        {/* Selection Bar */}
        <div className="flex flex-wrap items-center gap-3">
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase">Class</label>
            <select
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(e.target.value)}
              className="px-3 py-1.5 text-xs font-bold rounded-xl border border-slate-200 bg-white"
            >
              {classes.map(c => <option key={c._id} value={c._id}>Class {c.name} ({c.section})</option>)}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase">Subject</label>
            <select
              value={selectedSubjectId}
              onChange={(e) => setSelectedSubjectId(e.target.value)}
              className="px-3 py-1.5 text-xs font-bold rounded-xl border border-slate-200 bg-white"
            >
              {subjects.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase">Exam Type</label>
            <input
              type="text"
              value={examName}
              onChange={(e) => setExamName(e.target.value)}
              className="w-32 px-3 py-1.5 text-xs font-bold rounded-xl border border-slate-200 bg-white"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase">Max Marks</label>
            <input
              type="number"
              value={totalMarks}
              onChange={(e) => setTotalMarks(Number(e.target.value))}
              className="w-20 px-3 py-1.5 text-xs font-bold rounded-xl border border-slate-200 bg-white"
            />
          </div>
        </div>
      </div>

      <ResultEntryTable
        totalMarks={totalMarks}
        records={records}
        onSave={handleSave}
        loading={loading}
      />
    </div>
  );
}
