require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const connectDB = require('../config/db');
const Timetable = require('../models/Timetable');
const Subject = require('../models/Subject');
const User = require('../models/User');
const Class = require('../models/Class');

async function cleanTimetableAndProfiles() {
  await connectDB();
  console.log('=== CLEANING TIMETABLE & PROFILES (NO COMPOUND SUBJECTS, FULL PROFILES) ===');

  // 1. Fetch Subjects map
  const subjects = await Subject.find();
  const subMap = {};
  subjects.forEach(s => {
    subMap[s.name.toUpperCase()] = s;
    subMap[s.code.toUpperCase()] = s;
  });

  const getSub = (name) => subMap[name.toUpperCase()];

  // 2. Fetch Teachers map
  const teachers = await User.find({ role: 'TEACHER' });
  const teacherMap = {};
  teachers.forEach(t => {
    teacherMap[t.name.toUpperCase()] = t;
  });

  // 3. Mapping for compound/non-standard subject names to clean standard subjects
  const cleanSubjectMapping = {
    'MATHEMATICS + SANSKRIT (3/3)': 'Mathematics',
    'COMPUTER + SCIENCE + ENGLISH (3/3)': 'Computer',
    'COMPUTER + GAME (3/3)': 'Computer',
    'GK + HINDI': 'Hindi',
    'MATH + GK': 'Mathematics',
    'GK + ENGLISH': 'English',
    'ORAL + DIARY': 'Diary & Rhymes',
    'ENGLISH + GK': 'English',
    'DIARY': 'Diary & Rhymes'
  };

  // 4. Update all Timetables
  const allTimetables = await Timetable.find();
  let updatedPeriodsCount = 0;

  for (const tt of allTimetables) {
    let modified = false;

    for (const day of tt.schedule) {
      for (const p of day.periods) {
        if (p.isBreak) continue;

        const currentSubNameUpper = (p.subjectName || '').trim().toUpperCase();

        if (cleanSubjectMapping[currentSubNameUpper]) {
          const cleanName = cleanSubjectMapping[currentSubNameUpper];
          const subDoc = getSub(cleanName);

          p.subjectName = cleanName;
          if (subDoc) p.subject = subDoc._id;
          modified = true;
          updatedPeriodsCount++;
        } else if (p.subjectName) {
          // Ensure subjectName matches subject document exactly
          const subDoc = getSub(p.subjectName);
          if (subDoc) {
            p.subject = subDoc._id;
            p.subjectName = subDoc.name;
          }
        }

        // Clean teacherName
        if (p.teacher) {
          const teachDoc = teachers.find(t => t._id.toString() === p.teacher.toString());
          if (teachDoc) {
            p.teacherName = teachDoc.name;
          }
        }
      }
    }

    if (modified) {
      await tt.save();
      console.log(`Cleaned compound subjects in Timetable for ${tt.className}`);
    }
  }

  console.log(`Total compound periods converted to clean standard subjects: ${updatedPeriodsCount}`);

  // 5. Update Teacher Profiles with full assignedSubjects & assignedClasses
  const teacherSubjectMap = {
    'Priti': ['English', 'Hindi', 'Mathematics', 'Oral', 'Games & Activity', 'Diary & Rhymes'],
    'Lalita': ['Hindi', 'Mathematics', 'English', 'General Knowledge', 'Diary & Rhymes', 'Oral'],
    'Priya': ['Mathematics', 'General Knowledge', 'Hindi', 'English', 'Oral', 'Diary & Rhymes'],
    'Sarita': ['EVS', 'Mathematics', 'Hindi', 'General Knowledge', 'Games & Activity'],
    'Durga': ['Hindi', 'General Knowledge'],
    'Pawan': ['Computer', 'Games & Activity', 'Science'],
    'Vanshika': ['EVS', 'English', 'Social Science', 'General Knowledge'],
    'Megha': ['English', 'Hindi Grammar', 'Sanskrit'],
    'Kavita': ['English', 'Science'],
    'Chanchal': ['Mathematics', 'General Knowledge', 'Sanskrit']
  };

  for (const t of teachers) {
    const subNames = teacherSubjectMap[t.name] || ['English', 'Hindi', 'Mathematics'];
    const subIds = subNames.map(sName => getSub(sName)?._id).filter(Boolean);

    t.assignedSubjects = subIds;
    t.qualification = t.qualification || 'M.A., B.Ed. (Trained Faculty)';
    t.gender = t.name === 'Pawan' ? 'Male' : 'Female';
    await t.save();
    console.log(`Updated complete profile for Teacher: ${t.name} (${subNames.join(', ')})`);
  }

  console.log('=== TIMETABLE AND PROFILES CLEANED SUCCESSFULLY ===');
  process.exit(0);
}

cleanTimetableAndProfiles().catch(err => {
  console.error(err);
  process.exit(1);
});
