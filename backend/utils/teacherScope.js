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

/**
 * Returns an array of class ID strings that this teacher is specifically authorized
 * to record attendance for (as designated Attendance In-Charge).
 *
 * @param {Object} user - The authenticated user document (req.user)
 * @returns {Promise<string[]>} Array of class ID strings
 */
async function getTeacherAttendanceClassIds(user) {
  if (!user || user.role !== 'TEACHER') {
    return [];
  }

  // Permission check
  if (user.permissions && user.permissions.manageAttendance === false) {
    return [];
  }

  // 1. Check classes where attendanceTeacher is specifically assigned to this user
  // or user's attendanceClasses array
  const attendanceDocs = await Class.find({
    status: 'active',
    $or: [
      { attendanceTeacher: user._id },
      { _id: { $in: user.attendanceClasses || [] } }
    ]
  }).select('_id');

  let classIds = attendanceDocs.map(c => c._id.toString());

  // 2. Fallback: If no class in the school has attendanceTeacher assigned yet, fall back to classTeacher
  if (classIds.length === 0) {
    const anyExplicitSet = await Class.exists({ attendanceTeacher: { $ne: null } });
    if (!anyExplicitSet) {
      const ctDocs = await Class.find({ status: 'active', classTeacher: user._id }).select('_id');
      classIds = ctDocs.map(c => c._id.toString());
    }
  }

  return Array.from(new Set(classIds));
}

module.exports = { getTeacherClassIds, getTeacherAttendanceClassIds };
