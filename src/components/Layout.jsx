import React from 'react';
import { Link, Outlet } from 'react-router-dom';
import { Button } from './Button';
import { useAuth } from '../context/AuthContext';
import { LogOut, User as UserIcon } from 'lucide-react';
import './Layout.css';

export function TopNav() {
  const { user, signOut } = useAuth();

  return (
    <nav className="top-nav">
      <Link to="/" className="top-nav-logo">OpenVC</Link>

      <div className="top-nav-links text-body-sm">
        <Link to="/discover" className="top-nav-link">Market Signals</Link>
        <Link to="/research" className="top-nav-link">Diligence Engine</Link>
        <Link to="/history" className="top-nav-link">History</Link>
        <Link to="/presentation" className="top-nav-link" style={{ color: 'var(--color-primary)' }}>Fund Deck</Link>
      </div>

      <div className="top-nav-actions">
        <Button variant="secondary" onClick={() => window.location.href = '/research'}>Run Diligence</Button>
        
        {user ? (
          <div className="user-profile-menu">
            <div className="user-avatar-badge" title={user.email}>
              <UserIcon size={14} />
              <span className="user-email-text">{user.user_metadata?.full_name || user.email?.split('@')[0]}</span>
            </div>
            <button 
              className="btn-signout" 
              onClick={() => signOut()}
              title="Sign Out"
            >
              <LogOut size={14} />
              <span>Sign Out</span>
            </button>
          </div>
        ) : (
          <Link to="/login" className="btn-signin-link text-button">
            Sign In
          </Link>
        )}
      </div>
    </nav>
  );
}

export function MarqueeStrip({ text }) {
  return (
    <div className="marquee-strip text-body-sm">
      {text}
    </div>
  );
}

export function Footer() {
  return (
    <footer className="footer">
      <div>
        <div className="footer-logo">OpenVC</div>
      </div>
      <div className="footer-col">
        <div className="footer-col-title text-caption">Platform</div>
        <Link to="/discover" className="footer-link text-body-sm">Signal Sourcing</Link>
        <Link to="/research" className="footer-link text-body-sm">Diligence Copilot</Link>
        <Link to="/history" className="footer-link text-body-sm">Diligence Archive</Link>
        <Link to="#" className="footer-link text-body-sm">Market Mapping</Link>
      </div>
      <div className="footer-col">
        <div className="footer-col-title text-caption">Research</div>
        <Link to="#" className="footer-link text-body-sm">Methodology</Link>
        <Link to="#" className="footer-link text-body-sm">Sector Reports</Link>
        <Link to="#" className="footer-link text-body-sm">API & Data Access</Link>
      </div>
      <div className="footer-col">
        <div className="footer-col-title text-caption">Institutional</div>
        <Link to="#" className="footer-link text-body-sm">Security & Compliance</Link>
        <Link to="#" className="footer-link text-body-sm">Terms of Service</Link>
      </div>
    </footer>
  );
}

export function Layout() {
  return (
    <div className="page-wrapper">
      <TopNav />
      <main>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
