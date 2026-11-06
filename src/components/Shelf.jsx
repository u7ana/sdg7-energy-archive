import { memo } from 'react';
import { FILMS, N, TOT } from '../data.js';
import { spineSVG, coverSVG } from '../art.js';

// The art is generated SVG markup, built once per film and reused by the three loop copies.
const SPINES = FILMS.map(spineSVG);
const COVERS = FILMS.map(coverSVG);

const Tape = memo(function Tape({ v }) {
  const i = v % N;
  return (
    <div className="tape" data-v={v}>
      <div className="sp" dangerouslySetInnerHTML={{ __html: SPINES[i] }} />
      <div className="cv">
        <div className="cvi" dangerouslySetInnerHTML={{ __html: COVERS[i] }} />
      </div>
    </div>
  );
});

export default function Shelf({ shelfRef, stageRef, ringRef }) {
  return (
    <>
      <div className="floor" />
      <section className="shelf" ref={shelfRef} aria-label="Ten research papers on solar energy and energy saving">
        <div className="stage" ref={stageRef}>
          {Array.from({ length: TOT }, (_, v) => <Tape key={v} v={v} />)}
        </div>
      </section>
      <div className="ring" ref={ringRef}><i /></div>
    </>
  );
}
