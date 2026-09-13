const express = require('express');
const router = express.Router();
const Timetable = require('../models/Timetable');
const Class = require('../models/Class');
const Student = require('../models/Student');
const { protect } = require('../middleware/auth');
const checkRole = require('../middleware/checkRole');

// @route   GET /api/timetable/class/:classId
// @desc    Get weekly timetable for a specific class
// @access  Private
router.get('/class/:classId', protect, async (req, res) => {
  try {
    const { classId } = req.params;
    let timetable = await Timetable.findOne({ class: classId })
      .populate('class', 'name section')
      .populate('schedule.periods.subject', 'name code')
      .populate('schedule.periods.teacher', 'name email mobile');

    if (!timetable) {
      // Find class details to return empty structure
      const cls = await Class.findById(classId);
      if (!cls) {
        return res.status(404).json({ success: false, message: 'Class not found' });
      }

      return res.json({
        success: true,
        timetable: {
          class: cls._id,
          className: `Class ${cls.name}`,
          section: cls.section || 'A',
          academicYear: '2026-2027',
          schedule: []
        }
      });
    }

    res.json({ success: true, timetable });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/timetable/my-timetable
// @desc    Get personalized timetable for logged-in user (Student's class schedule or Teacher's teaching periods)
// @access  Private
router.get('/my-timetable', protect, async (req, res) => {
  try {
    const user = req.user;

    // 1. If Student: return their class timetable ONLY
    if (user.role === 'STUDENT') {
      let targetClassId = user.studentClass;

      // Try to find class from studentRef if studentClass not set
      if (!targetClassId && user.studentRef) {
        const st = await Student.findById(user.studentRef);
        if (st) targetClassId = st.class?._id || st.class;
      }

      // Try admissionNo lookup
      if (!targetClassId && user.admissionNo) {
        const st = await Student.findOne({ admissionNo: user.admissionNo });
        if (st) targetClassId = st.class?._id || st.class;
      }

      // Try email lookup
      if (!targetClassId && user.email) {
        const st = await Student.findOne({ email: user.email });
        if (st) targetClassId = st.class?._id || st.class;
      }

      if (!targetClassId) {
        // No class found - return empty timetable with helpful message
        return res.json({
          success: true,
          role: 'STUDENT',
          classId: null,
          timetable: { schedule: [] },
          message: 'Student class not linked. Please contact the school administration.'
        });
      }

      const timetable = await Timetable.findOne({ class: targetClassId })
        .populate('class', 'name section')
        .populate('schedule.periods.subject', 'name code')
        .populate('schedule.periods.teacher', 'name email mobile');

      const isSunday = new Date().getDay() === 0;

      return res.json({
        success: true,
        role: 'STUDENT',
        classId: targetClassId,
        isSunday,
        isHoliday: isSunday,
        message: isSunday ? 'Today is Sunday (Weekly Holiday). School is closed today.' : undefined,
        timetable: timetable || { schedule: [] }
      });
    }

    // 2. If Teacher: return periods where this teacher is assigned across all classes + Live Classroom Tracker
    if (user.role === 'TEACHER') {
      const allTimetables = await Timetable.find()
        .populate('class', 'name section')
        .populate('schedule.periods.subject', 'name code');

      const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const teacherSchedule = days.map(dayName => {
        const dayPeriods = [];

        allTimetables.forEach(tt => {
          const dayData = tt.schedule.find(s => s.day === dayName);
          if (dayData && Array.isArray(dayData.periods)) {
            dayData.periods.forEach(p => {
              if (p.teacher && p.teacher.toString() === user._id.toString()) {
                dayPeriods.push({
                  classId: tt.class?._id,
                  className: tt.className,
                  section: tt.section,
                  periodNumber: p.periodNumber,
                  periodTitle: p.periodTitle || `Period ${p.periodNumber}`,
                  startTime: p.startTime,
                  endTime: p.endTime,
                  subjectName: p.subjectName || p.subject?.name || 'Academic Class',
                  roomNo: p.roomNo || `Room ${tt.className}`
                });
              }
            });
          }
        });

        dayPeriods.sort((a, b) => a.periodNumber - b.periodNumber);
        return { day: dayName, periods: dayPeriods };
      });

      // Live Today's Classroom Tracker
      const daysMap = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const now = new Date();
      const currentDayOfWeek = now.getDay();
      const isSunday = currentDayOfWeek === 0;

      if (isSunday) {
        return res.json({
          success: true,
          role: 'TEACHER',
          teacherSchedule,
          liveToday: {
            dayName: 'Sunday',
            isSunday: true,
            isHoliday: true,
            message: 'Today is Sunday (Weekly Holiday). School is closed today.',
            todayPeriods: [],
            currentPeriod: null,
            nextPeriod: null,
            totalClassesToday: 0
          }
        });
      }

      const currentDayName = daysMap[currentDayOfWeek];
      const todayScheduleObj = teacherSchedule.find(s => s.day === currentDayName);
      const todayPeriods = todayScheduleObj?.periods || [];

      const parseTimeToMinutes = (timeStr) => {
        if (!timeStr) return 0;
        const [time, modifier] = timeStr.trim().split(' ');
        let [hours, minutes] = time.split(':').map(Number);
        if (modifier === 'PM' && hours < 12) hours += 12;
        if (modifier === 'AM' && hours === 12) hours = 0;
        return hours * 60 + (minutes || 0);
      };

      const currentTotalMinutes = now.getHours() * 60 + now.getMinutes();
      let currentPeriod = null;
      let nextPeriod = null;

      const formattedTodayPeriods = todayPeriods.map(p => {
        const startMin = parseTimeToMinutes(p.startTime);
        const endMin = parseTimeToMinutes(p.endTime);
        let status = 'upcoming';

        if (currentTotalMinutes >= startMin && currentTotalMinutes <= endMin) {
          status = 'in-progress';
          currentPeriod = { ...p, status };
        } else if (currentTotalMinutes > endMin) {
          status = 'completed';
        } else if (currentTotalMinutes < startMin && !nextPeriod) {
          status = 'next';
          nextPeriod = { ...p, status };
        }

        return { ...p, status };
      });

      return res.json({
        success: true,
        role: 'TEACHER',
        teacherSchedule,
        liveToday: {
          dayName: currentDayName,
          isSunday: false,
          isHoliday: false,
          todayPeriods: formattedTodayPeriods,
          currentPeriod,
          nextPeriod,
          totalClassesToday: formattedTodayPeriods.length
        }
      });
    }

    // 3. For Head / Principal: return ALL class timetables (master admin view)
    const allTimetables = await Timetable.find()
      .populate('class', 'name section')
      .populate('schedule.periods.subject', 'name code')
      .populate('schedule.periods.teacher', 'name email mobile');

    // Return first available timetable as preview + all class list
    const firstTimetable = allTimetables[0] || null;

    res.json({
      success: true,
      role: user.role,
      classId: firstTimetable?.class?._id || null,
      timetable: firstTimetable || { schedule: [] },
      allTimetables: allTimetables.map(tt => ({
        classId: tt.class?._id,
        className: tt.className,
        section: tt.section
      })),
      message: 'Master timetable loaded for admin preview'
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/timetable/save
// @desc    Create or update weekly timetable for a class
// @access  Private (HEAD, PRINCIPAL)
router.post('/save', protect, checkRole('HEAD', 'PRINCIPAL'), async (req, res) => {
  try {
    const { classId, academicYear, schedule } = req.body;

    if (!classId || !Array.isArray(schedule)) {
      return res.status(400).json({ success: false, message: 'classId and schedule array are required' });
    }

    const cls = await Class.findById(classId);
    if (!cls) {
      return res.status(404).json({ success: false, message: 'Class not found' });
    }

    const mongoose = require('mongoose');
    const Subject = require('../models/Subject');
    const User = require('../models/User');

    const allSubjects = await Subject.find({}, '_id name');
    const allTeachers = await User.find({ role: { $in: ['TEACHER', 'HEAD', 'PRINCIPAL'] } }, '_id name');
    const subjectMap = new Map(allSubjects.map(s => [s._id.toString(), s.name]));
    const teacherMap = new Map(allTeachers.map(t => [t._id.toString(), t.name]));

    const cleanedSchedule = schedule.map(dayData => ({
      day: dayData.day,
      periods: (dayData.periods || []).map(p => {
        const isBreak = !!p.isBreak;
        let rawSub = isBreak ? null : (p.subject?._id || p.subject);
        let rawTeach = isBreak ? null : (p.teacher?._id || p.teacher);
        if (rawSub && typeof rawSub === 'object' && rawSub._id) rawSub = rawSub._id;
        if (rawTeach && typeof rawTeach === 'object' && rawTeach._id) rawTeach = rawTeach._id;

        const subStr = rawSub ? rawSub.toString().trim() : '';
        const teachStr = rawTeach ? rawTeach.toString().trim() : '';

        const validSub = (!isBreak && subStr && mongoose.Types.ObjectId.isValid(subStr)) ? subStr : null;
        const validTeach = (!isBreak && teachStr && mongoose.Types.ObjectId.isValid(teachStr)) ? teachStr : null;

        const resolvedSubName = isBreak
          ? 'Lunch Break'
          : (validSub && subjectMap.has(validSub.toString()) ? subjectMap.get(validSub.toString()) : (p.subjectName || ''));

        const resolvedTeachName = isBreak
          ? ''
          : (validTeach && teacherMap.has(validTeach.toString()) ? teacherMap.get(validTeach.toString()) : (p.teacherName || ''));

        return {
          periodNumber: p.periodNumber,
          periodTitle: p.periodTitle || (isBreak ? 'Lunch Break' : `Period ${p.periodNumber}`),
          isBreak,
          startTime: p.startTime,
          endTime: p.endTime,
          subject: validSub,
          subjectName: resolvedSubName,
          teacher: validTeach,
          teacherName: resolvedTeachName,
          roomNo: p.roomNo || `Class ${cls.name}`
        };
      })
    }));

    const filter = { class: classId, academicYear: academicYear || '2026-2027' };
    const update = {
      class: classId,
      className: `Class ${cls.name}`,
      section: cls.section || 'A',
      academicYear: academicYear || '2026-2027',
      schedule: cleanedSchedule
    };

    const timetable = await Timetable.findOneAndUpdate(filter, update, {
      new: true,
      upsert: true,
      setDefaultsOnInsert: true
    }).populate('class', 'name section');

    res.json({
      success: true,
      message: `Timetable for Class ${cls.name} saved successfully`,
      timetable
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   DELETE /api/timetable/class/:classId
// @desc    Delete/reset timetable for a class
// @access  Private (HEAD, PRINCIPAL)
router.delete('/class/:classId', protect, checkRole('HEAD', 'PRINCIPAL'), async (req, res) => {
  try {
    const { classId } = req.params;
    await Timetable.deleteOne({ class: classId });
    res.json({ success: true, message: 'Timetable removed successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
