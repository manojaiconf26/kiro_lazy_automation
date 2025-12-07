import { useState } from 'react';

interface ResultViewProps {
  releaseNotes: string;
  changelog: string;
}

function ResultView({ releaseNotes, changelog }: ResultViewProps) {
  const [copiedReleaseNotes, setCopiedReleaseNotes] = useState(false);
  const [copiedChangelog, setCopiedChangelog] = useState(false);

  const handleCopy = async (content: string, type: 'releaseNotes' | 'changelog') => {
    try {
      await navigator.clipboard.writeText(content);
      
      if (type === 'releaseNotes') {
        setCopiedReleaseNotes(true);
        setTimeout(() => setCopiedReleaseNotes(false), 2000);
      } else {
        setCopiedChangelog(true);
        setTimeout(() => setCopiedChangelog(false), 2000);
      }
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  };

  return (
    <div className="result-view">
      <div className="result-section">
        <div className="result-header">
          <h2>Release Notes</h2>
          <button
            onClick={() => handleCopy(releaseNotes, 'releaseNotes')}
            className="copy-button"
            aria-label="Copy release notes"
          >
            {copiedReleaseNotes ? '✓ Copied!' : 'Copy'}
          </button>
        </div>
        <textarea
          value={releaseNotes}
          readOnly
          className="result-textarea"
          aria-label="Release notes output"
        />
      </div>

      <div className="result-section">
        <div className="result-header">
          <h2>Changelog</h2>
          <button
            onClick={() => handleCopy(changelog, 'changelog')}
            className="copy-button"
            aria-label="Copy changelog"
          >
            {copiedChangelog ? '✓ Copied!' : 'Copy'}
          </button>
        </div>
        <textarea
          value={changelog}
          readOnly
          className="result-textarea"
          aria-label="Changelog output"
        />
      </div>
    </div>
  );
}

export default ResultView;
