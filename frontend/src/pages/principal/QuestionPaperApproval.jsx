import React, { useState, useEffect } from 'react';
import { getQuestionPapersApi, reviewQuestionPaperApi } from '../../services/api';
import DataTable from '../../components/common/DataTable';
import Modal from '../../components/common/Modal';
import PrintablePaper from '../../components/questionPaper/PrintablePaper';
import { useAuth } from '../../context/AuthContext';
import { FileText, CheckCircle, XCircle, Eye, Clock, AlertCircle } from 'lucide-react';

export default function QuestionPaperApproval() {
  const { showToast } = useAuth();
  const [papers, setPapers] = useState([]);
  const [selectedPaper, setSelectedPaper] = useState(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const fetchPapers = async () => {
    try {
      const res = await getQuestionPapersApi({ status: statusFilter });
      if (res.data.success) setPapers(res.data.papers);
    } catch (err) {
      showToast('Failed to fetch question papers.', 'error');
    }
  };

  useEffect(() => {
    fetchPapers();
  }, [statusFilter]);

  const handleReview = async (action) => {
    if (action === 'reject' && !rejectionReason.trim()) {
      showToast('Please enter a rejection reason for the teacher.', 'error');
      return;
    }

    try {
      const res = await reviewQuestionPaperApi(selectedPaper._id, action, rejectionReason);
      if (res.data.success) {
        showToast(action === 'approve' ? 'Question paper APPROVED!' : 'Question paper REJECTED. Teacher notified.', 'success');
        setShowReviewModal(false);
        setRejectionReason('');
        fetchPapers();
      }
    } catch (err) {
      showToast('Failed saving review decision.', 'error');
    }
  };

  const columns = [
    {
      header: 'Exam Title & Details',
      render: (row) => (
        <div>
          <p className="font-bold text-slate-900">{row.examType}</p>
          <p className="text-[11px] text-blue-600 font-semibold">
            Class {row.class?.name} ({row.class?.section}) - {row.subject?.name}
          </p>
          <p className="text-[10px] text-slate-400">Total Marks: {row.totalMarks} | Duration: {row.duration} Mins</p>
        </div>
      )
    },
    {
      header: 'Author Teacher',
      render: (row) => (
        <div>
          <p className="font-bold text-slate-900">{row.teacher?.name}</p>
          <p className="text-[10px] text-slate-500">{row.teacher?.employeeId}</p>
        </div>
      )
    },
    {
      header: 'Submission Date',
      render: (row) => row.submittedAt ? new Date(row.submittedAt).toLocaleDateString('en-IN') : 'Draft'
    },
    {
      header: 'Review Status',
      render: (row) => (
        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
          row.status === 'approved' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
          row.status === 'rejected' ? 'bg-rose-50 text-rose-700 border border-rose-200' :
          row.status === 'pending' ? 'bg-amber-50 text-amber-700 border border-amber-200 animate-pulse' :
          'bg-slate-100 text-slate-700'
        }`}>
          {row.status}
        </span>
      )
    },
    {
      header: 'Actions',
      render: (row) => (
        <button
          onClick={() => { setSelectedPaper(row); setRejectionReason(row.rejectionReason || ''); setShowReviewModal(true); }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md"
        >
          <Eye className="w-3.5 h-3.5" />
          <span>Review Paper</span>
        </button>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-heading font-extrabold text-xl sm:text-2xl text-slate-900">
            Question Paper Review & Approval Workflow
          </h2>
          <p className="text-xs text-slate-500">Inspect paper questions, verify syllabus coverage, approve for print or return for edits.</p>
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 bg-white"
        >
          <option value="">All Statuses</option>
          <option value="pending">Pending Approvals Only</option>
          <option value="approved">Approved Papers</option>
          <option value="rejected">Rejected / Needs Revision</option>
        </select>
      </div>

      <DataTable
        columns={columns}
        data={papers}
        searchPlaceholder="Search by exam title, class, subject, teacher..."
        exportFileName="question_paper_approvals"
      />

      {/* Review Modal */}
      <Modal
        isOpen={showReviewModal}
        onClose={() => setShowReviewModal(false)}
        title={`Review: ${selectedPaper?.examType}`}
        maxWidth="max-w-4xl"
      >
        <div className="space-y-6">
          {/* Printable A4 View */}
          <PrintablePaper paper={selectedPaper} />

          {/* Decision Box */}
          <div className="p-5 rounded-2xl bg-slate-900 text-white space-y-4 shadow-xl">
            <h4 className="font-heading font-bold text-xs uppercase tracking-wider text-blue-400">
              Principal Official Decision
            </h4>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Rejection Remarks / Revision Feedback (Required if Rejecting)
              </label>
              <textarea
                rows="2"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Specify missing sections, formatting errors, or required changes..."
                className="w-full p-2.5 text-xs rounded-xl bg-slate-950 border border-slate-800 text-white focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => handleReview('reject')}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md"
              >
                <XCircle className="w-4 h-4" />
                <span>Reject & Request Edits</span>
              </button>

              <button
                type="button"
                onClick={() => handleReview('approve')}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-lg shadow-emerald-600/30"
              >
                <CheckCircle className="w-4 h-4" />
                <span>Approve Paper For Exam</span>
              </button>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}
