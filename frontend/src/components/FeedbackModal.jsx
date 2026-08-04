import React, { useState, useEffect } from 'react';
import { 
  X, 
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
  Mail
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './FeedbackModal.css';

const CATEGORIES = [
  { id: 'Feature Request', label: 'Feature Request', icon: Lightbulb, color: '#c5b0f4' },
  { id: 'Bug Report', label: 'Bug Report', icon: Bug, color: '#f3c9b6' },
  { id: 'Diligence Quality', label: 'Signal / Diligence Quality', icon: BarChart3, color: '#dceeb1' },
  { id: 'General Feedback', label: 'General Feedback', icon: Sparkles, color: '#c8e6cd' },
  { id: 'Partnership / VC', label: 'Investor / Partnership', icon: Briefcase, color: '#efd4d4' },
];

const RATING_LABELS = {
  1: 'Needs Work',
  2: 'Fair Experience',
  3: 'Good Quality',
  4: 'Very Strong',
  5: 'Exceptional (High Conviction)',
};

export function FeedbackModal({ isOpen, onClose }) {
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

  // Prefill email & name if authenticated user exists
  useEffect(() => {
    if (user) {
      if (user.email && !email) setEmail(user.email);
      if (user.user_metadata?.full_name && !name) setName(user.user_metadata.full_name);
    }
  }, [user, isOpen]);

  // Handle escape key to close
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim()) {
      setErrorMsg('Please enter your feedback message.');
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
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.detail || 'Failed to submit feedback. Please try again.');
      }

      const resData = await response.json().catch(() => ({}));
      setFeedbackResult(resData);
      setIsSuccess(true);
    } catch (err) {
      console.error('Feedback submit error:', err);
      setErrorMsg(err.message || 'Something went wrong while sending your feedback. Please try again.');
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
    <div className="feedback-modal-overlay" onClick={onClose}>
      <div 
        className="feedback-modal-card" 
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        {/* Close Button */}
        <button className="feedback-close-btn" onClick={onClose} aria-label="Close modal">
          <X size={18} />
        </button>

        {isSuccess ? (
          <div className="feedback-success-container">
            <div className="feedback-success-icon-badge">
              <CheckCircle2 size={44} color="#1ea64a" />
            </div>
            <h2 className="feedback-success-title">Feedback Delivered!</h2>
            <p className="feedback-success-desc">
              Thank you for helping us refine OpenVC. Your submission has been captured and routed to <strong>shaikajhaj@gmail.com</strong>.
            </p>
            {feedbackResult?.activation_pending && (
              <div style={{
                margin: '14px 0',
                padding: '12px 14px',
                background: 'rgba(255, 187, 0, 0.1)',
                border: '1px solid rgba(255, 187, 0, 0.3)',
                borderRadius: '8px',
                fontSize: '12.5px',
                color: '#e69500',
                textAlign: 'left',
                lineHeight: '1.45'
              }}>
                <strong>Activation Needed:</strong> FormSubmit sent a 1-time activation email to <strong>shaikajhaj@gmail.com</strong> (check Spam / Promotions). Click <em>Activate Form</em> once to begin receiving submissions straight to your inbox.
              </div>
            )}
            <div className="feedback-success-actions">
              <button 
                className="btn-feedback-primary" 
                onClick={onClose}
              >
                Done
              </button>
              <button 
                className="btn-feedback-secondary" 
                onClick={resetForm}
              >
                Send Another Response
              </button>
            </div>
          </div>
        ) : (
          <form className="feedback-form" onSubmit={handleSubmit}>
            {/* Header */}
            <div className="feedback-modal-header">
              <div className="feedback-eyebrow-tag">
                <MessageSquare size={13} style={{ marginRight: '6px' }} />
                <span>DIRECT FEEDBACK</span>
              </div>
              <h2 className="feedback-modal-title">Help shape OpenVC</h2>
              <p className="feedback-modal-subtitle">
                Found a bug, want new diligence tools, or have market insights? Every response goes directly to the founder’s inbox at <strong>shaikajhaj@gmail.com</strong>.
              </p>
            </div>

            {/* Error Message */}
            {errorMsg && (
              <div className="feedback-error-banner">
                <AlertCircle size={16} />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Category Selector */}
            <div className="feedback-form-group">
              <label className="feedback-field-label">Feedback Category</label>
              <div className="feedback-category-pills">
                {CATEGORIES.map((cat) => {
                  const Icon = cat.icon;
                  const isSelected = category === cat.id;
                  return (
                    <button
                      type="button"
                      key={cat.id}
                      className={`feedback-cat-pill ${isSelected ? 'active' : ''}`}
                      onClick={() => setCategory(cat.id)}
                    >
                      <Icon size={14} style={{ color: isSelected ? '#000000' : 'inherit' }} />
                      <span>{cat.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Star Rating */}
            <div className="feedback-form-group">
              <div className="feedback-rating-header">
                <label className="feedback-field-label">How is your experience with OpenVC?</label>
                <span className="feedback-rating-hint">
                  {RATING_LABELS[hoverRating || rating]}
                </span>
              </div>
              <div className="feedback-stars-row" onMouseLeave={() => setHoverRating(0)}>
                {[1, 2, 3, 4, 5].map((star) => {
                  const isFilled = (hoverRating || rating) >= star;
                  return (
                    <button
                      type="button"
                      key={star}
                      className={`feedback-star-btn ${isFilled ? 'filled' : ''}`}
                      onMouseEnter={() => setHoverRating(star)}
                      onClick={() => setRating(star)}
                      aria-label={`${star} star`}
                    >
                      <Star size={24} fill={isFilled ? '#ff9f00' : 'none'} color={isFilled ? '#ff9f00' : '#bbbbbb'} />
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Feedback Message */}
            <div className="feedback-form-group">
              <div className="feedback-textarea-header">
                <label className="feedback-field-label">Your Message *</label>
                <span className="feedback-char-count">{message.length}/1000</span>
              </div>
              <textarea
                className="feedback-textarea"
                rows={4}
                maxLength={1000}
                placeholder="What worked well? What features or diligence data should we add next? Any issues encountered?"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
              />
            </div>

            {/* Name & Email Row */}
            <div className="feedback-inputs-row">
              <div className="feedback-input-col">
                <label className="feedback-field-label">Your Name (Optional)</label>
                <input
                  type="text"
                  className="feedback-input"
                  placeholder="e.g. Alex Chen"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div className="feedback-input-col">
                <label className="feedback-field-label">Email for Follow-up (Optional)</label>
                <input
                  type="email"
                  className="feedback-input"
                  placeholder="alex@fund.vc"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="feedback-modal-footer">
              <div className="feedback-destination-note">
                <Mail size={13} style={{ marginRight: '6px' }} />
                <span>Dispatches instantly to <strong>shaikajhaj@gmail.com</strong></span>
              </div>
              <button 
                type="submit" 
                className="btn-feedback-submit" 
                disabled={isSubmitting || !message.trim()}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={16} className="feedback-spinner" />
                    <span>Sending Feedback...</span>
                  </>
                ) : (
                  <>
                    <Send size={15} />
                    <span>Send Feedback</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
