const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Class = require('../models/Class');
const Subject = require('../models/Subject');
const Setting = require('../models/Setting');
const Timetable = require('../models/Timetable');

/**
 * Non-Destructive System Initializer:
 * - SAFE: Never deletes existing classes, teachers, subjects, or timetables.
 * - SAFE: Never overwrites live customizations made by Head Administrator, Principal, or Teachers.
 * - Only seeds initial records if the database or record is missing.
 */
const seedInitialData = async () => {
  try {
    console.log('[System Init] Checking database state (Safe Non-Destructive Mode)...');

    // 1. Standard Subjects (Insert only if missing, never overwrite existing)
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

    for (const s of standardSubjectsDef) {
      const exists = await Subject.findOne({ name: { $regex: new RegExp(`^${s.name}$`, 'i') } });
      if (!exists) {
        await Subject.create({ name: s.name, code: s.code, status: 'active' });
      }
    }

    const allSubjectDocs = await Subject.find({ status: 'active' });
    const allSubjectIds = allSubjectDocs.map(s => s._id);
    const subMap = {};
    allSubjectDocs.forEach(s => {
      subMap[s.name.toUpperCase()] = s;
      subMap[s.code.toUpperCase()] = s;
    });

    // 2. Standard Classes (Insert only if missing, NEVER delete or overwrite existing classes)
    const standardClassNames = ['PG', 'LKG', 'UKG', '1', '2', '3', '4', '5', '6', '7'];
    for (const name of standardClassNames) {
      const clsExists = await Class.findOne({ name, section: 'A' });
      if (!clsExists) {
        await Class.create({
          name,
          section: 'A',
          subjects: allSubjectIds,
          studentCount: 0,
          status: 'active'
        });
      }
    }

    // 3. Ensure Default School Setting (Only if missing)
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

    // 4. Head Administrator (Only if missing)
    let headDoc = await User.findOne({ role: 'HEAD' });
    if (!headDoc) {
      const salt = await bcrypt.genSalt(10);
      const headPasswordHash = await bcrypt.hash('Head@12345', salt);
      headDoc = await User.create({
        name: 'Head Administrator',
        email: (process.env.HEAD_EMAIL || 'head@school.local').toLowerCase().trim(),
        passwordHash: headPasswordHash,
        generatedPassword: 'Head@12345',
        role: 'HEAD',
        mobile: '+91 98290 00000',
        employeeId: 'EMP-HEAD',
        gender: 'Male',
        qualification: 'Director / Management',
        joiningDate: new Date(),
        status: 'active'
      });
      console.log('[System Init] Head Administrator created');
    }

    // 5. Faculty / Teachers (Create only if missing; never overwrite modified live profiles)
    const realFacultyDef = [
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
        pass: 'Sarita@123',
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
        qual: 'B.Sc., M.Sc.',
        gender: 'Female',
        role: 'TEACHER',
        ctClass: '4',
        pass: 'Vanshika@123',
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
        pass: 'Megha@123',
        teachingClasses: ['1', '2', '5', '6', '7'],
        teachingSubjects: ['English', 'Hindi', 'Sanskrit']
      }
    ];

    for (const f of realFacultyDef) {
      let userDoc = await User.findOne({
        $or: [
          { email: f.email.toLowerCase() },
          { name: { $regex: new RegExp(`^${f.name}$`, 'i') } }
        ]
      });

      if (!userDoc) {
        const salt = await bcrypt.genSalt(10);
        const passHash = await bcrypt.hash(f.pass, salt);

        const assignedSubjectIds = f.teachingSubjects
          .map(subName => subMap[subName.toUpperCase()]?._id)
          .filter(Boolean);

        const assignedClasses = await Class.find({ name: { $in: f.teachingClasses } });
        const assignedClassIds = assignedClasses.map(c => c._id);

        const ctClassDoc = await Class.findOne({ name: f.ctClass });
        if (ctClassDoc && !assignedClassIds.some(id => id.toString() === ctClassDoc._id.toString())) {
          assignedClassIds.push(ctClassDoc._id);
        }

        userDoc = await User.create({
          name: f.name,
          email: f.email.toLowerCase(),
          passwordHash: passHash,
          generatedPassword: f.pass,
          role: f.role,
          mobile: f.mobile,
          employeeId: f.empId,
          gender: f.gender,
          qualification: f.qual,
          status: 'active',
          assignedClasses: assignedClassIds,
          assignedSubjects: assignedSubjectIds,
          attendanceClasses: ctClassDoc ? [ctClassDoc._id] : []
        });

        // Link Class Teacher if class didn't have one
        if (ctClassDoc && !ctClassDoc.classTeacher) {
          ctClassDoc.classTeacher = userDoc._id;
          ctClassDoc.attendanceTeacher = userDoc._id;
          await ctClassDoc.save();
        }
      }
    }

    // 6. Timetable Setup (Only insert default if class has NO timetable at all)
    const activeClasses = await Class.find({ status: 'active' });
    for (const cls of activeClasses) {
      const existingTT = await Timetable.findOne({ class: cls._id });
      if (!existingTT) {
        // Create initial default empty timetable structure for this class
        const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const emptySchedule = daysOfWeek.map(day => ({
          day,
          periods: []
        }));

        await Timetable.create({
          class: cls._id,
          className: `Class ${cls.name}`,
          section: cls.section || 'A',
          academicYear: '2026-2027',
          schedule: emptySchedule
        });
        console.log(`[System Init] Initialized empty timetable placeholder for Class ${cls.name}`);
      }
    }

    console.log('[System Init] System verification completed (All existing data preserved 100%).');
  } catch (error) {
    console.error('[System Init Error]:', error.message);
  }
};

module.exports = seedInitialData;
