import { useCallback, useEffect, useRef, useState } from 'react';
import { FILMS, N } from './data.js';
import { fitText } from './art.js';
import { createShelf, START } from './engine.js';
import Defs from './components/Defs.jsx';
import Shelf from './components/Shelf.jsx';
import Caption from './components/Caption.jsx';
import Timeline from './components/Timeline.jsx';
import Detail from './components/Detail.jsx';
import { TopBar, HalftoneWords, Arrows, Footer, Cursor } from './components/Chrome.jsx';

let layerId = 1;

export default function App() {
  const shelfRef = useRef(null), stageRef = useRef(null), probeRef = useRef(null), ringRef = useRef(null);
  const curRef = useRef(null), dotRef = useRef(null), tlRef = useRef(null);
  const engine = useRef(null), detail = useRef(null);
  const detailOpen = useRef(false), cursorTarget = useRef(null);

  const [cursorState, setCursorState] = useState('');
  const [layers, setLayers] = useState([{ id: 0, idx: START % N, dir: 1, leaving: false, fresh: false }]);

  const onActive = useCallback((idx, dir) => {
    setLayers((ls) => [
      ...ls.slice(-3).map((l) => ({ ...l, leaving: true, dir, fresh: false })),
      { id: layerId++, idx, dir, leaving: false, fresh: true },
    ]);
  }, []);
  const removeLayer = useCallback((id) => setLayers((ls) => (ls.some((l) => l.id === id) ? ls.filter((l) => l.id !== id) : ls)), []);

  const openDetail = useCallback(() => {
    if (detailOpen.current || !engine.current) return;
    detailOpen.current = true;
    const i = engine.current.snap();
    detail.current.open(FILMS[i], engine.current.coverRect());
  }, []);
  const closeDetail = useCallback(() => {
    if (!detailOpen.current) return;
    detailOpen.current = false;
    detail.current.close(engine.current.coverRect());
  }, []);

  useEffect(() => {
    const e = createShelf({
      shelf: shelfRef.current, stage: stageRef.current, probe: probeRef.current, ring: ringRef.current,
      cursor: curRef.current, dot: dotRef.current, tl: tlRef.current,
      onActive, onOpen: openDetail, onCursor: setCursorState,
      isDetailOpen: () => detailOpen.current,
      cursorTarget: () => cursorTarget.current,
      setCursorTarget: (t) => { cursorTarget.current = t; },
    });
    engine.current = e;
    const refit = () => { e.measure(); fitText(stageRef.current); };
    refit();
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(refit);
    const onKey = (ev) => { if (ev.key === 'Escape') closeDetail(); };
    window.addEventListener('keydown', onKey);
    return () => { window.removeEventListener('keydown', onKey); e.destroy(); engine.current = null; };
  }, [onActive, openDetail, closeDetail]);

  const jumpTo = (id) => { const i = FILMS.findIndex((f) => f.id === id); if (i >= 0) engine.current.jumpFilm(i); };

  return (
    <>
      <Defs />
      <div className="grain" />
      <TopBar onJump={jumpTo} onBrand={closeDetail} />
      <HalftoneWords />
      <Shelf shelfRef={shelfRef} stageRef={stageRef} ringRef={ringRef} />
      <Caption layers={layers} onDone={removeLayer} />
      <Arrows onPrev={() => engine.current.step(-1)} onNext={() => engine.current.step(1)} />
      <Timeline tlRef={tlRef} dotRef={dotRef} onJump={(x) => engine.current.jumpYear(x)} />
      <Footer />
      <Cursor curRef={curRef} state={cursorState} />
      <div id="probe" ref={probeRef} />
      <Detail ref={detail} onRequestClose={closeDetail} />
    </>
  );
}
