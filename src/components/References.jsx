import { useEffect, useRef, useState } from 'react';
import { FILMS } from '../data.js';
import { SUM } from '../summaries.js';
import { Italic, copyText } from './cite.jsx';

// Alphabetical APA reference list for the whole library.
const LIST = FILMS.map((f) => ({ id: f.id, title: f.title, ref: SUM[f.id].ref })).sort((a, b) => a.ref.localeCompare(b.ref, 'en', { sensitivity: 'base' }));

export default function References({ open, onClose, onOpenPaper }) {
  const [copied, setCopied] = useState(false);
  const btn = useRef(null);
  useEffect(() => { if (open && btn.current) btn.current.focus({ preventScroll: true }); }, [open]);
  if (!open) return null;
  const all = LIST.map((r) => r.ref.replace(/\*/g, '')).join('\n\n');
  return (
    <div className="refs" role="dialog" aria-modal="true" aria-label="References">
      <button ref={btn} className="close box lbl" onClick={onClose} aria-label="Close references">Close ✕</button>
      <div className="refs-in">
        <span className="lbl d-sub">SDG 7 Energy Library</span>
        <h2 className="d-ttl">References</h2>
        <p className="d-syn">The ten papers in this library, in APA 7th edition order.</p>
        <div className="d-acts">
          <button type="button" className="d-btn lbl" onClick={() => copyText(all).then(() => { setCopied(true); setTimeout(() => setCopied(false), 1600); })}>{copied ? 'Copied ✓' : 'Copy all references'}</button>
        </div>
        <ol className="refs-list">
          {LIST.map((r) => (
            <li key={r.id}>
              <p className="ref"><Italic text={r.ref} /></p>
              <button type="button" className="lbl lnk" onClick={() => onOpenPaper(r.id)}>Open in library →</button>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
