import React, { useState, useEffect } from 'react';
import { getQuestionPapersApi, deleteQuestionPaperApi } from '../../services/api';
import DataTable from '../../components/common/DataTable';
import Modal from '../../components/common/Modal';
import PrintablePaper from '../../components/questionPaper/PrintablePaper';
import { useAuth } from '../../context/AuthContext';
import { Plus, Eye, Edit, Trash2, AlertCircle, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function TeacherQuestionPapers() {
  const { showToast } = useAuth();
  const navigate = useNavigate();
  const [papers, setPapers] = useState([]);
  const [selectedPaper, setSelectedPaper] = useState(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);

  const fetchPapers = async () => {
    try {
      const res = await getQuestionPapersApi();
      if (res.data.success) setPapers(res.data.papers);
    } catch (err) {
      showToast('Failed to fetch question papers.', 'error');
    }
  };

  useEffect(() => {
    fetchPapers();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this question paper?')) return;
    try {
      await deleteQuestionPaperApi(id);
      showToast('Question paper deleted.', 'info');
      fetchPapers();
    } catch (err) {
      showToast('Failed deleting paper.', 'error');
    }
  };

  const columns = [
    {
      header: 'Exam Title & Subject',
      render: (row) => (
        <div>
          <p className="font-bold text-slate-900">{row.examType}</p>
          <p className="text-[11px] text-blue-600 font-semibold">
            Class {row.class?.name} ({row.class?.section}) - {row.subject?.name}
          </p>

          {/* Rejection Alert Box for Teacher */}
          {row.status === 'rejected' && row.rejectionReason && (
            <div className="mt-2 p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-[11px] font-medium flex items-start gap-1.5 max-w-md">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Principal Remarks: </span>
                <span>{row.rejectionReason}</span>
              </div>
            </div>
          )}
        </div>
      )
    },
    {
      header: 'Marks & Duration',
      render: (row) => `${row.totalMarks} Marks (${row.duration} mins)`
    },
    {
      header: 'Questions Count',
      render: (row) => `${row.questions?.length || 0} Questions`
    },
    {
      header: 'Approval Status',
      render: (row) => (
        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
          row.status === 'approved' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
          row.status === 'rejected' ? 'bg-rose-50 text-rose-700 border border-rose-200 font-extrabold' :
          row.status === 'pending' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
          'bg-slate-100 text-slate-700'
        }`}>
          {row.status === 'pending' ? 'Pending Principal Review' : row.status}
        </span>
      )
    },
    {
      header: 'Actions',
      render: (row) => (
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => { setSelectedPaper(row); setShowPreviewModal(true); }}
            className="p-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100"
            title="Preview / Print A4"
          >
            <Eye className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => navigate(`/teacher/question-papers/edit/${row._id}`)}
            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700"
            title="Edit & Resubmit"
          >
            <Edit className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => handleDelete(row._id)}
            className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600"
            title="Delete"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-heading font-extrabold text-xl sm:text-2xl text-slate-900">
            Question Paper Creator & Bank
          </h2>
          <p className="text-xs text-slate-500">Create, preview, print, and submit question papers for your assigned classes.</p>
        </div>

        <button
          onClick={() => navigate('/teacher/question-papers/create')}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-lg shadow-blue-600/30"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Question Paper</span>
        </button>
      </div>

      <DataTable
        columns={columns}
        data={papers}
        searchPlaceholder="Search exam title, class, subject..."
        exportFileName="my_question_papers"
      />

      {/* A4 Paper Preview Modal */}
      <Modal
        isOpen={showPreviewModal}
        onClose={() => setShowPreviewModal(false)}
        title={`A4 Paper View: ${selectedPaper?.examType}`}
        maxWidth="max-w-4xl"
      >
        <PrintablePaper paper={selectedPaper} />
      </Modal>
    </div>
  );
}
