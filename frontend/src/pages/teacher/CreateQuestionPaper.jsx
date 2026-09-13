import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import QuestionPaperForm from '../../components/questionPaper/QuestionPaperForm';
import { getQuestionPaperByIdApi, createQuestionPaperApi, updateQuestionPaperApi, getClassesApi, getSubjectsApi } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { ArrowLeft } from 'lucide-react';

export default function CreateQuestionPaper() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast, user } = useAuth();

  const [paperData, setPaperData] = useState(null);
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    const initData = async () => {
      try {
        setFetching(true);
        const [cRes, sRes] = await Promise.all([
          getClassesApi(),
          getSubjectsApi()
        ]);
        if (cRes.data.success) setClasses(cRes.data.classes);
        if (sRes.data.success) setSubjects(sRes.data.subjects);

        if (id) {
          const pRes = await getQuestionPaperByIdApi(id);
          if (pRes.data.success) {
            setPaperData(pRes.data.paper);
          }
        }
      } catch (err) {
        showToast('Failed loading initial data.', 'error');
      } finally {
        setFetching(false);
      }
    };
    initData();
  }, [id]);

  const handleSubmit = async (payload) => {
    try {
      setLoading(true);
      if (id) {
        await updateQuestionPaperApi(id, payload);
        showToast('Question paper updated and submitted for review.', 'success');
      } else {
        await createQuestionPaperApi(payload);
        showToast('Question paper created and submitted to Principal.', 'success');
      }
      navigate('/teacher/question-papers');
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed saving question paper.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveDraft = async (payload) => {
    try {
      setLoading(true);
      if (id) {
        await updateQuestionPaperApi(id, { ...payload, status: 'draft' });
        showToast('Question paper draft updated.', 'success');
      } else {
        await createQuestionPaperApi({ ...payload, status: 'draft' });
        showToast('Question paper saved as draft.', 'success');
      }
      navigate('/teacher/question-papers');
    } catch (err) {
      showToast('Failed saving draft.', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return <div className="p-12 text-center text-slate-500 text-xs font-semibold">Loading paper builder...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate('/teacher/question-papers')}
          className="p-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 shadow-sm"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h2 className="font-heading font-extrabold text-xl sm:text-2xl text-slate-900">
            {id ? 'Edit & Resubmit Question Paper' : 'Create New Question Paper'}
          </h2>
          <p className="text-xs text-slate-500">NVP English Medium School Official Paper Creator with A4 Print Layout.</p>
        </div>
      </div>

      <QuestionPaperForm
        initialData={paperData}
        classes={classes}
        subjects={subjects}
        onSubmit={handleSubmit}
        onSaveDraft={handleSaveDraft}
        loading={loading}
      />
    </div>
  );
}
