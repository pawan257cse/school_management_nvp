require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dns = require('dns');

try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {}

const connectDB = require('../config/db');
const User = require('../models/User');
const Class = require('../models/Class');
const Subject = require('../models/Subject');
const Timetable = require('../models/Timetable');

const periodTimes = [
  { periodNumber: 1, startTime: '08:30 AM', endTime: '09:10 AM', periodTitle: 'Period 1' },
  { periodNumber: 2, startTime: '09:10 AM', endTime: '09:50 AM', periodTitle: 'Period 2' },
  { periodNumber: 3, startTime: '09:50 AM', endTime: '10:30 AM', periodTitle: 'Period 3' },
  { periodNumber: 4, startTime: '10:30 AM', endTime: '11:10 AM', periodTitle: 'Period 4' },
  { periodNumber: 5, startTime: '11:10 AM', endTime: '11:45 AM', periodTitle: 'Lunch Break', isBreak: true },
  { periodNumber: 6, startTime: '11:45 AM', endTime: '12:25 PM', periodTitle: 'Period 5' },
  { periodNumber: 7, startTime: '12:25 PM', endTime: '01:05 PM', periodTitle: 'Period 6' },
  { periodNumber: 8, startTime: '01:05 PM', endTime: '01:45 PM', periodTitle: 'Period 7' },
  { periodNumber: 9, startTime: '01:45 PM', endTime: '02:25 PM', periodTitle: 'Period 8' },
];

async function setup() {
  await connectDB();
  console.log('--- Setting up NVP School Real Teachers & Timetable ---');

  // 1. Ensure Standard Subjects exist
  const subjectsConfig = [
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
    { name: 'Diary & Rhymes', code: 'DIARY' }
  ];

  const subjectMap = {};
  for (const s of subjectsConfig) {
    let subDoc = await Subject.findOne({ name: s.name });
    if (!subDoc) {
      subDoc = await Subject.create({ name: s.name, code: s.code, status: 'active' });
    }
    subjectMap[s.name.toUpperCase()] = subDoc;
    subjectMap[s.code.toUpperCase()] = subDoc;
  }

  // 2. Ensure Classes exist
  const classNames = ['PG', 'Nursery', 'LKG', 'UKG', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10'];
  const allSubjectIds = Object.values(subjectMap).map(s => s._id);
  const classMap = {};

  for (const name of classNames) {
    let cls = await Class.findOne({ name, section: 'A' });
    if (!cls) {
      cls = await Class.create({
        name,
        section: 'A',
        subjects: allSubjectIds,
        studentCount: 30,
        status: 'active'
      });
    }
    classMap[name] = cls;
  }

  // 3. Define 10 Teachers
  const teacherDefs = [
    { name: 'Priti', email: 'priti@nvpschool.edu.in', phone: '+91 98290 11001', empId: 'EMP-T101', classTeacherOf: ['PG', 'Nursery'], classesTaught: ['PG', 'Nursery'] },
    { name: 'Lalita', email: 'lalita@nvpschool.edu.in', phone: '+91 98290 11002', empId: 'EMP-T102', classTeacherOf: ['LKG'], classesTaught: ['LKG'] },
    { name: 'Priya', email: 'priya@nvpschool.edu.in', phone: '+91 98290 11003', empId: 'EMP-T103', classTeacherOf: ['UKG'], classesTaught: ['UKG'] },
    { name: 'Sarita', email: 'sarita@nvpschool.edu.in', phone: '+91 98290 11004', empId: 'EMP-T104', classTeacherOf: ['1'], classesTaught: ['1', '2', '3', '4', '5'] },
    { name: 'Durga', email: 'durga@nvpschool.edu.in', phone: '+91 98290 11005', empId: 'EMP-T105', classTeacherOf: ['2'], classesTaught: ['1', '2', '3', '4', '6', '7'] },
    { name: 'Pawan', email: 'pawan@nvpschool.edu.in', phone: '+91 98290 11006', empId: 'EMP-T106', classTeacherOf: ['3'], classesTaught: ['1', '2', '3', '4', '5', '6', '7'] },
    { name: 'Vanshika', email: 'vanshika@nvpschool.edu.in', phone: '+91 98290 11007', empId: 'EMP-T107', classTeacherOf: ['4'], classesTaught: ['3', '4', '5', '6', '7'] },
    { name: 'Megha', email: 'megha@nvpschool.edu.in', phone: '+91 98290 11008', empId: 'EMP-T108', classTeacherOf: ['5'], classesTaught: ['1', '2', '5', '6'] },
    { name: 'Kavita', email: 'kavita@nvpschool.edu.in', phone: '+91 98290 11009', empId: 'EMP-T109', classTeacherOf: ['6'], classesTaught: ['4', '6', '7'] },
    { name: 'Chanchal', email: 'chanchal@nvpschool.edu.in', phone: '+91 98290 11010', empId: 'EMP-T110', classTeacherOf: ['7'], classesTaught: ['3', '4', '5', '6', '7'] }
  ];

  const teacherMap = {};
  const salt = await bcrypt.genSalt(10);

  for (const t of teacherDefs) {
    const defaultPassword = `${t.name}@12345`;
    const passwordHash = await bcrypt.hash(defaultPassword, salt);
    const assignedClassIds = t.classesTaught.map(cName => classMap[cName]?._id).filter(Boolean);

    let user = await User.findOne({ email: t.email.toLowerCase() });
    if (!user) {
      user = await User.create({
        name: t.name,
        email: t.email.toLowerCase(),
        passwordHash,
        generatedPassword: defaultPassword,
        role: 'TEACHER',
        mobile: t.phone,
        employeeId: t.empId,
        gender: t.name === 'Pawan' ? 'Male' : 'Female',
        qualification: 'B.Ed / Trained Faculty',
        assignedClasses: assignedClassIds,
        mustChangePassword: true,
        status: 'active'
      });
      console.log(`Created Teacher account: ${t.name} (${t.email})`);
    } else {
      user.name = t.name;
      user.role = 'TEACHER';
      user.assignedClasses = Array.from(new Set([...(user.assignedClasses || []).map(id => id.toString()), ...assignedClassIds.map(id => id.toString())]));
      user.generatedPassword = defaultPassword;
      user.status = 'active';
      await user.save();
      console.log(`Updated Teacher account: ${t.name}`);
    }

    teacherMap[t.name.toUpperCase()] = user;

    // Set Class Teacher for their respective classes (1st Period Teachers)
    for (const cName of t.classTeacherOf) {
      const cls = classMap[cName];
      if (cls) {
        cls.classTeacher = user._id;
        await cls.save();
        console.log(`Assigned Class Teacher: ${t.name} -> Class ${cName}`);
      }
    }
  }

  // Helper to map subject string to Subject Document
  const findSubjectDoc = (str) => {
    const upper = str.toUpperCase();
    if (upper.includes('HINDI')) return subjectMap['HINDI'] || subjectMap['HIN'];
    if (upper.includes('MATH')) return subjectMap['MATHEMATICS'] || subjectMap['MATH'];
    if (upper.includes('ENG')) return subjectMap['ENGLISH'] || subjectMap['ENG'];
    if (upper.includes('EVS')) return subjectMap['EVS'];
    if (upper.includes('S.S.T') || upper.includes('SST')) return subjectMap['SOCIAL SCIENCE'] || subjectMap['SST'];
    if (upper.includes('SCI')) return subjectMap['SCIENCE'] || subjectMap['SCI'];
    if (upper.includes('COM')) return subjectMap['COMPUTER'] || subjectMap['CS'];
    if (upper.includes('SAN') || upper.includes('SANSKRIT')) return subjectMap['SANSKRIT'] || subjectMap['SKT'];
    if (upper.includes('GK') || upper.includes('G.K')) return subjectMap['GENERAL KNOWLEDGE'] || subjectMap['GK'];
    if (upper.includes('ORAL')) return subjectMap['ORAL'] || subjectMap['ENGLISH'];
    if (upper.includes('GAME')) return subjectMap['GAMES & ACTIVITY'] || subjectMap['GAME'];
    if (upper.includes('DIARY')) return subjectMap['DIARY & RHYMES'] || subjectMap['DIARY'];
    return subjectMap['GENERAL KNOWLEDGE'] || allSubjectIds[0];
  };

  // Helper to find teacher
  const findTeacherDoc = (name) => {
    return teacherMap[name.toUpperCase()] || teacherMap['PAWAN'];
  };

  // 4. Raw schedule per class provided by user
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
      { pNum: 9, sub: 'Oral & Diary', teacher: 'Priti' }
    ],
    LKG: [
      { pNum: 1, sub: 'Hindi', teacher: 'Lalita' },
      { pNum: 2, sub: 'Hindi', teacher: 'Lalita' },
      { pNum: 3, sub: 'Mathematics', teacher: 'Lalita' },
      { pNum: 4, sub: 'Mathematics', teacher: 'Lalita' },
      { pNum: 5, isBreak: true },
      { pNum: 6, sub: 'English & GK', teacher: 'Lalita' },
      { pNum: 7, sub: 'English & GK', teacher: 'Lalita' },
      { pNum: 8, sub: 'Diary & Rhymes', teacher: 'Lalita' },
      { pNum: 9, sub: 'Oral', teacher: 'Lalita' }
    ],
    UKG: [
      { pNum: 1, sub: 'Mathematics', teacher: 'Priya' },
      { pNum: 2, sub: 'Mathematics', teacher: 'Priya' },
      { pNum: 3, sub: 'GK & Hindi', teacher: 'Priya' },
      { pNum: 4, sub: 'GK & Hindi', teacher: 'Priya' },
      { pNum: 5, isBreak: true },
      { pNum: 6, sub: 'English', teacher: 'Priya' },
      { pNum: 7, sub: 'English', teacher: 'Priya' },
      { pNum: 8, sub: 'Oral', teacher: 'Priya' },
      { pNum: 9, sub: 'Oral & Diary', teacher: 'Priya' }
    ],
    '1': [
      { pNum: 1, sub: 'EVS', teacher: 'Sarita' },
      { pNum: 2, sub: 'Hindi', teacher: 'Durga' },
      { pNum: 3, sub: 'English', teacher: 'Megha' },
      { pNum: 4, sub: 'Mathematics', teacher: 'Sarita' },
      { pNum: 5, isBreak: true },
      { pNum: 6, sub: 'Computer', teacher: 'Pawan' },
      { pNum: 7, sub: 'Computer & Games', teacher: 'Pawan' },
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
      { pNum: 7, sub: 'Math & GK', teacher: 'Sarita' },
      { pNum: 8, sub: 'Games & Activity', teacher: 'Sarita' },
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
      { pNum: 6, sub: 'GK & English', teacher: 'Sarita' },
      { pNum: 7, sub: 'Mathematics', teacher: 'Chanchal' },
      { pNum: 8, sub: 'Hindi', teacher: 'Durga' },
      { pNum: 9, sub: 'Games & Activity', teacher: 'Sarita' }
    ],
    '5': [
      { pNum: 1, sub: 'Hindi Grammar', teacher: 'Megha' },
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
      { pNum: 8, sub: 'Mathematics & Sanskrit', teacher: 'Chanchal' },
      { pNum: 9, sub: 'Computer & Science', teacher: 'Pawan' }
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

    console.log(`Timetable created & synced for Class ${cName}`);
  }

  console.log('=== SETUP COMPLETED SUCCESSFULLY ===');
  process.exit(0);
}

setup().catch(err => {
  console.error('Fatal setup error:', err);
  process.exit(1);
});
