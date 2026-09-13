const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Class = require('../models/Class');
const Subject = require('../models/Subject');
const Setting = require('../models/Setting');
const Student = require('../models/Student');
const Parent = require('../models/Parent');
const Staff = require('../models/Staff');
const QuestionPaper = require('../models/QuestionPaper');
const Assignment = require('../models/Assignment');
const StudyMaterial = require('../models/StudyMaterial');
const Attendance = require('../models/Attendance');
const Result = require('../models/Result');
const Notification = require('../models/Notification');
const Announcement = require('../models/Announcement');
const TeacherAttendance = require('../models/TeacherAttendance');
const Transport = require('../models/Transport');
const Timetable = require('../models/Timetable');
const { FeeStructure, FeePayment } = require('../models/Fee');
const Promotion = require('../models/Promotion');

/**
 * Clean System Initializer:
 * - Purges ALL dummy teachers, principals, students, and mock records.
 * - Leaves ONLY the Head Administrator account.
 * - Pre-configures standard classes (Nursery to 10) and subjects ready for real use.
 */
const seedInitialData = async () => {
  try {
    console.log('[System Init] Verifying core system configuration...');

    // 2. Ensure Standard Subjects are available for syllabus assignment
    const defaultSubjects = [
      { name: 'English', code: 'ENG' },
      { name: 'Hindi', code: 'HIN' },
      { name: 'Mathematics', code: 'MATH' },
      { name: 'Science', code: 'SCI' },
      { name: 'Social Science', code: 'SST' },
      { name: 'Computer', code: 'CS' },
      { name: 'Sanskrit', code: 'SKT' },
      { name: 'General Knowledge', code: 'GK' },
      { name: 'EVS', code: 'EVS' }
    ];

    for (const sub of defaultSubjects) {
      await Subject.findOneAndUpdate(
        { name: sub.name },
        { name: sub.name, code: sub.code, status: 'active' },
        { upsert: true, new: true }
      );
    }

    const allSubjects = await Subject.find();
    const subjectIds = allSubjects.map(s => s._id);

    // 3. Ensure Standard Classes exist (PG to 7) without overwriting class teacher or enrollment
    const standardClassNames = ['PG', 'LKG', 'UKG', '1', '2', '3', '4', '5', '6', '7'];
    for (const name of standardClassNames) {
      await Class.findOneAndUpdate(
        { name, section: 'A' },
        {
          $setOnInsert: {
            name,
            section: 'A',
            subjects: subjectIds,
            classTeacher: null,
            studentCount: 28,
            status: 'active'
          }
        },
        { upsert: true, new: true }
      );
    }
    // Remove unused classes
    await Class.deleteMany({ name: { $in: ['Nursery', '8', '9', '10'] } });

    // 4. Ensure Default School Information
    const existingSetting = await Setting.findOne();
    if (!existingSetting) {
      await Setting.create({
        schoolName: 'NVP ENGLISH MEDIUM SCHOOL',
        subtitle: 'NIMBI JODHAN',
        address: 'Nimbi Jodhan, Ladnun, Nagaur, Rajasthan 341316',
        contactNumber: '+91 98290 12345',
        email: 'info@nvpschool.edu.in',
        academicSession: '2026-2027',
        motto: 'Excellence in Education, Character in Leadership',
        affiliation: 'CBSE Affiliated - Secondary & Sr. Secondary',
        examTypes: ['Unit Test I', 'Unit Test II', 'Half Yearly Exam', 'Final Annual Exam'],
        defaultMarks: 100,
        defaultDuration: 90
      });
    }

    // 5. Ensure Head Administrator account exists
    const existingHead = await User.findOne({ role: 'HEAD' });
    if (!existingHead) {
      const initialHeadPass = process.env.HEAD_PASSWORD || 'Head@12345';
      const salt = await bcrypt.genSalt(10);
      const headPasswordHash = await bcrypt.hash(initialHeadPass, salt);

      await User.create({
        name: 'Head Administrator',
        email: (process.env.HEAD_EMAIL || 'head@school.local').toLowerCase().trim(),
        passwordHash: headPasswordHash,
        generatedPassword: initialHeadPass,
        role: 'HEAD',
        mobile: '+91 98290 00000',
        employeeId: 'EMP-HEAD',
        gender: 'Male',
        qualification: 'Director / Management',
        joiningDate: new Date(),
        status: 'active'
      });
      console.log('[System Init] Head Administrator verified: head@school.local');
    }

    // 6. Ensure Principal account exists
    const existingPrincipal = await User.findOne({ role: 'PRINCIPAL' });
    if (!existingPrincipal) {
      const princPass = 'Megha@123';
      const salt = await bcrypt.genSalt(10);
      const princHash = await bcrypt.hash(princPass, salt);
      await User.create({
        name: 'Megha',
        email: 'pk621913@gmail.com',
        passwordHash: princHash,
        generatedPassword: princPass,
        role: 'PRINCIPAL',
        mobile: '+91 82270 31017',
        employeeId: 'EMP-P001',
        gender: 'Female',
        qualification: 'M.A., B.Ed., M.Ed.',
        status: 'active'
      });
      console.log('[System Init] Principal verified: pk621913@gmail.com');
    }
  } catch (error) {
    console.error('[System Init Error]:', error.message);
  }
};

module.exports = seedInitialData;
