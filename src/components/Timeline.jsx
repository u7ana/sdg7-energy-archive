import { FILMS, YMIN, YMAX } from '../data.js';

const years = Array.from({ length: YMAX - YMIN + 1 }, (_, i) => YMIN + i);
const pos = (y) => ((y - YMIN) / (YMAX - YMIN)) * 100 + '%';

export default function Timeline({ tlRef, dotRef, onJump }) {
  return (
    <div className="tl" ref={tlRef}>
      <div className="line" />
      {years.map((y) => {
        const major = (y - YMIN) % 5 === 0;
        return (
          <span key={y}>
            <span className={'t ' + (major ? 'm' : 'n')} style={{ left: pos(y) }} />
            {major && <span className={'y ' + (y === YMIN ? 'f' : '')} style={{ left: pos(y) }}>{y}</span>}
          </span>
        );
      })}
      {FILMS.map((f) => <span key={f.id} className="film" style={{ left: pos(f.year) }} />)}
      <div className="dot" ref={dotRef} />
      <div className="hit" onClick={(e) => onJump(e.clientX)} />
    </div>
  );
}
