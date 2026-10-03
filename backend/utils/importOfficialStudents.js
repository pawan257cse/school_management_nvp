const bcrypt = require('bcryptjs');
const Student = require('../models/Student');
const Class = require('../models/Class');
const User = require('../models/User');
const rawStudentData = require('../scripts/officialStudentData.json');

const importOfficialStudents = async () => {
  try {
    console.log('[System Init] Importing NVP Official Students (93 Real Records)...');

    const salt = await bcrypt.genSalt(10);
    let createdCount = 0;
    let updatedCount = 0;

    for (const [className, studentList] of Object.entries(rawStudentData)) {
      const cls = await Class.findOne({ name: className, section: 'A' });
      if (!cls) {
        console.warn(`[Student Import] Class ${className} not found. Skipping...`);
        continue;
      }

      for (const st of studentList) {
        let dobDate = null;
        if (st.dob && st.dob.includes('/')) {
          const parts = st.dob.split('/');
          if (parts.length === 3) {
            dobDate = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
          }
        }

        const srnNo = String(st.rollNo || st.admissionNo.replace(/[^0-9]/g, '')).trim();
        const firstNameRaw = (st.name || 'Student').trim().split(' ')[0].replace(/[^a-zA-Z0-9]/g, '');
        const firstName = firstNameRaw.charAt(0).toUpperCase() + firstNameRaw.slice(1).toLowerCase();

        const studentData = {
          srnNo: srnNo,
          admissionNo: st.admissionNo,
          rollNo: srnNo,
          name: st.name,
          class: cls._id,
          section: 'A',
          academicYear: '2026-2027',
          fatherName: st.fatherName || '',
          fatherPhone: st.contactNumber || '',
          motherName: st.motherName || '',
          gender: st.gender || 'Male',
          dob: dobDate || null,
          category: st.category || 'General',
          religion: st.religion || 'Hindu',
          nationality: 'Indian',
          contactNumber: st.contactNumber || '',
          address: st.address || 'Nimbi Jodhan',
          city: 'Nimbi Jodhan',
          state: 'Rajasthan',
          pincode: '341316',
          status: 'active'
        };

        let studentDoc = await Student.findOne({ admissionNo: st.admissionNo });
        if (!studentDoc) {
          studentDoc = await Student.create(studentData);
          createdCount++;
        } else {
          Object.assign(studentDoc, studentData);
          await studentDoc.save();
          updatedCount++;
        }

        // Student Username = firstName + srnNo (e.g., bhavya370)
        const username = `${firstName.toLowerCase()}${srnNo}`;
        // Student Password = FirstName@SRN (e.g., Bhavya@370)
        const defaultPassword = `${firstName}@${srnNo}`;
        const passHash = await bcrypt.hash(defaultPassword, salt);
        const studentEmail = `${username}@student.school.local`;

        await User.findOneAndUpdate(
          { admissionNo: st.admissionNo },
          {
            name: st.name,
            email: studentEmail,
            passwordHash: passHash,
            generatedPassword: defaultPassword,
            role: 'STUDENT',
            admissionNo: st.admissionNo,
            studentClass: cls._id,
            studentRef: studentDoc._id,
            mobile: st.contactNumber || '',
            status: 'active',
            mustChangePassword: false
          },
          { upsert: true, new: true }
        );
      }

      // Update student count in Class
      const count = await Student.countDocuments({ class: cls._id, status: 'active' });
      cls.studentCount = count;
      await cls.save();
    }

    console.log(`[Student Import Complete] Created: ${createdCount}, Updated: ${updatedCount} across 10 classes.`);
  } catch (error) {
    console.error('[Student Import Error]:', error.message);
  }
};

module.exports = importOfficialStudents;
