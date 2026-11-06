import { forwardRef, useImperativeHandle, useRef, useState } from 'react';
import { flushSync } from 'react-dom';
import { FILMS } from '../data.js';
import { coverInner, fitText } from '../art.js';

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
      flushSync(() => { setFilm(f); setHidden(false); });
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
      <div className="brand lbl"><span>SDG 7</span><span className="ln" /><span>Energy Archive</span></div>

      <div className="dl" ref={lines}>
        <div className="m"><span className="i lbl d-sub">{film.romaji}</span></div>
        <div className="m"><h2 className="i d-ttl" style={{ margin: 0 }}>{film.title}</h2></div>
        <div className="m"><span className="i lbl d-meta">{film.year} / {film.topic.toUpperCase()} / {film.words} WORDS</span></div>
        <div className="m"><p className="i d-syn">{film.syn}</p></div>
        <div className="m">
          <div className="i d-stats">
            {film.stats.map(([v, l]) => <div key={l}><b>{v}</b><span>{l}</span></div>)}
          </div>
        </div>
        <div className="m"><p className="i d-cred">{film.auFull} ({film.year}). {film.journal}.</p></div>
        <div className="m">
          <a className="i d-btn lbl" href={`https://doi.org/${film.doi}`} target="_blank" rel="noopener noreferrer">Read the paper <span>→</span></a>
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
