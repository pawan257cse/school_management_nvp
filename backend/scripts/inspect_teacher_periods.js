const dns = require('dns');
dns.setServers(['8.8.8.8']);
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');

async function testTeacherSchedule() {
  await mongoose.connect(process.env.MONGODB_URI);
  const User = mongoose.model('User', new mongoose.Schema({}, { strict: false }));
  const Timetable = mongoose.model('Timetable', new mongoose.Schema({}, { strict: false }));

  const teachers = await User.find({ role: { $in: ['TEACHER', 'PRINCIPAL'] } }).lean();
  const timetables = await Timetable.find().lean();

  console.log('\n=== ACTUAL TEACHING CLASSES PER TEACHER (MONDAY) ===');
  for (const t of teachers) {
    let mondayCount = 0;
    const periodsList = [];

    for (const tt of timetables) {
      const mon = (tt.schedule || []).find(s => s.day === 'Monday');
      if (mon && mon.periods) {
        for (const p of mon.periods) {
          if (p.teacher && p.teacher.toString() === t._id.toString() && !p.isBreak && p.subjectName !== 'Lunch Break') {
            mondayCount++;
            periodsList.push(`${tt.className}: ${p.subjectName}`);
          }
        }
      }
    }

    console.log(`- ${t.name}: ${mondayCount} Classes -> [${periodsList.join(' | ')}]`);
  }

  process.exit(0);
}

testTeacherSchedule().catch(e => { console.error(e); process.exit(1); });
