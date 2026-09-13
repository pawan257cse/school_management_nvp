require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
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
const Student = require('../models/Student');
const Timetable = require('../models/Timetable');

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

async function seedAll() {
  await connectDB();
  console.log('=== SEEDING FULL NVP SCHOOL DATA (CLASSES, TEACHERS, PRINCIPAL, STUDENTS, TIMETABLE) ===');

  const salt = await bcrypt.genSalt(10);

  // 1. Clean up unused classes (Nursery, 8, 9, 10, etc.)
  const delClassesRes = await Class.deleteMany({ name: { $nin: ['PG', 'LKG', 'UKG', '1', '2', '3', '4', '5', '6', '7'] } });
  console.log(`Removed non-standard classes count: ${delClassesRes.deletedCount}`);

  // 2. Standard Subjects
  const subjectsConfig = [
    { name: 'English', code: 'ENG' },
    { name: 'Hindi', code: 'HIN' },
    { name: 'Hindi Grammar', code: 'HING' },
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
    { name: 'Activity / Self Study', code: 'ACT' }
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
  const allSubjectIds = Object.values(subjectMap).map(s => s._id);

  // 3. Ensure 10 Active Classes (PG, LKG, UKG, 1, 2, 3, 4, 5, 6, 7)
  const classNames = ['PG', 'LKG', 'UKG', '1', '2', '3', '4', '5', '6', '7'];
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
    } else {
      cls.subjects = allSubjectIds;
      cls.status = 'active';
      await cls.save();
    }
    classMap[name] = cls;
  }
  console.log(`10 Active classes verified.`);

  // 4. Head User
  let headUser = await User.findOne({ email: 'head@school.local' });
  const headPass = 'Head@12345';
  const headHash = await bcrypt.hash(headPass, salt);
  if (!headUser) {
    headUser = await User.create({
      name: 'Pawan (Head Administrator)',
      email: 'head@school.local',
      passwordHash: headHash,
      generatedPassword: headPass,
      role: 'HEAD',
      mobile: '+91 98290 00000',
      status: 'active',
      mustChangePassword: false
    });
    console.log('Created Head Administrator: head@school.local');
  } else {
    headUser.generatedPassword = headPass;
    headUser.passwordHash = headHash;
    await headUser.save();
    console.log('Updated Head Administrator: head@school.local');
  }

  // 5. Principal User (Megha, pk621913@gmail.com)
  let principalUser = await User.findOne({ email: 'pk621913@gmail.com' });
  const princPass = 'Megha@123';
  const princHash = await bcrypt.hash(princPass, salt);
  if (!principalUser) {
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
      status: 'active',
      mustChangePassword: false
    });
    console.log('Created Principal: Megha (pk621913@gmail.com)');
  } else {
    principalUser.name = 'Megha';
    principalUser.role = 'PRINCIPAL';
    principalUser.generatedPassword = princPass;
    principalUser.passwordHash = princHash;
    principalUser.mobile = '+91 82270 31017';
    principalUser.status = 'active';
    await principalUser.save();
    console.log('Updated Principal: Megha (pk621913@gmail.com)');
  }

  // 6. 10 Teachers
  const teacherDefs = [
    { name: 'Priti', email: 'priti@nvpschool.edu.in', phone: '+91 98290 11001', empId: 'EMP-T101', classTeacherOf: ['PG'], classesTaught: ['PG'], subjectsTaught: ['English', 'Hindi', 'Mathematics', 'Oral', 'Games & Activity', 'Diary & Rhymes'] },
    { name: 'Lalita', email: 'lalita@nvpschool.edu.in', phone: '+91 98290 11002', empId: 'EMP-T102', classTeacherOf: ['LKG'], classesTaught: ['LKG'], subjectsTaught: ['Hindi', 'Mathematics', 'English', 'General Knowledge', 'Diary & Rhymes', 'Oral'] },
    { name: 'Priya', email: 'priya@nvpschool.edu.in', phone: '+91 98290 11003', empId: 'EMP-T103', classTeacherOf: ['UKG'], classesTaught: ['UKG'], subjectsTaught: ['Mathematics', 'General Knowledge', 'Hindi', 'English', 'Oral', 'Diary & Rhymes'] },
    { name: 'Sarita', email: 'sarita@nvpschool.edu.in', phone: '+91 98290 11004', empId: 'EMP-T104', classTeacherOf: ['1'], classesTaught: ['1', '2', '3', '4', '5'], subjectsTaught: ['EVS', 'Mathematics', 'Hindi', 'General Knowledge', 'Games & Activity'] },
    { name: 'Durga', email: 'durga@nvpschool.edu.in', phone: '+91 98290 11005', empId: 'EMP-T105', classTeacherOf: ['2'], classesTaught: ['1', '2', '3', '4', '6', '7'], subjectsTaught: ['Hindi', 'General Knowledge'] },
    { name: 'Pawan', email: 'pawan@nvpschool.edu.in', phone: '+91 98290 11006', empId: 'EMP-T106', classTeacherOf: ['3'], classesTaught: ['1', '2', '3', '4', '5', '6', '7'], subjectsTaught: ['Computer', 'Games & Activity', 'Science'] },
    { name: 'Vanshika', email: 'vanshika@nvpschool.edu.in', phone: '+91 98290 11007', empId: 'EMP-T107', classTeacherOf: ['4'], classesTaught: ['3', '4', '5', '6', '7'], subjectsTaught: ['EVS', 'English', 'Social Science', 'General Knowledge'] },
    { name: 'Megha', email: 'megha.teacher@nvpschool.edu.in', phone: '+91 98290 11008', empId: 'EMP-T108', classTeacherOf: ['5'], classesTaught: ['1', '2', '5', '6'], subjectsTaught: ['English', 'Hindi Grammar', 'Sanskrit'] },
    { name: 'Kavita', email: 'kavita@nvpschool.edu.in', phone: '+91 98290 11009', empId: 'EMP-T109', classTeacherOf: ['6'], classesTaught: ['4', '6', '7'], subjectsTaught: ['English', 'Science'] },
    { name: 'Chanchal', email: 'chanchal@nvpschool.edu.in', phone: '+91 98290 11010', empId: 'EMP-T110', classTeacherOf: ['7'], classesTaught: ['3', '4', '5', '6', '7'], subjectsTaught: ['Mathematics', 'General Knowledge'] }
  ];

  const teacherMap = {};
  for (const t of teacherDefs) {
    const defaultPassword = `${t.name}@12345`;
    const passwordHash = await bcrypt.hash(defaultPassword, salt);
    const assignedClassIds = t.classesTaught.map(cName => classMap[cName]?._id).filter(Boolean);
    const assignedSubjectIds = t.subjectsTaught.map(sName => {
      const found = Object.values(subjectMap).find(s => s.name.toUpperCase() === sName.toUpperCase());
      return found?._id;
    }).filter(Boolean);

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
        assignedSubjects: assignedSubjectIds,
        mustChangePassword: false,
        status: 'active'
      });
      console.log(`Created Teacher: ${t.name} (${t.email})`);
    } else {
      user.name = t.name;
      user.role = 'TEACHER';
      user.assignedClasses = assignedClassIds;
      user.assignedSubjects = assignedSubjectIds;
      user.generatedPassword = defaultPassword;
      user.passwordHash = passwordHash;
      user.status = 'active';
      await user.save();
      console.log(`Updated Teacher: ${t.name} (${t.email})`);
    }

    teacherMap[t.name.toUpperCase()] = user;

    // Assign Class Teacher to corresponding Class
    for (const cName of t.classTeacherOf) {
      const cls = classMap[cName];
      if (cls) {
        cls.classTeacher = user._id;
        await cls.save();
        console.log(`  -> Class Teacher of Class ${cName}: ${t.name}`);
      }
    }
  }

  // 7. Official Timetable Setup
  const findSubjectDoc = (str) => {
    if (!str || str === '-') return subjectMap['ACTIVITY / SELF STUDY'] || subjectMap['EVS'];
    const upper = str.toUpperCase();
    if (upper.includes('HINDI GRAM')) return subjectMap['HINDI GRAMMAR'] || subjectMap['HIN'];
    if (upper.includes('HINDI')) return subjectMap['HINDI'] || subjectMap['HIN'];
    if (upper.includes('MATH')) return subjectMap['MATHEMATICS'] || subjectMap['MATH'];
    if (upper.includes('ENG')) return subjectMap['ENGLISH'] || subjectMap['ENG'];
    if (upper.includes('EVS')) return subjectMap['EVS'];
    if (upper.includes('S.S.T') || upper.includes('SST') || upper.includes('SOCIAL')) return subjectMap['SOCIAL SCIENCE'] || subjectMap['SST'];
    if (upper.includes('SCI')) return subjectMap['SCIENCE'] || subjectMap['SCI'];
    if (upper.includes('COM')) return subjectMap['COMPUTER'] || subjectMap['CS'];
    if (upper.includes('SAN') || upper.includes('SANSKRIT')) return subjectMap['SANSKRIT'] || subjectMap['SKT'];
    if (upper.includes('GK') || upper.includes('G.K')) return subjectMap['GENERAL KNOWLEDGE'] || subjectMap['GK'];
    if (upper.includes('ORAL')) return subjectMap['ORAL'] || subjectMap['ENG'];
    if (upper.includes('GAME')) return subjectMap['GAMES & ACTIVITY'] || subjectMap['GAME'];
    if (upper.includes('DIARY')) return subjectMap['DIARY & RHYMES'] || subjectMap['DIARY'];
    return subjectMap['GENERAL KNOWLEDGE'] || allSubjectIds[0];
  };

  const findTeacherDoc = (name) => {
    if (!name || name === '-') return null;
    return teacherMap[name.toUpperCase()] || null;
  };

  const classSchedulesFromPdf = {
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
      { pNum: 8, sub: 'Activity / Self Study', teacher: null },
      { pNum: 9, sub: 'General Knowledge', teacher: 'Durga' }
    ],
    '2': [
      { pNum: 1, sub: 'Hindi', teacher: 'Durga' },
      { pNum: 2, sub: 'EVS', teacher: 'Sarita' },
      { pNum: 3, sub: 'Computer', teacher: 'Pawan' },
      { pNum: 4, sub: 'English', teacher: 'Megha' },
      { pNum: 5, isBreak: true },
      { pNum: 6, sub: 'Activity / Self Study', teacher: null },
      { pNum: 7, sub: 'Hindi', teacher: 'Durga' },
      { pNum: 8, sub: 'Mathematics', teacher: 'Sarita' },
      { pNum: 9, sub: 'Games & Activity', teacher: 'Sarita' }
    ],
    '3': [
      { pNum: 1, sub: 'Computer', teacher: 'Pawan' },
      { pNum: 2, sub: 'Activity / Self Study', teacher: null },
      { pNum: 3, sub: 'EVS', teacher: 'Sarita' },
      { pNum: 4, sub: 'Hindi', teacher: 'Durga' },
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
      { pNum: 7, sub: 'Activity / Self Study', teacher: null },
      { pNum: 8, sub: 'Hindi', teacher: 'Durga' },
      { pNum: 9, sub: 'Activity / Self Study', teacher: null }
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
      { pNum: 9, sub: 'Activity / Self Study', teacher: null }
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
      { pNum: 8, sub: 'Mathematics', teacher: 'Chanchal' },
      { pNum: 9, sub: 'Computer', teacher: 'Pawan' }
    ]
  };

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  for (const [cName, rawPeriods] of Object.entries(classSchedulesFromPdf)) {
    const cls = classMap[cName];
    if (!cls) continue;

    const formattedPeriods = rawPeriods.map((item, idx) => {
      const pTime = periodTimes[idx];
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
        subject: subDoc?._id || null,
        subjectName: subDoc?.name || item.sub,
        teacher: teachDoc?._id || null,
        teacherName: teachDoc?.name || (item.teacher === null ? 'Self Study' : item.teacher),
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
    console.log(`Timetable synchronized for Class ${cName}`);
  }

  // 8. Seed Sample Students for all 10 Classes
  console.log('Seeding Sample Students for all 10 classes...');

  const studentNamesByClass = {
    PG: [
      { name: 'Aarav Sharma', gender: 'Male', father: 'Ramesh Sharma', mother: 'Sunita Sharma' },
      { name: 'Ananya Gupta', gender: 'Female', father: 'Vikas Gupta', mother: 'Pooja Gupta' },
      { name: 'Vihaan Verma', gender: 'Male', father: 'Sanjay Verma', mother: 'Rekha Verma' },
      { name: 'Myra Choudhary', gender: 'Female', father: 'Mukesh Choudhary', mother: 'Manju Choudhary' }
    ],
    LKG: [
      { name: 'Reyansh Singh', gender: 'Male', father: 'Mahendra Singh', mother: 'Kavita Singh' },
      { name: 'Aadhya Joshi', gender: 'Female', father: 'Dinesh Joshi', mother: 'Mamta Joshi' },
      { name: 'Kabir Rathore', gender: 'Male', father: 'Surendra Rathore', mother: 'Sharda Rathore' },
      { name: 'Prisha Meena', gender: 'Female', father: 'Rajesh Meena', mother: 'Anita Meena' }
    ],
    UKG: [
      { name: 'Atharv Soni', gender: 'Male', father: 'Prakash Soni', mother: 'Lata Soni' },
      { name: 'Saanvi Pareek', gender: 'Female', father: 'Gopal Pareek', mother: 'Suman Pareek' },
      { name: 'Rudra Jangid', gender: 'Male', father: 'Kailash Jangid', mother: 'Geeta Jangid' },
      { name: 'Kiara Sen', gender: 'Female', father: 'Naresh Sen', mother: 'Santosh Sen' }
    ],
    '1': [
      { name: 'Daksh Agarwal', gender: 'Male', father: 'Suresh Agarwal', mother: 'Kiran Agarwal' },
      { name: 'Navya Khandelwal', gender: 'Female', father: 'Hemant Khandelwal', mother: 'Asha Khandelwal' },
      { name: 'Advik Sharma', gender: 'Male', father: 'Ashok Sharma', mother: 'Pushpa Sharma' },
      { name: 'Diya Kumawat', gender: 'Female', father: 'Bhanwar Kumawat', mother: 'Chanda Kumawat' }
    ],
    '2': [
      { name: 'Ishaan Prajapat', gender: 'Male', father: 'Gordhan Prajapat', mother: 'Sita Prajapat' },
      { name: 'Avni Tiwari', gender: 'Female', father: 'Brijmohan Tiwari', mother: 'Radha Tiwari' },
      { name: 'Shaurya Shekhawat', gender: 'Male', father: 'Gajendra Shekhawat', mother: 'Kiran Shekhawat' },
      { name: 'Anika Solanki', gender: 'Female', father: 'Mohan Solanki', mother: 'Urmila Solanki' }
    ],
    '3': [
      { name: 'Devansh Bhati', gender: 'Male', father: 'Bhagwan Bhati', mother: 'Prem Bhati' },
      { name: 'Ira Mathur', gender: 'Female', father: 'Alok Mathur', mother: 'Ritu Mathur' },
      { name: 'Kushagra Saini', gender: 'Male', father: 'Madan Saini', mother: 'Kamla Saini' },
      { name: 'Tanvi Chauhan', gender: 'Female', father: 'Devendra Chauhan', mother: 'Saroj Chauhan' }
    ],
    '4': [
      { name: 'Ayush Bishnoi', gender: 'Male', father: 'Ramchandra Bishnoi', mother: 'Vidya Bishnoi' },
      { name: 'Pari Dadhich', gender: 'Female', father: 'Shyam Dadhich', mother: 'Gayatri Dadhich' },
      { name: 'Manan Tailor', gender: 'Male', father: 'Govind Tailor', mother: 'Koshlya Tailor' },
      { name: 'Mishti Purohit', gender: 'Female', father: 'Narendra Purohit', mother: 'Bhagwati Purohit' }
    ],
    '5': [
      { name: 'Harshvardhan Rao', gender: 'Male', father: 'Prabhu Rao', mother: 'Sushila Rao' },
      { name: 'Bhavya Gaur', gender: 'Female', father: 'Kishore Gaur', mother: 'Usha Gaur' },
      { name: 'Tejas Sankhla', gender: 'Male', father: 'Om Prakash Sankhla', mother: 'Laxmi Sankhla' },
      { name: 'Vanshika Kaswan', gender: 'Female', father: 'Rakesh Kaswan', mother: 'Sudha Kaswan' }
    ],
    '6': [
      { name: 'Yuvraj Godara', gender: 'Male', father: 'Hanuman Godara', mother: 'Tulsi Godara' },
      { name: 'Khushi Jakhar', gender: 'Female', father: 'Subhash Jakhar', mother: 'Sarita Jakhar' },
      { name: 'Dhruv Saran', gender: 'Male', father: 'Moolchand Saran', mother: 'Maina Saran' },
      { name: 'Sneha Dhaka', gender: 'Female', father: 'Brijlal Dhaka', mother: 'Bimla Dhaka' }
    ],
    '7': [
      { name: 'Abhimanyu Choudhary', gender: 'Male', father: 'Pabu Ram Choudhary', mother: 'Mohini Choudhary' },
      { name: 'Kavya Punia', gender: 'Female', father: 'Bhanwar Lal Punia', mother: 'Sayar Punia' },
      { name: 'Lakshya Beniwal', gender: 'Male', father: 'Kishan Beniwal', mother: 'Draupadi Beniwal' },
      { name: 'Riya Mehriya', gender: 'Female', father: 'Ramu Ram Mehriya', mother: 'Jethi Mehriya' }
    ]
  };

  let studentSeq = 100;

  for (const [cName, list] of Object.entries(studentNamesByClass)) {
    const cls = classMap[cName];
    if (!cls) continue;

    let roll = 1;
    for (const item of list) {
      studentSeq++;
      const admNo = `NVP-2026-${studentSeq}`;

      let student = await Student.findOne({ admissionNo: admNo });
      if (!student) {
        student = await Student.create({
          admissionNo: admNo,
          rollNo: String(roll),
          class: cls._id,
          section: 'A',
          academicYear: '2026-2027',
          name: item.name,
          gender: item.gender,
          dob: new Date('2015-05-15'),
          fatherName: item.father,
          fatherPhone: `+91 98290 ${studentSeq}1`,
          motherName: item.mother,
          motherPhone: `+91 98290 ${studentSeq}2`,
          contactNumber: `+91 98290 ${studentSeq}1`,
          address: 'Main Bazaar, Nimbi Jodhan',
          city: 'Nimbi Jodhan',
          state: 'Rajasthan',
          pincode: '341316',
          status: 'active'
        });
      }

      // Create matching student portal User account
      const studentEmail = `${admNo.toLowerCase().replace(/[^a-z0-9]/g, '')}@school.local`;
      const studentPass = `${item.name.split(' ')[0]}@123`;
      const studentHash = await bcrypt.hash(studentPass, salt);

      let studentUser = await User.findOne({ email: studentEmail });
      if (!studentUser) {
        studentUser = await User.create({
          name: item.name,
          email: studentEmail,
          passwordHash: studentHash,
          generatedPassword: studentPass,
          role: 'STUDENT',
          admissionNo: admNo,
          studentRef: student._id,
          studentClass: cls._id,
          gender: item.gender,
          status: 'active',
          mustChangePassword: false
        });
      } else {
        studentUser.generatedPassword = studentPass;
        studentUser.studentRef = student._id;
        studentUser.studentClass = cls._id;
        studentUser.passwordHash = studentHash;
        await studentUser.save();
      }

      roll++;
    }

    // Update studentCount on Class
    cls.studentCount = list.length * 7; // approximate batch count (e.g. 28)
    await cls.save();
    console.log(`Seeded ${list.length} students + portal accounts for Class ${cName}`);
  }

  const totalUsers = await User.countDocuments();
  const totalStudents = await Student.countDocuments();
  const totalTimetables = await Timetable.countDocuments();

  console.log('\n====================================================');
  console.log('  NVP PORTAL DATA SEEDING COMPLETE!                 ');
  console.log(`  Total Portal Users in DB : ${totalUsers}`);
  console.log(`  Total Active Students    : ${totalStudents}`);
  console.log(`  Total Classes Configured : ${classNames.length} (PG to 7)`);
  console.log(`  Total Timetables Active  : ${totalTimetables}`);
  console.log('====================================================\n');

  process.exit(0);
}

seedAll().catch(err => {
  console.error('Fatal seed error:', err);
  process.exit(1);
});
