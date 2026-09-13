const express = require('express');
const router = express.Router();
const QuestionPaper = require('../models/QuestionPaper');
const Notification = require('../models/Notification');
const { protect } = require('../middleware/auth');
const checkRole = require('../middleware/checkRole');
const { logActivity } = require('../middleware/auditLogger');
const upload = require('../middleware/upload');
const { generateWordDocument } = require('../utils/docxGenerator');

// @route   GET /api/question-papers/:id/download-word
// @desc    Download question paper as MS Word (.docx) formatted exactly for NVP School
// @access  Private
router.get('/:id/download-word', protect, async (req, res) => {
  try {
    const paper = await QuestionPaper.findById(req.params.id)
      .populate('class', 'name section')
      .populate('subject', 'name code');

    if (!paper) {
      return res.status(404).json({ success: false, message: 'Question paper not found.' });
    }

    const buffer = await generateWordDocument(paper);
    const filename = `NVP_Paper_${paper.class?.name || 'Class'}_${paper.subject?.name || 'Subject'}.docx`;

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(buffer);
  } catch (error) {
    console.error('Word export error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/question-papers/upload-file
// @desc    Upload image for a question or Word/PDF paper file
// @access  Private
router.post('/upload-file', protect, upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded.' });
    }
    const fileUrl = `/uploads/${req.file.filename}`;
    const ext = req.file.originalname.split('.').pop().toLowerCase();
    res.json({
      success: true,
      fileUrl,
      fileName: req.file.originalname,
      fileType: ext
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/question-papers
// @desc    Get question papers (Filtered by role and permissions)
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const { status, classId, subjectId } = req.query;
    let query = {};

    if (status) query.status = status;
    if (classId) query.class = classId;
    if (subjectId) query.subject = subjectId;

    // Security Isolation for Teachers
    if (req.user.role === 'TEACHER') {
      const assignedClassIds = (req.user.assignedClasses || []).map(c => (c._id || c).toString());
      query.$or = [
        { teacher: req.user._id },
        { class: { $in: assignedClassIds } }
      ];
    }

    const papers = await QuestionPaper.find(query)
      .populate('teacher', 'name email employeeId')
      .populate('class', 'name section')
      .populate('subject', 'name code')
      .populate('reviewedBy', 'name email role')
      .sort({ updatedAt: -1 });

    res.json({ success: true, count: papers.length, papers });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/question-papers/:id
// @desc    Get single question paper by ID
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const paper = await QuestionPaper.findById(req.params.id)
      .populate('teacher', 'name email employeeId qualification')
      .populate('class', 'name section')
      .populate('subject', 'name code')
      .populate('reviewedBy', 'name email role');

    if (!paper) {
      return res.status(404).json({ success: false, message: 'Question paper not found.' });
    }

    // Security Check: Teacher can only view papers if assigned to the class or is owner
    if (req.user.role === 'TEACHER') {
      const isOwner = paper.teacher._id.toString() === req.user._id.toString();
      const assignedClassIds = (req.user.assignedClasses || []).map(c => (c._id || c).toString());
      const isAssigned = assignedClassIds.includes(paper.class._id.toString());
      
      if (!isOwner && !isAssigned) {
        return res.status(403).json({ success: false, message: 'Access denied. You are not assigned to this class.' });
      }
    }

    res.json({ success: true, paper });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/question-papers
// @desc    Create new question paper (Save Draft or Submit)
// @access  Private (TEACHER, PRINCIPAL, HEAD)
router.post('/', protect, async (req, res) => {
  try {
    const {
      classId, subjectId, examType, session, examDate,
      duration, totalMarks, language, paperMode, uploadedFileUrl,
      uploadedFileType, instructions, questions, status
    } = req.body;

    if (!classId || !subjectId || !examType) {
      return res.status(400).json({ success: false, message: 'Class, Subject, and Exam Type are required.' });
    }

    // Backend Access Control Check for Teachers
    if (req.user.role === 'TEACHER') {
      const assignedClassIds = (req.user.assignedClasses || []).map(c => (c._id || c).toString());
      const assignedSubjectIds = (req.user.assignedSubjects || []).map(s => (s._id || s).toString());

      if (!assignedClassIds.includes(classId.toString())) {
        return res.status(403).json({ success: false, message: 'This class is not assigned to you.' });
      }
      if (!assignedSubjectIds.includes(subjectId.toString())) {
        return res.status(403).json({ success: false, message: 'This subject is not assigned to you.' });
      }
    }

    const paperStatus = status === 'pending' ? 'pending' : 'draft';
    const submittedAt = paperStatus === 'pending' ? new Date() : null;

    const defaultInstructions = [
      'All questions are compulsory.',
      'Write legibly and cleanly.',
      'Figures to the right indicate full marks.'
    ];

    const newPaper = await QuestionPaper.create({
      teacher: req.user._id,
      class: classId,
      subject: subjectId,
      examType,
      session: session || '2026-2027',
      examDate: examDate || Date.now(),
      duration: duration || 90,
      totalMarks: totalMarks || 100,
      language: language || 'English',
      paperMode: paperMode || 'builder',
      uploadedFileUrl: uploadedFileUrl || '',
      uploadedFileType: uploadedFileType || '',
      instructions: instructions || defaultInstructions,
      questions: questions || [],
      status: paperStatus,
      submittedAt
    });

    await logActivity(req, 'CREATE_QUESTION_PAPER', 'QuestionPaper', newPaper._id, {
      examType: newPaper.examType,
      status: paperStatus
    });

    // Auto generate docx file in output folder
    try {
      const populatedPaper = await QuestionPaper.findById(newPaper._id).populate('class').populate('subject');
      if (populatedPaper) {
        await generateWordDocument(populatedPaper, true);
      }
    } catch (e) {
      console.error('Auto docx save error:', e);
    }

    // Send Notification to Principal if submitted
    if (paperStatus === 'pending') {
      await Notification.create({
        sender: req.user._id,
        recipientRole: 'PRINCIPAL',
        title: 'New Question Paper Submitted',
        message: `Teacher ${req.user.name} submitted a new ${examType} question paper for review.`,
        type: 'paper_status'
      });
    }

    res.status(201).json({
      success: true,
      message: paperStatus === 'pending'
        ? 'Question paper submitted to Principal successfully for review.'
        : 'Question paper saved as draft.',
      paper: newPaper
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   PUT /api/question-papers/:id
// @desc    Update question paper
// @access  Private (Owner TEACHER, PRINCIPAL, HEAD)
router.put('/:id', protect, async (req, res) => {
  try {
    const paper = await QuestionPaper.findById(req.params.id);
    if (!paper) {
      return res.status(404).json({ success: false, message: 'Question paper not found.' });
    }

    // Owner check for teachers
    if (req.user.role === 'TEACHER' && paper.teacher.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'You can only edit your own question papers.' });
    }

    const {
      classId, subjectId, examType, session, examDate,
      duration, totalMarks, language, paperMode, uploadedFileUrl,
      uploadedFileType, instructions, questions, status
    } = req.body;

    if (classId) paper.class = classId;
    if (subjectId) paper.subject = subjectId;
    if (examType) paper.examType = examType;
    if (session) paper.session = session;
    if (examDate) paper.examDate = examDate;
    if (duration) paper.duration = duration;
    if (totalMarks) paper.totalMarks = totalMarks;
    if (language) paper.language = language;
    if (paperMode) paper.paperMode = paperMode;
    if (uploadedFileUrl !== undefined) paper.uploadedFileUrl = uploadedFileUrl;
    if (uploadedFileType !== undefined) paper.uploadedFileType = uploadedFileType;
    if (instructions) paper.instructions = instructions;
    if (questions) paper.questions = questions;

    if (status) {
      paper.status = status;
      if (status === 'pending') {
        paper.submittedAt = new Date();
        paper.rejectionReason = ''; // reset on resubmission
      }
    }

    await paper.save();
    await logActivity(req, 'EDIT_QUESTION_PAPER', 'QuestionPaper', paper._id, { status: paper.status });

    // Auto generate docx file in output folder
    try {
      const populatedPaper = await QuestionPaper.findById(paper._id).populate('class').populate('subject');
      if (populatedPaper) {
        await generateWordDocument(populatedPaper, true);
      }
    } catch (e) {
      console.error('Auto docx update error:', e);
    }

    if (status === 'pending') {
      await Notification.create({
        sender: req.user._id,
        recipientRole: 'PRINCIPAL',
        title: 'Question Paper Resubmitted',
        message: `Teacher ${req.user.name} resubmitted ${paper.examType} question paper.`,
        type: 'paper_status'
      });
    }

    res.json({ success: true, message: 'Question paper updated successfully.', paper });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   PUT /api/question-papers/:id/review
// @desc    Approve or Reject Question Paper
// @access  Private (PRINCIPAL, HEAD)
router.put('/:id/review', protect, checkRole('HEAD', 'PRINCIPAL'), async (req, res) => {
  try {
    const { action, rejectionReason } = req.body; // action: 'approve' | 'reject'

    if (!['approve', 'reject'].includes(action)) {
      return res.status(400).json({ success: false, message: 'Action must be either "approve" or "reject".' });
    }

    const paper = await QuestionPaper.findById(req.params.id).populate('teacher', 'name email');
    if (!paper) {
      return res.status(404).json({ success: false, message: 'Question paper not found.' });
    }

    if (action === 'approve') {
      paper.status = 'approved';
      paper.rejectionReason = '';
    } else {
      if (!rejectionReason) {
        return res.status(400).json({ success: false, message: 'Rejection reason is required when rejecting a paper.' });
      }
      paper.status = 'rejected';
      paper.rejectionReason = rejectionReason;
    }

    paper.reviewedAt = new Date();
    paper.reviewedBy = req.user._id;
    await paper.save();

    const actionType = action === 'approve' ? 'APPROVE_QUESTION_PAPER' : 'REJECT_QUESTION_PAPER';
    await logActivity(req, actionType, 'QuestionPaper', paper._id, {
      reviewedBy: req.user.name,
      rejectionReason: paper.rejectionReason
    });

    // Send Notification to Teacher
    await Notification.create({
      sender: req.user._id,
      recipientUser: paper.teacher._id,
      title: action === 'approve' ? 'Question Paper Approved!' : 'Question Paper Needs Revision',
      message: action === 'approve'
        ? `Your question paper for ${paper.examType} has been APPROVED by ${req.user.name}.`
        : `Your question paper was REJECTED by ${req.user.name}. Reason: ${rejectionReason}`,
      type: 'paper_status'
    });

    res.json({
      success: true,
      message: action === 'approve' ? 'Question paper approved.' : 'Question paper rejected. Teacher has been notified.',
      paper
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   DELETE /api/question-papers/:id
// @desc    Delete Question Paper
// @access  Private (Owner TEACHER, PRINCIPAL, HEAD)
router.delete('/:id', protect, async (req, res) => {
  try {
    const paper = await QuestionPaper.findById(req.params.id);
    if (!paper) {
      return res.status(404).json({ success: false, message: 'Question paper not found.' });
    }

    if (req.user.role === 'TEACHER' && paper.teacher.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'You can only delete your own question papers.' });
    }

    await QuestionPaper.findByIdAndDelete(req.params.id);
    await logActivity(req, 'DELETE_QUESTION_PAPER', 'QuestionPaper', req.params.id);

    res.json({ success: true, message: 'Question paper deleted successfully.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
