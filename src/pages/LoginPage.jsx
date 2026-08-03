import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Mail, 
  Lock, 
  User, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  AlertCircle, 
  CheckCircle2, 
  ArrowLeft,
  Sparkles,
  ShieldCheck
} from 'lucide-react';
import './LoginPage.css';

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, signInWithPassword, signUpWithPassword, signInWithOAuth, resetPassword } = useAuth();

  // Mode: 'signin' | 'signup' | 'reset'
  const [mode, setMode] = useState('signin');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Destination after login
  const from = location.state?.from?.pathname || '/research';

  // If already logged in, redirect
  useEffect(() => {
    if (user) {
      navigate(from, { replace: true });
    }
  }, [user, navigate, from]);

  // Check URL params for mode
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('mode') === 'signup') {
      setMode('signup');
    } else if (params.get('mode') === 'reset') {
      setMode('reset');
    }
  }, [location]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setLoading(true);

    try {
      if (mode === 'signin') {
        if (!email || !password) {
          throw new Error('Please enter both email and password.');
        }
        await signInWithPassword(email, password);
        navigate(from, { replace: true });
      } else if (mode === 'signup') {
        if (!email || !password) {
          throw new Error('Please fill in all required fields.');
        }
        if (password.length < 6) {
          throw new Error('Password must be at least 6 characters.');
        }
        if (password !== confirmPassword) {
          throw new Error('Passwords do not match.');
        }
        const data = await signUpWithPassword(email, password, fullName);
        if (data?.user && !data?.session) {
          setSuccessMsg('Account created! Please check your email to confirm your account.');
        } else {
          setSuccessMsg('Account created successfully!');
          setTimeout(() => navigate(from, { replace: true }), 1000);
        }
      } else if (mode === 'reset') {
        if (!email) {
          throw new Error('Please provide your account email address.');
        }
        await resetPassword(email);
        setSuccessMsg('Password reset instructions have been sent to your email.');
      }
    } catch (err) {
      console.error('[Auth Error]', err);
      setErrorMsg(err.message || 'An error occurred during authentication. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleOAuth = async (provider) => {
    try {
      setErrorMsg('');
      setLoading(true);
      await signInWithOAuth(provider);
    } catch (err) {
      setErrorMsg(err.message || `Failed to sign in with ${provider}`);
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        
        {/* Left Side: Venture Intelligence Context */}
        <div className="login-hero">
          <div className="login-hero-header">
            <div className="hero-tag">
              <Sparkles size={13} />
              <span>Institutional Intelligence</span>
            </div>
            <h2 className="login-hero-title">
              Venture Diligence with Conviction.
            </h2>
            <p className="login-hero-sub">
              Access real-time digital exhaust, autonomous thesis validation, and algorithmic market mapping for top-tier venture funds.
            </p>

            <div className="login-stats-grid">
              <div className="login-stat-card">
                <div className="login-stat-num">500,000+</div>
                <div className="login-stat-desc">Developer & web signals synthesized weekly</div>
              </div>
              <div className="login-stat-card">
                <div className="login-stat-num">&lt; 3 mins</div>
                <div className="login-stat-desc">From initial sector scan to complete diligence memo</div>
              </div>
            </div>
          </div>

          <div className="login-hero-footer">
            <span>Powered by Supabase Auth</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <ShieldCheck size={14} color="var(--color-semantic-success)" />
              <span>RLS & Encrypted Storage</span>
            </div>
          </div>
        </div>

        {/* Right Side: Auth Form */}
        <div className="login-form-wrapper">
          {mode === 'reset' ? (
            <div>
              <button 
                type="button" 
                className="login-back-btn"
                onClick={() => { setMode('signin'); setErrorMsg(''); setSuccessMsg(''); }}
              >
                <ArrowLeft size={16} />
                <span>Back to Sign In</span>
              </button>
              
              <div className="login-form-header">
                <h1 className="login-form-title">Reset Password</h1>
                <p className="login-form-desc">
                  Enter your email address and we'll send you a link to reset your password.
                </p>
              </div>

              {errorMsg && (
                <div className="login-alert login-alert-error">
                  <AlertCircle size={18} />
                  <span>{errorMsg}</span>
                </div>
              )}

              {successMsg && (
                <div className="login-alert login-alert-success">
                  <CheckCircle2 size={18} />
                  <span>{successMsg}</span>
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="login-field-group">
                  <div className="login-field">
                    <label className="login-label">Work Email</label>
                    <div className="login-input-wrapper">
                      <Mail className="login-input-icon" size={18} />
                      <input
                        type="email"
                        required
                        className="login-input"
                        placeholder="analyst@sequoia.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                <button 
                  type="submit" 
                  className="login-submit-btn"
                  disabled={loading}
                >
                  {loading ? <div className="spinner" /> : (
                    <>
                      <span>Send Reset Link</span>
                      <ArrowRight size={16} />
                    </>
                  )}
                </button>
              </form>
            </div>
          ) : (
            <div>
              {/* Tab Selector */}
              <div className="login-tabs">
                <button 
                  type="button"
                  className={`login-tab ${mode === 'signin' ? 'active' : ''}`}
                  onClick={() => { setMode('signin'); setErrorMsg(''); setSuccessMsg(''); }}
                >
                  Sign In
                </button>
                <button 
                  type="button"
                  className={`login-tab ${mode === 'signup' ? 'active' : ''}`}
                  onClick={() => { setMode('signup'); setErrorMsg(''); setSuccessMsg(''); }}
                >
                  Create Account
                </button>
              </div>

              <div className="login-form-header">
                <h1 className="login-form-title">
                  {mode === 'signin' ? 'Welcome back to OpenVC' : 'Join OpenVC Intelligence'}
                </h1>
                <p className="login-form-desc">
                  {mode === 'signin' 
                    ? 'Enter your credentials to access your venture copilot.' 
                    : 'Start generating autonomous investment memos and tracking sector signals.'}
                </p>
              </div>

              {errorMsg && (
                <div className="login-alert login-alert-error">
                  <AlertCircle size={18} />
                  <span>{errorMsg}</span>
                </div>
              )}

              {successMsg && (
                <div className="login-alert login-alert-success">
                  <CheckCircle2 size={18} />
                  <span>{successMsg}</span>
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="login-field-group">
                  {mode === 'signup' && (
                    <div className="login-field">
                      <label className="login-label">Full Name</label>
                      <div className="login-input-wrapper">
                        <User className="login-input-icon" size={18} />
                        <input
                          type="text"
                          className="login-input"
                          placeholder="Shaik Mohammad"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                        />
                      </div>
                    </div>
                  )}

                  <div className="login-field">
                    <label className="login-label">Work Email</label>
                    <div className="login-input-wrapper">
                      <Mail className="login-input-icon" size={18} />
                      <input
                        type="email"
                        required
                        className="login-input"
                        placeholder="analyst@fund.vc"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="login-field">
                    <div className="login-label">
                      <span>Password</span>
                      {mode === 'signin' && (
                        <button
                          type="button"
                          className="login-forgot-link"
                          onClick={() => { setMode('reset'); setErrorMsg(''); setSuccessMsg(''); }}
                        >
                          Forgot password?
                        </button>
                      )}
                    </div>
                    <div className="login-input-wrapper">
                      <Lock className="login-input-icon" size={18} />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        className="login-input"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />
                      <button
                        type="button"
                        className="login-password-toggle"
                        onClick={() => setShowPassword(!showPassword)}
                        tabIndex={-1}
                      >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  {mode === 'signup' && (
                    <div className="login-field">
                      <label className="login-label">Confirm Password</label>
                      <div className="login-input-wrapper">
                        <Lock className="login-input-icon" size={18} />
                        <input
                          type={showPassword ? 'text' : 'password'}
                          required
                          className="login-input"
                          placeholder="••••••••"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                        />
                      </div>
                    </div>
                  )}
                </div>

                <button 
                  type="submit" 
                  className="login-submit-btn"
                  disabled={loading}
                >
                  {loading ? <div className="spinner" /> : (
                    <>
                      <span>{mode === 'signin' ? 'Sign In' : 'Create Account'}</span>
                      <ArrowRight size={16} />
                    </>
                  )}
                </button>
              </form>

              <div className="login-divider">
                <span>or continue with</span>
              </div>

              <div className="login-oauth-grid">
                <button
                  type="button"
                  className="login-oauth-btn"
                  onClick={() => handleOAuth('google')}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"/>
                    <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.26v3.15C3.25 21.36 7.34 24 12 24z"/>
                    <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.26C.46 8.16 0 9.94 0 12s.46 3.84 1.26 5.42l4.02-3.15z"/>
                    <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.25 2.64 1.26 6.58l4.02 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
                  </svg>
                  <span>Google</span>
                </button>

                <button
                  type="button"
                  className="login-oauth-btn"
                  onClick={() => handleOAuth('github')}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path fillRule="evenodd" clipRule="evenodd" d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
                  </svg>
                  <span>GitHub</span>
                </button>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
