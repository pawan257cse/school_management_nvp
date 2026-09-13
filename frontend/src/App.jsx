import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Common Components
import Sidebar from './components/common/Sidebar';
import Topbar from './components/common/Topbar';

// Pages
import Login from './pages/Login';

// Head Pages
import HeadDashboard from './pages/head/HeadDashboard';
import TeacherManagement from './pages/head/TeacherManagement';
import PrincipalManagement from './pages/head/PrincipalManagement';
import ClassManagement from './pages/head/ClassManagement';
import SubjectManagement from './pages/head/SubjectManagement';
import RolePermissions from './pages/head/RolePermissions';
import ActivityLogs from './pages/head/ActivityLogs';
import LoginHistory from './pages/head/LoginHistory';
import SystemSettings from './pages/head/SystemSettings';

// New Core School Management Pages
import StudentManagement from './pages/head/StudentManagement';
import ParentManagement from './pages/head/ParentManagement';
import StaffManagement from './pages/head/StaffManagement';
import ExamManagement from './pages/head/ExamManagement';
import FeeManagement from './pages/head/FeeManagement';
import PromotionManagement from './pages/head/PromotionManagement';
import SchoolInfo from './pages/head/SchoolInfo';
import NoticeBoard from './pages/head/NoticeBoard';
import FacultyAttendance from './pages/head/TeacherAttendance';
import TransportManagement from './pages/head/TransportManagement';
import HeadAssignmentManagement from './pages/head/HeadAssignmentManagement';
import CredentialsManagement from './pages/head/CredentialsManagement';

// Timetable & Student Portal Pages
import TimetableManagement from './pages/principal/TimetableManagement';
import StudentDashboard from './pages/student/StudentDashboard';
import StudentTimetable from './pages/student/StudentTimetable';
import StudentAttendance from './pages/student/StudentAttendance';
import StudentResults from './pages/student/StudentResults';
import StudentFees from './pages/student/StudentFees';
import StudentAssignments from './pages/student/StudentAssignments';

// Principal Pages
import PrincipalDashboard from './pages/principal/PrincipalDashboard';
import QuestionPaperApproval from './pages/principal/QuestionPaperApproval';
import TeacherPerformance from './pages/principal/TeacherPerformance';
import PrincipalReports from './pages/principal/PrincipalReports';

// Teacher Pages
import TeacherDashboard from './pages/teacher/TeacherDashboard';
import TeacherQuestionPapers from './pages/teacher/TeacherQuestionPapers';
import CreateQuestionPaper from './pages/teacher/CreateQuestionPaper';
import TeacherAssignments from './pages/teacher/TeacherAssignments';
import TeacherAttendance from './pages/teacher/TeacherAttendance';
import TeacherResults from './pages/teacher/TeacherResults';
import TeacherMaterials from './pages/teacher/TeacherMaterials';
import TeacherNotifications from './pages/teacher/TeacherNotifications';
import TeacherAnalytics from './pages/teacher/TeacherAnalytics';
import TeacherProfile from './pages/teacher/TeacherProfile';
import TeacherTimetable from './pages/teacher/TeacherTimetable';

// Protected Layout Route
const ProtectedLayout = ({ allowedRoles, children }) => {
  const { user, loading, getDefaultRouteForRole } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white font-bold text-sm">
        Initializing NVP Portal Session...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    const fallbackPath = getDefaultRouteForRole(user.role);
    return <Navigate to={fallbackPath} replace />;
  }

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-900 flex w-full max-w-full overflow-x-hidden">
      <Sidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />
      <div className="flex-1 lg:pl-72 flex flex-col min-w-0 w-full max-w-full overflow-x-hidden">
        <Topbar setMobileOpen={setMobileOpen} />
        <main className="p-2.5 sm:p-5 lg:p-8 flex-1 max-w-7xl w-full mx-auto min-w-0">
          {children}
        </main>
      </div>
    </div>
  );
};

// Dedicated Admin Gate: renders Head Dashboard if logged in as HEAD, otherwise renders private Admin Console login
const AdminGate = () => {
  const { user, loading } = useAuth();
  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white font-bold">Loading...</div>;
  }
  if (user && user.role === 'HEAD') {
    return (
      <ProtectedLayout allowedRoles={['HEAD']}>
        <HeadDashboard />
      </ProtectedLayout>
    );
  }
  return <Login isAdminMode={true} />;
};

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login isAdminMode={false} />} />

          {/* Dedicated /admin and /head Gateway (Hidden from standard /login) */}
          <Route path="/admin" element={<AdminGate />} />
          <Route path="/head" element={<AdminGate />} />

          {/* Core School Management Routes (Head & Principal Access) */}
          <Route path="/students" element={<ProtectedLayout allowedRoles={['HEAD', 'PRINCIPAL']}><StudentManagement /></ProtectedLayout>} />
          <Route path="/students/create" element={<ProtectedLayout allowedRoles={['HEAD', 'PRINCIPAL']}><StudentManagement /></ProtectedLayout>} />
          <Route path="/parents" element={<ProtectedLayout allowedRoles={['HEAD', 'PRINCIPAL']}><ParentManagement /></ProtectedLayout>} />
          <Route path="/staff" element={<ProtectedLayout allowedRoles={['HEAD', 'PRINCIPAL']}><StaffManagement /></ProtectedLayout>} />
          <Route path="/exams" element={<ProtectedLayout allowedRoles={['HEAD', 'PRINCIPAL']}><ExamManagement /></ProtectedLayout>} />
          <Route path="/exams/create" element={<ProtectedLayout allowedRoles={['HEAD', 'PRINCIPAL']}><ExamManagement /></ProtectedLayout>} />
          <Route path="/fees" element={<ProtectedLayout allowedRoles={['HEAD', 'PRINCIPAL']}><FeeManagement /></ProtectedLayout>} />
          <Route path="/fees/structure" element={<ProtectedLayout allowedRoles={['HEAD', 'PRINCIPAL']}><FeeManagement /></ProtectedLayout>} />
          <Route path="/promotions" element={<ProtectedLayout allowedRoles={['HEAD', 'PRINCIPAL']}><PromotionManagement /></ProtectedLayout>} />
          <Route path="/config/school-info" element={<ProtectedLayout allowedRoles={['HEAD', 'PRINCIPAL']}><SchoolInfo /></ProtectedLayout>} />
          <Route path="/notifications/notices" element={<ProtectedLayout allowedRoles={['HEAD', 'PRINCIPAL', 'TEACHER']}><NoticeBoard /></ProtectedLayout>} />
          <Route path="/results" element={<ProtectedLayout allowedRoles={['HEAD', 'PRINCIPAL']}><TeacherResults /></ProtectedLayout>} />
          <Route path="/attendance" element={<ProtectedLayout allowedRoles={['HEAD', 'PRINCIPAL', 'TEACHER']}><TeacherAttendance /></ProtectedLayout>} />
          <Route path="/head/teacher-attendance" element={<ProtectedLayout allowedRoles={['HEAD', 'PRINCIPAL']}><FacultyAttendance /></ProtectedLayout>} />
          <Route path="/transport" element={<ProtectedLayout allowedRoles={['HEAD', 'PRINCIPAL']}><TransportManagement /></ProtectedLayout>} />
          <Route path="/academic/timetable" element={<ProtectedLayout allowedRoles={['HEAD', 'PRINCIPAL']}><TimetableManagement /></ProtectedLayout>} />

          {/* Student Portal Routes */}
          <Route path="/student-dashboard" element={<ProtectedLayout allowedRoles={['STUDENT', 'HEAD', 'PRINCIPAL']}><StudentDashboard /></ProtectedLayout>} />
          <Route path="/student/assignments" element={<ProtectedLayout allowedRoles={['STUDENT', 'HEAD', 'PRINCIPAL']}><StudentAssignments /></ProtectedLayout>} />
          <Route path="/student/homework" element={<ProtectedLayout allowedRoles={['STUDENT', 'HEAD', 'PRINCIPAL']}><StudentAssignments /></ProtectedLayout>} />
          <Route path="/student/timetable" element={<ProtectedLayout allowedRoles={['STUDENT', 'HEAD', 'PRINCIPAL']}><StudentTimetable /></ProtectedLayout>} />
          <Route path="/student/attendance" element={<ProtectedLayout allowedRoles={['STUDENT', 'HEAD', 'PRINCIPAL']}><StudentAttendance /></ProtectedLayout>} />
          <Route path="/student/results" element={<ProtectedLayout allowedRoles={['STUDENT', 'HEAD', 'PRINCIPAL']}><StudentResults /></ProtectedLayout>} />
          <Route path="/student/fees" element={<ProtectedLayout allowedRoles={['STUDENT', 'HEAD', 'PRINCIPAL']}><StudentFees /></ProtectedLayout>} />

          {/* HEAD Super Admin Routes */}
          <Route path="/head-dashboard" element={<ProtectedLayout allowedRoles={['HEAD']}><HeadDashboard /></ProtectedLayout>} />
          <Route path="/dashboard" element={<ProtectedLayout allowedRoles={['HEAD']}><HeadDashboard /></ProtectedLayout>} />
          <Route path="/head/users" element={<ProtectedLayout allowedRoles={['HEAD', 'PRINCIPAL']}><TeacherManagement /></ProtectedLayout>} />
          <Route path="/accounts/users" element={<ProtectedLayout allowedRoles={['HEAD', 'PRINCIPAL']}><TeacherManagement /></ProtectedLayout>} />
          <Route path="/head/teachers" element={<ProtectedLayout allowedRoles={['HEAD', 'PRINCIPAL']}><TeacherManagement /></ProtectedLayout>} />
          <Route path="/teachers" element={<ProtectedLayout allowedRoles={['HEAD', 'PRINCIPAL']}><TeacherManagement /></ProtectedLayout>} />
          <Route path="/head/principal" element={<ProtectedLayout allowedRoles={['HEAD', 'PRINCIPAL']}><PrincipalManagement /></ProtectedLayout>} />
          <Route path="/head/classes" element={<ProtectedLayout allowedRoles={['HEAD', 'PRINCIPAL']}><ClassManagement /></ProtectedLayout>} />
          <Route path="/classes" element={<ProtectedLayout allowedRoles={['HEAD', 'PRINCIPAL']}><ClassManagement /></ProtectedLayout>} />
          <Route path="/classes/subjects" element={<ProtectedLayout allowedRoles={['HEAD', 'PRINCIPAL']}><SubjectManagement /></ProtectedLayout>} />
          <Route path="/head/subjects" element={<ProtectedLayout allowedRoles={['HEAD', 'PRINCIPAL']}><SubjectManagement /></ProtectedLayout>} />
          <Route path="/head/security" element={<ProtectedLayout allowedRoles={['HEAD']}><RolePermissions /></ProtectedLayout>} />
          <Route path="/head/activity" element={<ProtectedLayout allowedRoles={['HEAD']}><ActivityLogs /></ProtectedLayout>} />
          <Route path="/head/login-history" element={<ProtectedLayout allowedRoles={['HEAD']}><LoginHistory /></ProtectedLayout>} />
          <Route path="/head/settings" element={<ProtectedLayout allowedRoles={['HEAD']}><SystemSettings /></ProtectedLayout>} />
          <Route path="/head/assignments" element={<ProtectedLayout allowedRoles={['HEAD', 'PRINCIPAL']}><HeadAssignmentManagement /></ProtectedLayout>} />
          <Route path="/head/credentials" element={<ProtectedLayout allowedRoles={['HEAD', 'PRINCIPAL']}><CredentialsManagement /></ProtectedLayout>} />

          {/* PRINCIPAL Routes */}
          <Route path="/principal-dashboard" element={<ProtectedLayout allowedRoles={['HEAD', 'PRINCIPAL']}><PrincipalDashboard /></ProtectedLayout>} />
          <Route path="/principal/teachers" element={<ProtectedLayout allowedRoles={['HEAD', 'PRINCIPAL']}><TeacherManagement /></ProtectedLayout>} />
          <Route path="/principal/classes" element={<ProtectedLayout allowedRoles={['HEAD', 'PRINCIPAL']}><ClassManagement /></ProtectedLayout>} />
          <Route path="/principal/subjects" element={<ProtectedLayout allowedRoles={['HEAD', 'PRINCIPAL']}><SubjectManagement /></ProtectedLayout>} />
          <Route path="/principal/question-papers" element={<ProtectedLayout allowedRoles={['HEAD', 'PRINCIPAL']}><QuestionPaperApproval /></ProtectedLayout>} />
          <Route path="/principal/assignments" element={<ProtectedLayout allowedRoles={['HEAD', 'PRINCIPAL']}><TeacherAssignments /></ProtectedLayout>} />
          <Route path="/principal/results" element={<ProtectedLayout allowedRoles={['HEAD', 'PRINCIPAL']}><TeacherResults /></ProtectedLayout>} />
          <Route path="/principal/attendance" element={<ProtectedLayout allowedRoles={['HEAD', 'PRINCIPAL']}><TeacherAttendance /></ProtectedLayout>} />
          <Route path="/principal/performance" element={<ProtectedLayout allowedRoles={['HEAD', 'PRINCIPAL']}><TeacherPerformance /></ProtectedLayout>} />
          <Route path="/principal/reports" element={<ProtectedLayout allowedRoles={['HEAD', 'PRINCIPAL']}><PrincipalReports /></ProtectedLayout>} />

          {/* TEACHER Routes */}
          <Route path="/teacher-dashboard" element={<ProtectedLayout allowedRoles={['TEACHER', 'HEAD', 'PRINCIPAL']}><TeacherDashboard /></ProtectedLayout>} />
          <Route path="/teacher/timetable" element={<ProtectedLayout allowedRoles={['TEACHER', 'HEAD', 'PRINCIPAL']}><TeacherTimetable /></ProtectedLayout>} />
          <Route path="/teacher/profile" element={<ProtectedLayout allowedRoles={['TEACHER']}><TeacherProfile /></ProtectedLayout>} />
          <Route path="/teacher/classes" element={<ProtectedLayout allowedRoles={['TEACHER']}><TeacherDashboard /></ProtectedLayout>} />
          <Route path="/teacher/subjects" element={<ProtectedLayout allowedRoles={['TEACHER']}><TeacherDashboard /></ProtectedLayout>} />
          <Route path="/teacher/question-papers" element={<ProtectedLayout allowedRoles={['TEACHER']}><TeacherQuestionPapers /></ProtectedLayout>} />
          <Route path="/teacher/question-papers/create" element={<ProtectedLayout allowedRoles={['TEACHER']}><CreateQuestionPaper /></ProtectedLayout>} />
          <Route path="/teacher/question-papers/edit/:id" element={<ProtectedLayout allowedRoles={['TEACHER']}><CreateQuestionPaper /></ProtectedLayout>} />
          <Route path="/teacher/assignments" element={<ProtectedLayout allowedRoles={['TEACHER']}><TeacherAssignments /></ProtectedLayout>} />
          <Route path="/teacher/attendance" element={<ProtectedLayout allowedRoles={['TEACHER']}><TeacherAttendance /></ProtectedLayout>} />
          <Route path="/teacher/results" element={<ProtectedLayout allowedRoles={['TEACHER']}><TeacherResults /></ProtectedLayout>} />
          <Route path="/teacher/materials" element={<ProtectedLayout allowedRoles={['TEACHER']}><TeacherMaterials /></ProtectedLayout>} />
          <Route path="/teacher/notifications" element={<ProtectedLayout allowedRoles={['TEACHER']}><TeacherNotifications /></ProtectedLayout>} />
          <Route path="/notifications" element={<ProtectedLayout allowedRoles={['HEAD', 'PRINCIPAL', 'TEACHER']}><NoticeBoard /></ProtectedLayout>} />
          <Route path="/teacher/analytics" element={<ProtectedLayout allowedRoles={['TEACHER']}><TeacherAnalytics /></ProtectedLayout>} />

          {/* Default Fallback Redirect */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
