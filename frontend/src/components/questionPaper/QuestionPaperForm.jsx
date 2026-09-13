import React, { useState, useEffect } from 'react';
import { Plus, Trash2, ArrowUp, ArrowDown, Eye, Save, Send, Upload, FileText, Image as ImageIcon, Sparkles, Languages, Check, Smartphone, Type, Layers, HelpCircle } from 'lucide-react';
import PrintablePaper from './PrintablePaper';
import { uploadQuestionPaperFileApi } from '../../services/api';

export default function QuestionPaperForm({ initialData, classes = [], subjects = [], onSubmit, onSaveDraft, loading }) {
  const [paperMode, setPaperMode] = useState(initialData?.paperMode || 'text'); // 'text' | 'builder' | 'upload'
  const [classId, setClassId] = useState(initialData?.class?._id || initialData?.class || '');
  const [subjectId, setSubjectId] = useState(initialData?.subject?._id || initialData?.subject || '');
  const [examType, setExamType] = useState(initialData?.examType || 'Mid Term Examination');
  const [session, setSession] = useState(initialData?.session || '2026-2027');
  const [examDate, setExamDate] = useState(initialData?.examDate ? new Date(initialData.examDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]);
  const [duration, setDuration] = useState(initialData?.duration || 90);
  const [totalMarks, setTotalMarks] = useState(initialData?.totalMarks || 50);
  const [language, setLanguage] = useState(initialData?.language || 'English');

  // Raw Text Typing Mode State (Mobile / Phone Friendly)
  const [rawPaperText, setRawPaperText] = useState(() => {
    if (initialData?.questions && initialData.questions.length > 0) {
      return initialData.questions.map((q, idx) => {
        let text = `Q${idx + 1}. ${q.questionText} [${q.marks || 1} Marks]`;
        if (q.questionType === 'mcq' && q.options?.length > 0) {
          text += '\n' + q.options.map((opt, i) => `(${String.fromCharCode(65 + i)}) ${opt}`).join('\n');
        }
        return text;
      }).join('\n\n');
    }
    return `Q1. Which organelle is known as the powerhouse of the cell? [1 Mark]\n(A) Ribosome\n(B) Mitochondria\n(C) Golgi Body\n(D) Nucleus\n\nQ2. Define photosynthesis and write its chemical equation. [3 Marks]\n\nQ3. State the laws of reflection of light with a diagram. [5 Marks]`;
  });

  // Direct File Upload State
  const [uploadedFileUrl, setUploadedFileUrl] = useState(initialData?.uploadedFileUrl || '');
  const [uploadedFileType, setUploadedFileType] = useState(initialData?.uploadedFileType || '');
  const [uploadingPaperFile, setUploadingPaperFile] = useState(false);

  const [instructions, setInstructions] = useState(initialData?.instructions || [
    'All questions are compulsory.',
    'Write legibly and cleanly.',
    'Figures to the right indicate full marks.'
  ]);

  const [questions, setQuestions] = useState(initialData?.questions || []);
  const [showPreview, setShowPreview] = useState(true); // Open preview by default for live split-studio view!

  // Smart Parser for Raw Text Typed by Teacher on Mobile/Laptop
  const parseRawTextToQuestions = (text) => {
    if (!text.trim()) return [];

    const blocks = text.split(/\n\s*\n/).filter(b => b.trim());
    const parsed = [];

    blocks.forEach((block, idx) => {
      const lines = block.split('\n').map(l => l.trim()).filter(Boolean);
      if (lines.length === 0) return;

      let mainLine = lines[0];
      let marks = 1;
      const markMatch = mainLine.match(/\[(\d+)\s*Marks?\]|\((\d+)\s*Marks?\)/i);
      if (markMatch) {
        marks = Number(markMatch[1] || markMatch[2]) || 1;
        mainLine = mainLine.replace(/\[\d+\s*Marks?\]|\(\d+\s*Marks?\)/gi, '').trim();
      }

      let questionText = mainLine.replace(/^(Q\d+[\.:\s]*|\d+[\.:\s]*)/i, '').trim();
      if (!questionText) questionText = mainLine;

      const options = [];
      const optionLines = lines.slice(1);
      
      optionLines.forEach(optLine => {
        if (/^(\([A-D]\)|[A-D]\)|[A-D]\.)/i.test(optLine)) {
          const optClean = optLine.replace(/^(\([A-D]\)|[A-D]\)|[A-D]\.)/i, '').trim();
          options.push(optClean);
        } else {
          questionText += ' ' + optLine;
        }
      });

      const questionType = options.length >= 2 ? 'mcq' : (marks >= 4 ? 'long' : marks >= 2 ? 'short' : 'very_short');

      parsed.push({
        questionText,
        questionType,
        section: marks >= 4 ? 'Section C' : marks >= 2 ? 'Section B' : 'Section A',
        marks,
        options: options.length >= 2 ? options : [],
        matchPairs: [],
        answer: '',
        questionImage: '',
        reorderIndex: idx
      });
    });

    return parsed;
  };

  useEffect(() => {
    if (paperMode === 'text') {
      const parsed = parseRawTextToQuestions(rawPaperText);
      setQuestions(parsed);
    }
  }, [rawPaperText, paperMode]);

  const handleLanguageChange = (newLang) => {
    setLanguage(newLang);
    setInstructions([
      'All questions are compulsory.',
      'Write legibly and cleanly.',
      'Marks for questions are indicated against them.'
    ]);
  };

  const handlePaperFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setUploadingPaperFile(true);
      const data = new FormData();
      data.append('file', file);
      const res = await uploadQuestionPaperFileApi(data);
      if (res.data.success) {
        setUploadedFileUrl(res.data.fileUrl);
        setUploadedFileType(res.data.fileType);
      }
    } catch (err) {
      alert('Failed uploading question paper file.');
    } finally {
      setUploadingPaperFile(false);
    }
  };

  const handleFormSubmit = (status) => {
    if (!classId || !subjectId || !examType) {
      alert('Please select Class, Subject, and Exam Type.');
      return;
    }

    let finalQuestions = questions;
    if (paperMode === 'text') {
      finalQuestions = parseRawTextToQuestions(rawPaperText);
    }

    if (paperMode !== 'upload' && finalQuestions.length === 0) {
      alert('Please type at least one question in the text box.');
      return;
    }

    if (paperMode === 'upload' && !uploadedFileUrl) {
      alert('Please upload a Word or PDF question paper file.');
      return;
    }

    const payload = {
      classId,
      subjectId,
      examType,
      session,
      examDate,
      duration: Number(duration),
      totalMarks: Number(totalMarks),
      language,
      paperMode,
      uploadedFileUrl,
      uploadedFileType,
      instructions,
      questions: finalQuestions,
      status
    };

    if (status === 'pending') {
      onSubmit(payload);
    } else {
      onSaveDraft(payload);
    }
  };

  const selectedClassObj = classes.find(c => c._id === classId);
  const selectedSubjectObj = subjects.find(s => s._id === subjectId);
  const paperPreviewData = {
    class: selectedClassObj,
    subject: selectedSubjectObj,
    examType,
    session,
    examDate,
    duration,
    totalMarks,
    language,
    paperMode,
    uploadedFileUrl,
    uploadedFileType,
    instructions,
    questions
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Studio Top Control Panel */}
      <div className="glass-card p-4 rounded-3xl border border-slate-800 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 w-full md:w-auto">
          <button
            type="button"
            onClick={() => setPaperMode('text')}
            className={`flex-1 md:flex-initial flex items-center justify-center gap-2 px-5 py-3 rounded-2xl font-bold text-xs transition-all ${
              paperMode === 'text'
                ? 'btn-glow-indigo text-white font-extrabold shadow-lg'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/80 border border-slate-800'
            }`}
          >
            <Smartphone className="w-4 h-4 text-amber-400" />
            <span>📱 Smart Studio Typing Mode</span>
          </button>

          <button
            type="button"
            onClick={() => setPaperMode('upload')}
            className={`flex-1 md:flex-initial flex items-center justify-center gap-2 px-5 py-3 rounded-2xl font-bold text-xs transition-all ${
              paperMode === 'upload'
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white font-extrabold shadow-lg shadow-purple-600/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/80 border border-slate-800'
            }`}
          >
            <Upload className="w-4 h-4 text-purple-300" />
            <span>📄 Upload Word / PDF</span>
          </button>
        </div>

        {/* Paper Language Selector */}
        <div className="flex items-center gap-3 px-4 py-2 rounded-2xl bg-slate-900/90 border border-slate-800">
          <Languages className="w-4 h-4 text-indigo-400" />
          <span className="text-xs font-bold text-slate-400">Language:</span>
          <select
            value={language}
            onChange={(e) => handleLanguageChange(e.target.value)}
            className="bg-transparent text-xs font-extrabold text-indigo-300 focus:outline-none cursor-pointer"
          >
            <option value="English" className="bg-slate-900 text-white">English Medium</option>
            <option value="Hindi" className="bg-slate-900 text-white">Hindi Medium</option>
            <option value="Bilingual" className="bg-slate-900 text-white">Bilingual (English & Hindi)</option>
          </select>
        </div>
      </div>

      {/* Paper Header Metadata Card */}
      <div className="glass-card p-6 rounded-3xl border border-slate-800 shadow-xl space-y-4">
        <h3 className="font-heading font-extrabold text-base text-white flex items-center gap-2">
          <FileText className="w-5 h-5 text-indigo-400" />
          NVP Paper Header Configurator
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">Target Class *</label>
            <select
              value={classId}
              onChange={(e) => setClassId(e.target.value)}
              className="w-full px-4 py-3 text-xs rounded-2xl bg-slate-900 border border-slate-700 text-white font-bold focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">-- Select Class --</option>
              {classes.map((c) => (
                <option key={c._id} value={c._id}>Class {c.name} ({c.section})</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">Subject *</label>
            <select
              value={subjectId}
              onChange={(e) => setSubjectId(e.target.value)}
              className="w-full px-4 py-3 text-xs rounded-2xl bg-slate-900 border border-slate-700 text-white font-bold focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">-- Select Subject --</option>
              {subjects.map((s) => (
                <option key={s._id} value={s._id}>{s.name} ({s.code})</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">Exam Name *</label>
            <input
              type="text"
              value={examType}
              onChange={(e) => setExamType(e.target.value)}
              placeholder="e.g. Mid Term Examination"
              className="w-full px-4 py-3 text-xs rounded-2xl bg-slate-900 border border-slate-700 text-white font-semibold focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">Total Maximum Marks</label>
            <input
              type="number"
              value={totalMarks}
              onChange={(e) => setTotalMarks(e.target.value)}
              className="w-full px-4 py-3 text-xs rounded-2xl bg-slate-900 border border-slate-700 text-indigo-400 font-extrabold focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>
      </div>

      {/* SPLIT STUDIO VIEW: TYPING EDITOR ON LEFT, REAL-TIME PRINTABLE A4 PREVIEW ON RIGHT */}
      {paperMode === 'text' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Editor Column */}
          <div className={`${showPreview ? 'lg:col-span-6' : 'lg:col-span-12'} space-y-4`}>
            <div className="glass-card p-6 rounded-3xl border border-slate-800 shadow-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
                <div>
                  <h3 className="font-heading font-extrabold text-white text-base flex items-center gap-2">
                    <Type className="w-5 h-5 text-indigo-400" />
                    Question Paper Editor
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Type question text below. Real-time parsed into A4 sheet!
                  </p>
                </div>
                <span className="px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-extrabold">
                  {questions.length} Qs Parsed
                </span>
              </div>

              {/* Sample Shortcuts Bar */}
              <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2">
                <p className="text-[11px] font-bold text-slate-300 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  Quick Question Templates:
                </p>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setRawPaperText(prev => prev + `\n\nQ${questions.length + 1}. Which planet is known as the Red Planet? [1 Mark]\n(A) Venus\n(B) Mars\n(C) Jupiter\n(D) Saturn`)}
                    className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-indigo-300 border border-indigo-500/30 transition-all"
                  >
                    + MCQ Question
                  </button>
                  <button
                    type="button"
                    onClick={() => setRawPaperText(prev => prev + `\n\nQ${questions.length + 1}. Explain Newton's First Law of Motion with an example. [3 Marks]`)}
                    className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-purple-300 border border-purple-500/30 transition-all"
                  >
                    + Short Answer Q
                  </button>
                  <button
                    type="button"
                    onClick={() => setRawPaperText(prev => prev + `\n\nQ${questions.length + 1}. Explain the process of photosynthesis with a labeled diagram. [5 Marks]`)}
                    className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-emerald-300 border border-emerald-500/30 transition-all"
                  >
                    + Long Answer Q
                  </button>
                </div>
              </div>

              {/* Editor Textarea */}
              <textarea
                rows="16"
                value={rawPaperText}
                onChange={(e) => setRawPaperText(e.target.value)}
                placeholder="Type questions here..."
                className="w-full p-4 text-xs sm:text-sm font-mono leading-relaxed rounded-2xl bg-slate-900/90 border border-slate-700 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-inner"
              />
            </div>
          </div>

          {/* Right Real-time A4 Preview Column */}
          {showPreview && (
            <div className="lg:col-span-6 space-y-4 sticky top-24">
              <div className="glass-card p-4 rounded-3xl border border-slate-800 shadow-2xl">
                <div className="flex items-center justify-between mb-3 px-2">
                  <h4 className="font-heading font-extrabold text-white text-sm flex items-center gap-2">
                    <Eye className="w-4 h-4 text-emerald-400" />
                    Live A4 Printable Sheet Preview
                  </h4>
                  <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    Live Sync
                  </span>
                </div>
                <div className="max-h-[calc(100vh-220px)] overflow-y-auto rounded-2xl bg-slate-950 p-2 border border-slate-800">
                  <PrintablePaper paper={paperPreviewData} />
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* MODE 2: WORD / PDF UPLOAD */}
      {paperMode === 'upload' && (
        <div className="glass-card p-10 rounded-3xl border-2 border-dashed border-purple-500/30 text-center space-y-4 shadow-2xl">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-purple-500/20 text-purple-300 flex items-center justify-center font-bold border border-purple-500/40">
            <Upload className="w-7 h-7" />
          </div>
          <div>
            <h3 className="font-heading font-extrabold text-white text-lg">Upload Pre-Formatted Word (.docx) or PDF File</h3>
            <p className="text-xs text-slate-400 mt-1">Select a Microsoft Word paper file or PDF from your computer.</p>
          </div>

          <div className="max-w-md mx-auto pt-2">
            <input
              type="file"
              accept=".doc,.docx,.pdf,.png,.jpg,.jpeg"
              onChange={handlePaperFileUpload}
              className="w-full text-xs text-slate-400 file:mr-4 file:py-3 file:px-6 file:rounded-xl file:border-0 file:text-xs file:font-extrabold file:bg-purple-600 file:text-white hover:file:bg-purple-500 transition-all cursor-pointer"
            />
          </div>

          {uploadingPaperFile && (
            <p className="text-xs text-purple-400 font-bold animate-pulse">Uploading file to server...</p>
          )}

          {uploadedFileUrl && (
            <div className="p-3.5 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center justify-center gap-2 max-w-md mx-auto">
              <Check className="w-4 h-4" />
              <span>File Attached Successfully ({uploadedFileType.toUpperCase()})</span>
            </div>
          )}
        </div>
      )}

      {/* Bottom Sticky Action Bar */}
      <div className="glass-card p-4 rounded-3xl border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 sticky bottom-4 shadow-2xl z-30">
        <button
          type="button"
          onClick={() => setShowPreview(!showPreview)}
          className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs border border-slate-800 transition-colors"
        >
          <Eye className="w-4 h-4 text-indigo-400" />
          <span>{showPreview ? 'Hide Split Preview' : '🔍 Show Live Split Preview'}</span>
        </button>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            type="button"
            disabled={loading}
            onClick={() => handleFormSubmit('draft')}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 font-bold text-xs shadow-md transition-all disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>Save Draft</span>
          </button>

          <button
            type="button"
            disabled={loading}
            onClick={() => handleFormSubmit('pending')}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-8 py-3 rounded-2xl btn-glow-indigo text-white font-extrabold text-xs shadow-xl transition-all disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
            <span>Submit to Principal</span>
          </button>
        </div>
      </div>
    </div>
  );
}
