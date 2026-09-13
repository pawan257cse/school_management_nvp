const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  recipientRole: {
    type: String,
    enum: ['ALL', 'HEAD', 'PRINCIPAL', 'TEACHER', 'SPECIFIC_USER', 'SPECIFIC_CLASS'],
    default: 'ALL'
  },
  recipientUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  recipientClass: { type: mongoose.Schema.Types.ObjectId, ref: 'Class' },
  title: { type: String, required: true },
  message: { type: String, required: true },
  type: {
    type: String,
    enum: ['info', 'warning', 'urgent', 'paper_status', 'meeting'],
    default: 'info'
  },
  readBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
}, { timestamps: true });

module.exports = mongoose.model('Notification', notificationSchema);
