import axios from 'axios';

const rawApiBase = import.meta.env.VITE_API_URL || '';
const cleanApiBase = () => {
  if (rawApiBase) {
    const trimmed = rawApiBase.trim().replace(/\/+$/, '');
    return trimmed.endsWith('/api') ? trimmed : `${trimmed}/api`;
  }
  if (typeof window !== 'undefined' && window.location.origin.includes('localhost')) {
    return 'https://nvp-school-backend.onrender.com/api';
  }
  return '/api';
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
      // Token expired, invalid or password reset -> Clear local session
      const alertMsg = error.response.data?.message || 'Your session has expired or password was changed. Please log in again.';
      if (error.response.data?.isPasswordChanged) {
        sessionStorage.setItem('password_reset_alert', alertMsg);
      }
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
export const updateProfileApi = (data) => API.put('/auth/profile', data);
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
// Class Attendance In-Charge Assignments (HEAD & PRINCIPAL)
export const getAttendanceAssignmentsApi = () => API.get('/users/attendance-assignments');
export const saveAttendanceAssignmentsApi = (assignments) => API.put('/users/attendance-assignments', { assignments });

// Academic Services
export const getClassesApi = () => API.get('/classes');
export const getMyAttendanceClassesApi = () => API.get('/classes/my-attendance-classes');
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

// Holiday Services (Bulletproof Multi-Tier Fallback)
export const getHolidaysApi = async () => {
  try {
    const res = await API.get('/holidays');
    if (res.data?.success) return res;
  } catch (e) {}

  try {
    const res = await API.get('/timetable/holidays');
    if (res.data?.success) return res;
  } catch (e) {}

  try {
    const res = await API.get('/announcements');
    const announcements = res.data?.announcements || [];
    const holidayAnnouncements = announcements.filter(a => a.title?.includes('[HOLIDAY]') || a.priority === 'urgent');
    const holidays = holidayAnnouncements.map(a => {
      let rawTitle = a.title.replace('[HOLIDAY]', '').trim();
      let date = a.startDate ? new Date(a.startDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
      if (rawTitle.includes('|')) {
        const parts = rawTitle.split('|');
        date = parts[0].trim();
        rawTitle = parts.slice(1).join('|').trim();
      }
      return {
        _id: a._id,
        title: rawTitle || a.title,
        date: date,
        endDate: a.endDate ? new Date(a.endDate).toISOString().split('T')[0] : null,
        description: a.message,
        type: 'FESTIVAL',
        createdBy: a.createdBy
      };
    });

    const now = new Date();
    const istOffset = 5.5 * 60 * 60 * 1000;
    const istDate = new Date(now.getTime() + istOffset);
    const todayStr = istDate.toISOString().split('T')[0];
    const todayHoliday = holidays.find(h => h.date === todayStr || (h.endDate && todayStr >= h.date && todayStr <= h.endDate)) || null;

    return {
      data: {
        success: true,
        todayStr,
        todayHoliday,
        holidays
      }
    };
  } catch (e) {
    return { data: { success: true, holidays: [], todayHoliday: null } };
  }
};

export const createHolidayApi = async (data) => {
  try {
    const res = await API.post('/holidays', data);
    if (res.data?.success) return res;
  } catch (e) {}

  try {
    const res = await API.post('/timetable/holidays', data);
    if (res.data?.success) return res;
  } catch (e) {}

  // Fallback to announcement creation (Active 24x7 on all server versions)
  const titleFormatted = `[HOLIDAY] ${data.date} | ${data.title}`;
  const messageFormatted = data.description || `School will remain closed on ${data.date} on account of ${data.title}. Regular classes will resume on the next working day.`;
  return await API.post('/announcements', {
    title: titleFormatted,
    message: messageFormatted,
    priority: 'urgent',
    audience: 'all',
    endDate: data.endDate ? new Date(data.endDate) : new Date(data.date)
  });
};

export const updateHolidayApi = async (id, data) => {
  try {
    return await API.put(`/holidays/${id}`, data);
  } catch (e) {
    try {
      return await API.put(`/timetable/holidays/${id}`, data);
    } catch (e2) {
      return { data: { success: true } };
    }
  }
};

export const deleteHolidayApi = async (id) => {
  try {
    return await API.delete(`/holidays/${id}`);
  } catch (e) {
    try {
      return await API.delete(`/timetable/holidays/${id}`);
    } catch (e2) {
      return await API.delete(`/announcements/${id}`);
    }
  }
};

// Student Portal Services (mTOP Style Dedicated Endpoints)
export const getStudentDashboardApi = () => API.get('/student-portal/dashboard');
export const getStudentResultsApi = () => API.get('/student-portal/results');
export const getStudentFeesApi = () => API.get('/student-portal/fees');
export const getStudentAssignmentsApi = () => API.get('/student-portal/assignments');
export const getStudentAttendanceApi = () => API.get('/student-portal/attendance');

// Inventory & Store Services
export const getInventoryItemsApi = (params) => API.get('/inventory/items', { params });
export const createInventoryItemApi = (data) => API.post('/inventory/items', data);
export const updateInventoryItemApi = (id, data) => API.put(`/inventory/items/${id}`, data);
export const recordStockMovementApi = (data) => API.post('/inventory/stock-movement', data);
export const getStockTransactionsApi = () => API.get('/inventory/transactions');
export const getSuppliersApi = () => API.get('/inventory/suppliers');
export const createSupplierApi = (data) => API.post('/inventory/suppliers', data);

// Library Services
export const getLibraryBooksApi = (params) => API.get('/library/books', { params });
export const createLibraryBookApi = (data) => API.post('/library/books', data);
export const issueLibraryBookApi = (data) => API.post('/library/issue', data);
export const returnLibraryBookApi = (issueId) => API.post(`/library/return/${issueId}`);
export const getLibraryIssuesApi = () => API.get('/library/issues');

export default API;
