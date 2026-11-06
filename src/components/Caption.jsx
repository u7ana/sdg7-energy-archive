import { useEffect, useLayoutEffect, useRef } from 'react';
import { FILMS } from '../data.js';

const RM = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const OPTS = { duration: 650, easing: 'cubic-bezier(.2,.8,.2,1)', fill: 'both' };

// One line of the caption. A new layer slides in from `dir`, the old one slides out the other way (mask slide, no fades).
function Layer({ leaving, dir, fresh, onDone, className, children }) {
  const ref = useRef(null);
  useLayoutEffect(() => {
    if (fresh && !RM) ref.current.animate([{ transform: `translateY(${dir * 105}%)` }, { transform: 'translateY(0)' }], OPTS);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => {
    if (!leaving) return;
    if (RM) { onDone(); return; }
    const el = ref.current, cs = getComputedStyle(el).transform;
    const a = el.animate([{ transform: cs === 'none' ? 'translateY(0)' : cs }, { transform: `translateY(${-dir * 105}%)` }], OPTS);
    a.onfinish = onDone;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [leaving]);
  return <span ref={ref} className={className}>{children}</span>;
}

export default function Caption({ layers, onDone }) {
  const line = (cls, render) => (
    <div className="mask">
      {layers.map((l) => (
        <Layer key={l.id} leaving={l.leaving} dir={l.dir} fresh={l.fresh} onDone={() => onDone(l.id)} className={cls}>
          {render(FILMS[l.idx])}
        </Layer>
      ))}
    </div>
  );
  return (
    <div className="cap" aria-live="polite">
      {line('ttl', (f) => f.title)}
      {line('lbl sub', (f) => f.romaji)}
      {line('', () => <i className="rl" />)}
      {line('yr', (f) => `${f.year} — ${f.topic}`)}
    </div>
  );
}
