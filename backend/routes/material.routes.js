const express = require('express');
const router = express.Router();
const StudyMaterial = require('../models/StudyMaterial');
const { protect } = require('../middleware/auth');
const { logActivity } = require('../middleware/auditLogger');
const upload = require('../middleware/upload');
const { getTeacherClassIds } = require('../utils/teacherScope');

// @route   GET /api/materials
// @desc    Get study materials (TEACHER sees only their own materials for assigned classes)
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const { classId, subjectId } = req.query;
    let query = {};

    if (classId) query.class = classId;
    if (subjectId) query.subject = subjectId;

    if (req.user.role === 'TEACHER') {
      const allowedClassIds = await getTeacherClassIds(req.user);
      query.teacher = req.user._id;
      if (classId) {
        if (!allowedClassIds.includes(classId.toString())) {
          return res.status(403).json({ success: false, message: 'Class not assigned to you.' });
        }
        query.class = classId;
      } else {
        query.class = { $in: allowedClassIds };
      }
    }

    const materials = await StudyMaterial.find(query)
      .populate('teacher', 'name email')
      .populate('class', 'name section')
      .populate('subject', 'name code')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: materials.length, materials });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/materials
// @desc    Upload study material
// @access  Private (TEACHER, PRINCIPAL, HEAD)
router.post('/', protect, upload.single('file'), async (req, res) => {
  try {
    const { classId, subjectId, chapter, topic, title, description, fileType, externalUrl } = req.body;

    if (!classId || !subjectId || !chapter || !topic || !title) {
      return res.status(400).json({ success: false, message: 'Class, Subject, Chapter, Topic, and Title are required.' });
    }

    if (req.user.role === 'TEACHER') {
      const allowedClassIds = await getTeacherClassIds(req.user);
      if (!allowedClassIds.includes(classId.toString())) {
        return res.status(403).json({ success: false, message: 'This class is not assigned to you.' });
      }
    }

    let fileUrl = externalUrl || '';
    if (req.file) {
      fileUrl = `/uploads/${req.file.filename}`;
    }

    if (!fileUrl) {
      return res.status(400).json({ success: false, message: 'Please attach a file or provide an external URL.' });
    }

    const material = await StudyMaterial.create({
      teacher: req.user._id,
      class: classId,
      subject: subjectId,
      chapter,
      topic,
      title,
      description: description || '',
      fileUrl,
      fileType: fileType || 'pdf'
    });

    await logActivity(req, 'UPLOAD_MATERIAL', 'StudyMaterial', material._id, { title: material.title });

    res.status(201).json({ success: true, message: 'Study material uploaded successfully.', material });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   DELETE /api/materials/:id
// @desc    Delete study material
// @access  Private
router.delete('/:id', protect, async (req, res) => {
  try {
    const material = await StudyMaterial.findById(req.params.id);
    if (!material) {
      return res.status(404).json({ success: false, message: 'Study material not found.' });
    }

    if (req.user.role === 'TEACHER' && material.teacher.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Unauthorized.' });
    }

    await StudyMaterial.findByIdAndDelete(req.params.id);
    await logActivity(req, 'DELETE_MATERIAL', 'StudyMaterial', req.params.id);

    res.json({ success: true, message: 'Study material deleted.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
