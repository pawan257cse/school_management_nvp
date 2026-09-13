const express = require('express');
const router = express.Router();
const Timetable = require('../models/Timetable');
const Class = require('../models/Class');
const Student = require('../models/Student');
const Holiday = require('../models/Holiday');
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

    // Fetch School Holidays & determine today's status
    const holidays = await Holiday.find().sort({ date: 1 });
    const now = new Date();
    const istOffset = 5.5 * 60 * 60 * 1000;
    const istDate = new Date(now.getTime() + istOffset);
    const todayStr = istDate.toISOString().split('T')[0];
    const currentDayOfWeek = istDate.getDay();
    const isSunday = currentDayOfWeek === 0;

    const todayHoliday = holidays.find(h => {
      if (h.date === todayStr) return true;
      if (h.endDate && todayStr >= h.date && todayStr <= h.endDate) return true;
      return false;
    }) || null;

    const isTodayOff = isSunday || !!todayHoliday;
    const holidayMessage = isSunday
      ? 'Today is Sunday (Weekly Holiday). School is closed today.'
      : (todayHoliday ? `Today is School Holiday: ${todayHoliday.title}${todayHoliday.description ? ` (${todayHoliday.description})` : ''}` : undefined);

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
          todayStr,
          isSunday,
          isHoliday: isTodayOff,
          todayHoliday,
          holidays,
          timetable: { schedule: [] },
          message: 'Student class not linked. Please contact the school administration.'
        });
      }

      const timetable = await Timetable.findOne({ class: targetClassId })
        .populate('class', 'name section')
        .populate('schedule.periods.subject', 'name code')
        .populate('schedule.periods.teacher', 'name email mobile');

      return res.json({
        success: true,
        role: 'STUDENT',
        classId: targetClassId,
        todayStr,
        isSunday,
        isHoliday: isTodayOff,
        todayHoliday: todayHoliday ? {
          _id: todayHoliday._id,
          title: todayHoliday.title,
          date: todayHoliday.date,
          endDate: todayHoliday.endDate,
          description: todayHoliday.description,
          type: todayHoliday.type
        } : null,
        holidays,
        message: holidayMessage,
        timetable: timetable || { schedule: [] }
      });
    }

    // 2. If Teacher: return periods where this teacher is assigned across all classes + Live Classroom Tracker
    if (user.role === 'TEACHER') {
      const allTimetables = await Timetable.find()
        .populate('class', 'name section')
        .populate('schedule.periods.subject', 'name code');

      const getExactPeriodNumber = (periodNumber, startTime) => {
        if (startTime) {
          const cleanTime = startTime.trim().toUpperCase();
          if (cleanTime.startsWith('08:00') || cleanTime.startsWith('8:00')) return 1;
          if (cleanTime.startsWith('08:40') || cleanTime.startsWith('8:40')) return 2;
          if (cleanTime.startsWith('09:10') || cleanTime.startsWith('9:10')) return 3;
          if (cleanTime.startsWith('09:45') || cleanTime.startsWith('9:45')) return 4;
          if (cleanTime.startsWith('10:40')) return 5;
          if (cleanTime.startsWith('11:20')) return 6;
          if (cleanTime.startsWith('11:50')) return 7;
          if (cleanTime.startsWith('12:25')) return 8;
        }
        const pNum = Number(periodNumber) || 1;
        const displayNum = pNum > 5 ? pNum - 1 : pNum;
        return Math.min(Math.max(displayNum, 1), 8);
      };

      const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const teacherSchedule = days.map(dayName => {
        const dayPeriods = [];

        allTimetables.forEach(tt => {
          const dayData = tt.schedule.find(s => s.day === dayName);
          if (dayData && Array.isArray(dayData.periods)) {
            dayData.periods.forEach(p => {
              if (p.teacher && p.teacher.toString() === user._id.toString() && !p.isBreak && p.subjectName !== 'Lunch Break') {
                const pNum = Number(p.periodNumber) || 1;
                const exactNum = getExactPeriodNumber(pNum, p.startTime);
                const displayTitle = `Period ${exactNum}`;

                dayPeriods.push({
                  classId: tt.class?._id,
                  className: tt.className,
                  section: tt.section,
                  periodNumber: exactNum,
                  rawPeriodNumber: pNum,
                  periodTitle: displayTitle,
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

      const daysMap = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

      if (isTodayOff) {
        return res.json({
          success: true,
          role: 'TEACHER',
          todayStr,
          isSunday,
          isHoliday: true,
          todayHoliday: todayHoliday ? {
            _id: todayHoliday._id,
            title: todayHoliday.title,
            date: todayHoliday.date,
            endDate: todayHoliday.endDate,
            description: todayHoliday.description,
            type: todayHoliday.type
          } : null,
          holidays,
          teacherSchedule,
          liveToday: {
            dayName: daysMap[currentDayOfWeek],
            isSunday,
            isHoliday: true,
            todayHoliday,
            message: holidayMessage,
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
        todayStr,
        isSunday: false,
        isHoliday: false,
        todayHoliday: null,
        holidays,
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

// @route   GET /api/timetable/holidays
// @desc    Get all school holidays
// @access  Private (All authenticated users)
router.get('/holidays', protect, async (req, res) => {
  try {
    const holidays = await Holiday.find()
      .populate('createdBy', 'name role')
      .sort({ date: 1 });

    const now = new Date();
    const istOffset = 5.5 * 60 * 60 * 1000;
    const istDate = new Date(now.getTime() + istOffset);
    const todayStr = istDate.toISOString().split('T')[0];

    const todayHoliday = holidays.find(h => {
      if (h.date === todayStr) return true;
      if (h.endDate && todayStr >= h.date && todayStr <= h.endDate) return true;
      return false;
    }) || null;

    res.json({
      success: true,
      todayStr,
      todayHoliday,
      holidays
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/timetable/holidays
// @desc    Declare a school holiday
// @access  Private (HEAD, PRINCIPAL)
router.post('/holidays', protect, checkRole('HEAD', 'PRINCIPAL'), async (req, res) => {
  try {
    const { title, date, endDate, description, type, academicYear } = req.body;

    if (!title || !date) {
      return res.status(400).json({ success: false, message: 'Holiday title and date are required.' });
    }

    const newHoliday = await Holiday.create({
      title: title.trim(),
      date: date.trim(),
      endDate: endDate ? endDate.trim() : null,
      description: description ? description.trim() : '',
      type: type || 'FESTIVAL',
      academicYear: academicYear || '2026-2027',
      createdBy: req.user._id
    });

    res.status(201).json({
      success: true,
      message: 'School holiday declared successfully.',
      holiday: newHoliday
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   DELETE /api/timetable/holidays/:id
// @desc    Delete a school holiday
// @access  Private (HEAD, PRINCIPAL)
router.delete('/holidays/:id', protect, checkRole('HEAD', 'PRINCIPAL'), async (req, res) => {
  try {
    const holiday = await Holiday.findById(req.params.id);
    if (!holiday) {
      return res.status(404).json({ success: false, message: 'Holiday record not found.' });
    }

    await Holiday.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Holiday deleted successfully.'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
