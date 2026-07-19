import React from 'react';
import { Link, Outlet } from 'react-router-dom';
import { Button } from './Button';
import './Layout.css';

export function TopNav() {
  return (
    <nav className="top-nav">
      <Link to="/" className="top-nav-logo">UpvoteVC</Link>
      
      <div className="top-nav-links text-body-sm">
        <Link to="/discover" className="top-nav-link">Discover Ideas</Link>
        <Link to="/research" className="top-nav-link">Research My Idea</Link>
      </div>

      <div className="top-nav-actions">
        <Button variant="secondary" onClick={() => window.location.href = '/research'}>Try for free</Button>
        <Button variant="primary" onClick={() => window.location.href = '/discover'}>Explore Signals</Button>
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
        <div className="footer-logo">UpvoteVC</div>
      </div>
      <div className="footer-col">
        <div className="footer-col-title text-caption">Product</div>
        <Link to="/discover" className="footer-link text-body-sm">Discover</Link>
        <Link to="/research" className="footer-link text-body-sm">Research</Link>
        <Link to="#" className="footer-link text-body-sm">Pricing</Link>
      </div>
      <div className="footer-col">
        <div className="footer-col-title text-caption">Resources</div>
        <Link to="#" className="footer-link text-body-sm">Blog</Link>
        <Link to="#" className="footer-link text-body-sm">Methodology</Link>
        <Link to="#" className="footer-link text-body-sm">Contact</Link>
      </div>
      <div className="footer-col">
        <div className="footer-col-title text-caption">Legal</div>
        <Link to="#" className="footer-link text-body-sm">Privacy</Link>
        <Link to="#" className="footer-link text-body-sm">Terms</Link>
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
