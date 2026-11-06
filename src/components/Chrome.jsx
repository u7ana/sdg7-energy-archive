// Fixed page furniture: top bar, giant halftone words, arrows, footer and the custom cursor.
export function TopBar({ onJump, onBrand }) {
  return (
    <header className="top">
      <div className="l">
        <a className="lbl" href="#top" onClick={(e) => { e.preventDefault(); onBrand(); }}>SDG 7</a>
        <span className="ln" />
        <span className="lbl">Energy Archive</span>
      </div>
      <nav className="r">
        <button className="lbl" onClick={() => onJump('feron')}>Solar</button>
        <button className="lbl" onClick={() => onJump('hossain')}>Saving</button>
        <button className="lbl keep" onClick={() => onJump('salah')}>Egypt</button>
      </nav>
    </header>
  );
}

export function HalftoneWords() {
  return (
    <>
      <div className="kj a" aria-hidden="true">SOLAR</div>
      <div className="kj b" aria-hidden="true">SAVE</div>
    </>
  );
}

export function Arrows({ onPrev, onNext }) {
  return (
    <>
      <button className="arr l" onClick={onPrev} aria-label="Previous paper">
        <svg viewBox="0 0 24 12" fill="none" stroke="currentColor" strokeWidth="1.2"><path d="M6 1L1 6l5 5M1 6h23" /></svg>
      </button>
      <button className="arr r" onClick={onNext} aria-label="Next paper">
        <svg viewBox="0 0 24 12" fill="none" stroke="currentColor" strokeWidth="1.2"><path d="M18 1l5 5-5 5M23 6H0" /></svg>
      </button>
    </>
  );
}

export function Footer() {
  return (
    <footer className="foot">
      <span className="lbl">© GEO 217 · Fall 2026 · Alamein International University</span>
      <span className="lbl">#AIU #SDGs #GEO217</span>
    </footer>
  );
}

export function Cursor({ curRef, state }) {
  return (
    <div className={'cursor ' + state} ref={curRef}>
      <div className="rg" /><div className="dt" />
      <div className="tx"><b>OPEN</b><i>READ</i></div>
    </div>
  );
}
