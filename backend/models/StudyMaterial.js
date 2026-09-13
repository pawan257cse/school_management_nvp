const mongoose = require('mongoose');

const studyMaterialSchema = new mongoose.Schema({
  teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  class: { type: mongoose.Schema.Types.ObjectId, ref: 'Class', required: true },
  subject: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', required: true },
  chapter: { type: String, required: true, trim: true },
  topic: { type: String, required: true, trim: true },
  title: { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  fileUrl: { type: String, required: true },
  fileType: {
    type: String,
    enum: ['pdf', 'notes', 'worksheet', 'image', 'document', 'link'],
    default: 'pdf'
  }
}, { timestamps: true });

module.exports = mongoose.model('StudyMaterial', studyMaterialSchema);
