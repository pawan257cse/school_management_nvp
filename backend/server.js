require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
const connectDB = require('./config/db');
const seedInitialData = require('./utils/seedData');

const app = express();

// Security Middlewares
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// CORS — allow frontend URL in production, all origins in dev
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (Postman, mobile apps, same-origin)
    if (!origin) return callback(null, true);
    if (process.env.NODE_ENV !== 'production') return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    callback(null, true); // Allow all in initial deployment; tighten later
  },
  credentials: true
}));

app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

// Rate Limiter
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  message: { success: false, message: 'Too many requests from this IP, please try again later.' }
});
app.use('/api', apiLimiter);

// Serve static uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Register API Routes
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/users', require('./routes/user.routes'));
app.use('/api/classes', require('./routes/class.routes'));
app.use('/api/subjects', require('./routes/subject.routes'));
app.use('/api/question-papers', require('./routes/questionPaper.routes'));
app.use('/api/assignments', require('./routes/assignment.routes'));
app.use('/api/materials', require('./routes/material.routes'));
app.use('/api/attendance', require('./routes/attendance.routes'));
app.use('/api/results', require('./routes/result.routes'));
app.use('/api/notifications', require('./routes/notification.routes'));
app.use('/api/announcements', require('./routes/announcement.routes'));
app.use('/api/reports', require('./routes/report.routes'));
app.use('/api/audit', require('./routes/audit.routes'));
app.use('/api/settings', require('./routes/setting.routes'));
app.use('/api/students', require('./routes/student.routes'));
app.use('/api/parents', require('./routes/parent.routes'));
app.use('/api/staff', require('./routes/staff.routes'));
app.use('/api/exams', require('./routes/exam.routes'));
app.use('/api/fees', require('./routes/fee.routes'));
app.use('/api/promotions', require('./routes/promotion.routes'));
app.use('/api/config/school-info', require('./routes/schoolInfo.routes'));
app.use('/api/teacher-attendance', require('./routes/teacherAttendance.routes'));
app.use('/api/transport', require('./routes/transport.routes'));
app.use('/api/timetable', require('./routes/timetable.routes'));
app.use('/api/student-portal', require('./routes/studentPortal.routes'));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'NVP School Portal API is running.', timestamp: new Date(), env: process.env.NODE_ENV });
});

// ── PRODUCTION: Serve React frontend build ──────────────────────────────────
if (process.env.NODE_ENV === 'production') {
  const distPath = path.join(__dirname, '../frontend/dist');
  app.use(express.static(distPath));
  // Any route not starting with /api → serve React app
  app.get('*', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();
  await seedInitialData();

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`====================================================`);
    console.log(`  NVP ENGLISH MEDIUM SCHOOL PORTAL SERVER STARTED  `);
    console.log(`  Mode: ${process.env.NODE_ENV || 'development'}   `);
    console.log(`  Running on: http://localhost:${PORT}             `);
    console.log(`====================================================`);
  });
};

startServer();
