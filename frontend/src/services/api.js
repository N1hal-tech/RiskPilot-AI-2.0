const BASE = process.env.REACT_APP_API_BASE || 'http://localhost:8080/api';

function authHeaders() {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...authHeaders(), ...options.headers },
    ...options,
  });

  const body = res.headers.get('content-type')?.includes('application/json')
    ? await res.json()
    : null;

  if (!res.ok) throw new Error(body?.error || `Request failed (${res.status})`);
  return body;
}

const api = {
  // Auth
  register:       (data) => request('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
  login:          (data) => request('/auth/login',    { method: 'POST', body: JSON.stringify(data) }),
  socialLogin:    (data) => request('/auth/social',   { method: 'POST', body: JSON.stringify(data) }),
  logout:         ()     => request('/auth/logout',   { method: 'POST' }),

  // Loans
  submitLoan:     (data) => request('/loans/apply',    { method: 'POST', body: JSON.stringify(data) }),
  submitFeedback: (data) => request('/loans/feedback', { method: 'POST', body: JSON.stringify(data) }),
  getLoanHistory: ()     => request('/loans/history'),
  getLoanDetail:  (id)   => request(`/loans/${id}`),

  // Comments
  addComment:     (data) => request('/loans/comments', { method: 'POST', body: JSON.stringify(data) }),
  getComments:    (loanId) => request(`/loans/${loanId}/comments`),

  // Documents
  uploadDoc:      (params) => request(`/loans/documents?${new URLSearchParams(params)}`, { method: 'POST' }),
  getDocs:        (loanId) => request(`/loans/${loanId}/documents`),

  // Notifications
  getNotifications:   () => request('/notifications'),
  getUnreadCount:     () => request('/notifications/unread-count'),
  markNotifRead:      (id) => request(`/notifications/${id}/read`, { method: 'POST' }),
  markAllNotifsRead:  () => request('/notifications/read-all',     { method: 'POST' }),

  // Profile
  getProfile:       () => request('/profile'),
  updateProfile:    (data) => request('/profile', { method: 'PUT', body: JSON.stringify(data) }),
  changePassword:   (data) => request('/profile/change-password', { method: 'POST', body: JSON.stringify(data) }),

  // Admin
  getAnalytics:     () => request('/admin/analytics'),
  getAllLoans:       (page = 0, size = 20) => request(`/admin/loans?page=${page}&size=${size}`),
  getLoansByStatus:  (status, page = 0) => request(`/admin/loans/status/${status}?page=${page}`),
  getReviewQueue:    () => request('/admin/review-queue'),
  getReviewQueueCount: () => request('/admin/review-queue/count'),
  reviewLoan:       (data) => request('/admin/review', { method: 'POST', body: JSON.stringify(data) }),
  getAllUsers:       () => request('/admin/users'),
  toggleUserActive: (id) => request(`/admin/users/${id}/toggle-active`, { method: 'POST' }),
  getAuditLogs:     (page = 0, size = 50) => request(`/admin/audit?page=${page}&size=${size}`),
  verifyDocument:   (docId) => request(`/admin/documents/${docId}/verify`, { method: 'POST' }),

  // Risk Intelligence
  simulate:         (data)     => request('/risk/simulate', { method: 'POST', body: JSON.stringify(data) }),
  getRiskHistory:   ()         => request('/risk/history'),
  askAI:            (question) => request('/risk/ask', { method: 'POST', body: JSON.stringify({ question }) }),
};

export default api;