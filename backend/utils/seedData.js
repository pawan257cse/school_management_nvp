const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Class = require('../models/Class');
const Subject = require('../models/Subject');
const Setting = require('../models/Setting');
const Timetable = require('../models/Timetable');
const Student = require('../models/Student');
const importOfficialStudents = require('./importOfficialStudents');

const periodTimes = [
  { periodNumber: 1, startTime: '08:00 AM', endTime: '08:40 AM', periodTitle: 'Period 1' },
  { periodNumber: 2, startTime: '08:40 AM', endTime: '09:10 AM', periodTitle: 'Period 2' },
  { periodNumber: 3, startTime: '09:10 AM', endTime: '09:45 AM', periodTitle: 'Period 3' },
  { periodNumber: 4, startTime: '09:45 AM', endTime: '10:20 AM', periodTitle: 'Period 4' },
  { periodNumber: 5, startTime: '10:20 AM', endTime: '10:40 AM', periodTitle: 'Lunch Break', isBreak: true },
  { periodNumber: 6, startTime: '10:40 AM', endTime: '11:20 AM', periodTitle: 'Period 5' },
  { periodNumber: 7, startTime: '11:20 AM', endTime: '11:50 AM', periodTitle: 'Period 6' },
  { periodNumber: 8, startTime: '11:50 AM', endTime: '12:25 PM', periodTitle: 'Period 7' },
  { periodNumber: 9, startTime: '12:25 PM', endTime: '01:00 PM', periodTitle: 'Period 8' },
];

/**
 * Bulletproof System Initializer:
 * Ensures 10 Active Classes (PG to Class 7), 14 Subjects, 10 Real Teachers, Principal, Head Admin,
 * 10 Class Timetables, and 93 Official Real Students are ALWAYS preserved and seeded in MongoDB Atlas.
 */
const seedInitialData = async () => {
  try {
    const studentCountCheck = await Student.countDocuments();
    const teacherCountCheck = await User.countDocuments({ role: { $in: ['TEACHER', 'PRINCIPAL'] } });
    if (studentCountCheck >= 93 && teacherCountCheck >= 10) {
      console.log('[System Init] NVP School Database is already fully populated (' + studentCountCheck + ' students, ' + teacherCountCheck + ' teachers). Skipping re-seed.');
      return;
    }

    console.log('[System Init] Synchronizing NVP School Database State...');

    const salt = await bcrypt.genSalt(10);

    // 1. Standard Subjects Setup
    const standardSubjectsDef = [
      { name: 'English', code: 'ENG' },
      { name: 'Hindi', code: 'HIN' },
      { name: 'Mathematics', code: 'MATH' },
      { name: 'Science', code: 'SCI' },
      { name: 'Social Science', code: 'SST' },
      { name: 'Computer', code: 'CS' },
      { name: 'Sanskrit', code: 'SKT' },
      { name: 'General Knowledge', code: 'GK' },
      { name: 'EVS', code: 'EVS' },
      { name: 'Oral', code: 'ORAL' },
      { name: 'Games & Activity', code: 'GAME' },
      { name: 'Diary & Rhymes', code: 'DIARY' },
      { name: 'Activity / Self Study', code: 'ACT' },
      { name: 'Hindi Grammar', code: 'HING' }
    ];

    const subMap = {};
    for (const s of standardSubjectsDef) {
      const doc = await Subject.findOneAndUpdate(
        { name: s.name },
        { name: s.name, code: s.code, status: 'active' },
        { upsert: true, new: true }
      );
      subMap[s.name.toUpperCase()] = doc;
      subMap[s.code.toUpperCase()] = doc;
    }

    const allSubjectDocs = await Subject.find({ status: 'active' });
    const allSubjectIds = allSubjectDocs.map(s => s._id);

    // 2. Standard Classes Setup (PG to 7)
    const classNames = ['PG', 'LKG', 'UKG', '1', '2', '3', '4', '5', '6', '7'];
    const classMap = {};

    for (const name of classNames) {
      let cls = await Class.findOne({ name, section: 'A' });
      if (!cls) {
        cls = await Class.create({
          name,
          section: 'A',
          subjects: allSubjectIds,
          studentCount: 0,
          status: 'active'
        });
      } else {
        cls.subjects = allSubjectIds;
        cls.status = 'active';
        await cls.save();
      }
      classMap[name] = cls;
    }

    // 3. School Settings
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

    // 4. Head Administrator
    let headUser = await User.findOne({ role: 'HEAD' });
    const headPass = 'Head@12345';
    const headHash = await bcrypt.hash(headPass, salt);
    if (!headUser) {
      headUser = await User.create({
        name: 'Pawan (Head Administrator)',
        email: (process.env.HEAD_EMAIL || 'head@school.local').toLowerCase().trim(),
        passwordHash: headHash,
        generatedPassword: headPass,
        role: 'HEAD',
        mobile: '+91 98290 00000',
        employeeId: 'EMP-HEAD',
        gender: 'Male',
        qualification: 'Director / Management',
        joiningDate: new Date(),
        status: 'active'
      });
    }

    // 5. Faculty / Teachers Setup (10 Real Teachers + Head Admin)
    const realFaculty = [
      {
        name: 'Priti',
        email: 'priti@school.local',
        empId: 'EMP-T001',
        mobile: '+91 98000 00001',
        qual: 'B.A., D.El.Ed.',
        gender: 'Female',
        role: 'TEACHER',
        ctClass: 'PG',
        pass: 'Priti@123',
        teachingClasses: ['PG'],
        teachingSubjects: ['English', 'Hindi', 'Mathematics', 'General Knowledge', 'Oral']
      },
      {
        name: 'Lalita',
        email: 'lalita@school.local',
        empId: 'EMP-T002',
        mobile: '+91 98000 00002',
        qual: 'B.A., B.Ed.',
        gender: 'Female',
        role: 'TEACHER',
        ctClass: 'LKG',
        pass: 'Lalita@123',
        teachingClasses: ['LKG'],
        teachingSubjects: ['Hindi', 'Mathematics', 'English', 'General Knowledge']
      },
      {
        name: 'Priya',
        email: 'priya@school.local',
        empId: 'EMP-T003',
        mobile: '+91 98000 00003',
        qual: 'B.Sc., B.Ed.',
        gender: 'Female',
        role: 'TEACHER',
        ctClass: 'UKG',
        pass: 'Priya@123',
        teachingClasses: ['UKG'],
        teachingSubjects: ['Mathematics', 'Hindi', 'English', 'General Knowledge']
      },
      {
        name: 'Sarita',
        email: 'sarita@school.local',
        empId: 'EMP-T004',
        mobile: '+91 98000 00004',
        qual: 'M.A., B.Ed.',
        gender: 'Female',
        role: 'TEACHER',
        ctClass: '1',
        pass: 'Sarita@C#',
        teachingClasses: ['1', '2', '3', '4', '5'],
        teachingSubjects: ['EVS', 'Mathematics', 'Hindi', 'English', 'General Knowledge']
      },
      {
        name: 'Durga',
        email: 'durga@school.local',
        empId: 'EMP-T005',
        mobile: '+91 98000 00005',
        qual: 'M.A., B.Ed.',
        gender: 'Female',
        role: 'TEACHER',
        ctClass: '2',
        pass: 'Durga@123',
        teachingClasses: ['1', '2', '3', '4', '6', '7'],
        teachingSubjects: ['Hindi', 'General Knowledge']
      },
      {
        name: 'Pawan',
        email: 'pawan@school.local',
        empId: 'EMP-T006',
        mobile: '+91 98000 00006',
        qual: 'B.Tech (CS), MCA',
        gender: 'Male',
        role: 'TEACHER',
        ctClass: '3',
        pass: 'Pawan@123',
        teachingClasses: ['1', '2', '3', '4', '5', '6', '7'],
        teachingSubjects: ['Computer', 'Science']
      },
      {
        name: 'Vanshika',
        email: 'vanshika@school.local',
        empId: 'EMP-T007',
        mobile: '+91 98000 00007',
        qual: 'B.sc., M.Sc.',
        gender: 'Female',
        role: 'TEACHER',
        ctClass: '4',
        pass: 'Vanshika@C#',
        teachingClasses: ['3', '4', '5', '6', '7'],
        teachingSubjects: ['English', 'EVS', 'Social Science', 'General Knowledge']
      },
      {
        name: 'Chanchal',
        email: 'chanchal@school.local',
        empId: 'EMP-T008',
        mobile: '+91 98000 00008',
        qual: 'M.Sc. (Math), B.Ed.',
        gender: 'Female',
        role: 'TEACHER',
        ctClass: '5',
        pass: 'Chanchal@123',
        teachingClasses: ['3', '4', '5', '6', '7'],
        teachingSubjects: ['Mathematics', 'Sanskrit', 'General Knowledge']
      },
      {
        name: 'Kavita',
        email: 'kavita@school.local',
        empId: 'EMP-T009',
        mobile: '+91 98000 00009',
        qual: 'M.A. (English), B.Ed.',
        gender: 'Female',
        role: 'TEACHER',
        ctClass: '6',
        pass: 'Kavita@123',
        teachingClasses: ['4', '6', '7'],
        teachingSubjects: ['English', 'Science']
      },
      {
        name: 'Megha',
        email: 'pk621913@gmail.com',
        empId: 'EMP-P001',
        mobile: '+91 82270 31017',
        qual: 'M.A., B.Ed., M.Ed.',
        gender: 'Female',
        role: 'PRINCIPAL',
        ctClass: '7',
        pass: 'Megha@C#',
        teachingClasses: ['1', '2', '5', '6', '7'],
        teachingSubjects: ['English', 'Hindi', 'Sanskrit']
      }
    ];

    const teacherMap = {};

    for (const f of realFaculty) {
      let userDoc = await User.findOne({
        $or: [ { email: f.email.toLowerCase() }, { name: { $regex: new RegExp('^' + f.name + '$', 'i') } } ]
      });

      const passHash = await bcrypt.hash(f.pass, salt);

      const classIds = (f.teachingClasses || []).map(cName => classMap[cName]?._id).filter(Boolean);
      const subjectIds = (f.teachingSubjects || []).map(sName => {
        return subMap[sName.toUpperCase()]?._id;
      }).filter(Boolean);

      if (!userDoc) {
        userDoc = await User.create({
          name: f.name,
          email: f.email.toLowerCase(),
          passwordHash: passHash,
          generatedPassword: f.pass,
          role: f.role,
          employeeId: f.empId,
          mobile: f.mobile,
          gender: f.gender,
          qualification: f.qual,
          joiningDate: new Date('2024-04-01'),
          classes: classIds,
          subjects: subjectIds,
          assignedClasses: classIds,
          assignedSubjects: subjectIds,
          status: 'active',
          mustChangePassword: false
        });
      } else {
        userDoc.role = f.role;
        userDoc.employeeId = f.empId;
        userDoc.classes = classIds;
        userDoc.subjects = subjectIds;
        userDoc.assignedClasses = classIds;
        userDoc.assignedSubjects = subjectIds;
        userDoc.status = 'active';
        await userDoc.save();
      }

      teacherMap[f.name.toUpperCase()] = userDoc;

      if (f.ctClass && classMap[f.ctClass]) {
        const targetClass = classMap[f.ctClass];
        targetClass.classTeacher = userDoc._id;
        targetClass.attendanceTeacher = userDoc._id;
        await targetClass.save();
      }
    }

    // 6. Timetables (Official NVP Timetable)
    const classSchedulesRaw = {
      PG: [
        { pNum: 1, sub: 'Oral', teacher: 'Priti' },
        { pNum: 2, sub: 'English', teacher: 'Priti' },
        { pNum: 3, sub: 'Hindi', teacher: 'Priti' },
        { pNum: 4, sub: 'Hindi', teacher: 'Priti' },
        { pNum: 5, isBreak: true },
        { pNum: 6, sub: 'Games & Activity', teacher: 'Priti' },
        { pNum: 7, sub: 'Mathematics', teacher: 'Priti' },
        { pNum: 8, sub: 'Mathematics', teacher: 'Priti' },
        { pNum: 9, sub: 'Diary & Rhymes', teacher: 'Priti' }
      ],
      LKG: [
        { pNum: 1, sub: 'Hindi', teacher: 'Lalita' },
        { pNum: 2, sub: 'Hindi', teacher: 'Lalita' },
        { pNum: 3, sub: 'Mathematics', teacher: 'Lalita' },
        { pNum: 4, sub: 'Mathematics', teacher: 'Lalita' },
        { pNum: 5, isBreak: true },
        { pNum: 6, sub: 'English', teacher: 'Lalita' },
        { pNum: 7, sub: 'General Knowledge', teacher: 'Lalita' },
        { pNum: 8, sub: 'Diary & Rhymes', teacher: 'Lalita' },
        { pNum: 9, sub: 'Oral', teacher: 'Lalita' }
      ],
      UKG: [ 
        { pNum: 1, sub: 'Mathematics', teacher: 'Priya' },
        { pNum: 2, sub: 'Mathematics', teacher: 'Priya' },
        { pNum: 3, sub: 'General Knowledge', teacher: 'Priya' },
        { pNum: 4, sub: 'Hindi', teacher: 'Priya' },
        { pNum: 5, isBreak: true },
        { pNum: 6, sub: 'English', teacher: 'Priya' },
        { pNum: 7, sub: 'English', teacher: 'Priya' },
        { pNum: 8, sub: 'Oral', teacher: 'Priya' },
        { pNum: 9, sub: 'Diary & Rhymes', teacher: 'Priya' }
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

    const daysOfweek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

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
            roomNo: 'Class ' + cName
          };
        }

        const subDoc = subMap[item.sub.toUpperCase()] || subMap['GK'];
        const teachDoc = teacherMap[item.teacher.toUpperCase()];

        return{
          periodNumber: pTime.periodNumber,
          periodTitle: pTime.periodTitle,
          isBreak: false,
          startTime: pTime.startTime,
          endTime: pTime.endTime,
          subject: subDoc?._id,
          subjectName: item.sub,
          teacher: teachDoc?._id,
          teacherName: teachDoc?.name || item.teacher,
          roomNo: 'Class ' + cName
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
          className: 'Class ' + cls.name,
          section: cls.section || 'A',
          academicYear: '2026-2027',
          schedule: weeklySchedule
        },
        { upsert: true, new: true }
      );
    }

    // 7. Import 93 Official Real Students
    await importOfficialStudents();

    // 8. Synchronize Class Student Counts
    for (const cName of classNames) {
      const cls = classMap[cName];
      if (cls) {
        const cnt = await Student.countDocuments({ class: cls._id, status: 'active' });
        cls.studentCount = cnt;
        await cls.save();
      }
    }

    console.log('[System Init] NVP School Database State Synchronized Successfully (10 Classes, 10 Teachers, 10 Timetables, 93 Students).');
  } catch (error) {
    console.error('[System Init Error]:', error.message);
  }
};

module.exports = seedInitialData;
