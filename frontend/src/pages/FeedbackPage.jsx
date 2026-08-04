import React, { useState, useEffect } from 'react';
import { 
  MessageSquare, 
  Star, 
  Send, 
  CheckCircle2, 
  Sparkles, 
  Bug, 
  Lightbulb, 
  BarChart3, 
  Briefcase, 
  Loader2, 
  AlertCircle,
  Mail,
  ShieldCheck,
  Zap,
  ArrowLeft
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ColorBlock } from '../components/ColorBlock';
import './FeedbackPage.css';

const CATEGORIES = [
  { id: 'Feature Request', label: 'Feature Request', icon: Lightbulb, desc: 'Suggest new scrapers, analysis dimensions, or export tools' },
  { id: 'Bug Report', label: 'Bug Report', icon: Bug, desc: 'Report errors, rendering glitches, or failed diligence scans' },
  { id: 'Diligence Quality', label: 'Signal Quality', icon: BarChart3, desc: 'Feedback on thesis accuracy, sentiment weights, and market signals' },
  { id: 'General Feedback', label: 'General Experience', icon: Sparkles, desc: 'Thoughts on UI responsiveness, UX flow, and overall utility' },
  { id: 'Partnership / VC', label: 'VC & Partnership', icon: Briefcase, desc: 'Direct query regarding custom datasets, API integration, or fund syndication' },
];

const RATING_LABELS = {
  1: 'Needs Improvement',
  2: 'Fair Experience',
  3: 'Solid & Helpful',
  4: 'Very Strong Quality',
  5: 'Exceptional & High Conviction',
};

export function FeedbackPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [category, setCategory] = useState('Feature Request');
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [feedbackResult, setFeedbackResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (user) {
      if (user.email && !email) setEmail(user.email);
      if (user.user_metadata?.full_name && !name) setName(user.user_metadata.full_name);
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim()) {
      setErrorMsg('Please provide your feedback message before sending.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    const payload = {
      name: name.trim(),
      email: email.trim(),
      category,
      rating,
      message: message.trim(),
      page_url: window.location.href,
      metadata: {
        userAgent: navigator.userAgent,
        screen: `${window.innerWidth}x${window.innerHeight}`,
        timestamp: new Date().toISOString()
      }
    };

    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.detail || 'Failed to submit feedback. Please try again.');
      }

      const resData = await res.json().catch(() => ({}));
      setFeedbackResult(resData);
      setIsSuccess(true);
    } catch (err) {
      console.error('Feedback error:', err);
      setErrorMsg(err.message || 'Network error while submitting feedback.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setMessage('');
    setCategory('Feature Request');
    setRating(5);
    setIsSuccess(false);
    setFeedbackResult(null);
    setErrorMsg('');
  };

  return (
    <div className="container feedback-page-container">
      <div className="feedback-page-nav-back">
        <button className="feedback-back-link" onClick={() => navigate(-1)}>
          <ArrowLeft size={16} /> Back
        </button>
      </div>

      <div className="feedback-page-grid">
        {/* Left Column: Context & Assurances */}
        <div className="feedback-page-info">
          <div className="feedback-eyebrow-tag">
            <Sparkles size={14} /> Founder & Investor Direct Line
          </div>
          <h1 className="feedback-page-heading text-display-lg">
            Direct Feedback & Venture Intelligence Input.
          </h1>
          <p className="feedback-page-description text-body">
            OpenVC is built to serve active founders and venture investors. Your product critiques, edge-case bug discoveries, and data source suggestions directly drive our sprint priority roadmap.
          </p>

          <div className="feedback-guarantee-card">
            <div className="feedback-guarantee-item">
              <Mail size={18} className="feedback-guarantee-icon" />
              <div>
                <strong>Direct Delivery</strong>
                <p>Every message routes directly to <code>shaikajhaj@gmail.com</code>.</p>
              </div>
            </div>
            <div className="feedback-guarantee-item">
              <Zap size={18} className="feedback-guarantee-icon" />
              <div>
                <strong>Rapid Review</strong>
                <p>Sprint engineering reviews all feedback submissions within 24 hours.</p>
              </div>
            </div>
            <div className="feedback-guarantee-item">
              <ShieldCheck size={18} className="feedback-guarantee-icon" />
              <div>
                <strong>Confidential Intelligence</strong>
                <p>Proprietary research insights and feature suggestions stay strictly private.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Form Card */}
        <div className="feedback-page-form-wrapper">
          <div className="feedback-page-card">
            {isSuccess ? (
              <div className="feedback-page-success">
                <div className="feedback-success-icon-badge">
                  <CheckCircle2 size={48} color="#1ea64a" />
                </div>
                <h2>Thank you for your feedback!</h2>
                <p>
                  Your submission has been captured and routed to <strong>shaikajhaj@gmail.com</strong>.
                </p>
                {feedbackResult?.activation_pending && (
                  <div style={{
                    margin: '16px 0',
                    padding: '12px 16px',
                    background: 'rgba(255, 187, 0, 0.1)',
                    border: '1px solid rgba(255, 187, 0, 0.3)',
                    borderRadius: '8px',
                    fontSize: '13px',
                    color: '#e69500',
                    textAlign: 'left',
                    lineHeight: '1.5'
                  }}>
                    <strong>Inbox Action Required:</strong> FormSubmit has sent a 1-time activation email to <strong>shaikajhaj@gmail.com</strong> (check Spam / Promotions). Click <em>Activate Form</em> once to allow emails straight into your inbox.
                  </div>
                )}
                <div className="feedback-page-success-actions">
                  <button className="btn-feedback-primary" onClick={() => navigate('/discover')}>
                    Explore Market Signals
                  </button>
                  <button className="btn-feedback-secondary" onClick={resetForm}>
                    Submit Another Feedback
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="feedback-page-form">
                <h2 className="feedback-card-heading">Submit Your Input</h2>
                <p className="feedback-card-subheading">
                  Let us know what we can build or improve next.
                </p>

                {errorMsg && (
                  <div className="feedback-error-banner">
                    <AlertCircle size={16} />
                    <span>{errorMsg}</span>
                  </div>
                )}

                {/* Category Selection */}
                <div className="feedback-field-block">
                  <label className="feedback-label">Category</label>
                  <div className="feedback-category-grid">
                    {CATEGORIES.map((cat) => {
                      const Icon = cat.icon;
                      const isSelected = category === cat.id;
                      return (
                        <button
                          type="button"
                          key={cat.id}
                          className={`feedback-category-tile ${isSelected ? 'selected' : ''}`}
                          onClick={() => setCategory(cat.id)}
                        >
                          <div className="cat-tile-header">
                            <Icon size={16} />
                            <span className="cat-tile-label">{cat.label}</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Rating */}
                <div className="feedback-field-block">
                  <div className="feedback-rating-header">
                    <label className="feedback-label">Overall Experience Rating</label>
                    <span className="feedback-rating-hint">{RATING_LABELS[hoverRating || rating]}</span>
                  </div>
                  <div className="feedback-stars-row" onMouseLeave={() => setHoverRating(0)}>
                    {[1, 2, 3, 4, 5].map((star) => {
                      const isFilled = (hoverRating || rating) >= star;
                      return (
                        <button
                          type="button"
                          key={star}
                          className="feedback-star-btn"
                          onMouseEnter={() => setHoverRating(star)}
                          onClick={() => setRating(star)}
                        >
                          <Star size={26} fill={isFilled ? '#ff9f00' : 'none'} color={isFilled ? '#ff9f00' : '#cccccc'} />
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Message */}
                <div className="feedback-field-block">
                  <div className="feedback-textarea-header">
                    <label className="feedback-label">Feedback Details *</label>
                    <span className="feedback-char-count">{message.length}/1000</span>
                  </div>
                  <textarea
                    rows={5}
                    maxLength={1000}
                    className="feedback-textarea"
                    placeholder="Provide specific feedback, feature ideas, or bug details..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    required
                  />
                </div>

                {/* Name & Email */}
                <div className="feedback-inputs-row" style={{ padding: 0 }}>
                  <div className="feedback-input-col">
                    <label className="feedback-label">Name (Optional)</label>
                    <input
                      type="text"
                      className="feedback-input"
                      placeholder="e.g. Maya Lin"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>
                  <div className="feedback-input-col">
                    <label className="feedback-label">Email (Optional)</label>
                    <input
                      type="email"
                      className="feedback-input"
                      placeholder="maya@venture.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                </div>

                {/* Submit Row */}
                <div className="feedback-submit-section">
                  <div className="feedback-destination-badge">
                    <Mail size={13} style={{ marginRight: '6px' }} />
                    <span>Lands at <strong>shaikajhaj@gmail.com</strong></span>
                  </div>

                  <button
                    type="submit"
                    className="btn-feedback-submit"
                    disabled={isSubmitting || !message.trim()}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 size={16} className="feedback-spinner" />
                        <span>Submitting...</span>
                      </>
                    ) : (
                      <>
                        <Send size={15} />
                        <span>Send to Founder</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
