require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const { FeeStructure } = require('../models/Fee');
const Class = require('../models/Class');
const Transport = require('../models/Transport');

const officialFeeSpecs = [
  { className: 'PG', admissionFee: 500, examFee: 1000, tuitionFee: 10500, term1: 6500, term2: 5000 },
  { className: 'LKG', admissionFee: 500, examFee: 1000, tuitionFee: 11500, term1: 6500, term2: 6000 },
  { className: 'UKG', admissionFee: 500, examFee: 1000, tuitionFee: 12500, term1: 7500, term2: 6000 },
  { className: '1', admissionFee: 500, examFee: 1500, tuitionFee: 13500, term1: 8000, term2: 7000 },
  { className: '2', admissionFee: 500, examFee: 1500, tuitionFee: 14500, term1: 8000, term2: 8000 },
  { className: '3', admissionFee: 500, examFee: 1500, tuitionFee: 15500, term1: 9000, term2: 8000 },
  { className: '4', admissionFee: 500, examFee: 1500, tuitionFee: 15500, term1: 9000, term2: 8000 },
  { className: '5', admissionFee: 500, examFee: 1500, tuitionFee: 16500, term1: 9000, term2: 9000 },
  { className: '6', admissionFee: 500, examFee: 1500, tuitionFee: 16500, term1: 9000, term2: 9000 },
  { className: '7', admissionFee: 500, examFee: 1500, tuitionFee: 17500, term1: 10000, term2: 9000 },
  { className: '8', admissionFee: 500, examFee: 1500, tuitionFee: 18500, term1: 10000, term2: 10000 }
];

const officialTransportChart = [
  { routeTitle: 'Koyal', vehicleNo: 'RJ 37 PA 1001', totalFare: 5500, firstInstallment: 3000, secondInstallment: 2500, driverName: 'Koyal Route Driver', driverPhone: '+91 98290 10001' },
  { routeTitle: 'Jhardiya', vehicleNo: 'RJ 37 PA 1002', totalFare: 5500, firstInstallment: 3000, secondInstallment: 2500, driverName: 'Jhardiya Route Driver', driverPhone: '+91 98290 10002' },
  { routeTitle: 'Bharnawa', vehicleNo: 'RJ 37 PA 1003', totalFare: 5500, firstInstallment: 3000, secondInstallment: 2500, driverName: 'Bharnawa Route Driver', driverPhone: '+91 98290 10003' },
  { routeTitle: 'Hudas', vehicleNo: 'RJ 37 PA 1004', totalFare: 6600, firstInstallment: 3300, secondInstallment: 3300, driverName: 'Hudas Route Driver', driverPhone: '+91 98290 10004' },
  { routeTitle: 'Khokhari', vehicleNo: 'RJ 37 PA 1005', totalFare: 5500, firstInstallment: 3000, secondInstallment: 2500, driverName: 'Khokhari Route Driver', driverPhone: '+91 98290 10005' },
  { routeTitle: 'Bera Ki Dhani', vehicleNo: 'RJ 37 PA 1006', totalFare: 3300, firstInstallment: 2000, secondInstallment: 1300, driverName: 'Bera Ki Dhani Driver', driverPhone: '+91 98290 10006' },
  { routeTitle: 'Nimbi Local', vehicleNo: 'RJ 37 PA 1007', totalFare: 2200, firstInstallment: 1200, secondInstallment: 1000, driverName: 'Nimbi Local Driver', driverPhone: '+91 98290 10007' }
];

async function seedOfficialFeeAndTransport() {
  try {
    await connectDB();
    console.log('[Seeder] Connected to MongoDB Atlas...');

    // 1. Seed Fee Structures for each Class
    console.log('=== SEEDING OFFICIAL SCHOOL FEE STRUCTURE ===');
    for (const spec of officialFeeSpecs) {
      let cls = await Class.findOne({ name: spec.className });
      if (!cls) {
        cls = await Class.create({ name: spec.className, section: 'A', status: 'active' });
      }

      const totalBaseFee = spec.admissionFee + spec.examFee + spec.tuitionFee;

      const feeHeads = [
        { headName: 'Admission Fee (New Students Only)', amount: spec.admissionFee, frequency: 'One-Time' },
        { headName: 'Exam Fee', amount: spec.examFee, frequency: 'Annual' },
        { headName: 'Tuition Fee', amount: spec.tuitionFee, frequency: 'Annual' }
      ];

      const installments = [
        { installmentNo: 1, title: 'FIRST TERM (APRIL-AUG)', dueDate: new Date('2026-08-31'), amount: spec.term1 },
        { installmentNo: 2, title: 'SECOND TERM (OCT-FEB)', dueDate: new Date('2026-02-28'), amount: spec.term2 }
      ];

      const existingStruct = await FeeStructure.findOne({ class: cls._id, academicYear: '2026-2027' });

      if (existingStruct) {
        existingStruct.feeHeads = feeHeads;
        existingStruct.totalBaseFee = totalBaseFee;
        existingStruct.installments = installments;
        await existingStruct.save();
        console.log(`[Fee] Updated Fee Structure for Class ${spec.className} (Total: ₹${totalBaseFee})`);
      } else {
        await FeeStructure.create({
          class: cls._id,
          className: `Class ${spec.className}`,
          section: 'A',
          academicYear: '2026-2027',
          feeHeads,
          totalBaseFee,
          installments
        });
        console.log(`[Fee] Created Fee Structure for Class ${spec.className} (Total: ₹${totalBaseFee})`);
      }
    }

    // 2. Seed Official Transport Chart
    console.log('\n=== SEEDING OFFICIAL TRANSPORT / FARE CHART ===');
    for (const tr of officialTransportChart) {
      const existing = await Transport.findOne({ routeTitle: tr.routeTitle });
      if (existing) {
        existing.vehicleNo = tr.vehicleNo;
        existing.totalFare = tr.totalFare;
        existing.firstInstallment = tr.firstInstallment;
        existing.secondInstallment = tr.secondInstallment;
        existing.monthlyFee = Math.round(tr.totalFare / 10);
        existing.pickupPoints = [tr.routeTitle];
        await existing.save();
        console.log(`[Transport] Updated Route: ${tr.routeTitle} (Total: ₹${tr.totalFare}, 1st Inst: ₹${tr.firstInstallment}, 2nd Inst: ₹${tr.secondInstallment})`);
      } else {
        await Transport.create({
          vehicleNo: tr.vehicleNo,
          vehicleType: 'School Bus',
          routeTitle: tr.routeTitle,
          driverName: tr.driverName,
          driverPhone: tr.driverPhone,
          capacity: 40,
          monthlyFee: Math.round(tr.totalFare / 10),
          totalFare: tr.totalFare,
          firstInstallment: tr.firstInstallment,
          secondInstallment: tr.secondInstallment,
          pickupPoints: [tr.routeTitle],
          status: 'active'
        });
        console.log(`[Transport] Created Route: ${tr.routeTitle} (Total: ₹${tr.totalFare}, 1st Inst: ₹${tr.firstInstallment}, 2nd Inst: ₹${tr.secondInstallment})`);
      }
    }

    console.log('\n=== OFFICIAL NVP FEE & TRANSPORT CHART SEEDED SUCCESSFULLY ===');
    return true;
  } catch (err) {
    console.error('Error seeding fee and transport chart:', err);
    throw err;
  }
}

module.exports = seedOfficialFeeAndTransport;

if (require.main === module) {
  seedOfficialFeeAndTransport()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}
