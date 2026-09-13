const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Class = require('../models/Class');
const Subject = require('../models/Subject');
const QuestionPaper = require('../models/QuestionPaper');
const Assignment = require('../models/Assignment');
const StudyMaterial = require('../models/StudyMaterial');
const Attendance = require('../models/Attendance');
const Result = require('../models/Result');
const Notification = require('../models/Notification');
const Announcement = require('../models/Announcement');
const Setting = require('../models/Setting');
const Student = require('../models/Student');
const Parent = require('../models/Parent');
const Staff = require('../models/Staff');
const Exam = require('../models/Exam');
const { FeeStructure, FeePayment } = require('../models/Fee');
const Promotion = require('../models/Promotion');
const TeacherAttendance = require('../models/TeacherAttendance');
const Transport = require('../models/Transport');
const Timetable = require('../models/Timetable');

const seedInitialData = async () => {
  try {
    let classes = await Class.find();
    let subjects = await Subject.find();
    let classMap = {};
    let subjectMap = {};

    // 1. Initial Users & Classes setup if User count is 0
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      console.log('[Seed] Starting initial demo data seeding (Users, Classes, Subjects)...');

      // Create Default Subjects
      const subjectList = [
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

      subjects = await Subject.insertMany(subjectList);
      subjects.forEach(s => { subjectMap[s.name] = s._id; });

      // Create Default Classes (Nursery to 10)
      const classNames = ['Nursery', 'LKG', 'UKG', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10'];
      const classDocs = classNames.map(name => ({
        name,
        section: 'A',
        subjects: subjects.map(s => s._id),
        studentCount: name === 'Nursery' || name === 'LKG' ? 20 : 35
      }));

      classes = await Class.insertMany(classDocs);
      classes.forEach(c => { classMap[c.name] = c._id; });

      // Default Passwords
      const headPasswordHash = await bcrypt.hash('Head@12345', 10);
      const principalPasswordHash = await bcrypt.hash('Principal@12345', 10);
      const teacherPasswordHash = await bcrypt.hash('Teacher@12345', 10);

      // Create Users
      const teacher1 = await User.create({
        name: 'Mr. Rahul Sharma',
        email: 'teacher@school.local',
        passwordHash: teacherPasswordHash,
        role: 'TEACHER',
        mobile: '+91 98281 11222',
        employeeId: 'EMP-T101',
        gender: 'Male',
        qualification: 'M.Sc. Mathematics, B.Ed.',
        joiningDate: new Date('2022-06-15'),
        assignedClasses: [classMap['6'], classMap['7'], classMap['8']],
        assignedSubjects: [subjectMap['Mathematics'], subjectMap['Science']],
        status: 'active'
      });

      const teacher2 = await User.create({
        name: 'Mrs. Priya Verma',
        email: 'priya.verma@school.local',
        passwordHash: teacherPasswordHash,
        role: 'TEACHER',
        mobile: '+91 98282 33445',
        employeeId: 'EMP-T102',
        gender: 'Female',
        qualification: 'M.A. English, B.Ed.',
        joiningDate: new Date('2023-04-10'),
        assignedClasses: [classMap['7'], classMap['9'], classMap['10']],
        assignedSubjects: [subjectMap['English'], subjectMap['Hindi']],
        status: 'active'
      });

      const principal = await User.create({
        name: 'Dr. Sunita Choudhary',
        email: 'principal@school.local',
        passwordHash: principalPasswordHash,
        role: 'PRINCIPAL',
        mobile: '+91 98290 88990',
        employeeId: 'EMP-P100',
        gender: 'Female',
        qualification: 'Ph.D. Education, M.Ed.',
        joiningDate: new Date('2020-03-01'),
        status: 'active'
      });

      const head = await User.create({
        name: 'Mr. Vikram Singh (Head Admin)',
        email: 'head@school.local',
        passwordHash: headPasswordHash,
        role: 'HEAD',
        mobile: '+91 98290 00000',
        employeeId: 'EMP-H001',
        gender: 'Male',
        qualification: 'M.Tech, Management Director',
        joiningDate: new Date('2018-01-01'),
        status: 'active'
      });

      // Update Class Teachers
      if (classMap['7']) await Class.findByIdAndUpdate(classMap['7'], { classTeacher: teacher1._id });
      if (classMap['9']) await Class.findByIdAndUpdate(classMap['9'], { classTeacher: teacher2._id });

      // Create Sample Notifications & Announcements
      await Notification.create({
        sender: principal._id,
        recipientRole: 'ALL',
        title: 'Staff Meeting Notice',
        message: 'All teaching staff are requested to assemble in the Conference Room at 2:30 PM today.',
        type: 'meeting'
      });

      await Announcement.create({
        title: 'Annual Sports Meet & Science Exhibition 2026',
        message: 'Preparations for the upcoming Inter-School Science Exhibition begin this Friday.',
        priority: 'important',
        audience: 'all',
        startDate: new Date()
      });

      // Default School Settings
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

    // Refresh classes & subjects mapping
    classes = await Class.find();
    classes.forEach(c => { classMap[c.name] = c._id; });

    // 2. Seed Parents & Students if not already seeded
    const studentCount = await Student.countDocuments();
    if (studentCount === 0) {
      console.log('[Seed] Seeding Parents & Students...');

      const parentsData = [
        { name: 'Suresh Kumar Sharma', relation: 'Father', phone: '+91 98291 55661', email: 'suresh.sharma@gmail.com', occupation: 'Business Owner', address: 'Ward No 4, Nimbi Jodhan' },
        { name: 'Rameshwar Lal Patel', relation: 'Father', phone: '+91 98291 77882', email: 'rameshwar.p@gmail.com', occupation: 'Civil Engineer', address: 'Station Road, Ladnun' },
        { name: 'Sunita Devi Rathore', relation: 'Mother', phone: '+91 98292 11223', email: 'sunita.rathore@outlook.com', occupation: 'School Lecturer', address: 'Near Jain Mandir, Ladnun' },
        { name: 'Mahesh Verma', relation: 'Father', phone: '+91 98293 44556', email: 'mahesh.verma@yahoo.com', occupation: 'Bank Branch Officer', address: 'Main Market, Nimbi Jodhan' },
        { name: 'Rajendra Singh Shekhawat', relation: 'Father', phone: '+91 98294 66778', email: 'rajendra.singh@gmail.com', occupation: 'Defence Veteran', address: 'Rajput Colony, Nimbi Jodhan' }
      ];

      const createdParents = await Parent.insertMany(parentsData);

      const sampleStudents = [
        { admissionNo: 'NVP-2026-001', rollNo: '1', name: 'Aarav Sharma', gender: 'Male', class: classMap['6'] || classes[0]._id, section: 'A', parent: createdParents[0]._id, guardianName: 'Suresh Kumar Sharma', contactNumber: '+91 98291 55661', status: 'active', bloodGroup: 'B+' },
        { admissionNo: 'NVP-2026-002', rollNo: '2', name: 'Ananya Patel', gender: 'Female', class: classMap['6'] || classes[0]._id, section: 'A', parent: createdParents[1]._id, guardianName: 'Rameshwar Lal Patel', contactNumber: '+91 98291 77882', status: 'active', bloodGroup: 'O+' },
        { admissionNo: 'NVP-2026-003', rollNo: '1', name: 'Devansh Rathore', gender: 'Male', class: classMap['7'] || classes[0]._id, section: 'A', parent: createdParents[2]._id, guardianName: 'Sunita Devi Rathore', contactNumber: '+91 98292 11223', status: 'active', bloodGroup: 'A+' },
        { admissionNo: 'NVP-2026-004', rollNo: '2', name: 'Ishita Verma', gender: 'Female', class: classMap['7'] || classes[0]._id, section: 'A', parent: createdParents[3]._id, guardianName: 'Mahesh Verma', contactNumber: '+91 98293 44556', status: 'active', bloodGroup: 'AB+' },
        { admissionNo: 'NVP-2026-005', rollNo: '3', name: 'Karan Shekhawat', gender: 'Male', class: classMap['7'] || classes[0]._id, section: 'A', parent: createdParents[4]._id, guardianName: 'Rajendra Singh Shekhawat', contactNumber: '+91 98294 66778', status: 'active', bloodGroup: 'O+' },
        { admissionNo: 'NVP-2026-006', rollNo: '1', name: 'Pooja Choudhary', gender: 'Female', class: classMap['8'] || classes[0]._id, section: 'A', parent: createdParents[0]._id, guardianName: 'Suresh Kumar Sharma', contactNumber: '+91 98291 55661', status: 'active', bloodGroup: 'B+' },
        { admissionNo: 'NVP-2026-007', rollNo: '1', name: 'Rohan Joshi', gender: 'Male', class: classMap['9'] || classes[0]._id, section: 'A', parent: createdParents[1]._id, guardianName: 'Rameshwar Lal Patel', contactNumber: '+91 98291 77882', status: 'active', bloodGroup: 'A+' },
        { admissionNo: 'NVP-2026-008', rollNo: '1', name: 'Tanvi Meena', gender: 'Female', class: classMap['10'] || classes[0]._id, section: 'A', parent: createdParents[2]._id, guardianName: 'Sunita Devi Rathore', contactNumber: '+91 98292 11223', status: 'active', bloodGroup: 'B+' },
        { admissionNo: 'NVP-2026-009', rollNo: '1', name: 'Vivaan Soni', gender: 'Male', class: classMap['Nursery'] || classes[0]._id, section: 'A', parent: createdParents[3]._id, guardianName: 'Mahesh Verma', contactNumber: '+91 98293 44556', status: 'active', bloodGroup: 'O+' },
        { admissionNo: 'NVP-2026-010', rollNo: '1', name: 'Kavya Jangid', gender: 'Female', class: classMap['LKG'] || classes[0]._id, section: 'A', parent: createdParents[4]._id, guardianName: 'Rajendra Singh Shekhawat', contactNumber: '+91 98294 66778', status: 'active', bloodGroup: 'A+' },
        { admissionNo: 'NVP-2026-011', rollNo: '1', name: 'Ayaan Khan', gender: 'Male', class: classMap['UKG'] || classes[0]._id, section: 'A', parent: createdParents[0]._id, guardianName: 'Suresh Kumar Sharma', contactNumber: '+91 98291 55661', status: 'active', bloodGroup: 'B+' },
        { admissionNo: 'NVP-2026-012', rollNo: '1', name: 'Meera Rao', gender: 'Female', class: classMap['1'] || classes[0]._id, section: 'A', parent: createdParents[1]._id, guardianName: 'Rameshwar Lal Patel', contactNumber: '+91 98291 77882', status: 'active', bloodGroup: 'O+' },
        { admissionNo: 'NVP-2026-013', rollNo: '1', name: 'Reyansh Tiwari', gender: 'Male', class: classMap['2'] || classes[0]._id, section: 'A', parent: createdParents[2]._id, guardianName: 'Sunita Devi Rathore', contactNumber: '+91 98292 11223', status: 'active', bloodGroup: 'A+' },
        { admissionNo: 'NVP-2026-014', rollNo: '1', name: 'Anvi Kumawat', gender: 'Female', class: classMap['3'] || classes[0]._id, section: 'A', parent: createdParents[3]._id, guardianName: 'Mahesh Verma', contactNumber: '+91 98293 44556', status: 'active', bloodGroup: 'AB+' },
        { admissionNo: 'NVP-2026-015', rollNo: '1', name: 'Daksh Agarwal', gender: 'Male', class: classMap['4'] || classes[0]._id, section: 'A', parent: createdParents[4]._id, guardianName: 'Rajendra Singh Shekhawat', contactNumber: '+91 98294 66778', status: 'active', bloodGroup: 'B+' },
        { admissionNo: 'NVP-2026-016', rollNo: '1', name: 'Saanvi Pareek', gender: 'Female', class: classMap['5'] || classes[0]._id, section: 'A', parent: createdParents[0]._id, guardianName: 'Suresh Kumar Sharma', contactNumber: '+91 98291 55661', status: 'active', bloodGroup: 'O+' }
      ];

      const createdStudents = await Student.insertMany(sampleStudents);

      // Link students back to parents
      for (const st of createdStudents) {
        if (st.parent) {
          await Parent.findByIdAndUpdate(st.parent, { $addToSet: { students: st._id } });
        }
      }

      // Update student count in Class records
      for (const c of classes) {
        const count = await Student.countDocuments({ class: c._id, status: 'active' });
        await Class.findByIdAndUpdate(c._id, { studentCount: count > 0 ? count : 30 });
      }

      // 3. Seed Attendance Records for Class 6 & 7 (Past 35 school days including Today)
      const teacherUser = await User.findOne({ role: 'TEACHER' });
      if (teacherUser) {
        const attDocs = [];
        const now = new Date();

        // Generate past 35 days (excluding Sundays)
        for (let i = 0; i <= 35; i++) {
          const d = new Date(now);
          d.setDate(now.getDate() - i);
          d.setHours(0, 0, 0, 0);

          // Skip Sundays
          if (d.getDay() === 0) continue;

          // Aarav Sharma attendance profile: mostly present, 2 absent, 1 leave
          let aaravStatus = 'present';
          if (i === 7 || i === 19) aaravStatus = 'absent';
          else if (i === 13) aaravStatus = 'leave';

          // Ananya Patel attendance profile
          let ananyaStatus = i === 10 || i === 22 ? 'absent' : 'present';

          if (classMap['6']) {
            attDocs.push({
              class: classMap['6'],
              teacher: teacherUser._id,
              date: d,
              records: [
                { studentName: 'Aarav Sharma', rollNo: '1', status: aaravStatus },
                { studentName: 'Ananya Patel', rollNo: '2', status: ananyaStatus }
              ]
            });
          }

          if (classMap['7']) {
            attDocs.push({
              class: classMap['7'],
              teacher: teacherUser._id,
              date: d,
              records: [
                { studentName: 'Devansh Rathore', rollNo: '1', status: i === 5 ? 'absent' : 'present' },
                { studentName: 'Ishita Verma', rollNo: '2', status: 'present' },
                { studentName: 'Karan Shekhawat', rollNo: '3', status: i % 4 === 0 ? 'absent' : 'present' }
              ]
            });
          }
        }

        for (const doc of attDocs) {
          await Attendance.findOneAndUpdate(
            { class: doc.class, date: doc.date },
            { $set: doc },
            { upsert: true }
          );
        }
      }

      // 4. Seed Results
      const mathSubject = await Subject.findOne({ name: 'Mathematics' });
      if (teacherUser && classMap['7'] && mathSubject) {
        await Result.create({
          class: classMap['7'],
          subject: mathSubject._id,
          teacher: teacherUser._id,
          exam: 'Periodic Assessment - 1',
          totalMarks: 50,
          records: [
            { studentName: 'Devansh Rathore', rollNo: '1', obtainedMarks: 46, percentage: 92, grade: 'A1', passStatus: 'pass' },
            { studentName: 'Ishita Verma', rollNo: '2', obtainedMarks: 42, percentage: 84, grade: 'A2', passStatus: 'pass' },
            { studentName: 'Karan Shekhawat', rollNo: '3', obtainedMarks: 38, percentage: 76, grade: 'B1', passStatus: 'pass' }
          ]
        });
      }
    }

    // Ensure all classes have representative students if needed
    const curStudentsCount = await Student.countDocuments();
    if (curStudentsCount < 16) {
      const parents = await Parent.find();
      if (parents.length > 0) {
        const extraStudents = [
          { admissionNo: 'NVP-2026-009', rollNo: '1', name: 'Vivaan Soni', gender: 'Male', class: classMap['Nursery'], section: 'A', parent: parents[0]._id, guardianName: parents[0].name, contactNumber: parents[0].phone, status: 'active', bloodGroup: 'O+' },
          { admissionNo: 'NVP-2026-010', rollNo: '1', name: 'Kavya Jangid', gender: 'Female', class: classMap['LKG'], section: 'A', parent: parents[1]._id, guardianName: parents[1].name, contactNumber: parents[1].phone, status: 'active', bloodGroup: 'A+' },
          { admissionNo: 'NVP-2026-011', rollNo: '1', name: 'Ayaan Khan', gender: 'Male', class: classMap['UKG'], section: 'A', parent: parents[2]._id, guardianName: parents[2].name, contactNumber: parents[2].phone, status: 'active', bloodGroup: 'B+' },
          { admissionNo: 'NVP-2026-012', rollNo: '1', name: 'Meera Rao', gender: 'Female', class: classMap['1'], section: 'A', parent: parents[3]._id, guardianName: parents[3].name, contactNumber: parents[3].phone, status: 'active', bloodGroup: 'O+' },
          { admissionNo: 'NVP-2026-013', rollNo: '1', name: 'Reyansh Tiwari', gender: 'Male', class: classMap['2'], section: 'A', parent: parents[4]._id, guardianName: parents[4].name, contactNumber: parents[4].phone, status: 'active', bloodGroup: 'A+' },
          { admissionNo: 'NVP-2026-014', rollNo: '1', name: 'Anvi Kumawat', gender: 'Female', class: classMap['3'], section: 'A', parent: parents[0]._id, guardianName: parents[0].name, contactNumber: parents[0].phone, status: 'active', bloodGroup: 'AB+' },
          { admissionNo: 'NVP-2026-015', rollNo: '1', name: 'Daksh Agarwal', gender: 'Male', class: classMap['4'], section: 'A', parent: parents[1]._id, guardianName: parents[1].name, contactNumber: parents[1].phone, status: 'active', bloodGroup: 'B+' },
          { admissionNo: 'NVP-2026-016', rollNo: '1', name: 'Saanvi Pareek', gender: 'Female', class: classMap['5'], section: 'A', parent: parents[2]._id, guardianName: parents[2].name, contactNumber: parents[2].phone, status: 'active', bloodGroup: 'O+' }
        ].filter(s => s.class);

        for (const st of extraStudents) {
          const exists = await Student.findOne({ admissionNo: st.admissionNo });
          if (!exists) {
            await Student.create(st);
          }
        }
      }
    }

    // 5. Seed Staff Members
    const staffCount = await Staff.countDocuments();
    if (staffCount === 0) {
      console.log('[Seed] Seeding Non-Teaching Staff...');
      await Staff.insertMany([
        { employeeId: 'EMP-S201', name: 'Mr. Kailash Chand Sharma', designation: 'Senior Accountant', department: 'Accounts & Finance', gender: 'Male', phone: '+91 98290 44332', email: 'accounts@nvpschool.edu.in', salary: 32000, status: 'active' },
        { employeeId: 'EMP-S202', name: 'Mrs. Rekha Joshi', designation: 'Chief Librarian', department: 'Library', gender: 'Female', phone: '+91 98290 55443', email: 'library@nvpschool.edu.in', salary: 28000, status: 'active' },
        { employeeId: 'EMP-S203', name: 'Mr. Mohan Singh Bhati', designation: 'Office Superintendent', department: 'Administration', gender: 'Male', phone: '+91 98290 66554', email: 'adminoffice@nvpschool.edu.in', salary: 26000, status: 'active' },
        { employeeId: 'EMP-S204', name: 'Mr. Balveer Ram', designation: 'Transport Supervisor', department: 'Transport', gender: 'Male', phone: '+91 98290 77665', salary: 20000, status: 'active' },
        { employeeId: 'EMP-S205', name: 'Mr. Shrawan Kumar', designation: 'Campus Security Head', department: 'Security', gender: 'Male', phone: '+91 98290 88776', salary: 18000, status: 'active' }
      ]);
    }

    // 6. Seed Exams
    const examCount = await Exam.countDocuments();
    if (examCount === 0) {
      console.log('[Seed] Seeding Exams...');
      const targetClassIds = [classMap['6'], classMap['7'], classMap['8'], classMap['9'], classMap['10']].filter(Boolean);
      await Exam.insertMany([
        {
          name: 'Quarterly Periodic Assessment - 1',
          examType: 'Periodic Assessment',
          academicYear: '2026-2027',
          startDate: new Date(Date.now() + 5 * 86400000),
          endDate: new Date(Date.now() + 12 * 86400000),
          classes: targetClassIds,
          status: 'upcoming',
          description: 'Official first periodic assessment covering Chapters 1 through 4.',
          published: true
        },
        {
          name: 'Half Yearly Examination 2026',
          examType: 'Half Yearly',
          academicYear: '2026-2027',
          startDate: new Date(Date.now() + 45 * 86400000),
          endDate: new Date(Date.now() + 55 * 86400000),
          classes: targetClassIds,
          status: 'upcoming',
          description: 'Comprehensive mid-term evaluation across all academic subjects.',
          published: true
        }
      ]);
    }

    // 7. Seed Fee Structures & Fee Payments
    const feeStructureCount = await FeeStructure.countDocuments();
    if (feeStructureCount === 0) {
      console.log('[Seed] Seeding Fee Structures & Payments...');
      const feeDocs = [];
      classes.forEach(c => {
        let amt = 3500;
        if (['9', '10'].includes(c.name)) amt = 5500;
        else if (['6', '7', '8'].includes(c.name)) amt = 4500;

        feeDocs.push({
          title: `Class ${c.name} Quarterly Tuition Fee`,
          class: c._id,
          amount: amt,
          feeType: 'Tuition',
          frequency: 'Quarterly',
          academicYear: '2026-2027'
        });
      });
      await FeeStructure.insertMany(feeDocs);

      const students = await Student.find().populate('class');
      if (students.length > 0) {
        const payments = [
          { receiptNo: 'REC-2026-00101', student: students[0]._id, studentName: students[0].name, className: 'Class 6 - A', amount: 4500, feeType: 'Tuition Fee (Q1)', paymentDate: new Date(), paymentMethod: 'UPI', status: 'Completed', remarks: 'Paid via PhonePe transaction' },
          { receiptNo: 'REC-2026-00102', student: students[1]._id, studentName: students[1].name, className: 'Class 6 - A', amount: 4500, feeType: 'Tuition Fee (Q1)', paymentDate: new Date(Date.now() - 86400000), paymentMethod: 'Cash', status: 'Completed', remarks: 'Paid at fee counter' },
          { receiptNo: 'REC-2026-00103', student: students[2]._id, studentName: students[2].name, className: 'Class 7 - A', amount: 4500, feeType: 'Tuition Fee (Q1)', paymentDate: new Date(Date.now() - 2 * 86400000), paymentMethod: 'Net Banking', status: 'Completed', remarks: 'NEFT Transfer' },
          { receiptNo: 'REC-2026-00104', student: students[3]._id, studentName: students[3].name, className: 'Class 7 - A', amount: 4500, feeType: 'Tuition Fee (Q1)', paymentDate: new Date(Date.now() - 5 * 86400000), paymentMethod: 'Cash', status: 'Completed', remarks: 'Paid at fee counter' },
          { receiptNo: 'REC-2026-00105', student: students[4]._id, studentName: students[4].name, className: 'Class 7 - A', amount: 4500, feeType: 'Tuition Fee (Q1)', paymentDate: new Date(Date.now() - 7 * 86400000), paymentMethod: 'UPI', status: 'Completed', remarks: 'Google Pay' }
        ];
        await FeePayment.insertMany(payments);
      }
    }

    // 8. Seed Promotions Log
    const promotionCount = await Promotion.countDocuments();
    if (promotionCount === 0 && classMap['6'] && classMap['7']) {
      console.log('[Seed] Seeding Sample Promotion record...');
      await Promotion.create({
        fromClass: classMap['6'],
        fromClassName: 'Class 6 - A',
        toClass: classMap['7'],
        toClassName: 'Class 7 - A',
        academicYearFrom: '2025-2026',
        academicYearTo: '2026-2027',
        promotedCount: 28,
        promotionDate: new Date(Date.now() - 90 * 86400000),
        remarks: 'Annual Session Promotion after final examination clearance.'
      });
    }

    // 9. Seed Teacher Attendance for Today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const teacherAttCount = await TeacherAttendance.countDocuments({ date: today });
    if (teacherAttCount === 0) {
      console.log('[Seed] Seeding Teacher Attendance for today...');
      const teachers = await User.find({ role: 'TEACHER' });
      const attDocs = teachers.map((t, idx) => ({
        teacher: t._id,
        teacherName: t.name,
        employeeId: t.employeeId || `EMP-T10${idx + 1}`,
        date: today,
        status: idx === 0 ? 'present' : (idx === 1 ? 'present' : 'late'),
        checkInTime: idx === 0 ? '07:55 AM' : (idx === 1 ? '08:05 AM' : '08:20 AM'),
        remarks: idx === 0 ? 'On time - Morning Gate Duty' : (idx === 1 ? 'Assembly Proctor' : 'Late due to bus delay')
      }));

      if (attDocs.length > 0) {
        await TeacherAttendance.insertMany(attDocs);
      }
    }

    // 10. Seed Transport Fleet & Routes
    const transportCount = await Transport.countDocuments();
    if (transportCount === 0) {
      console.log('[Seed] Seeding Transport Fleet & Routes...');
      await Transport.insertMany([
        {
          vehicleNo: 'RJ-37-PA-1001',
          vehicleType: 'School Bus',
          routeTitle: 'Route 1 - Nimbi Jodhan & Ladnun Highway',
          driverName: 'Mohan Ram Gujjar',
          driverPhone: '+91 98290 44332',
          conductorName: 'Ramprasad Meena',
          capacity: 35,
          assignedStudentsCount: 28,
          monthlyFee: 1200,
          pickupPoints: ['Nimbi Bus Stand', 'Kalyanpura Crossing', 'Station Road', 'School Gate'],
          status: 'active'
        },
        {
          vehicleNo: 'RJ-37-PA-1002',
          vehicleType: 'School Bus',
          routeTitle: 'Route 2 - Ladnun City & Jain Vishva Bharati',
          driverName: 'Sohan Lal Bishnoi',
          driverPhone: '+91 98290 88771',
          conductorName: 'Govind Ram',
          capacity: 35,
          assignedStudentsCount: 31,
          monthlyFee: 1200,
          pickupPoints: ['Current Balaji', 'Jain Vishva Bharati', 'City Kotwali', 'Bada Bazaar', 'School Gate'],
          status: 'active'
        },
        {
          vehicleNo: 'RJ-37-TA-2001',
          vehicleType: 'Van',
          routeTitle: 'Route 3 - Didwana Bypass & Industrial RIICO',
          driverName: 'Aslam Khan',
          driverPhone: '+91 98291 33221',
          capacity: 12,
          assignedStudentsCount: 10,
          monthlyFee: 1500,
          pickupPoints: ['Bypass Toll Point', 'RIICO Area', 'Balaji Nagar', 'School Gate'],
          status: 'active'
        },
        {
          vehicleNo: 'RJ-37-TA-2002',
          vehicleType: 'Van',
          routeTitle: 'Route 4 - Jaswantgarh & Nearby Hubs',
          driverName: 'Kishore Singh',
          driverPhone: '+91 98292 99887',
          capacity: 14,
          assignedStudentsCount: 12,
          monthlyFee: 1600,
          pickupPoints: ['Jaswantgarh Center', 'Railway Gate', 'Naya Gaon', 'School Gate'],
          status: 'active'
        }
      ]);
    }

    // 11. Seed Student User Account (TCS mTOP Student Portal Login)
    const studentUser = await User.findOne({ email: 'student@school.local' });
    if (!studentUser) {
      console.log('[Seed] Seeding Student user account (student@school.local / Student@12345)...');
      const studentPasswordHash = await bcrypt.hash('Student@12345', 10);
      const studentDoc = await Student.findOne({ admissionNo: 'NVP-2026-001' }) || await Student.findOne();

      await User.create({
        name: studentDoc ? studentDoc.name : 'Aarav Sharma',
        email: 'student@school.local',
        passwordHash: studentPasswordHash,
        role: 'STUDENT',
        mobile: studentDoc?.contactNumber || '+91 98291 55661',
        admissionNo: studentDoc?.admissionNo || 'NVP-2026-001',
        studentRef: studentDoc?._id,
        studentClass: studentDoc?.class || classMap['6'],
        gender: 'Male',
        status: 'active'
      });
    }

    // 12. Seed Class Weekly Timetables (Monday to Saturday)
    const timetableCount = await Timetable.countDocuments();
    if (timetableCount === 0 && classMap['6']) {
      console.log('[Seed] Seeding Class Timetables (Routine & Classrooms)...');
      const teacherUsers = await User.find({ role: 'TEACHER' });
      const teacher1 = teacherUsers[0] || null;
      const teacher2 = teacherUsers[1] || teacher1;

      const mathSub = subjectMap['Mathematics'];
      const engSub = subjectMap['English'];
      const sciSub = subjectMap['Science'];
      const sstSub = subjectMap['Social Science'];
      const hinSub = subjectMap['Hindi'];
      const csSub = subjectMap['Computer'];
      const sktSub = subjectMap['Sanskrit'];

      const weekdays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

      const generateScheduleForClass = (clsId, clsName, roomDefault) => {
        return weekdays.map((day, dIdx) => ({
          day,
          periods: [
            {
              periodNumber: 1,
              periodTitle: 'Period 1',
              isBreak: false,
              startTime: '08:00 AM',
              endTime: '08:45 AM',
              subject: mathSub,
              subjectName: 'Mathematics',
              teacher: teacher1?._id,
              teacherName: teacher1?.name || 'Mr. Rahul Sharma',
              roomNo: roomDefault
            },
            {
              periodNumber: 2,
              periodTitle: 'Period 2',
              isBreak: false,
              startTime: '08:45 AM',
              endTime: '09:30 AM',
              subject: engSub,
              subjectName: 'English',
              teacher: teacher2?._id,
              teacherName: teacher2?.name || 'Mrs. Priya Verma',
              roomNo: roomDefault
            },
            {
              periodNumber: 3,
              periodTitle: 'Period 3',
              isBreak: false,
              startTime: '09:30 AM',
              endTime: '10:15 AM',
              subject: sciSub,
              subjectName: 'Science',
              teacher: teacher1?._id,
              teacherName: teacher1?.name || 'Mr. Rahul Sharma',
              roomNo: dIdx % 2 === 0 ? 'Science Lab 1' : roomDefault
            },
            {
              periodNumber: 4,
              periodTitle: 'Period 4',
              isBreak: false,
              startTime: '10:15 AM',
              endTime: '11:00 AM',
              subject: sstSub,
              subjectName: 'Social Science',
              teacher: teacher2?._id,
              teacherName: teacher2?.name || 'Mrs. Priya Verma',
              roomNo: roomDefault
            },
            {
              periodNumber: 5,
              periodTitle: 'Lunch & Recess',
              isBreak: true,
              startTime: '11:00 AM',
              endTime: '11:35 AM',
              subjectName: 'Lunch Break',
              teacherName: 'Duty Proctor',
              roomNo: 'Cafeteria & Ground'
            },
            {
              periodNumber: 6,
              periodTitle: 'Period 5',
              isBreak: false,
              startTime: '11:35 AM',
              endTime: '12:20 PM',
              subject: hinSub,
              subjectName: 'Hindi',
              teacher: teacher2?._id,
              teacherName: teacher2?.name || 'Mrs. Priya Verma',
              roomNo: roomDefault
            },
            {
              periodNumber: 7,
              periodTitle: 'Period 6',
              isBreak: false,
              startTime: '12:20 PM',
              endTime: '01:05 PM',
              subject: csSub,
              subjectName: 'Computer',
              teacher: teacher1?._id,
              teacherName: teacher1?.name || 'Mr. Rahul Sharma',
              roomNo: 'Computer Lab 1'
            },
            {
              periodNumber: 8,
              periodTitle: 'Period 7',
              isBreak: false,
              startTime: '01:05 PM',
              endTime: '01:50 PM',
              subject: sktSub,
              subjectName: 'Sanskrit / Sports',
              teacher: teacher2?._id,
              teacherName: teacher2?.name || 'Mrs. Priya Verma',
              roomNo: dIdx === 5 ? 'Playground' : roomDefault
            }
          ]
        }));
      };

      await Timetable.create({
        class: classMap['6'],
        className: 'Class 6',
        section: 'A',
        academicYear: '2026-2027',
        schedule: generateScheduleForClass(classMap['6'], 'Class 6', 'Room 102 (Main Wing)')
      });

      if (classMap['7']) {
        await Timetable.create({
          class: classMap['7'],
          className: 'Class 7',
          section: 'A',
          academicYear: '2026-2027',
          schedule: generateScheduleForClass(classMap['7'], 'Class 7', 'Room 103 (Main Wing)')
        });
      }
    }

    // 13. Seed Homework & Assignments for Class 6
    const assignmentCount = await Assignment.countDocuments();
    if (assignmentCount === 0 && classMap['6']) {
      console.log('[Seed] Seeding Class Homework & Assignments...');
      const teacherUser = await User.findOne({ role: 'TEACHER' });
      const teacherId = teacherUser?._id;

      const dueInDays = (days) => {
        const d = new Date();
        d.setDate(d.getDate() + days);
        return d;
      };

      const seedAssignments = [
        {
          teacher: teacherId,
          class: classMap['6'],
          subject: subjectMap['Sanskrit'] || subjects[0]?._id,
          title: 'Sanskrit: Chapter 3 - Word Meanings and Shlokas Recitation',
          description: 'Complete workbook pages 24 to 28 in neat handwriting and memorize Subhashitani shlokas 1-4.',
          instructions: '1. Practice daily neat handwriting.\n2. Memorize word meanings and write in notebook.\n3. Oral recitation will be conducted tomorrow in class.',
          submissionDate: dueInDays(1),
          status: 'published'
        },
        {
          teacher: teacherId,
          class: classMap['6'],
          subject: subjectMap['Mathematics'] || subjects[2]?._id,
          title: 'Mathematics: Chapter 4 - Fractions & Decimals Word Problems',
          description: 'Solve Exercise 4.2 Questions 1 to 12 in the Math Fair Notebook with full calculation steps and diagrams.',
          instructions: 'Draw neat number lines for questions 7 and 9 with pencil and ruler. Practice LCM calculation without calculator.',
          submissionDate: dueInDays(2),
          status: 'published'
        },
        {
          teacher: teacherId,
          class: classMap['6'],
          subject: subjectMap['Science'] || subjects[3]?._id,
          title: 'Science: Diagram of Plant Cell & Photosynthesis Cycle',
          description: 'Draw and color the diagram of a typical Plant Cell on an A4 sheet. Label all 8 organelles clearly.',
          instructions: 'Write 2 lines about the function of Chloroplast and Mitochondria. Bring it in your science file.',
          submissionDate: dueInDays(3),
          status: 'published'
        },
        {
          teacher: teacherId,
          class: classMap['6'],
          subject: subjectMap['English'] || subjects[0]?._id,
          title: 'English: Grammar Tenses Worksheet & Story Composition',
          description: 'Complete the Active-Passive voice worksheet (15 sentences) and write a short paragraph on "A Rainy Day in My Village" (120 words).',
          instructions: 'Check spelling and punctuation carefully. Highlight new vocabulary words with an underline.',
          submissionDate: dueInDays(2),
          status: 'published'
        },
        {
          teacher: teacherId,
          class: classMap['6'],
          subject: subjectMap['Social Science'] || subjects[4]?._id,
          title: 'Social Science: India Physical Map - Major River Basins',
          description: 'Mark and color Ganga, Yamuna, Brahmaputra, Narmada and Godavari rivers on the physical map of India.',
          instructions: 'Paste the map in your Social Science practical notebook and write capitals of 5 states.',
          submissionDate: dueInDays(4),
          status: 'published'
        }
      ];

      await Assignment.insertMany(seedAssignments);
    }

    console.log('[Seed] Demo data verification & seeding completed successfully.');
  } catch (error) {
    console.error(`[Seed Error]: ${error.message}`);
  }
};

module.exports = seedInitialData;
