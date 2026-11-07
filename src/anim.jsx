import { useEffect, useRef, useState } from 'react';

/* Animated explainers: four short scenes per paper (6 s each), one per topic or experiment the paper covers.
   Every scene is a pure function of u (0..1 within the scene), so the player can play, pause and scrub it. */

const RM = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const DUR = 6;
const C = { cob: '#1F3FB0', ver: '#D9432A', ink: '#141414', cream: '#F1E7D0', mut: '#6D6A63', sand: '#E6DBC0', dim: 'rgba(20,20,20,.14)' };
const cl = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const sg = (t, a, b) => cl((t - a) / (b - a));
const eo = (x) => 1 - Math.pow(1 - x, 3);
const eio = (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const lerp = (a, b, x) => a + (b - a) * x;
const fr = (x) => x - Math.floor(x);
const f1 = (n, d = 0) => Number(n).toLocaleString('en-US', { maximumFractionDigits: d, minimumFractionDigits: d });

/* ---------- drawing helpers (all SVG, 800 x 450) ---------- */
const T = ({ x, y, s = 22, a = 'middle', c = C.ink, w = 600, o = 1, children }) => (
  <text x={x} y={y} fontSize={s} textAnchor={a} fill={c} fontWeight={w} opacity={o} className="an-t">{children}</text>
);
const Sun = ({ x, y, r = 26, u = 0, o = 1 }) => (
  <g opacity={o} transform={`translate(${x} ${y})`}>
    <g transform={`rotate(${u * 90})`}>
      {Array.from({ length: 12 }, (_, i) => <line key={i} x1={r + 7} x2={r + 16 + (i % 2) * 6} y1="0" y2="0" stroke={C.ver} strokeWidth="3" strokeLinecap="round" transform={`rotate(${i * 30})`} />)}
    </g>
    <circle r={r} fill={C.ver} />
  </g>
);
const Home = ({ x, y, s = 1, on = 1, o = 1, c = C.ink }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} opacity={o}>
    <path d="M0 14 L16 0 L32 14 V32 H0Z" fill={c} />
    <rect x="11" y="16" width="10" height="9" fill={on > 0.5 ? C.cream : '#555'} />
    {on > 0.5 && <circle cx="16" cy="20" r="14" fill={C.cream} opacity=".18" />}
  </g>
);
const Village = ({ x, y, cols, rows, gap = 40, on = () => 1, pop = 1 }) => (
  <g>{Array.from({ length: cols * rows }, (_, i) => {
    const c = i % cols, r = Math.floor(i / cols), p = eo(sg(pop, (i / (cols * rows)) * 0.7, (i / (cols * rows)) * 0.7 + 0.3));
    return <Home key={i} x={x + c * gap} y={y + r * gap} s={p} on={on(i)} c={on(i) > 0.5 ? C.ver : C.ink} />;
  })}</g>
);
const Panel = ({ x, y, w = 44, h = 26, o = 1, c = C.cob, skew = 0 }) => (
  <g transform={`translate(${x} ${y}) skewX(${skew})`} opacity={o}>
    <rect width={w} height={h} fill={c} />
    <path d={`M${w / 3} 0V${h}M${(2 * w) / 3} 0V${h}M0 ${h / 2}H${w}`} stroke={C.cream} strokeWidth="1" opacity=".7" />
  </g>
);
const Flow = ({ d, u, c = C.ver, w = 4, speed = 160 }) => (
  <g><path d={d} fill="none" stroke={C.dim} strokeWidth={w} /><path d={d} fill="none" stroke={c} strokeWidth={w} strokeDasharray="10 14" strokeDashoffset={-u * speed} strokeLinecap="round" /></g>
);
const Bar = ({ x, y, w, h = 18, p, c = C.cob, label, val }) => (
  <g>
    {label && <T x={x} y={y - 8} s={13} a="start" c={C.mut} w={500}>{label}</T>}
    <rect x={x} y={y} width={w} height={h} fill="none" stroke={C.ink} />
    <rect x={x} y={y} width={Math.max(0, w * cl(p))} height={h} fill={c} />
    {val != null && <T x={x + w + 12} y={y + h - 3} s={17} a="start">{val}</T>}
  </g>
);
const Big = ({ x, y, v, s = 54, c = C.cob, a = 'middle' }) => <T x={x} y={y} s={s} c={c} a={a} w={700}>{v}</T>;
const Cap = ({ x, y, children, a = 'middle', s = 15 }) => <T x={x} y={y} s={s} a={a} c={C.mut} w={500}>{children}</T>;
// Row of pop-in cards: items = [[title, sub]]
const Cards = ({ items, u, y = 180, w = 150, gap = 16, from = 0.08, step = 0.16, c = C.cob }) => {
  const x0 = 400 - (items.length * w + (items.length - 1) * gap) / 2;
  return (
    <g>{items.map(([t, s], i) => {
      const p = eo(sg(u, from + i * step, from + i * step + 0.14));
      return (
        <g key={t} transform={`translate(${x0 + i * (w + gap) + w / 2} ${y}) scale(${p})`} opacity={p}>
          <rect x={-w / 2} y="-60" width={w} height="120" fill="none" stroke={C.ink} />
          <rect x={-w / 2} y="-60" width={w} height="6" fill={c} />
          <T x="0" y="-4" s={20}>{t}</T>
          <T x="0" y="26" s={13} c={C.mut} w={500}>{s}</T>
        </g>
      );
    })}</g>
  );
};
const Ground = ({ y = 360 }) => <line x1="0" x2="800" y1={y} y2={y} stroke={C.ink} strokeWidth="2" />;

/* building cross-section used by the smart-building scenes */
function Building({ lit, people = [], x = 220, y = 70 }) {
  const rooms = [];
  for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++) {
    const i = r * 3 + c, on = lit(i);
    rooms.push(
      <g key={i}>
        <rect x={x + c * 120} y={y + r * 90} width="120" height="90" fill={on ? C.cream : '#2a2a2e'} stroke={C.ink} strokeWidth="2" />
        {people.includes(i) && <g><circle cx={x + c * 120 + 60} cy={y + r * 90 + 40} r="9" fill={C.cob} /><path d={`M${x + c * 120 + 46} ${y + r * 90 + 84} q14 -34 28 0z`} fill={C.cob} /></g>}
      </g>
    );
  }
  return <g>{rooms}</g>;
}

/* ---------- scenes per paper ---------- */
const FERON = [
  { cap: '1.2 billion people have no electricity. The grid simply does not reach many villages.', r: (u) => (
    <g><Ground />
      {[80, 180, 280].map((px, i) => <g key={px} opacity={sg(u, i * 0.1, i * 0.1 + 0.1)}><line x1={px} x2={px} y1="200" y2="360" stroke={C.ink} strokeWidth="4" /><line x1={px - 16} x2={px + 16} y1="214" y2="214" stroke={C.ink} strokeWidth="4" /></g>)}
      <line x1="0" x2={lerp(0, 330, eo(sg(u, 0, 0.4)))} y1="212" y2="212" stroke={C.ink} strokeWidth="3" />
      <Village x={440} y={250} cols={6} rows={2} gap={46} on={() => 0} pop={sg(u, 0.2, 0.6)} />
      <Big x={600} y={150} v={`${f1(1.2 * eo(sg(u, 0.2, 0.7)), 1)} billion`} c={C.ver} />
      <Cap x={600} y={182}>people with no electricity</Cap>
    </g>) },
  { cap: 'A solar home system: the panel charges a battery in the day, and the battery runs the lights at night.', r: (u) => {
    const night = sg(u, 0.55, 0.7);
    return (
      <g><rect x="0" y="0" width="800" height="380" fill={C.ink} opacity={0.82 * night} />
        <Ground y={380} />
        {night < 0.5 ? <Sun x={130} y={80} u={u} /> : <circle cx="130" cy="80" r="22" fill={C.cream} />}
        <Panel x={90} y={250} w={90} h={50} skew={-14} /><line x1="135" x2="135" y1="300" y2="380" stroke={C.ink} strokeWidth="4" />
        <Flow d="M180 275 H360 V320" u={u} c={C.ver} speed={night < 0.5 ? 160 : 0} />
        <rect x="330" y="320" width="70" height="40" fill="none" stroke={night > 0.5 ? C.cream : C.ink} strokeWidth="3" />
        <rect x="334" y="324" width={62 * (night < 0.5 ? 0.15 + 0.85 * sg(u, 0.05, 0.5) : 1 - 0.45 * sg(u, 0.7, 1))} height="32" fill={C.cob} />
        <Flow d="M400 340 H560" u={u} c={C.cream} speed={night > 0.5 ? 160 : 0} />
        <Home x={560} y={316} s={2} on={night > 0.5 ? 1 : 0} c={C.ver} />
        <Cap x={400} y={420}>{night < 0.5 ? 'Day: sun → panel → battery' : 'Night: battery → lamp'}</Cap>
      </g>);
  } },
  { cap: 'But many systems stop working: 45% in Guatemala and 65% in Laos, far fewer than were installed.', r: (u) => {
    const order = [3, 7, 1, 9, 5, 0, 8, 2, 6, 4];
    const g = (n, p, i) => (order.indexOf(i) < Math.round(n * eo(sg(u, 0.2, 0.8)) * p) ? 0 : 1);
    return (
      <g>
        <T x="190" y="90" s={20}>Guatemala</T>
        <Village x={80} y={140} cols={5} rows={2} gap={46} on={(i) => g(10, 0.45, i)} />
        <Big x={190} y={290} v={`${Math.round(45 * eo(sg(u, 0.2, 0.8)))}%`} c={C.ver} />
        <Cap x={190} y={320}>not working</Cap>
        <T x="610" y="90" s={20}>Laos</T>
        <Village x={500} y={140} cols={5} rows={2} gap={46} on={(i) => g(10, 0.65, i)} />
        <Big x={610} y={290} v={`${Math.round(65 * eo(sg(u, 0.2, 0.8)))}%`} c={C.ver} />
        <Cap x={610} y={320}>not working</Cap>
      </g>);
  } },
  { cap: 'What keeps the light on: training, fair pricing, a repair service and battery recycling.', r: (u) => (
    <g>
      <Cards u={u} y={150} w={160} items={[['Training', 'users know the system'], ['Fair price', 'families can pay'], ['Repair', 'local service'], ['Recycling', 'old batteries']]} />
      <Village x={310} y={290} cols={6} rows={1} gap={46} on={() => (u > 0.72 ? 1 : 0)} pop={sg(u, 0.55, 0.75)} />
    </g>) },
];

const YAICI = [
  { cap: 'Many buildings waste energy: lights and cooling stay on in rooms nobody is using.', r: (u) => (
    <g><Building lit={() => 1} people={[4, 6]} />
      {[0, 1, 2, 3, 5, 7, 8].map((i) => {
        const c = i % 3, r = Math.floor(i / 3), p = (fr(u * 1.5 + i * 0.13));
        return <g key={i} opacity={eo(sg(u, 0.2, 0.4)) * (1 - p)} transform={`translate(${220 + c * 120 + 60} ${70 + r * 90 + 60 - p * 26})`}><path d="M0 -14 L-7 3 H0 L-3 14 L8 -4 H1Z" fill={C.ver} /></g>;
      })}
      <Cap x={400} y={410}>Red bolts = electricity wasted in empty rooms</Cap>
    </g>) },
  { cap: 'Sensors measure light, temperature and who is in the room, and send the data over a wireless network.', r: (u) => {
    const hub = eo(sg(u, 0.05, 0.2));
    return (
      <g><Building lit={() => 1} people={[4, 6]} />
        <g transform={`translate(680 90) scale(${hub})`}><circle r="22" fill={C.ink} /><path d="M0 -22 V-44 M-10 -34 a10 10 0 0 1 20 0" stroke={C.ink} strokeWidth="3" fill="none" /><T x="0" y="42" s="13" c={C.mut} w={500}>hub</T></g>
        {Array.from({ length: 9 }, (_, i) => {
          const c = i % 3, r = Math.floor(i / 3), cx = 220 + c * 120 + 100, cy = 70 + r * 90 + 18, p = eo(sg(u, 0.2 + i * 0.05, 0.3 + i * 0.05)), ring = fr(u * 1.8 + i * 0.1);
          return <g key={i}><circle cx={cx} cy={cy} r={6 * p} fill={C.cob} />{p > 0.9 && <circle cx={cx} cy={cy} r={6 + ring * 22} fill="none" stroke={C.cob} strokeWidth="2" opacity={1 - ring} />}</g>;
        })}
        <Cap x={400} y={410}>Sensors → wireless network → hub</Cap>
      </g>);
  } },
  { cap: 'Automatic control switches off what is not needed. One upgrade alone saves about 5–15%.', r: (u) => {
    const k = eo(sg(u, 0.25, 0.5));
    return (
      <g><Building lit={(i) => (i === 4 || i === 6 ? 1 : 1 - k)} people={[4, 6]} />
        <Bar x={220} y={385} w={300} p={lerp(1, 0.88, eo(sg(u, 0.35, 0.8)))} label="Energy use" val={`−${Math.round(12 * eo(sg(u, 0.35, 0.8)))}%`} />
      </g>);
  } },
  { cap: 'With autonomous control, learning from the data, savings reach up to 50%.', r: (u) => {
    const k = eo(sg(u, 0.2, 0.75));
    return (
      <g><Building lit={(i) => (i === 4 || i === 6 ? 1 : 0)} people={[4, 6]} />
        <g transform="translate(680 120)"><circle r="34" fill="none" stroke={C.cob} strokeWidth="4" strokeDasharray="30 12" transform={`rotate(${u * 360})`} /><T x="0" y="7" s="20" c={C.cob}>AI</T></g>
        <Bar x={220} y={385} w={300} p={lerp(0.88, 0.5, k)} label="Energy use" val={`−${Math.round(lerp(12, 50, k))}%`} c={C.ver} />
      </g>);
  } },
];

const SALAH = [
  { cap: 'Egypt receives up to 3,200 kWh of sunshine per square metre every year, among the best in the world.', r: (u) => (
    <g><Sun x={200} y={140} r={50} u={u} /><Ground y={380} />
      <path d="M0 380 q200 -40 400 0 t400 0 V380Z" fill={C.sand} stroke={C.ink} strokeWidth="2" />
      <rect x="520" y="90" width="40" height="260" fill="none" stroke={C.ink} /><rect x="520" y={350 - 260 * eo(sg(u, 0.1, 0.7))} width="40" height={260 * eo(sg(u, 0.1, 0.7))} fill={C.ver} />
      <Big x={660} y={200} v={f1(3200 * eo(sg(u, 0.1, 0.7)))} c={C.ver} s={44} /><Cap x={660} y={230}>kWh/m² per year</Cap>
    </g>) },
  { cap: 'Large solar parks like Benban (planned 1.8 GW) turn that sunshine into grid power.', r: (u) => (
    <g><Sun x={110} y={80} u={u} /><Ground y={380} />
      {Array.from({ length: 40 }, (_, i) => {
        const c = i % 10, r = Math.floor(i / 10), p = eo(sg(u, (i / 40) * 0.6, (i / 40) * 0.6 + 0.15));
        return <Panel key={i} x={180 + c * 52} y={190 + r * 40} w={44} h={30} skew={-12} o={p} />;
      })}
      <Big x={400} y={150} v={`${f1(1.8 * eo(sg(u, 0.1, 0.7)), 1)} GW`} /><Cap x={400} y={415}>Benban solar park, planned</Cap>
    </g>) },
  { cap: 'The national target: 42% of electricity from renewables by 2035.', r: (u) => {
    const k = eo(sg(u, 0.15, 0.8));
    return (
      <g><T x="100" y="170" s="16" a="start" c={C.mut} w={500}>2022</T><T x="700" y="170" s="16" a="end" c={C.mut} w={500}>2035</T>
        <Bar x={100} y={190} w={600} h={34} p={0.42 * k} c={C.cob} />
        <line x1={100 + 600 * 0.42} x2={100 + 600 * 0.42} y1="176" y2="238" stroke={C.ver} strokeWidth="3" />
        <Big x={400} y={320} v={`${Math.round(42 * k)}%`} s={80} /><Cap x={400} y={352}>of electricity from renewables</Cap>
      </g>);
  } },
  { cap: 'To get there, three gaps must close: policy, finance and local manufacturing.', r: (u) => (
    <g><Ground y={380} />
      <rect x="40" y="250" width="110" height="130" fill={C.sand} stroke={C.ink} strokeWidth="2" /><rect x="650" y="250" width="110" height="130" fill={C.sand} stroke={C.ink} strokeWidth="2" />
      {[['Policy', 250], ['Finance', 400], ['Local making', 550]].map(([t, x], i) => {
        const h = 130 * eo(sg(u, 0.1 + i * 0.18, 0.3 + i * 0.18));
        return <g key={t}><rect x={x - 28} y={380 - h} width="56" height={h} fill={C.cob} /><T x={x} y={405} s={13} c={C.mut} w={500} o={sg(u, 0.3 + i * 0.18, 0.5 + i * 0.18)}>{t}</T></g>;
      })}
      <line x1="150" x2={lerp(150, 650, eio(sg(u, 0.65, 0.95)))} y1="250" y2="250" stroke={C.ver} strokeWidth="8" />
      <T x="400" y="215" s="20" o={sg(u, 0.85, 1)}>SDG 7 by 2035</T>
    </g>) },
];

const ELSHAMY = [
  { cap: 'In Egyptian buildings, cooling takes about 61–66% of all electricity used.', r: (u) => {
    const k = eo(sg(u, 0.1, 0.7)), L = 2 * Math.PI * 100;
    return (
      <g><g transform="translate(260 215) rotate(-90)">
        <circle r="100" fill="none" stroke={C.ink} strokeWidth="34" opacity=".15" />
        <circle r="100" fill="none" stroke={C.ver} strokeWidth="34" strokeDasharray={`${L * 0.63 * k} ${L}`} />
      </g>
        <Big x={560} y={210} v={`${Math.round(63 * k)}%`} c={C.ver} s={80} /><Cap x={560} y={242}>of building power goes to cooling</Cap>
      </g>);
  } },
  { cap: 'Solar-thermal cooling: roof collectors heat water, a chiller turns that heat into cold air. About 100 m² gives roughly 35 kW of cooling.', r: (u) => (
    <g><Sun x={110} y={80} u={u} /><Ground y={390} />
      <rect x="360" y="190" width="300" height="200" fill="none" stroke={C.ink} strokeWidth="3" />
      {[0, 1, 2, 3].map((i) => <Panel key={i} x={376 + i * 70} y={160} w={60} h={26} c={C.ver} o={eo(sg(u, i * 0.07, i * 0.07 + 0.12))} />)}
      <Flow d="M410 186 V260 H500" u={u} c={C.ver} />
      <rect x="500" y="235" width="70" height="50" fill={C.cob} /><T x="535" y="266" s="14" c={C.cream}>chiller</T>
      {[0, 1, 2].map((i) => { const p = fr(u * 1.4 + i * 0.33); return <path key={i} d={`M${580 + p * 50} 245 q8 15 0 30`} stroke={C.cob} strokeWidth="3" fill="none" opacity={1 - p} />; })}
      <Big x={160} y={300} v={`${f1(35 * eo(sg(u, 0.4, 0.85)))} kW`} s={44} c={C.cob} /><Cap x={160} y={328}>from 100 m² of collectors</Cap>
    </g>) },
  { cap: 'Small wind turbines on rooftops can add clean power where the wind allows.', r: (u) => (
    <g><Ground y={390} /><rect x="260" y="270" width="280" height="120" fill="none" stroke={C.ink} strokeWidth="3" />
      <line x1="400" x2="400" y1="270" y2="150" stroke={C.ink} strokeWidth="6" />
      <g transform={`translate(400 150) rotate(${u * 720})`}>{[0, 120, 240].map((a) => <path key={a} d="M0 0 L-6 -80 L6 -80Z" fill={C.cob} transform={`rotate(${a})`} />)}<circle r="8" fill={C.ink} /></g>
      <Flow d="M400 270 V310" u={u} c={C.cob} />
      <Home x={384} y={322} s={1.2} on={1} c={C.ver} />
      {[0, 1, 2].map((i) => <path key={i} d={`M${80 + fr(u + i * 0.33) * 100} ${120 + i * 28} h60`} stroke={C.dim} strokeWidth="4" strokeLinecap="round" />)}
    </g>) },
  { cap: 'The main barrier: building codes for energy are voluntary. Making them mandatory would open the gate.', r: (u) => {
    const k = eio(sg(u, 0.45, 0.7));
    return (
      <g><Ground y={380} />
        <rect x="340" y="200" width="120" height="180" fill="none" stroke={C.ink} strokeWidth="4" />
        <g transform={`translate(340 330) rotate(${-k * 80})`}><rect x="0" y="-8" width="120" height="16" fill={k > 0.5 ? C.cob : C.ver} /></g>
        <rect x="280" y="130" width="240" height="50" fill={k > 0.5 ? C.cob : C.ver} /><T x="400" y="164" s="24" c={C.cream}>{k > 0.5 ? 'MANDATORY CODE' : 'VOLUNTARY CODE'}</T>
        <Village x={560} y={330} cols={3} rows={1} gap={46} on={() => (k > 0.9 ? 1 : 0)} pop={k} />
        <Panel x={130} y={150} w={80} h={40} o={k} />
      </g>);
  } },
];

const HOSSAIN = [
  { cap: 'Buildings use about 40% of the world’s energy, so saving there matters for SDG 7.', r: (u) => {
    const k = eo(sg(u, 0.1, 0.7)), L = 2 * Math.PI * 100;
    return (
      <g><g transform="translate(260 215) rotate(-90)"><circle r="100" fill={C.ink} opacity=".12" /><circle r="50" fill="none" stroke={C.cob} strokeWidth="100" strokeDasharray={`${2 * Math.PI * 50 * 0.4 * k} ${2 * Math.PI * 50}`} /></g>
        <Big x={560} y={210} v={`${Math.round(40 * k)}%`} s={90} /><Cap x={560} y={242}>of global energy goes to buildings</Cap></g>);
  } },
  { cap: 'Forecasting: learn the daily pattern of use, then predict the next hours.', r: (u) => {
    const pts = (f) => Array.from({ length: 49 }, (_, i) => { const h = i / 2; return [100 + (h / 24) * 600, 340 - f(h) * 120]; });
    const path = (p) => p.map((q, i) => (i ? 'L' : 'M') + q[0].toFixed(1) + ' ' + q[1].toFixed(1)).join('');
    const load = (h) => 0.5 + 1.1 * Math.exp(-(((h - 15) / 4.2) ** 2)) + 0.45 * Math.exp(-(((h - 22) / 2.6) ** 2));
    const pred = (h) => load(h - 0.8) * 0.97;
    return (
      <g><line x1="100" x2="700" y1="340" y2="340" stroke={C.ink} /><T x="100" y="365" s="13" c={C.mut} a="start" w={500}>0h</T><T x="700" y="365" s="13" c={C.mut} a="end" w={500}>24h</T>
        <path d={path(pts(load))} fill="none" stroke={C.cob} strokeWidth="4" pathLength="1" strokeDasharray="1" strokeDashoffset={1 - eo(sg(u, 0.05, 0.6))} />
        <path d={path(pts(pred))} fill="none" stroke={C.ver} strokeWidth="3" strokeDasharray="6 6" opacity={sg(u, 0.5, 0.7)} />
        <T x="110" y="120" s="16" a="start" c={C.cob}>— actual use</T><T x="110" y="146" s="16" a="start" c={C.ver} o={sg(u, 0.5, 0.7)}>- - forecast</T></g>);
  } },
  { cap: 'A smart thermostat adjusts heating and cooling to the room: about 26% HVAC saving.', r: (u) => {
    const k = eo(sg(u, 0.25, 0.75));
    const load = (h) => 0.5 + 1.1 * Math.exp(-(((h - 15) / 4.2) ** 2)) + 0.45 * Math.exp(-(((h - 22) / 2.6) ** 2));
    const P = (s) => Array.from({ length: 25 }, (_, h) => (h ? 'L' : 'M') + (330 + (h / 24) * 400) + ' ' + (330 - load(h) * s * 105)).join('');
    return (
      <g><g transform="translate(160 200)"><circle r="76" fill="none" stroke={C.ink} strokeWidth="5" /><line x1="0" y1="0" x2="0" y2="-56" stroke={C.ver} strokeWidth="5" strokeLinecap="round" transform={`rotate(${lerp(40, -50, k)})`} /><circle r="7" fill={C.ink} /><T x="0" y="110" s="16">smart thermostat</T></g>
        <line x1="330" x2="730" y1="330" y2="330" stroke={C.ink} />
        <path d={P(1)} fill="none" stroke={C.ink} strokeWidth="2" strokeDasharray="5 5" />
        <path d={P(lerp(1, 0.74, k)) + 'L730 330L330 330Z'} fill={C.cob} opacity=".8" />
        <Big x={530} y={100} v={`−${Math.round(26 * k)}%`} s={56} /><Cap x={530} y={128}>HVAC energy</Cap></g>);
  } },
  { cap: 'Reinforcement-learning control learns by trial and error which action cuts cost most: more than 50% in some studies.', r: (u) => {
    const nodes = [[200, 150, 'Agent'], [540, 150, 'Action'], [540, 300, 'Building'], [200, 300, 'Reward']];
    const loop = [[200, 150], [540, 150], [540, 300], [200, 300], [200, 150]];
    const a = loop[Math.floor(fr(u * 2) * 4)], b = loop[Math.floor(fr(u * 2) * 4) + 1], q = fr(fr(u * 2) * 4);
    return (
      <g>{nodes.map(([x, y, l]) => <g key={l}><rect x={x - 55} y={y - 24} width="110" height="48" fill="none" stroke={C.ink} strokeWidth="2" /><T x={x} y={y + 7} s="18">{l}</T></g>)}
        <path d="M255 150 H485 M540 174 V276 M485 300 H255 M200 276 V174" fill="none" stroke={C.dim} strokeWidth="3" />
        <circle cx={lerp(a[0], b[0], q)} cy={lerp(a[1], b[1], q)} r="9" fill={C.ver} />
        <Bar x={300} y={375} w={200} p={lerp(1, 0.5, eo(sg(u, 0.2, 0.8)))} c={C.cob} label="Energy cost" val={u > 0.8 ? '50%+ cut' : `−${Math.round(50 * eo(sg(u, 0.2, 0.8)))}%`} />
      </g>);
  } },
];

const CAVALCANTI = [
  { cap: 'A systematic review: 47 studies on IoT for energy management in buildings.', r: (u) => (
    <g>{Array.from({ length: 47 }, (_, i) => {
      const c = i % 10, r = Math.floor(i / 10), p = eo(sg(u, (i / 47) * 0.55, (i / 47) * 0.55 + 0.18));
      return <rect key={i} x={230 + c * 34} y={110 + r * 44 - (1 - p) * 40} width="26" height="34" fill={C.cob} opacity={p} />;
    })}
      <Big x={400} y={380} v={`${Math.round(47 * eo(sg(u, 0, 0.65)))} studies`} s={48} /></g>) },
  { cap: 'Most of them focus on homes: 44.7% of the studies, with lighting and cooling the main targets.', r: (u) => (
    <g><Bar x={120} y={160} w={560} h={46} p={0.447 * eo(sg(u, 0.1, 0.6))} label="Homes" val="" c={C.ver} />
      <Bar x={120} y={260} w={560} h={46} p={0.553 * eo(sg(u, 0.25, 0.7))} label="Universities, offices and other buildings" val="" />
      <Big x={400} y={400} v={`${f1(44.7 * eo(sg(u, 0.1, 0.6)), 1)}%`} c={C.ver} s={50} /></g>) },
  { cap: 'The IoT loop: sensors measure, a small controller decides, the cloud logs it, and devices act.', r: (u) => {
    const xs = [100, 290, 480, 670], labels = ['Sensor', 'Controller', 'Cloud', 'Lamp / A/C'];
    const pos = fr(u * 1.6) * 3, i = Math.floor(pos), q = pos - i;
    return (
      <g>{xs.map((x, k) => <g key={k}><rect x={x - 58} y="170" width="116" height="70" fill={k === 1 ? C.cob : 'none'} stroke={C.ink} strokeWidth="2" /><T x={x} y="212" s="17" c={k === 1 ? C.cream : C.ink}>{labels[k]}</T></g>)}
        <path d="M158 205 H232 M348 205 H422 M538 205 H612" stroke={C.dim} strokeWidth="4" />
        <circle cx={lerp(xs[i] + 58, xs[i + 1] - 58, q)} cy="205" r="9" fill={C.ver} />
        <Cap x={400} y={300}>temperature · light · presence → decision → action</Cap></g>);
  } },
  { cap: 'Research is uneven: only 3 of the 47 studies come from Africa.', r: (u) => (
    <g>{Array.from({ length: 47 }, (_, i) => {
      const af = i < 3, p = eo(sg(u, 0.05 + (i / 47) * 0.4, 0.3 + (i / 47) * 0.4));
      const tx = af ? 520 + i * 36 : 80 + ((i - 3) % 11) * 36, ty = af ? 330 : 120 + Math.floor((i - 3) / 11) * 40;
      return <circle key={i} cx={lerp(400, tx, p)} cy={lerp(40, ty, p)} r="12" fill={af ? C.ver : C.cob} />;
    })}
      <T x="580" y="372" s="18" c={C.ver} o={sg(u, 0.6, 0.8)}>Africa: 3 studies</T></g>) },
];

const NGKAYLUP = [
  { cap: 'About 600 million people in Africa still have no electricity, so demand keeps outpacing supply.', r: (u) => (
    <g>{Array.from({ length: 60 }, (_, i) => {
      const c = i % 12, r = Math.floor(i / 12), p = eo(sg(u, (i / 60) * 0.5, (i / 60) * 0.5 + 0.2));
      return <g key={i} opacity={p} transform={`translate(${190 + c * 36} ${110 + r * 36})`}><circle cy="-6" r="6" fill={C.ink} /><path d="M-8 12 q8 -22 16 0z" fill={C.ink} /></g>;
    })}
      <Big x={400} y={370} v={`${Math.round(600 * eo(sg(u, 0, 0.6)))} million`} c={C.ver} s={50} /></g>) },
  { cap: 'A solar microgrid with battery storage can power a village that the grid does not reach, day and night.', r: (u) => {
    const night = sg(u, 0.5, 0.65), ang = Math.PI * cl(u / 0.55);
    return (
      <g><rect x="0" y="0" width="800" height="380" fill={C.ink} opacity={0.8 * night} /><Ground y={380} />
        {night < 0.5 ? <Sun x={400 - Math.cos(ang) * 300} y={300 - Math.sin(ang) * 230} u={u} /> : <circle cx="700" cy="70" r="22" fill={C.cream} />}
        <Panel x={90} y={320} w={80} h={40} /><Flow d="M170 340 H300" u={u} speed={night < 0.5 ? 160 : 0} />
        <rect x="300" y="322" width="64" height="38" fill="none" stroke={night > 0.5 ? C.cream : C.ink} strokeWidth="3" /><rect x="304" y="326" width={56 * (night < 0.5 ? 0.2 + 0.8 * u / 0.5 : 1 - 0.5 * sg(u, 0.7, 1))} height="30" fill={C.cob} />
        <Flow d="M364 340 H440" u={u} c={C.cream} speed={night > 0.5 ? 160 : 0} />
        <Village x={440} y={324} cols={5} rows={1} gap={50} on={() => 1} />
        <Cap x={400} y={425}>{night < 0.5 ? 'Day: panels power homes and charge the battery' : 'Night: the battery keeps lights on'}</Cap>
      </g>);
  } },
  { cap: 'Efficiency is improving too slowly: energy intensity gained only 1.2% in 2018, below what the goal needs.', r: (u) => {
    const k = eo(sg(u, 0.15, 0.7)), ang = (v) => Math.PI - (v / 4) * Math.PI;
    const pt = (v, r) => [400 + Math.cos(ang(v)) * r, 300 - Math.sin(ang(v)) * r];
    const need = pt(2.6, 130), cur = pt(1.2 * k, 118);
    return (
      <g><path d="M240 300 A160 160 0 0 1 560 300" fill="none" stroke={C.dim} strokeWidth="26" />
        <path d={`M240 300 A160 160 0 0 1 ${pt(1.2 * k, 160)[0]} ${pt(1.2 * k, 160)[1]}`} fill="none" stroke={C.ver} strokeWidth="26" />
        <line x1={pt(2.6, 140)[0]} y1={pt(2.6, 140)[1]} x2={pt(2.6, 182)[0]} y2={pt(2.6, 182)[1]} stroke={C.cob} strokeWidth="5" />
        <T x={need[0] + 34} y={need[1] - 52} s="14" c={C.cob} a="start">needed</T>
        <line x1="400" y1="300" x2={cur[0]} y2={cur[1]} stroke={C.ink} strokeWidth="5" strokeLinecap="round" /><circle cx="400" cy="300" r="9" fill={C.ink} />
        <Big x={400} y={370} v={`${f1(1.2 * k, 1)}%`} c={C.ver} s={50} /><Cap x={400} y={398}>yearly energy-intensity gain, 2018</Cap></g>);
  } },
  { cap: 'Power-to-X stores surplus renewable electricity as hydrogen or fuels, then turns it back into power.', r: (u) => {
    const nodes = [[110, 'Sun / wind'], [290, 'Electrolyser'], [470, 'H₂ store'], [650, 'Fuel cell']];
    const pos = fr(u * 1.5) * 3, i = Math.floor(pos), q = pos - i;
    return (
      <g>{nodes.map(([x, l], k) => <g key={l}><rect x={x - 60} y="170" width="120" height="70" fill={k === 2 ? C.cob : 'none'} stroke={C.ink} strokeWidth="2" /><T x={x} y="212" s="16" c={k === 2 ? C.cream : C.ink}>{l}</T></g>)}
        <path d="M170 205 H230 M350 205 H410 M530 205 H590" stroke={C.dim} strokeWidth="4" />
        <circle cx={lerp(nodes[i][0] + 60, nodes[i + 1][0] - 60, q)} cy="205" r="9" fill={C.ver} />
        <Home x={724} y={190} s={1.4} on={1} c={C.ver} />
        <Cap x={400} y={310}>surplus electricity → hydrogen → stored → power on demand</Cap></g>);
  } },
];

const ALY = [
  { cap: 'Egypt is warming: about 0.38 °C per decade between 2000 and 2020, which raises cooling demand.', r: (u) => {
    const k = eo(sg(u, 0.1, 0.7));
    return (
      <g><rect x="230" y="60" width="40" height="260" rx="20" fill="none" stroke={C.ink} strokeWidth="4" /><circle cx="250" cy="330" r="34" fill={C.ver} />
        <rect x="241" y={310 - 220 * k - 10} width="18" height={220 * k + 20} fill={C.ver} />
        <Big x={540} y={190} v={`+${f1(0.38 * k, 2)} °C`} c={C.ver} s={70} /><Cap x={540} y={222}>per decade, 2000–2020</Cap></g>);
  } },
  { cap: 'In one residential study, better wall insulation, shading, double glazing and LED lighting cut cooling demand by 7%, 13%, 14% and 17%.', r: (u) => {
    const cuts = [[0.07, 'Walls'], [0.13, 'Shading'], [0.14, 'Glazing'], [0.17, 'LED']];
    let rem = 1; cuts.forEach(([c], i) => { rem *= 1 - c * eo(sg(u, 0.1 + i * 0.2, 0.25 + i * 0.2)); });
    return (
      <g><Cards u={u} y={130} w={140} gap={14} step={0.2} from={0.1} items={cuts.map(([c, l]) => [l, `−${Math.round(c * 100)}%`])} />
        <Bar x={150} y={320} w={500} h={30} p={rem} c={C.ver} label="Cooling demand (baseline 100)" val="" /><Big x={400} y={410} v={f1(rem * 100)} s={44} /></g>);
  } },
  { cap: 'The review covered 124 studies, but only 22% of local ones included a cost analysis.', r: (u) => (
    <g>{Array.from({ length: 120 }, (_, i) => {
      const c = i % 15, r = Math.floor(i / 15), p = eo(sg(u, (i / 120) * 0.5, (i / 120) * 0.5 + 0.15)), hi = i < 26 && u > 0.7;
      return <rect key={i} x={170 + c * 32} y={80 + r * 32} width="24" height="24" fill={hi ? C.ver : C.cob} opacity={p} />;
    })}
      <Big x={400} y={395} v={u > 0.7 ? '22% with cost analysis' : `${Math.round(124 * eo(sg(u, 0, 0.55)))} studies`} s={36} c={u > 0.7 ? C.ver : C.cob} /></g>) },
  { cap: 'Egypt’s Green Pyramid rating lacks a prescriptive energy path backed by simulation. That is the missing step.', r: (u) => {
    const k = eio(sg(u, 0.4, 0.7));
    return (
      <g><Ground y={380} />
        {[['Design', 0], ['Rating', 1], ['', 2], ['Energy-efficient building', 3]].map(([t, i]) => i === 2
          ? <g key={i} transform={`translate(${160 + i * 130} ${lerp(40, 0, k)})`} opacity={k}><rect x="0" y={380 - 60 - i * 55} width="130" height={60 + i * 55} fill={C.ver} /><T x="65" y={380 - 20 - i * 55 + 12} s="14" c={C.cream}>Prescriptive path</T></g>
          : <g key={i}><rect x={160 + i * 130} y={380 - 60 - i * 55} width="130" height={60 + i * 55} fill={C.cob} /><T x={160 + i * 130 + 65} y={380 - 20 - i * 55 + 12} s="15" c={C.cream}>{t.length > 12 ? 'Target' : t}</T></g>)}
      </g>);
  } },
];

const JORGENSEN = [
  { cap: 'Buildings cause about 34% of energy-related CO₂ emissions.', r: (u) => {
    const k = eo(sg(u, 0.1, 0.7));
    return (
      <g><Ground y={380} /><rect x="160" y="190" width="200" height="190" fill={C.ink} /><path d="M140 190 L260 120 L380 190Z" fill={C.ink} />
        {[0, 1, 2, 3, 4, 5].map((i) => { const p = fr(u * 1.2 + i * 0.17); return <g key={i} opacity={(1 - p) * sg(u, 0.1, 0.3)} transform={`translate(${200 + (i % 3) * 40} ${110 - p * 90})`}><circle r="18" fill={C.ver} /><T x="0" y="5" s="12" c={C.cream}>CO₂</T></g>; })}
        <Big x={570} y={230} v={`${Math.round(34 * k)}%`} c={C.ver} s={90} /><Cap x={570} y={262}>of energy-related CO₂</Cap></g>);
  } },
  { cap: 'Step 1, cut demand first: insulation and airtight design keep the heat in.', r: (u) => {
    const k = eo(sg(u, 0.25, 0.6));
    return (
      <g><Ground y={380} /><rect x="260" y="200" width="280" height="180" fill={C.cream} stroke={C.ink} strokeWidth="3" /><path d="M240 200 L400 110 L560 200Z" fill={C.ink} />
        <rect x="260" y="200" width="280" height="180" fill="none" stroke={C.cob} strokeWidth={22 * k} opacity=".85" />
        {[0, 1, 2].map((i) => { const p = fr(u * 1.3 + i * 0.3); return <g key={i} opacity={(1 - p) * (1 - 0.8 * k)}><path d={`M${210 - p * 40} ${240 + i * 45} h-20 m8 -8 l-8 8 l8 8`} stroke={C.ver} strokeWidth="4" fill="none" /><path d={`M${590 + p * 40} ${240 + i * 45} h20 m-8 -8 l8 8 l-8 8`} stroke={C.ver} strokeWidth="4" fill="none" /></g>; })}
        <T x="400" y="418" s="16" c={C.mut} w={500}>heat loss shrinks</T></g>);
  } },
  { cap: 'Step 2, electrify heating: a heat pump delivers 3–4 units of heat for every unit of electricity.', r: (u) => (
    <g><rect x="320" y="150" width="160" height="130" fill={C.cob} /><T x="400" y="222" s="22" c={C.cream}>Heat pump</T>
      <g opacity={sg(u, 0.05, 0.2)}><path d="M120 215 H310" stroke={C.cob} strokeWidth="8" /><T x="200" y="190" s="16" c={C.cob}>1 unit electricity</T></g>
      {[0, 1, 2, 3].map((i) => { const on = eo(sg(u, 0.25 + i * 0.1, 0.4 + i * 0.1)); return <g key={i} opacity={on}><path d={`M490 ${170 + i * 24} H${490 + 180 * on}`} stroke={C.ver} strokeWidth="9" /></g>; })}
      <Big x={600} y={330} v={`${f1(3 + eo(sg(u, 0.25, 0.7)), 1)}×`} c={C.ver} s={60} /><Cap x={600} y={360}>heat per unit of electricity</Cap></g>) },
  { cap: 'Step 3, add rooftop solar. The challenge: only about 1% of buildings are renovated each year.', r: (u) => (
    <g><Ground y={380} /><rect x="160" y="230" width="240" height="150" fill={C.cream} stroke={C.ink} strokeWidth="3" /><path d="M140 230 L280 150 L420 230Z" fill={C.ink} />
      {[0, 1, 2].map((i) => <Panel key={i} x={196 + i * 54} y={170 - i * 0 + 18} w={46} h={22} skew={-25} o={eo(sg(u, 0.1 + i * 0.12, 0.25 + i * 0.12))} />)}
      <Bar x={500} y={170} w={220} p={lerp(1, 0.08, eo(sg(u, 0.3, 0.85)))} c={C.ver} label="CO₂ from the building" val="" />
      <Bar x={500} y={280} w={220} p={0.01 + 0.01 * u * 8} c={C.cob} label="Buildings renovated per year" val="1%" /></g>) },
];

const RASLAN = [
  { cap: 'Case study: Sakan Masr housing in New Cairo, a six-storey block with four apartments per floor.', r: (u) => (
    <g><Ground y={390} /><Sun x={110} y={90} u={u} />
      <rect x="300" y="110" width="220" height="280" fill={C.cream} stroke={C.ink} strokeWidth="3" />
      {Array.from({ length: 24 }, (_, i) => { const c = i % 4, r = Math.floor(i / 4), p = eo(sg(u, (i / 24) * 0.6, (i / 24) * 0.6 + 0.15)); return <rect key={i} x={316 + c * 50} y={124 + r * 44} width="34" height="28" fill={C.cob} opacity={p} />; })}
      <Big x={650} y={230} v="24" c={C.cob} s={70} /><Cap x={650} y={260}>apartments, 2,462 m² gross</Cap></g>) },
  { cap: 'South-facing layout: tilted rows must leave gaps so they do not shade each other, so fewer panels fit.', r: (u) => {
    const ang = Math.PI * (0.15 + 0.7 * u);
    const rows = [0, 1, 2, 3];
    return (
      <g><Ground y={390} /><Sun x={400 - Math.cos(ang) * 280} y={330 - Math.sin(ang) * 260} u={u} r={22} />
        {rows.map((i) => <g key={i}><path d={`M${150 + i * 130} 380 L${230 + i * 130} 330`} stroke={C.cob} strokeWidth="14" /><path d={`M${230 + i * 130} 336 l60 40 H${230 + i * 130}Z`} fill={C.ink} opacity=".12" /></g>)}
        <Big x={400} y={440} v={`${Math.round(57 * eo(sg(u, 0.1, 0.8)))} panels`} s={30} /></g>);
  } },
  { cap: 'East–west layout: panels face both sides in tight pairs, so about 50% more panels fit on the same roof.', r: (u) => {
    const pairs = [0, 1, 2, 3, 4, 5];
    return (
      <g><Ground y={390} /><Sun x={150} y={90} u={u} r={22} />
        {pairs.map((i) => <g key={i} opacity={eo(sg(u, i * 0.08, i * 0.08 + 0.15))}><path d={`M${120 + i * 100} 380 L${160 + i * 100} 345 L${200 + i * 100} 380`} fill="none" stroke={C.ver} strokeWidth="14" strokeLinejoin="round" /></g>)}
        <Big x={400} y={440} v={`${Math.round(94 * eo(sg(u, 0.1, 0.8)))} panels`} s={30} c={C.ver} /></g>);
  } },
  { cap: 'Result: east–west produces over 14% more electricity, and cuts the project’s annual bill from about 193 to 112 million EGP.', r: (u) => {
    const k = eo(sg(u, 0.1, 0.75));
    return (
      <g><Bar x={110} y={120} w={440} h={34} p={k * (100 / 120)} c={C.cob} label="Output, south-facing = 100" val="100" />
        <Bar x={110} y={200} w={440} h={34} p={k * (114 / 120)} c={C.ver} label="Output, east–west" val={String(Math.round(114 * k))} />
        <Bar x={110} y={310} w={440} h={34} p={1 - (1 - 144 / 193) * k} c={C.cob} label="Yearly electricity bill, with south PV (million EGP)" val={String(Math.round(lerp(193, 144, k)))} />
        <Bar x={110} y={390} w={440} h={34} p={1 - (1 - 112 / 193) * k} c={C.ver} label="Yearly electricity bill, with east–west PV" val={String(Math.round(lerp(193, 112, k)))} /></g>);
  } },
];

export const ANIM = { feron: FERON, yaici: YAICI, salah: SALAH, elshamy: ELSHAMY, hossain: HOSSAIN, cavalcanti: CAVALCANTI, nglup: NGKAYLUP, aly: ALY, jorgensen: JORGENSEN, raslan: RASLAN };

/* ---------- player ---------- */
export default function Player({ id }) {
  const scenes = ANIM[id];
  const total = scenes.length * DUR;
  const [t, setT] = useState(RM ? DUR * 0.9 : 0);
  const [play, setPlay] = useState(!RM);
  const last = useRef(0);
  useEffect(() => {
    if (!play) return undefined;
    let raf;
    last.current = performance.now();
    const f = (n) => { const dt = Math.min(0.1, (n - last.current) / 1000); last.current = n; setT((x) => (x + dt) % total); raf = requestAnimationFrame(f); };
    raf = requestAnimationFrame(f);
    return () => cancelAnimationFrame(raf);
  }, [play, total]);
  const i = Math.min(scenes.length - 1, Math.floor(t / DUR));
  const u = cl((t - i * DUR) / DUR);
  const go = (k) => { setT(k * DUR); };
  return (
    <div className="an">
      <div className="an-stage">
        <svg viewBox="0 0 800 450" role="img" aria-label={scenes[i].cap}>
          <rect width="800" height="450" fill="#F8F5EF" />
          <g key={i}>{scenes[i].r(u)}</g>
        </svg>
        <span className="an-tag lbl">{String(i + 1).padStart(2, '0')} / {String(scenes.length).padStart(2, '0')}</span>
      </div>
      <p className="an-cap" key={'c' + i}>{scenes[i].cap}</p>
      <div className="an-ctl">
        <button type="button" className="an-pp" onClick={() => setPlay((p) => !p)} aria-label={play ? 'Pause' : 'Play'}>{play ? '❚❚' : '▶'}</button>
        <input type="range" min="0" max={total} step="0.01" value={t} aria-label="Timeline" onChange={(e) => { setT(+e.target.value); }} />
        <div className="an-chips">{scenes.map((_, k) => <button type="button" key={k} className={k === i ? 'on' : ''} onClick={() => go(k)} aria-label={`Scene ${k + 1}`}>{k + 1}</button>)}</div>
      </div>
    </div>
  );
}
