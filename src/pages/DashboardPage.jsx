import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/Button';
import { Search, Loader2, CheckCircle2, Circle, XCircle } from 'lucide-react';
import './DashboardPage.css';

export function DashboardPage() {
  const [mode, setMode] = useState('research'); // 'discover' or 'research'
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [logs, setLogs] = useState([]);
  const navigate = useNavigate();

  const handleSearch = async () => {
    if (!query) return;
    setIsSearching(true);
    setLogs([]);

    try {
      const response = await fetch('/api/research', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode, query })
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n\n');
        buffer = lines.pop(); // Keep the incomplete chunk

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const dataStr = line.replace('data: ', '').trim();
            if (!dataStr) continue;
            
            try {
              const data = JSON.parse(dataStr);
              
              if (data.step === 'complete') {
                navigate('/report', { state: { reportData: data.result } });
                return;
              } else if (data.step === 'error') {
                setLogs(prev => [...prev, { step: 'error', message: data.message }]);
                setIsSearching(false);
                return;
              } else {
                setLogs(prev => {
                  // To prevent spamming, only append if message is different
                  const lastLog = prev[prev.length - 1];
                  if (lastLog && lastLog.message === data.message) return prev;
                  return [...prev, { step: data.step, message: data.message }];
                });
              }
            } catch (e) {
              console.error('Error parsing SSE data', e);
            }
          }
        }
      }
    } catch (err) {
      console.error(err);
      setLogs(prev => [...prev, { step: 'error', message: 'Failed to connect to backend. Is the server running?' }]);
      setIsSearching(false);
    }
  };

  return (
    <div className="container dashboard-page">
      <div className="dashboard-header">
        <div className="mode-toggle">
          <button 
            className={`mode-toggle-btn text-button ${mode === 'discover' ? 'active' : ''}`}
            onClick={() => { setMode('discover'); setQuery(''); }}
          >
            Discover Ideas
          </button>
          <button 
            className={`mode-toggle-btn text-button ${mode === 'research' ? 'active' : ''}`}
            onClick={() => { setMode('research'); setQuery(''); }}
          >
            Research My Idea
          </button>
        </div>
        
        <h1 className="text-display-lg" style={{ marginBottom: '24px' }}>
          {mode === 'discover' ? 'Find real problems.' : 'Validate your idea.'}
        </h1>
      </div>

      <div className="search-box-container">
        <div className="search-input-wrapper">
          <Search className="search-icon" size={24} />
          <input 
            type="text" 
            className="search-input" 
            placeholder={mode === 'discover' ? "Enter an industry (e.g., healthcare, logistics)..." : "Describe your startup idea..."}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            disabled={isSearching}
          />
          <div className="search-button">
            <Button variant="primary" onClick={handleSearch} disabled={isSearching}>
              {isSearching ? 'Researching...' : 'Start'}
            </Button>
          </div>
        </div>

        {!isSearching && (
          <div className="filters-row text-body-sm">
            <button className="filter-chip">Geography: Global</button>
            <button className="filter-chip">Customer: Any</button>
            <button className="filter-chip">Sources: Reddit, News, Trends</button>
          </div>
        )}
      </div>

      {(isSearching || logs.length > 0) && (
        <div className="progress-section">
          <div className="text-eyebrow" style={{ marginBottom: '24px', textAlign: 'center' }}>
            Pipeline Active
          </div>
          
          {logs.map((log, index) => {
            const isLast = index === logs.length - 1;
            const isError = log.step === 'error';
            
            let statusClass = 'done';
            if (isError) statusClass = 'error';
            else if (isLast && isSearching) statusClass = 'active';
            
            return (
              <div key={index} className={`progress-item ${statusClass}`}>
                {isError ? (
                  <XCircle className="progress-icon" size={20} color="var(--color-accent-magenta)" />
                ) : (isLast && isSearching) ? (
                  <Loader2 className="progress-icon" size={20} />
                ) : (
                  <CheckCircle2 className="progress-icon" size={20} />
                )}
                <span className="text-body-sm">{log.message}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
