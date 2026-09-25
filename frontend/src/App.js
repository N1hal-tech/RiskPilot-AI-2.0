import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Navbar    from './components/layout/Navbar';
import Sidebar   from './components/layout/Sidebar';
import Welcome   from './pages/Welcome';
import Dashboard from './pages/Dashboard';
import UserLanding from './pages/UserLanding';
import OfficerLanding from './pages/OfficerLanding';
import AdminLanding from './pages/AdminLanding';
import SocialAuth from './pages/SocialAuth';
import Apply     from './pages/Apply';
import History   from './pages/History';
import Profile   from './pages/Profile';
import Notifications from './pages/Notifications';
import AdminDashboard from './pages/AdminDashboard';
import AdminLoans     from './pages/AdminLoans';
import AdminUsers     from './pages/AdminUsers';
import AdminAudit     from './pages/AdminAudit';
import AdminReviewQueue from './pages/AdminReviewQueue';
import LoanDetail     from './pages/LoanDetail';
import RiskIntelligence from './pages/RiskIntelligence';
import Chatbot        from './components/Chatbot';

// Helper function to get role-specific landing page
function getLandingPage(user) {
  if (!user) return '/dashboard';
  return user.role === 'ADMIN' ? '/dashboard/admin' : 
         user.role === 'LOAN_OFFICER' ? '/dashboard/officer' : 
         '/dashboard/user';
}

function Protected({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="page-loader"><div className="spinner-lg" /></div>;
  return user ? children : <Navigate to="/login" />;
}

function Public({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="page-loader"><div className="spinner-lg" /></div>;
  return !user ? children : <Navigate to={getLandingPage(user)} />;
}

function PublicWelcome({ children }) {
  const { loading } = useAuth();
  if (loading) return <div className="page-loader"><div className="spinner-lg" /></div>;
  return children;
}

function AdminOnly({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="page-loader"><div className="spinner-lg" /></div>;
  if (!user) return <Navigate to="/login" />;
  if (user.role !== 'ADMIN' && user.role !== 'LOAN_OFFICER') return <Navigate to={getLandingPage(user)} />;
  return children;
}

function Shell({ children }) {
  const { user } = useAuth();
  const roleClass = user?.role === 'ADMIN' ? 'shell-admin' : user?.role === 'LOAN_OFFICER' ? 'shell-officer' : 'shell-user';
  
  return (
    <div className={`app-shell ${roleClass}`}>
      <Navbar />
      <div className="app-body">
        <Sidebar />
        <main className="app-main">{children}</main>
      </div>
    </div>
  );
}

function AppRoutes() {
  const { user } = useAuth();

  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/"          element={<PublicWelcome><Welcome /></PublicWelcome>} />
        <Route path="/auth" element={<Public><SocialAuth /></Public>} />
        <Route path="/login" element={<Navigate to="/auth" replace />} />
        <Route path="/login/user" element={<Navigate to="/auth" replace />} />
        <Route path="/login/officer" element={<Navigate to="/auth" replace />} />
        <Route path="/login/admin" element={<Navigate to="/auth" replace />} />
        <Route path="/register" element={<Navigate to="/auth" replace />} />
        <Route path="/register/user" element={<Navigate to="/auth" replace />} />
        <Route path="/register/officer" element={<Navigate to="/auth" replace />} />
        <Route path="/register/admin" element={<Navigate to="/auth" replace />} />

        {/* Role-specific landing pages */}
        <Route path="/dashboard/user"    element={<Protected><Shell><UserLanding /></Shell></Protected>} />
        <Route path="/dashboard/officer" element={<AdminOnly><Shell><OfficerLanding /></Shell></AdminOnly>} />
        <Route path="/dashboard/admin"   element={<AdminOnly><Shell><AdminLanding /></Shell></AdminOnly>} />

        <Route path="/dashboard"     element={<Protected><Shell><Dashboard /></Shell></Protected>} />
        <Route path="/apply"         element={<Protected><Shell><Apply /></Shell></Protected>} />
        <Route path="/history"       element={<Protected><Shell><History /></Shell></Protected>} />
        <Route path="/loans/:id"     element={<Protected><Shell><LoanDetail /></Shell></Protected>} />
        <Route path="/profile"       element={<Protected><Shell><Profile /></Shell></Protected>} />
        <Route path="/notifications" element={<Protected><Shell><Notifications /></Shell></Protected>} />
        <Route path="/risk"          element={<Protected><Shell><RiskIntelligence /></Shell></Protected>} />

        <Route path="/admin"          element={<AdminOnly><Shell><AdminDashboard /></Shell></AdminOnly>} />
        <Route path="/admin/loans"    element={<AdminOnly><Shell><AdminLoans /></Shell></AdminOnly>} />
        <Route path="/admin/review"   element={<AdminOnly><Shell><AdminReviewQueue /></Shell></AdminOnly>} />
        <Route path="/admin/users"    element={<AdminOnly><Shell><AdminUsers /></Shell></AdminOnly>} />
        <Route path="/admin/audit"    element={<AdminOnly><Shell><AdminAudit /></Shell></AdminOnly>} />

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
      <Chatbot userId={user?.id ? String(user.id) : null} />
    </>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}