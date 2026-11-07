import { forwardRef, useImperativeHandle, useRef, useState } from 'react';
import { flushSync } from 'react-dom';
import { FILMS } from '../data.js';
import { coverInner, fitText } from '../art.js';
import { SUM } from '../summaries.js';
import { SIMS, SIM_TITLE } from '../sims.jsx';
import Player from '../anim.jsx';
import { Italic, citeParen, copyText } from './cite.jsx';

const TABS = [['overview', 'Overview'], ['watch', 'Watch'], ['summary', 'Summary'], ['sim', 'Simulate'], ['cite', 'Cite']];

const RM = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const CLIP_EASE = 'cubic-bezier(.76,0,.18,1)';
const FULL = 'inset(0px 0px 0px 0px round 0px)';
// cx, cy, delay (ms): seven ink blots that grow to reveal the poster
const INK = [[150, 330, 0], [340, 600, 120], [250, 120, 220], [90, 760, 300], [400, 250, 360], [260, 860, 420], [230, 470, 180]];

const insetFrom = (r) => `inset(${r.top}px ${innerWidth - r.right}px ${innerHeight - r.bottom}px ${r.left}px round 3px)`;

// The sheet grows out of the cover (clip-path), text lines rise through masks, the poster bleeds in like ink.
const Detail = forwardRef(function Detail({ onRequestClose }, ref) {
  const [film, setFilm] = useState(FILMS[0]);
  const [hidden, setHidden] = useState(true);
  const [tab, setTab] = useState('overview');
  const [copied, setCopied] = useState('');
  const root = useRef(null), lines = useRef(null), art = useRef(null), closeBtn = useRef(null);
  const circles = useRef([]);
  const anims = useRef([]);
  const inkRaf = useRef(0);

  const cancelAll = () => { anims.current.forEach((a) => a.cancel()); anims.current = []; cancelAnimationFrame(inkRaf.current); };

  function runInk(start) {
    const tick = (now) => {
      let done = true;
      INK.forEach((c, i) => {
        const t = Math.max(0, Math.min(1, (now - start - c[2]) / 1250));
        circles.current[i]?.setAttribute('r', (720 * (1 - Math.pow(1 - t, 3))).toFixed(1));
        if (t < 1) done = false;
      });
      if (!done) inkRaf.current = requestAnimationFrame(tick);
    };
    cancelAnimationFrame(inkRaf.current);
    inkRaf.current = requestAnimationFrame(tick);
  }

  useImperativeHandle(ref, () => ({
    open(f, rect) {
      cancelAll();
      flushSync(() => { setFilm(f); setTab('overview'); setHidden(false); });
      circles.current.forEach((c) => c && c.setAttribute('r', 0));
      fitText(art.current);
      const el = root.current;
      el.scrollTop = 0;
      anims.current.push(el.animate([{ clipPath: insetFrom(rect) }, { clipPath: FULL }], { duration: RM ? 1 : 1050, easing: CLIP_EASE, fill: 'both' }));
      lines.current.querySelectorAll('.i').forEach((l, i) => {
        anims.current.push(l.animate([{ transform: 'translateY(110%)' }, { transform: 'translateY(0)' }],
          { duration: RM ? 1 : 900, delay: RM ? 0 : 620 + i * 75, easing: 'cubic-bezier(.2,.8,.2,1)', fill: 'both' }));
      });
      runInk(RM ? performance.now() - 5000 : performance.now() + 520);
      setTimeout(() => closeBtn.current && closeBtn.current.focus({ preventScroll: true }), RM ? 0 : 600);
    },
    close(rect) {
      const a = root.current.animate([{ clipPath: FULL }, { clipPath: insetFrom(rect) }], { duration: RM ? 1 : 850, easing: CLIP_EASE, fill: 'both' });
      a.onfinish = () => { cancelAll(); setHidden(true); };
    },
  }));

  return (
    <div className="detail" ref={root} hidden={hidden} role="dialog" aria-modal="true" aria-label="Paper details">
      <button className="close box lbl" ref={closeBtn} onClick={onRequestClose} aria-label="Close details">Close ✕</button>
      <div className="brand lbl"><span>SDG 7</span><span className="ln" /><span>Energy Library</span></div>

      <div className="dl" ref={lines}>
        <div className="m"><span className="i lbl d-sub">{film.romaji}</span></div>
        <div className="m"><h2 className="i d-ttl" style={{ margin: 0 }}>{film.title}</h2></div>
        <div className="m"><span className="i lbl d-meta">{film.year} / {film.topic.toUpperCase()} / {film.words} WORDS</span></div>
        <div className="m">
          <div className="i d-tabs" role="tablist" aria-label="Library sections">
            {TABS.map(([k, l]) => (
              <button key={k} role="tab" type="button" id={'tab-' + k} aria-selected={tab === k} aria-controls="d-panel" className={'lbl' + (tab === k ? ' on' : '')} onClick={() => setTab(k)}>{l}</button>
            ))}
          </div>
        </div>
        <div className="m">
          <div className="i d-panel" id="d-panel" role="tabpanel" aria-labelledby={'tab-' + tab}>
            <div className="d-in" key={film.id + tab}>
              {tab === 'overview' && (
                <>
                  <p className="d-syn">{film.syn}</p>
                  <div className="d-stats">
                    {film.stats.map(([v, l]) => <div key={l}><b>{v}</b><span>{l}</span></div>)}
                  </div>
                  <p className="d-cred">{film.auFull} ({film.year}). {film.journal}.</p>
                  <div className="d-acts">
                    <a className="d-btn lbl" href={`https://doi.org/${film.doi}`} target="_blank" rel="noopener noreferrer">Read the paper <span>→</span></a>
                    <button type="button" className="d-btn alt lbl" onClick={() => setTab('watch')}>Watch the animation <span>→</span></button>
                  </div>
                </>
              )}
              {tab === 'watch' && <Player id={film.id} />}
              {tab === 'summary' && (
                <article className="d-sum">
                  <p className="d-note lbl">{film.words} words · original summary of the paper</p>
                  {SUM[film.id].paras.map((p, i) => (
                    <section key={i}>
                      {p.h && <h3>{p.h}</h3>}
                      <p>{p.t}</p>
                    </section>
                  ))}
                </article>
              )}
              {tab === 'sim' && (() => {
                const Sim = SIMS[film.id];
                return (
                  <div className="d-simbox">
                    <h3 className="sm-ttl lbl">{SIM_TITLE[film.id]}</h3>
                    <Sim />
                  </div>
                );
              })()}
              {tab === 'cite' && (
                <div className="d-cite">
                  <span className="lbl d-note">APA 7th edition reference</span>
                  <p className="ref"><Italic text={SUM[film.id].ref} /></p>
                  <div className="d-acts">
                    <button type="button" className="d-btn lbl" onClick={() => copyText(SUM[film.id].ref.replace(/\*/g, '')).then(() => { setCopied('ref'); setTimeout(() => setCopied(''), 1600); })}>{copied === 'ref' ? 'Copied ✓' : 'Copy reference'}</button>
                    <a className="d-btn alt lbl" href={`https://doi.org/${film.doi}`} target="_blank" rel="noopener noreferrer">Open DOI <span>→</span></a>
                  </div>
                  <span className="lbl d-note">In-text citation</span>
                  <p className="ref plain">Parenthetical: {citeParen(film)}<br />Narrative: {citeParen(film, true)}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="dr">
        <svg viewBox="0 0 474 900" aria-hidden="true">
          <defs>
            <filter id="ink" filterUnits="userSpaceOnUse" x="-400" y="-400" width="1300" height="1700">
              <feTurbulence type="fractalNoise" baseFrequency=".011" numOctaves="3" seed="7" result="n" />
              <feDisplacementMap in="SourceGraphic" in2="n" scale="120" xChannelSelector="R" yChannelSelector="G" />
            </filter>
            <mask id="pm" maskUnits="userSpaceOnUse" x="0" y="0" width="474" height="900">
              <g filter="url(#ink)" fill="#fff">
                {INK.map((c, i) => <circle key={i} cx={c[0]} cy={c[1]} r="0" ref={(el) => { circles.current[i] = el; }} />)}
              </g>
            </mask>
          </defs>
          <g mask="url(#pm)" ref={art} dangerouslySetInnerHTML={{ __html: coverInner(film) }} />
        </svg>
      </div>
    </div>
  );
});

export default Detail;
