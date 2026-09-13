import axios from 'axios';

const rawApiBase = import.meta.env.VITE_API_URL || '';
const cleanApiBase = () => {
  if (!rawApiBase) return '/api';
  const trimmed = rawApiBase.trim().replace(/\/+$/, '');
  return trimmed.endsWith('/api') ? trimmed : `${trimmed}/api`;
};

const API = axios.create({
  baseURL: cleanApiBase(),
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request Interceptor: Attach JWT Token
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('nvp_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Response Interceptor: Handle Authorization Errors
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Token expired or invalid -> Clear local session
      localStorage.removeItem('nvp_token');
      localStorage.removeItem('nvp_user');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Auth Services
export const loginApi = (email, password) => API.post('/auth/login', { email, password });
export const getMeApi = () => API.get('/auth/me');
export const changePasswordApi = (data) => API.post('/auth/change-password', data);
export const logoutApi = () => API.post('/auth/logout');
export const adminRecoveryResetApi = (data) => API.post('/auth/admin-recovery-reset', data);

// User Management Services
export const getUsersApi = (params) => API.get('/users', { params });
export const getTeachersApi = () => API.get('/users', { params: { role: 'TEACHER' } });
export const createUserApi = (userData) => API.post('/users', userData);
export const updateUserApi = (id, userData) => API.put(`/users/${id}`, userData);
export const resetUserPasswordApi = (id, newPassword) => API.put(`/users/${id}/reset-password`, { newPassword });
export const updateUserPermissionsApi = (id, permissions) => API.put(`/users/${id}/permissions`, { permissions });
export const deleteUserApi = (id) => API.delete(`/users/${id}`);
// Credentials panel — shows email + generated passwords (HEAD/PRINCIPAL only)
export const getCredentialsApi = (params) => API.get('/users/credentials', { params });
// Bulk create student portal accounts for all students in one click
export const bulkCreateStudentsApi = () => API.post('/users/bulk-create-students');
// Reset password (can auto-generate if no password provided)
export const autoResetPasswordApi = (id) => API.put(`/users/${id}/reset-password`, {});

// Academic Services
export const getClassesApi = () => API.get('/classes');
export const createClassApi = (data) => API.post('/classes', data);
export const updateClassApi = (id, data) => API.put(`/classes/${id}`, data);
export const deleteClassApi = (id) => API.delete(`/classes/${id}`);

export const getSubjectsApi = () => API.get('/subjects');
export const createSubjectApi = (data) => API.post('/subjects', data);
export const updateSubjectApi = (id, data) => API.put(`/subjects/${id}`, data);
export const deleteSubjectApi = (id) => API.delete(`/subjects/${id}`);

// Question Paper Services
export const getQuestionPapersApi = (params) => API.get('/question-papers', { params });
export const getQuestionPaperByIdApi = (id) => API.get(`/question-papers/${id}`);
export const createQuestionPaperApi = (data) => API.post('/question-papers', data);
export const updateQuestionPaperApi = (id, data) => API.put(`/question-papers/${id}`, data);
export const uploadQuestionPaperFileApi = (formData) => API.post('/question-papers/upload-file', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
export const reviewQuestionPaperApi = (id, action, rejectionReason) => API.put(`/question-papers/${id}/review`, { action, rejectionReason });
export const deleteQuestionPaperApi = (id) => API.delete(`/question-papers/${id}`);

// Assignments & Materials
export const getAssignmentsApi = (params) => API.get('/assignments', { params });
export const getAssignmentsByClassApi = () => API.get('/assignments/by-class');
export const createAssignmentApi = (formData) => API.post('/assignments', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
export const updateAssignmentApi = (id, data) => API.put(`/assignments/${id}`, data);
export const deleteAssignmentApi = (id) => API.delete(`/assignments/${id}`);

export const getMaterialsApi = (params) => API.get('/materials', { params });
export const uploadMaterialApi = (formData) => API.post('/materials', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
export const deleteMaterialApi = (id) => API.delete(`/materials/${id}`);

// Attendance & Results
export const getAttendanceApi = (classId, date) => API.get('/attendance', { params: { classId, date } });
export const saveAttendanceApi = (data) => API.post('/attendance', data);

export const getResultsApi = (params) => API.get('/results', { params });
export const saveResultsApi = (data) => API.post('/results', data);

// Notifications & Announcements
export const getNotificationsApi = () => API.get('/notifications');
export const sendNotificationApi = (data) => API.post('/notifications', data);
export const markNotificationReadApi = (id) => API.put(`/notifications/${id}/read`);

export const getAnnouncementsApi = () => API.get('/announcements');
export const createAnnouncementApi = (data) => API.post('/announcements', data);
export const deleteAnnouncementApi = (id) => API.delete(`/announcements/${id}`);

// Reports & Audit
export const getDashboardStatsApi = () => API.get('/reports/dashboard-stats');
export const getTeacherPerformanceApi = () => API.get('/reports/teacher-performance');
export const getTeacherMyAnalyticsApi = () => API.get('/reports/teacher-my-analytics');

export const getAuditLogsApi = (params) => API.get('/audit/logs', { params });
export const getLoginHistoryApi = (params) => API.get('/audit/login-history', { params });

export const getSettingsApi = () => API.get('/settings');
export const updateSettingsApi = (data) => API.put('/settings', data);

// School Info Services (matching /config/school-info/)
export const getSchoolInfoApi = () => API.get('/config/school-info');
export const updateSchoolInfoApi = (data) => API.put('/config/school-info', data);

// Student Services
export const getStudentsApi = (params) => API.get('/students', { params });
export const getStudentByIdApi = (id) => API.get(`/students/${id}`);
export const createStudentApi = (data) => API.post('/students', data);
export const updateStudentApi = (id, data) => API.put(`/students/${id}`, data);
export const deleteStudentApi = (id) => API.delete(`/students/${id}`);

// Parent Services
export const getParentsApi = (params) => API.get('/parents', { params });
export const createParentApi = (data) => API.post('/parents', data);
export const updateParentApi = (id, data) => API.put(`/parents/${id}`, data);
export const deleteParentApi = (id) => API.delete(`/parents/${id}`);

// Staff Services
export const getStaffApi = (params) => API.get('/staff', { params });
export const createStaffApi = (data) => API.post('/staff', data);
export const updateStaffApi = (id, data) => API.put(`/staff/${id}`, data);
export const deleteStaffApi = (id) => API.delete(`/staff/${id}`);

// Exam Services
export const getExamsApi = (params) => API.get('/exams', { params });
export const createExamApi = (data) => API.post('/exams', data);
export const updateExamApi = (id, data) => API.put(`/exams/${id}`, data);
export const deleteExamApi = (id) => API.delete(`/exams/${id}`);

// Fee Services
export const getFeeStructuresApi = () => API.get('/fees/structures');
export const createFeeStructureApi = (data) => API.post('/fees/structures', data);
export const deleteFeeStructureApi = (id) => API.delete(`/fees/structures/${id}`);
export const getFeePaymentsApi = (params) => API.get('/fees/payments', { params });
export const recordFeePaymentApi = (data) => API.post('/fees/payments', data);

// Promotion Services
export const getPromotionsApi = () => API.get('/promotions');
export const executePromotionApi = (data) => API.post('/promotions/execute', data);

// Class-wise Overview (Strength, Capacity, Fees, Dues)
export const getClassWiseOverviewApi = () => API.get('/reports/class-wise-overview');

// Teacher Attendance Services
export const getTeacherAttendanceApi = (params) => API.get('/teacher-attendance', { params });
export const saveTeacherAttendanceApi = (data) => API.post('/teacher-attendance/save', data);

// Transport Services
export const getTransportApi = () => API.get('/transport');
export const createTransportApi = (data) => API.post('/transport', data);
export const updateTransportApi = (id, data) => API.put(`/transport/${id}`, data);
export const deleteTransportApi = (id) => API.delete(`/transport/${id}`);

// Timetable Services
export const getClassTimetableApi = (classId) => API.get(`/timetable/class/${classId}`);
export const getMyTimetableApi = () => API.get('/timetable/my-timetable');
export const saveClassTimetableApi = (data) => API.post('/timetable/save', data);
export const deleteClassTimetableApi = (classId) => API.delete(`/timetable/class/${classId}`);

// Student Portal Services (mTOP Style Dedicated Endpoints)
export const getStudentDashboardApi = () => API.get('/student-portal/dashboard');
export const getStudentResultsApi = () => API.get('/student-portal/results');
export const getStudentFeesApi = () => API.get('/student-portal/fees');
export const getStudentAssignmentsApi = () => API.get('/student-portal/assignments');
export const getStudentAttendanceApi = () => API.get('/student-portal/attendance');

export default API;
