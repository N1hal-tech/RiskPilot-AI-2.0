import { useEffect, useRef, useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import ThemeToggle from '../components/common/ThemeToggle';
import Alert from '../components/common/Alert';

const GOOGLE_CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID || '';

function loadScript(src, id) {
  return new Promise((resolve, reject) => {
    if (document.getElementById(id)) {
      resolve();
      return;
    }
    const script = document.createElement('script');
    script.id = id;
    script.src = src;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`Failed to load ${src}`));
    document.body.appendChild(script);
  });
}

export default function SocialAuth() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const googleButtonRef = useRef(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    async function setup() {
      try {
        await loadScript('https://accounts.google.com/gsi/client', 'google-gsi');

        if (!cancelled && window.google?.accounts?.id && googleButtonRef.current && GOOGLE_CLIENT_ID) {
          window.google.accounts.id.initialize({
            client_id: GOOGLE_CLIENT_ID,
            callback: async (response) => {
              if (!response?.credential) return;
              await handleSocialLogin('GOOGLE', response.credential);
            },
          });
          window.google.accounts.id.renderButton(googleButtonRef.current, {
            theme: 'outline',
            size: 'large',
            shape: 'pill',
            text: 'signin_with',
            width: 320,
          });
        }
      } catch (e) {
        if (!cancelled) setError(e.message);
      }
    }

    setup();
    return () => { cancelled = true; };
  }, []);

  const handleSocialLogin = async (provider, idToken, providerPayload = {}) => {
    setBusy(true);
    setError('');
    try {
      const data = await api.socialLogin({
        provider,
        idToken,
        email: providerPayload.email || null,
        fullName: providerPayload.fullName || null,
      });
      login(
        { id: data.userId, fullName: data.fullName, email: data.email, role: data.role },
        data.token,
      );
      navigate(data.role === 'ADMIN' ? '/dashboard/admin' : data.role === 'LOAN_OFFICER' ? '/dashboard/officer' : '/dashboard/user');
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };

  if (user) {
    return <Navigate to={user.role === 'ADMIN' ? '/dashboard/admin' : user.role === 'LOAN_OFFICER' ? '/dashboard/officer' : '/dashboard/user'} />;
  }

  return (
    <div className="auth-layout auth-layout-enterprise">
      <div className="auth-left" style={{ background: 'linear-gradient(135deg, #07111f, #123b6e)' }}>
        <div className="auth-left-content animate-fadeUp" style={{ color: 'white' }}>
          <div className="hero-logo">🛡️</div>
          <h1>Sign in with Google</h1>
          <p>
            RiskPilot AI now uses Google authentication only. Your account is created automatically on first sign-in.
          </p>
          <div className="auth-features">
            <div className="auth-feature">
              <div className="auth-feature-icon"><span className="material-icons-outlined">account_circle</span></div>
              <div className="auth-feature-text"><strong>Google Authentication</strong> Fast sign in with your Google account.</div>
            </div>
            <div className="auth-feature">
              <div className="auth-feature-icon"><span className="material-icons-outlined">lock</span></div>
              <div className="auth-feature-text"><strong>No Passwords</strong> Password login and signup are disabled.</div>
            </div>
          </div>
        </div>
      </div>

      <div className="auth-right">
        <div style={{ position: 'absolute', top: 20, right: 20, zIndex: 10 }}>
          <ThemeToggle size="small" />
        </div>
        <div className="auth-form-container animate-fadeUp">
          <div className="auth-form-header">
            <div className="logo-sm">
              <div className="logo-icon-sm">🛡️</div>
              <span>RiskPilot AI</span>
            </div>
            <h2>Continue with Google</h2>
            <p>Use Google to create or access your account.</p>
          </div>

          {error && <Alert type="error">{error}</Alert>}

          <div style={{ display: 'grid', gap: 14 }}>
            <div ref={googleButtonRef} style={{ display: 'flex', justifyContent: 'center' }} />
          </div>

          <p className="auth-footer-text" style={{ marginTop: 18 }}>
            Password sign-in and manual sign-up have been disabled.
          </p>
          <p className="auth-footer-text" style={{ marginTop: 6 }}>
            If your email already exists, your account and role will be linked automatically.
          </p>
        </div>
      </div>
    </div>
  );
}
