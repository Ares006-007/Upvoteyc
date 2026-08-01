import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, CheckCircle2, XCircle, Trash2, ArrowRight, Search, FileText, Loader2, AlertTriangle } from 'lucide-react';
import './HistoryPage.css';

export function HistoryPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchFilter, setSearchFilter] = useState('');
  const [deletingId, setDeletingId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/history');
      if (!res.ok) throw new Error('Failed to fetch history');
      const data = await res.json();
      setItems(data);
    } catch (err) {
      console.error(err);
      setError('Could not load history. Is the backend running?');
    } finally {
      setLoading(false);
    }
  };

  const handleView = async (id) => {
    try {
      const res = await fetch(`/api/history/${id}`);
      if (!res.ok) throw new Error('Failed to fetch report');
      const item = await res.json();
      navigate('/report', { state: { reportData: item.reportData } });
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (deletingId) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/history/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Delete failed');
      setItems(prev => prev.filter(item => item.id !== id));
    } catch (err) {
      console.error(err);
    } finally {
      setDeletingId(null);
    }
  };

  const formatDate = (isoDate) => {
    try {
      const d = new Date(isoDate);
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
      return 'Unknown date';
    }
  };

  const formatTime = (isoDate) => {
    try {
      const d = new Date(isoDate);
      return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  const filtered = items.filter(item => {
    if (!searchFilter) return true;
    const q = searchFilter.toLowerCase();
    return (
      (item.company_name || '').toLowerCase().includes(q) ||
      (item.query || '').toLowerCase().includes(q) ||
      (item.tagline || '').toLowerCase().includes(q) ||
      (item.pain_point || '').toLowerCase().includes(q)
    );
  });

  const goCount = filtered.filter(i => i.verdict === 'GO').length;
  const noGoCount = filtered.filter(i => i.verdict !== 'GO').length;

  return (
    <div className="container history-page">
      <div className="history-header">
        <div className="history-header-text">
          <h1 className="text-display-lg">Diligence Archive</h1>
          <p className="text-subhead history-subtitle">
            Your past investment memorandums and market scans.
          </p>
        </div>
      </div>

      {/* Stats Strip */}
      {!loading && !error && items.length > 0 && (
        <div className="history-stats">
          <div className="stat-pill">
            <FileText size={16} />
            <span className="text-body-sm"><strong>{items.length}</strong> memos</span>
          </div>
          <div className="stat-pill stat-go">
            <CheckCircle2 size={16} />
            <span className="text-body-sm"><strong>{goCount}</strong> GO</span>
          </div>
          <div className="stat-pill stat-nogo">
            <XCircle size={16} />
            <span className="text-body-sm"><strong>{noGoCount}</strong> NO-GO</span>
          </div>
        </div>
      )}

      {/* Search Filter */}
      {!loading && !error && items.length > 0 && (
        <div className="history-search-wrapper">
          <Search className="history-search-icon" size={18} />
          <input
            type="text"
            className="history-search-input text-body-sm"
            placeholder="Filter memos by company, query, or thesis..."
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
          />
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="history-empty-state">
          <Loader2 className="history-empty-icon spinning" size={48} />
          <p className="text-body">Loading your diligence archive...</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="history-empty-state">
          <AlertTriangle className="history-empty-icon error-icon" size={48} />
          <p className="text-body">{error}</p>
          <button className="history-retry-btn text-button" onClick={fetchHistory}>
            Try Again
          </button>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && items.length === 0 && (
        <div className="history-empty-state">
          <FileText className="history-empty-icon" size={48} />
          <p className="text-body" style={{ marginBottom: '8px' }}>No diligence memos yet.</p>
          <p className="text-body-sm" style={{ opacity: 0.6 }}>
            Run your first analysis from the Diligence Engine to start building your archive.
          </p>
        </div>
      )}

      {/* No Results */}
      {!loading && !error && items.length > 0 && filtered.length === 0 && (
        <div className="history-empty-state">
          <Search className="history-empty-icon" size={48} />
          <p className="text-body">No memos match "{searchFilter}"</p>
        </div>
      )}

      {/* History Cards */}
      {!loading && filtered.length > 0 && (
        <div className="history-list">
          {filtered.map((item, index) => {
            const isGo = item.verdict === 'GO';
            return (
              <div
                key={item.id}
                className="history-card"
                onClick={() => handleView(item.id)}
                style={{ animationDelay: `${index * 60}ms` }}
              >
                <div className="history-card-top">
                  <div className="history-card-meta">
                    <span className={`verdict-badge text-caption ${isGo ? 'go' : 'nogo'}`}>
                      {isGo ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
                      {item.verdict || 'NO-GO'}
                    </span>
                    <span className="confidence-badge text-caption">
                      {item.confidence || 0}% conviction
                    </span>
                    <span className="mode-badge text-caption">
                      {item.mode === 'discover' ? 'Signal Scan' : 'Diligence'}
                    </span>
                  </div>
                  <button
                    className="history-delete-btn"
                    onClick={(e) => handleDelete(e, item.id)}
                    title="Delete memo"
                    disabled={deletingId === item.id}
                  >
                    {deletingId === item.id ? (
                      <Loader2 size={16} className="spinning" />
                    ) : (
                      <Trash2 size={16} />
                    )}
                  </button>
                </div>

                <h3 className="history-card-title text-card-title">
                  {item.company_name || 'Untitled Memo'}
                </h3>
                <p className="history-card-tagline text-body-sm">
                  {item.tagline || 'No description'}
                </p>

                {item.pain_point && (
                  <div className="history-card-pain text-body-sm">
                    <span className="pain-label">Pain:</span> {item.pain_point}
                    {item.rage_score > 0 && (
                      <span className="rage-dot" title={`Demand intensity: ${item.rage_score}/10`}>
                        🔥 {item.rage_score}/10
                      </span>
                    )}
                  </div>
                )}

                <div className="history-card-bottom">
                  <div className="history-card-date text-caption">
                    <Clock size={12} />
                    {formatDate(item.created_at)} · {formatTime(item.created_at)}
                  </div>
                  <div className="history-card-signals text-caption">
                    {item.posts_count || 0} signals analyzed
                  </div>
                  <div className="history-card-cta text-body-sm">
                    View Report <ArrowRight size={14} />
                  </div>
                </div>

                {/* Confidence bar */}
                <div className="confidence-bar-track">
                  <div
                    className={`confidence-bar-fill ${isGo ? 'go' : 'nogo'}`}
                    style={{ width: `${Math.min(item.confidence || 0, 100)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
