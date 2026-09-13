import React from 'react';
import { Printer, Download, FileText, ExternalLink } from 'lucide-react';

export default function PrintablePaper({ paper }) {
  if (!paper) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleWordDownload = () => {
    if (paper._id) {
      const token = localStorage.getItem('nvp_token');
      window.open(`/api/question-papers/${paper._id}/download-word?token=${token}`, '_blank');
    } else {
      alert('Please save the paper first before downloading Word (.docx) file.');
    }
  };

  const {
    _id,
    class: classObj,
    subject: subjectObj,
    examType = 'PA - 1',
    session = '2026-27',
    examDate,
    duration = 90,
    totalMarks = 40,
    language = 'English',
    paperMode = 'builder',
    uploadedFileUrl,
    uploadedFileType,
    instructions = [],
    questions = []
  } = paper;

  const className = classObj?.name || '4';
  const subjectName = subjectObj?.name || 'Computer';
  const formattedDate = examDate ? new Date(examDate).toLocaleDateString('en-IN') : '__________';

  const isHindi = language === 'Hindi' || subjectName.toLowerCase().includes('hindi') || subjectName.toLowerCase().includes('sanskrit');

  return (
    <div className="space-y-4">
      {/* Top Action Bar (Hidden on Print) */}
      <div className="no-print flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-xl bg-slate-900 text-white shadow-lg">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-blue-400" />
          <span className="text-xs font-bold">
            NVP School Format Paper | Language: {language}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {_id && (
            <button
              onClick={handleWordDownload}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-all"
            >
              <Download className="w-4 h-4" />
              <span>Download MS Word (.docx)</span>
            </button>
          )}
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md transition-all"
          >
            <Printer className="w-4 h-4" />
            <span>Print / Export PDF</span>
          </button>
        </div>
      </div>

      {/* Direct File Upload Mode Display */}
      {paperMode === 'upload' && (
        <div className="p-8 rounded-2xl bg-white border-2 border-slate-300 text-center space-y-4">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center font-bold text-xl">
            {uploadedFileType?.toUpperCase() || 'FILE'}
          </div>
          <div>
            <h3 className="font-heading font-bold text-slate-900 text-lg">{examType} - {subjectName}</h3>
            <p className="text-xs text-slate-500 mt-1">This question paper was uploaded as a complete pre-formatted file.</p>
          </div>
          {uploadedFileUrl ? (
            <a
              href={uploadedFileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-lg shadow-blue-600/30"
            >
              <ExternalLink className="w-4 h-4" />
              <span>Download Uploaded {uploadedFileType?.toUpperCase() || 'Document'}</span>
            </a>
          ) : (
            <p className="text-xs text-rose-500 font-semibold">No file attached.</p>
          )}
        </div>
      )}

      {/* Printable A4 Question Paper Sheet (MATCHING EXACT NVP SCHOOL OUTPUT FORMAT) */}
      {paperMode !== 'upload' && (
        <div className="printable-paper bg-white p-8 sm:p-12 text-slate-950 border border-slate-300 shadow-2xl max-w-4xl mx-auto rounded-none font-serif">
          {/* Exact NVP School Header */}
          <div className="text-center font-serif leading-relaxed space-y-1 pb-3">
            <h1 className="font-extrabold text-xl sm:text-2xl text-slate-950">
              N.V.P English Medium School Nimbi Jodhan
            </h1>
            <div className="grid grid-cols-3 text-xs sm:text-sm font-bold pt-1">
              <div className="text-left">Exam – {examType}</div>
              <div className="text-center">Session – {session}</div>
              <div className="text-right">Class - {className}</div>
            </div>
            <div className="grid grid-cols-3 text-xs sm:text-sm font-bold">
              <div className="text-left">Subject – {subjectName}</div>
              <div className="text-center">Name - _____________</div>
              <div className="text-right">Roll No - ______</div>
            </div>
            <div className="grid grid-cols-3 text-xs sm:text-sm font-bold pb-2 border-b-2 border-slate-900">
              <div className="text-left">Date - {formattedDate}</div>
              <div className="text-center">Day - _______________</div>
              <div className="text-right">Maximum Marks - {totalMarks}</div>
            </div>
          </div>

          {/* General Instructions */}
          {instructions.length > 0 && (
            <div className="my-3 text-xs font-serif space-y-0.5 border-b border-slate-300 pb-2">
              <p className="font-bold">General Instructions:</p>
              {instructions.map((inst, i) => (
                <p key={i} className="text-slate-800">{i + 1}. {inst}</p>
              ))}
            </div>
          )}

          {/* Questions Body */}
          <div className="space-y-5 pt-3 text-xs sm:text-sm font-serif">
            {questions.map((q, idx) => (
              <div key={idx} className="space-y-1.5">
                {/* Question Header Line */}
                <div className="flex items-start justify-between font-bold">
                  <span>Q{idx + 1}. {q.questionText}</span>
                  <span className="whitespace-nowrap ml-2">({q.marks} Marks)</span>
                </div>

                {/* Question Diagram / Image if attached */}
                {q.questionImage && (
                  <div className="my-2 pl-4">
                    <img src={q.questionImage} alt={`Diagram Q${idx + 1}`} className="max-h-48 object-contain border p-1 rounded" />
                  </div>
                )}

                {/* MCQ Options */}
                {q.questionType === 'mcq' && q.options?.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pl-4 text-xs font-semibold">
                    {q.options.map((opt, optIdx) => (
                      <div key={optIdx}>
                        {String.fromCharCode(97 + optIdx)}) {opt || '__________'}
                      </div>
                    ))}
                  </div>
                )}

                {/* True / False */}
                {q.questionType === 'true_false' && (
                  <div className="flex items-center justify-between pl-4 text-xs">
                    <span>(A) True</span>
                    <span>(B) False</span>
                    <span>( ___________ )</span>
                  </div>
                )}

                {/* Match Columns Table */}
                {q.questionType === 'match' && q.matchPairs?.length > 0 && (
                  <div className="pl-4 pt-1">
                    <table className="w-full text-xs border border-slate-300 border-collapse">
                      <thead>
                        <tr className="bg-slate-100 font-bold">
                          <th className="border border-slate-300 p-1.5 text-left">Column A</th>
                          <th className="border border-slate-300 p-1.5 text-left">Column B</th>
                        </tr>
                      </thead>
                      <tbody>
                        {q.matchPairs.map((pair, pairIdx) => (
                          <tr key={pairIdx}>
                            <td className="border border-slate-300 p-1.5">{pairIdx + 1}. {pair.left}</td>
                            <td className="border border-slate-300 p-1.5">{String.fromCharCode(97 + pairIdx)}. {pair.right}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Blank Fill Answer Line */}
                {['short', 'long', 'very_short'].includes(q.questionType) && (
                  <div className="text-slate-400 text-xs pt-1">
                    Ans: __________________________________________________________________________________
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="mt-12 pt-3 border-t border-slate-400 flex items-center justify-between text-[11px] text-slate-500 font-serif">
            <span>N.V.P English Medium School Nimbi Jodhan</span>
            <span>*** End of Question Paper ***</span>
          </div>
        </div>
      )}
    </div>
  );
}
