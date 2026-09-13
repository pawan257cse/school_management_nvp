const Class = require('../models/Class');

/**
 * Returns an array of class ID strings that this teacher is authorized to manage
 * (combines direct User.assignedClasses and classes where teacher is Class.classTeacher).
 *
 * @param {Object} user - The authenticated user document (req.user)
 * @returns {Promise<string[]>} Array of class ID strings
 */
async function getTeacherClassIds(user) {
  if (!user || user.role !== 'TEACHER') {
    return [];
  }

  // 1. Classes listed in User.assignedClasses
  const directAssigned = (user.assignedClasses || []).map(c => (c._id || c).toString());

  // 2. Classes where this user is assigned as the Class Teacher
  const classTeacherDocs = await Class.find({ classTeacher: user._id }).select('_id');
  const classTeacherIds = classTeacherDocs.map(c => c._id.toString());

  // Combine and deduplicate
  return Array.from(new Set([...directAssigned, ...classTeacherIds]));
}

module.exports = { getTeacherClassIds };
