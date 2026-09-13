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
            studentCount: 0,
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
    let principalUser = existingPrincipal;
    if (!existingPrincipal) {
      const princPass = 'Megha@123';
      const salt = await bcrypt.genSalt(10);
      const princHash = await bcrypt.hash(princPass, salt);
      principalUser = await User.create({
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

    // 7. Ensure All 10 Real Teachers exist and are linked as Class Teachers
    const realTeachersDef = [
      { name: 'Priti', email: 'priti@school.local', empId: 'EMP-T001', mobile: '+91 98000 00001', qual: 'B.A., D.El.Ed.', ctClass: 'PG', pass: 'Priti@123' },
      { name: 'Lalita', email: 'lalita@school.local', empId: 'EMP-T002', mobile: '+91 98000 00002', qual: 'B.A., B.Ed.', ctClass: 'LKG', pass: 'Lalita@123' },
      { name: 'Priya', email: 'priya@school.local', empId: 'EMP-T003', mobile: '+91 98000 00003', qual: 'B.Sc., B.Ed.', ctClass: 'UKG', pass: 'Priya@123' },
      { name: 'Sarita', email: 'sarita@school.local', empId: 'EMP-T004', mobile: '+91 98000 00004', qual: 'M.A., B.Ed.', ctClass: '1', pass: 'Sarita@123' },
      { name: 'Durga', email: 'durga@school.local', empId: 'EMP-T005', mobile: '+91 98000 00005', qual: 'M.A., B.Ed.', ctClass: '2', pass: 'Durga@123' },
      { name: 'Pawan', email: 'pawan@school.local', empId: 'EMP-T006', mobile: '+91 98000 00006', qual: 'B.Tech (CS), MCA', ctClass: '3', pass: 'Pawan@123' },
      { name: 'Vanshika', email: 'vanshika@school.local', empId: 'EMP-T007', mobile: '+91 98000 00007', qual: 'B.Sc., M.Sc.', ctClass: '4', pass: 'Vanshika@123' },
      { name: 'Chanchal', email: 'chanchal@school.local', empId: 'EMP-T008', mobile: '+91 98000 00008', qual: 'M.Sc. (Math), B.Ed.', ctClass: '5', pass: 'Chanchal@123' },
      { name: 'Kavita', email: 'kavita@school.local', empId: 'EMP-T009', mobile: '+91 98000 00009', qual: 'M.A. (English), B.Ed.', ctClass: '6', pass: 'Kavita@123' },
    ];

    const teacherMap = {};
    if (principalUser) {
      teacherMap['MEGHA'] = principalUser;
    }

    for (const t of realTeachersDef) {
      let tDoc = await User.findOne({
        $or: [
          { email: t.email.toLowerCase() },
          { name: { $regex: new RegExp(`^${t.name}$`, 'i') } }
        ]
      });

      if (!tDoc) {
        const salt = await bcrypt.genSalt(10);
        const passHash = await bcrypt.hash(t.pass, salt);
        tDoc = await User.create({
          name: t.name,
          email: t.email.toLowerCase(),
          passwordHash: passHash,
          generatedPassword: t.pass,
          role: 'TEACHER',
          mobile: t.mobile,
          employeeId: t.empId,
          gender: 'Female',
          qualification: t.qual,
          status: 'active'
        });
      }
      teacherMap[t.name.toUpperCase()] = tDoc;

      // Link as Class Teacher in Class model
      const targetClass = await Class.findOne({ name: t.ctClass });
      if (targetClass) {
        targetClass.classTeacher = tDoc._id;
        targetClass.attendanceTeacher = tDoc._id;
        await targetClass.save();

        // Update assignedClasses on Teacher
        await User.findByIdAndUpdate(tDoc._id, {
          $addToSet: { assignedClasses: targetClass._id }
        });
      }
    }

    // Link Principal (Megha) as Class 7 Class Teacher
    const class7 = await Class.findOne({ name: '7' });
    if (class7 && principalUser) {
      class7.classTeacher = principalUser._id;
      class7.attendanceTeacher = principalUser._id;
      await class7.save();
    }

    // 8. Ensure Class Timetables are Seeded for PG to 7
    const classes = await Class.find({ status: 'active' });
    const classMap = {};
    classes.forEach(c => { classMap[c.name] = c; });

    const subjects = await Subject.find({ status: 'active' });
    const subjectMap = {};
    subjects.forEach(s => { subjectMap[s.name.toUpperCase()] = s; });

    const findSubjectDoc = (name) => {
      if (!name) return null;
      const upper = name.toUpperCase();
      if (subjectMap[upper]) return subjectMap[upper];
      if (upper.includes('MATH')) return subjectMap['MATHEMATICS'] || subjectMap['MATH'];
      if (upper.includes('HIN')) return subjectMap['HINDI'] || subjectMap['HIN'];
      if (upper.includes('ENG')) return subjectMap['ENGLISH'] || subjectMap['ENG'];
      if (upper.includes('EVS')) return subjectMap['EVS'];
      if (upper.includes('S.S.T') || upper.includes('SST')) return subjectMap['SOCIAL SCIENCE'] || subjectMap['SST'];
      if (upper.includes('SCI')) return subjectMap['SCIENCE'] || subjectMap['SCI'];
      if (upper.includes('COM')) return subjectMap['COMPUTER'] || subjectMap['CS'];
      if (upper.includes('SAN') || upper.includes('SANSKRIT')) return subjectMap['SANSKRIT'] || subjectMap['SKT'];
      if (upper.includes('GK') || upper.includes('G.K')) return subjectMap['GENERAL KNOWLEDGE'] || subjectMap['GK'];
      return subjectMap['GENERAL KNOWLEDGE'] || subjects[0];
    };

    const findTeacherDoc = (name) => {
      if (!name) return null;
      return teacherMap[name.toUpperCase()] || teacherMap['PAWAN'] || principalUser;
    };

    const periodTimes = [
      { periodNumber: 1, periodTitle: 'Period 1', startTime: '08:00 AM', endTime: '08:45 AM' },
      { periodNumber: 2, periodTitle: 'Period 2', startTime: '08:45 AM', endTime: '09:30 AM' },
      { periodNumber: 3, periodTitle: 'Period 3', startTime: '09:30 AM', endTime: '10:15 AM' },
      { periodNumber: 4, periodTitle: 'Period 4', startTime: '10:15 AM', endTime: '11:00 AM' },
      { periodNumber: 5, periodTitle: 'Lunch Break', startTime: '11:00 AM', endTime: '11:35 AM', isBreak: true },
      { periodNumber: 6, periodTitle: 'Period 5', startTime: '11:35 AM', endTime: '12:20 PM' },
      { periodNumber: 7, periodTitle: 'Period 6', startTime: '12:20 PM', endTime: '01:05 PM' },
      { periodNumber: 8, periodTitle: 'Period 7', startTime: '01:05 PM', endTime: '01:50 PM' },
      { periodNumber: 9, periodTitle: 'Period 8', startTime: '01:50 PM', endTime: '02:30 PM' }
    ];

    const classSchedulesRaw = {
      PG: [
        { pNum: 1, sub: 'Oral', teacher: 'Priti' },
        { pNum: 2, sub: 'English', teacher: 'Priti' },
        { pNum: 3, sub: 'Hindi', teacher: 'Priti' },
        { pNum: 4, sub: 'Hindi', teacher: 'Priti' },
        { pNum: 5, isBreak: true },
        { pNum: 6, sub: 'General Knowledge', teacher: 'Priti' },
        { pNum: 7, sub: 'Mathematics', teacher: 'Priti' },
        { pNum: 8, sub: 'Mathematics', teacher: 'Priti' },
        { pNum: 9, sub: 'General Knowledge', teacher: 'Priti' }
      ],
      LKG: [
        { pNum: 1, sub: 'Hindi', teacher: 'Lalita' },
        { pNum: 2, sub: 'Hindi', teacher: 'Lalita' },
        { pNum: 3, sub: 'Mathematics', teacher: 'Lalita' },
        { pNum: 4, sub: 'Mathematics', teacher: 'Lalita' },
        { pNum: 5, isBreak: true },
        { pNum: 6, sub: 'English', teacher: 'Lalita' },
        { pNum: 7, sub: 'English', teacher: 'Lalita' },
        { pNum: 8, sub: 'General Knowledge', teacher: 'Lalita' },
        { pNum: 9, sub: 'Hindi', teacher: 'Lalita' }
      ],
      UKG: [
        { pNum: 1, sub: 'Mathematics', teacher: 'Priya' },
        { pNum: 2, sub: 'Mathematics', teacher: 'Priya' },
        { pNum: 3, sub: 'Hindi', teacher: 'Priya' },
        { pNum: 4, sub: 'Hindi', teacher: 'Priya' },
        { pNum: 5, isBreak: true },
        { pNum: 6, sub: 'English', teacher: 'Priya' },
        { pNum: 7, sub: 'English', teacher: 'Priya' },
        { pNum: 8, sub: 'General Knowledge', teacher: 'Priya' },
        { pNum: 9, sub: 'Hindi', teacher: 'Priya' }
      ],
      '1': [
        { pNum: 1, sub: 'EVS', teacher: 'Sarita' },
        { pNum: 2, sub: 'Hindi', teacher: 'Durga' },
        { pNum: 3, sub: 'English', teacher: 'Megha' },
        { pNum: 4, sub: 'Mathematics', teacher: 'Sarita' },
        { pNum: 5, isBreak: true },
        { pNum: 6, sub: 'Computer', teacher: 'Pawan' },
        { pNum: 7, sub: 'Computer', teacher: 'Pawan' },
        { pNum: 8, sub: 'General Knowledge', teacher: 'Durga' },
        { pNum: 9, sub: 'Hindi', teacher: 'Durga' }
      ],
      '2': [
        { pNum: 1, sub: 'Hindi', teacher: 'Durga' },
        { pNum: 2, sub: 'EVS', teacher: 'Sarita' },
        { pNum: 3, sub: 'Computer', teacher: 'Pawan' },
        { pNum: 4, sub: 'English', teacher: 'Megha' },
        { pNum: 5, isBreak: true },
        { pNum: 6, sub: 'Hindi', teacher: 'Durga' },
        { pNum: 7, sub: 'Mathematics', teacher: 'Sarita' },
        { pNum: 8, sub: 'EVS', teacher: 'Sarita' },
        { pNum: 9, sub: 'EVS', teacher: 'Sarita' }
      ],
      '3': [
        { pNum: 1, sub: 'Computer', teacher: 'Pawan' },
        { pNum: 2, sub: 'EVS', teacher: 'Sarita' },
        { pNum: 3, sub: 'Hindi', teacher: 'Durga' },
        { pNum: 4, sub: 'English', teacher: 'Vanshika' },
        { pNum: 5, isBreak: true },
        { pNum: 6, sub: 'EVS', teacher: 'Sarita' },
        { pNum: 7, sub: 'Mathematics', teacher: 'Chanchal' },
        { pNum: 8, sub: 'English', teacher: 'Vanshika' },
        { pNum: 9, sub: 'General Knowledge', teacher: 'Chanchal' }
      ],
      '4': [
        { pNum: 1, sub: 'EVS', teacher: 'Vanshika' },
        { pNum: 2, sub: 'Mathematics', teacher: 'Chanchal' },
        { pNum: 3, sub: 'English', teacher: 'Kavita' },
        { pNum: 4, sub: 'Computer', teacher: 'Pawan' },
        { pNum: 5, isBreak: true },
        { pNum: 6, sub: 'English', teacher: 'Sarita' },
        { pNum: 7, sub: 'Mathematics', teacher: 'Chanchal' },
        { pNum: 8, sub: 'Hindi', teacher: 'Durga' },
        { pNum: 9, sub: 'General Knowledge', teacher: 'Sarita' }
      ],
      '5': [
        { pNum: 1, sub: 'Hindi', teacher: 'Megha' },
        { pNum: 2, sub: 'EVS', teacher: 'Vanshika' },
        { pNum: 3, sub: 'Mathematics', teacher: 'Chanchal' },
        { pNum: 4, sub: 'EVS', teacher: 'Sarita' },
        { pNum: 5, isBreak: true },
        { pNum: 6, sub: 'Mathematics', teacher: 'Chanchal' },
        { pNum: 7, sub: 'Hindi', teacher: 'Sarita' },
        { pNum: 8, sub: 'Computer', teacher: 'Pawan' },
        { pNum: 9, sub: 'English', teacher: 'Megha' }
      ],
      '6': [
        { pNum: 1, sub: 'English', teacher: 'Kavita' },
        { pNum: 2, sub: 'Computer', teacher: 'Pawan' },
        { pNum: 3, sub: 'Hindi', teacher: 'Durga' },
        { pNum: 4, sub: 'Mathematics', teacher: 'Chanchal' },
        { pNum: 5, isBreak: true },
        { pNum: 6, sub: 'Social Science', teacher: 'Vanshika' },
        { pNum: 7, sub: 'Sanskrit', teacher: 'Megha' },
        { pNum: 8, sub: 'Science', teacher: 'Kavita' },
        { pNum: 9, sub: 'Social Science', teacher: 'Vanshika' }
      ],
      '7': [
        { pNum: 1, sub: 'Mathematics', teacher: 'Chanchal' },
        { pNum: 2, sub: 'English', teacher: 'Kavita' },
        { pNum: 3, sub: 'Social Science', teacher: 'Vanshika' },
        { pNum: 4, sub: 'General Knowledge', teacher: 'Vanshika' },
        { pNum: 5, isBreak: true },
        { pNum: 6, sub: 'Hindi', teacher: 'Durga' },
        { pNum: 7, sub: 'Science', teacher: 'Kavita' },
        { pNum: 8, sub: 'Sanskrit', teacher: 'Chanchal' },
        { pNum: 9, sub: 'Computer', teacher: 'Pawan' }
      ]
    };

    const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    for (const [cName, rawPeriods] of Object.entries(classSchedulesRaw)) {
      const cls = classMap[cName];
      if (!cls) continue;

      const formattedPeriods = rawPeriods.map((item, idx) => {
        const pTime = periodTimes[idx] || periodTimes[periodTimes.length - 1];
        if (item.isBreak) {
          return {
            periodNumber: pTime.periodNumber,
            periodTitle: 'Lunch Break',
            isBreak: true,
            startTime: pTime.startTime,
            endTime: pTime.endTime,
            roomNo: `Class ${cName}`
          };
        }

        const subDoc = findSubjectDoc(item.sub);
        const teachDoc = findTeacherDoc(item.teacher);

        return {
          periodNumber: pTime.periodNumber,
          periodTitle: pTime.periodTitle,
          isBreak: false,
          startTime: pTime.startTime,
          endTime: pTime.endTime,
          subject: subDoc?._id,
          subjectName: item.sub,
          teacher: teachDoc?._id,
          teacherName: teachDoc?.name || item.teacher,
          roomNo: `Class ${cName}`
        };
      });

      const weeklySchedule = daysOfWeek.map(day => ({
        day,
        periods: formattedPeriods
      }));

      await Timetable.findOneAndUpdate(
        { class: cls._id, academicYear: '2026-2027' },
        {
          class: cls._id,
          className: `Class ${cls.name}`,
          section: cls.section || 'A',
          academicYear: '2026-2027',
          schedule: weeklySchedule
        },
        { upsert: true, new: true }
      );
    }

    console.log('[System Init] Core faculty & timetable verification completed successfully.');
  } catch (error) {
    console.error('[System Init Error]:', error.message);
  }
};

module.exports = seedInitialData;
