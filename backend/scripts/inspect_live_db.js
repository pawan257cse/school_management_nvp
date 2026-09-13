require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const dns = require('dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);
const mongoose = require('mongoose');

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB Atlas');
  
  const User = mongoose.model('User', new mongoose.Schema({}, { strict: false }));
  const Class = mongoose.model('Class', new mongoose.Schema({}, { strict: false }));
  const Subject = mongoose.model('Subject', new mongoose.Schema({}, { strict: false }));
  const Timetable = mongoose.model('Timetable', new mongoose.Schema({}, { strict: false }));

  const teachers = await User.find({ role: { $in: ['TEACHER', 'PRINCIPAL', 'HEAD'] } }).lean();
  console.log('\n--- USERS COUNT:', teachers.length);
  for (const t of teachers) {
    console.log(`- ${t.name} (${t.role}): Email=${t.email}, EmpID=${t.employeeId || 'N/A'}, Classes=${t.assignedClasses?.length || 0}, Subjects=${t.assignedSubjects?.length || 0}`);
  }

  const classes = await Class.find().lean();
  console.log('\n--- CLASSES COUNT:', classes.length);
  for (const c of classes) {
    console.log(`- Class ${c.name} (${c.section}): CT=${c.classTeacher || 'NONE'}, AttendanceTeacher=${c.attendanceTeacher || 'NONE'}, Subjects=${c.subjects?.length || 0}`);
  }

  const subjects = await Subject.find().lean();
  console.log('\n--- SUBJECTS COUNT:', subjects.length);
  for (const s of subjects) {
    console.log(`- ${s.name} (${s.code}) - ID: ${s._id}`);
  }

  const timetables = await Timetable.find().lean();
  console.log('\n--- TIMETABLES COUNT:', timetables.length);
  for (const tt of timetables) {
    console.log(`- Timetable for: ${tt.className} (Academic: ${tt.academicYear})`);
  }

  process.exit(0);
}

run().catch(e => { console.error(e); process.exit(1); });
