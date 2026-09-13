const express = require('express');
const router = express.Router();
const Assignment = require('../models/Assignment');
const Class = require('../models/Class');
const { protect } = require('../middleware/auth');
const { logActivity } = require('../middleware/auditLogger');
const upload = require('../middleware/upload');

// @route   GET /api/assignments/by-class
// @desc    Get all assignments grouped by class (for HEAD/PRINCIPAL class-wise diary view)
// @access  Private (HEAD, PRINCIPAL)
router.get('/by-class', protect, async (req, res) => {
  try {
    const classOrder = ['Nursery', 'LKG', 'UKG', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10'];
    const classes = await Class.find();
    classes.sort((a, b) => {
      const idxA = classOrder.indexOf(a.name);
      const idxB = classOrder.indexOf(b.name);
      return (idxA === -1 ? 99 : idxA) - (idxB === -1 ? 99 : idxB);
    });

    const result = await Promise.all(classes.map(async (cls) => {
      const assignments = await Assignment.find({ class: cls._id })
        .populate('teacher', 'name email')
        .populate('class', 'name section')
        .populate('subject', 'name code')
        .sort({ createdAt: -1 });
      return {
        class: { _id: cls._id, name: cls.name, section: cls.section },
        count: assignments.length,
        assignments
      };
    }));

    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/assignments
// @desc    Get assignments (HEAD/PRINCIPAL see all; TEACHER sees only their assigned classes)
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const { classId, subjectId } = req.query;
    let query = {};

    if (classId) query.class = classId;
    if (subjectId) query.subject = subjectId;

    // TEACHER: only see their assigned classes
    if (req.user.role === 'TEACHER') {
      const assignedClassIds = (req.user.assignedClasses || []).map(c => (c._id || c).toString());
      if (!classId) query.class = { $in: assignedClassIds };
    }
    // HEAD/PRINCIPAL: see all (no extra filter)

    const assignments = await Assignment.find(query)
      .populate('teacher', 'name email')
      .populate('class', 'name section')
      .populate('subject', 'name code')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: assignments.length, assignments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/assignments
// @desc    Create new assignment
// @access  Private (TEACHER, PRINCIPAL, HEAD)
router.post('/', protect, upload.array('attachments', 5), async (req, res) => {
  try {
    const { classId, subjectId, title, description, submissionDate, instructions, status } = req.body;

    if (!classId || !subjectId || !title || !submissionDate) {
      return res.status(400).json({ success: false, message: 'Class, Subject, Title, and Submission Date are required.' });
    }

    if (req.user.role === 'TEACHER') {
      const assignedClassIds = (req.user.assignedClasses || []).map(c => (c._id || c).toString());
      if (!assignedClassIds.includes(classId.toString())) {
        return res.status(403).json({ success: false, message: 'This class is not assigned to you.' });
      }
    }

    const attachmentUrls = (req.files || []).map(f => `/uploads/${f.filename}`);

    const newAssignment = await Assignment.create({
      teacher: req.user._id,
      class: classId,
      subject: subjectId,
      title,
      description: description || '',
      submissionDate,
      instructions: instructions || '',
      attachments: attachmentUrls,
      status: status || 'published'
    });

    await logActivity(req, 'CREATE_ASSIGNMENT', 'Assignment', newAssignment._id, { title: newAssignment.title });

    res.status(201).json({ success: true, message: 'Assignment created successfully.', assignment: newAssignment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   PUT /api/assignments/:id
// @desc    Update assignment (HEAD/PRINCIPAL can update any; TEACHER only their own)
// @access  Private
router.put('/:id', protect, async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id);
    if (!assignment) {
      return res.status(404).json({ success: false, message: 'Assignment not found.' });
    }

    if (req.user.role === 'TEACHER' && assignment.teacher.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Unauthorized. You can only edit your own assignments.' });
    }

    const { title, description, submissionDate, instructions, status } = req.body;
    if (title) assignment.title = title;
    if (description !== undefined) assignment.description = description;
    if (submissionDate) assignment.submissionDate = submissionDate;
    if (instructions !== undefined) assignment.instructions = instructions;
    if (status) assignment.status = status;

    await assignment.save();
    await logActivity(req, 'UPDATE_ASSIGNMENT', 'Assignment', assignment._id, { title: assignment.title });

    res.json({ success: true, message: 'Assignment updated successfully.', assignment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   DELETE /api/assignments/:id
// @desc    Delete assignment (HEAD/PRINCIPAL can delete any)
// @access  Private
router.delete('/:id', protect, async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id);
    if (!assignment) {
      return res.status(404).json({ success: false, message: 'Assignment not found.' });
    }

    if (req.user.role === 'TEACHER' && assignment.teacher.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Unauthorized.' });
    }

    await Assignment.findByIdAndDelete(req.params.id);
    await logActivity(req, 'DELETE_ASSIGNMENT', 'Assignment', req.params.id);

    res.json({ success: true, message: 'Assignment deleted successfully.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
