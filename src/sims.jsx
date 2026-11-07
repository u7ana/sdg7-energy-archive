import { useState } from 'react';

/* One small interactive model per paper. The models are illustrative: they reuse figures
   reported in each paper where possible, and label every extra assumption. */

/* ---------- shared bits ---------- */
const fmt = (n, d = 0) => Number(n).toLocaleString('en-US', { maximumFractionDigits: d, minimumFractionDigits: d });

function Slider({ label, value, min, max, step = 1, unit = '', onChange, show }) {
  return (
    <label className="sm-row">
      <span className="sm-lab"><span>{label}</span><b>{show ? show(value) : fmt(value)}{unit}</b></span>
      <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(+e.target.value)} />
    </label>
  );
}
function Toggle({ label, on, onChange, hint }) {
  return (
    <button type="button" className={'sm-tog' + (on ? ' on' : '')} aria-pressed={on} onClick={() => onChange(!on)}>
      <i /><span>{label}{hint && <em>{hint}</em>}</span>
    </button>
  );
}
function Seg({ options, value, onChange }) {
  return (
    <div className="sm-seg" role="group">
      {options.map(([v, l]) => (
        <button type="button" key={v} className={v === value ? 'on' : ''} aria-pressed={v === value} onClick={() => onChange(v)}>{l}</button>
      ))}
    </div>
  );
}
function Out({ items }) {
  return (
    <div className="sm-out">
      {items.map(([v, l, hot]) => <div key={l} className={hot ? 'hot' : ''}><b>{v}</b><span>{l}</span></div>)}
    </div>
  );
}
function Meter({ pct, label, tone }) {
  return (
    <div className="sm-meter" role="img" aria-label={`${label}: ${Math.round(pct)}%`}>
      <div className="bar"><div className={'fill ' + (tone || '')} style={{ width: Math.max(0, Math.min(100, pct)) + '%' }} /></div>
      <span>{label}</span>
    </div>
  );
}
const Note = ({ children }) => <p className="sm-note">{children}</p>;

/* 24-hour chart. series: [{v:[24 numbers], kind:'fill'|'line'|'dash', c:color}] */
function Chart({ series, max, unit = 'kW', h = 150 }) {
  const W = 480, L = 30, B = 20, T = 8, w = W - L - 8, hh = h - B - T;
  const x = (i) => L + (i / 23) * w, y = (v) => T + hh - (Math.min(v, max) / max) * hh;
  const line = (v) => v.map((d, i) => (i ? 'L' : 'M') + x(i).toFixed(1) + ' ' + y(d).toFixed(1)).join('');
  return (
    <svg className="sm-chart" viewBox={`0 0 ${W} ${h}`} role="img" aria-label="24 hour chart">
      {[0, 0.5, 1].map((t) => (
        <g key={t}><line x1={L} x2={W - 8} y1={y(max * t)} y2={y(max * t)} stroke="rgba(20,20,20,.14)" /><text x={L - 5} y={y(max * t) + 3} textAnchor="end">{fmt(max * t, max < 5 ? 1 : 0)}</text></g>
      ))}
      {[0, 6, 12, 18, 23].map((t) => <text key={t} x={x(t)} y={h - 5} textAnchor="middle">{t}h</text>)}
      {series.map((s, k) => s.kind === 'fill'
        ? <path key={k} d={line(s.v) + `L${x(23)} ${y(0)}L${x(0)} ${y(0)}Z`} fill={s.c} opacity={s.o || 0.85} />
        : <path key={k} d={line(s.v)} fill="none" stroke={s.c} strokeWidth="1.6" strokeDasharray={s.kind === 'dash' ? '4 3' : undefined} />)}
      <text x={W - 8} y={T + 8} textAnchor="end" className="u">{unit}</text>
    </svg>
  );
}
const hours = Array.from({ length: 24 }, (_, i) => i);
const bell = (h, c, w) => Math.exp(-(((h - c) / w) ** 2));
const sun = (h) => (h < 6 || h > 18 ? 0 : Math.sin((Math.PI * (h - 6)) / 12) ** 1.4);

/* ---------- 1. Feron: off-grid solar home systems ---------- */
function SimFeron() {
  const [yr, setYr] = useState(6);
  const [sup, setSup] = useState(0);
  const lam = [0.13, 0.07, 0.03][sup];
  const alive = Math.exp(-lam * yr);
  const lit = Math.round(alive * 100);
  return (
    <>
      <p className="sm-ask">A village gets 100 solar home systems. How many still work after a few years?</p>
      <svg className="sm-vil" viewBox="0 0 200 200" role="img" aria-label={`${lit} of 100 homes lit`}>
        {Array.from({ length: 100 }, (_, i) => {
          const r = Math.floor(i / 10), c = i % 10, on = i < lit;
          return <g key={i} transform={`translate(${c * 20 + 2},${r * 20 + 3})`}>
            <path d="M1 8 L8 1 L15 8 V16 H1Z" fill={on ? '#D9432A' : 'rgba(20,20,20,.12)'} />
            {on && <circle cx="8" cy="11" r="2" fill="#F1E7D0" />}
          </g>;
        })}
      </svg>
      <Slider label="Years since installation" value={yr} min={0} max={10} unit=" yr" onChange={setYr} />
      <Seg value={sup} onChange={setSup} options={[[0, 'Nothing after sale'], [1, 'Training + fair price'], [2, '+ repair & recycling']]} />
      <Out items={[[lit + '', 'homes still lit', true], [100 - lit + '', 'systems failed']]} />
      <Note>Illustrative decay model. The paper reports 45% of systems not working in Guatemala and 65% in Laos, where support was weak.</Note>
    </>
  );
}

/* ---------- 2. Yaici: smart buildings ---------- */
function SimYaici() {
  const [t, setT] = useState({ light: false, hvac: false, occ: false, auto: false });
  const set = (k) => (v) => setT({ ...t, [k]: v });
  const cuts = { light: 0.12, hvac: 0.1, occ: 0.08 };
  let rem = 100;
  Object.keys(cuts).forEach((k) => { if (t[k]) rem *= 1 - cuts[k]; });
  if (t.auto) rem *= 0.7;
  const save = 100 - rem;
  return (
    <>
      <p className="sm-ask">Switch on building upgrades and watch daily consumption fall (baseline 100 kWh).</p>
      <div className="sm-togs">
        <Toggle label="Smart lighting" hint="−12%" on={t.light} onChange={set('light')} />
        <Toggle label="Sensor-driven HVAC" hint="−10%" on={t.hvac} onChange={set('hvac')} />
        <Toggle label="Occupancy sensing" hint="−8%" on={t.occ} onChange={set('occ')} />
        <Toggle label="Autonomous control layer" hint="−30% of the rest" on={t.auto} onChange={set('auto')} />
      </div>
      <div className="sm-bars">
        <div><span>Before</span><div className="b"><i style={{ width: '100%', background: 'rgba(20,20,20,.25)' }} /></div><b>100</b></div>
        <div><span>After</span><div className="b"><i style={{ width: rem + '%' }} /></div><b>{fmt(rem, 0)}</b></div>
      </div>
      <Out items={[[fmt(save, 0) + '%', 'energy saved', true], [fmt(rem, 0) + ' kWh', 'per day']]} />
      <Note>A single upgrade saves 5–15% and autonomous setups reach up to 50% in the reviewed studies. The split between measures here is an illustrative assumption.</Note>
    </>
  );
}

/* ---------- 3. Salah: Egypt's solar resource ---------- */
function SimSalah() {
  const [area, setArea] = useState(120);
  const [irr, setIrr] = useState(2400);
  const out = area * irr * 0.18 * 0.8;
  const homes = out / 3000;
  return (
    <>
      <p className="sm-ask">How much electricity can a rooftop in Egypt's sun make in a year?</p>
      <svg className="sm-roof" viewBox="0 0 240 110" role="img" aria-label="Solar panel array">
        <circle cx="205" cy="26" r={10 + (irr - 1600) / 160} fill="#D9432A" />
        <path d="M10 100 L10 56 L120 22 L230 56 V100Z" fill="rgba(20,20,20,.1)" />
        {Array.from({ length: Math.max(1, Math.round(area / 10)) }, (_, i) => {
          const c = i % 8, r = Math.floor(i / 8);
          return <rect key={i} x={30 + c * 24} y={70 - r * 10} width="20" height="7" fill="#1F3FB0" />;
        })}
      </svg>
      <Slider label="Panel area" value={area} min={10} max={400} step={10} unit=" m²" onChange={setArea} />
      <Slider label="Sunshine at the site" value={irr} min={1600} max={3200} step={100} unit=" kWh/m²/yr" onChange={setIrr} />
      <Out items={[[fmt(out / 1000, 1) + ' MWh', 'per year', true], [fmt(homes, 1), 'homes powered*']]} />
      <Note>Egypt receives up to 3,200 kWh/m² a year at the best sites. Assumptions: 18% panel efficiency, 80% system performance, *3,000 kWh per home per year.</Note>
    </>
  );
}

/* ---------- 4. Elshamy: solar-thermal cooling ---------- */
function SimElshamy() {
  const [area, setArea] = useState(100);
  const [load, setLoad] = useState(45);
  const kw = area * 0.35;
  const pct = Math.min(100, (kw / load) * 100);
  return (
    <>
      <p className="sm-ask">Cooling takes 61–66% of a building's power in Egypt. Can roof collectors carry it?</p>
      <svg className="sm-roof" viewBox="0 0 240 110" role="img" aria-label="Collectors on a rooftop">
        <rect x="20" y="50" width="200" height="55" fill="rgba(20,20,20,.1)" />
        <rect x="14" y="44" width="212" height="8" fill="#141414" />
        {Array.from({ length: Math.max(0, Math.round(area / 10)) }, (_, i) => (
          <rect key={i} x={22 + (i % 12) * 17} y={34 - Math.floor(i / 12) * 9} width="15" height="7" fill="#D9432A" />
        ))}
        <path d="M60 80 h120" stroke="#1F3FB0" strokeWidth="3" strokeDasharray="2 5" />
      </svg>
      <Slider label="Collector area" value={area} min={0} max={300} step={10} unit=" m²" onChange={setArea} />
      <Slider label="Building cooling load" value={load} min={10} max={120} step={5} unit=" kW" onChange={setLoad} />
      <Meter pct={pct} label={`${fmt(pct, 0)}% of the cooling load covered by the sun`} tone={pct >= 100 ? 'ok' : ''} />
      <Out items={[[fmt(kw, 1) + ' kW', 'cooling from collectors', true], [fmt(Math.max(0, load - kw), 1) + ' kW', 'still from the grid']]} />
      <Note>The paper reports about 35 kW of cooling from 100 m² of collectors, scaled linearly here. Real output depends on weather and system design.</Note>
    </>
  );
}

/* ---------- 5. Hossain: smart control + on-site solar ---------- */
function SimHossain() {
  const [mode, setMode] = useState('manual');
  const [pv, setPv] = useState(false);
  const base = hours.map((h) => 0.7 + 2.6 * bell(h, 15, 4.2) + 1.1 * bell(h, 22, 2.6));
  const k = { manual: 1, smart: 0.74, drl: 0.5 }[mode];
  const ctrl = base.map((v) => v * k);
  const sol = hours.map((h) => (pv ? 2.8 * sun(h) : 0));
  const net = ctrl.map((v, i) => Math.max(0, v - sol[i]));
  const sum = (a) => a.reduce((s, v) => s + v, 0);
  return (
    <>
      <p className="sm-ask">A building's heating and cooling over 24 hours. Pick a control strategy.</p>
      <Seg value={mode} onChange={setMode} options={[['manual', 'Manual'], ['smart', 'Smart thermostat'], ['drl', 'AI control (RL)']]} />
      <Toggle label="Add on-site solar panels" on={pv} onChange={setPv} />
      <Chart max={4} series={[{ v: net, kind: 'fill', c: '#1F3FB0' }, { v: sol, kind: 'fill', c: '#D9432A', o: 0.5 }, { v: base, kind: 'dash', c: '#141414' }]} />
      <div className="sm-key"><span><i style={{ background: '#1F3FB0' }} />from the grid</span><span><i style={{ background: '#D9432A' }} />solar</span><span><i className="d" />manual baseline</span></div>
      <Out items={[[fmt(sum(net), 1) + ' kWh', 'from the grid per day', true], [fmt((1 - sum(net) / sum(base)) * 100, 0) + '%', 'less than baseline']]} />
      <Note>The paper reports about 26% HVAC saving from smart thermostats and cost cuts above 50% from deep reinforcement learning. Load shapes here are illustrative; the RL figure is a cost cut, shown as an energy factor for simplicity.</Note>
    </>
  );
}

/* ---------- 6. Cavalcanti: IoT rule engine ---------- */
function SimCavalcanti() {
  const [here, setHere] = useState(true);
  const [day, setDay] = useState(30);
  const [temp, setTemp] = useState(30);
  let lamp = 0;
  if (here && day < 70) lamp = (100 - day) / 100;
  const lampW = Math.round(lamp * 40);
  const acOn = here ? temp > 26 : temp > 33;
  const acW = acOn ? (here ? 900 : 450) : 0;
  const total = lampW + acW;
  const rules = [
    here ? 'Presence sensor: someone is in the room' : 'Presence sensor: room empty',
    here ? (day >= 70 ? 'Light sensor: enough daylight, lamp off' : `Light sensor: dim lamp to ${Math.round(lamp * 100)}%`) : 'Lamp off because nobody is there',
    acOn ? (here ? 'Temp > 26 °C and occupied: A/C on' : 'Temp > 33 °C: A/C on, eco mode') : 'Temperature fine: A/C off',
  ];
  return (
    <>
      <p className="sm-ask">A tiny ESP32-style controller reads three sensors and decides. Change the room.</p>
      <svg className="sm-room" viewBox="0 0 240 120" role="img" aria-label="Smart room">
        <rect x="6" y="6" width="228" height="108" fill="rgba(20,20,20,.06)" stroke="#141414" />
        <circle cx="120" cy="30" r={14 + lamp * 22} fill="#D9432A" opacity={0.08 + lamp * 0.35} />
        <path d="M110 12 h20 l-4 14 h-12z" fill="#141414" />
        <circle cx="120" cy="30" r="5" fill={lamp ? '#F1E7D0' : '#6D6A63'} />
        <rect x="170" y="20" width="52" height="18" rx="2" fill="#141414" />
        {acOn && [0, 1, 2].map((i) => <path key={i} d={`M${180 + i * 14} 46 q4 8 0 16`} stroke="#1F3FB0" strokeWidth="2" fill="none" />)}
        {here ? <g><circle cx="70" cy="68" r="8" fill="#1F3FB0" /><path d="M58 106 q12-34 24 0z" fill="#1F3FB0" /></g> : <text x="70" y="90" textAnchor="middle" fontSize="10" fill="#6D6A63">empty</text>}
      </svg>
      <Toggle label="Someone is in the room" on={here} onChange={setHere} />
      <Slider label="Daylight" value={day} min={0} max={100} unit="%" onChange={setDay} />
      <Slider label="Room temperature" value={temp} min={18} max={38} unit=" °C" onChange={setTemp} />
      <ul className="sm-rules">{rules.map((r) => <li key={r}>{r}</li>)}</ul>
      <Out items={[[total + ' W', 'with IoT rules', true], ['940 W', 'always-on baseline']]} />
      <Note>Lighting and cooling are the main IoT targets in the 47 studies reviewed. Wattages are example values.</Note>
    </>
  );
}

/* ---------- 7. Ng Kay Lup: village microgrid ---------- */
function SimNgKayLup() {
  const [hh, setHh] = useState(80);
  const [pvkw, setPvkw] = useState(60);
  const [bat, setBat] = useState(120);
  const dem = hours.map((h) => hh * (0.18 + 0.1 * bell(h, 7, 2) + 0.5 * bell(h, 19.5, 2.2)));
  const gen = hours.map((h) => pvkw * 0.85 * sun(h));
  let soc = bat * 0.5, served = 0, total = 0;
  const unmet = new Array(24).fill(0);
  for (let d = 0; d < 2; d++) {
    for (let h = 0; h < 24; h++) {
      let diff = gen[h] - dem[h], miss = 0;
      if (diff >= 0) soc = Math.min(bat, soc + diff * 0.92);
      else { const need = -diff, take = Math.min(soc, need / 0.92); soc -= take; miss = need - take * 0.92; }
      if (d === 1) { unmet[h] = miss; total += dem[h]; served += dem[h] - miss; }
    }
  }
  const pct = total ? (served / total) * 100 : 0;
  const shown = dem.map((v, i) => v - unmet[i]);
  return (
    <>
      <p className="sm-ask">Size a solar + battery microgrid for a village without a grid connection.</p>
      <Slider label="Households" value={hh} min={20} max={200} step={10} onChange={setHh} />
      <Slider label="Solar array" value={pvkw} min={0} max={200} step={10} unit=" kW" onChange={setPvkw} />
      <Slider label="Battery storage" value={bat} min={0} max={500} step={20} unit=" kWh" onChange={setBat} />
      <Chart max={Math.max(40, Math.ceil(Math.max(...dem) / 10) * 10)} series={[{ v: dem, kind: 'fill', c: '#D9432A', o: 0.55 }, { v: shown, kind: 'fill', c: '#1F3FB0' }, { v: gen, kind: 'line', c: '#141414' }]} />
      <div className="sm-key"><span><i style={{ background: '#1F3FB0' }} />demand served</span><span><i style={{ background: '#D9432A' }} />blackout</span><span><i className="s" />solar output</span></div>
      <Meter pct={pct} label={`${fmt(pct, 0)}% of the village's electricity is supplied`} tone={pct > 95 ? 'ok' : ''} />
      <Note>The paper stresses microgrids and storage for the roughly 600 million Africans still without electricity. Demand and solar curves are simplified examples.</Note>
    </>
  );
}

/* ---------- 8. Aly: design for heat ---------- */
function SimAly() {
  const [t, setT] = useState({ wall: false, shade: false, glass: false, led: false });
  const set = (k) => (v) => setT({ ...t, [k]: v });
  const cuts = { wall: 0.07, shade: 0.13, glass: 0.14, led: 0.17 };
  let rem = 100;
  Object.keys(cuts).forEach((k) => { if (t[k]) rem *= 1 - cuts[k]; });
  return (
    <>
      <p className="sm-ask">Design a hot-climate house. Each choice reduces the cooling demand.</p>
      <svg className="sm-room" viewBox="0 0 240 120" role="img" aria-label="House heat">
        <path d="M20 110 V52 L120 12 L220 52 V110Z" fill="#E6DBC0" />
        <path d="M20 110 V52 L120 12 L220 52 V110Z" fill="#D9432A" opacity={0.6 * (rem / 100)} />
        <rect x="46" y="62" width="40" height="30" fill={t.glass ? '#1F3FB0' : '#F1E7D0'} stroke="#141414" />
        <rect x="154" y="62" width="40" height="30" fill={t.glass ? '#1F3FB0' : '#F1E7D0'} stroke="#141414" />
        {t.shade && <><rect x="42" y="56" width="48" height="6" fill="#141414" /><rect x="150" y="56" width="48" height="6" fill="#141414" /></>}
        {t.wall && <path d="M20 110 V52 M220 110 V52" stroke="#141414" strokeWidth="6" />}
        {t.led && <circle cx="120" cy="84" r="5" fill="#1F3FB0" />}
      </svg>
      <div className="sm-togs">
        <Toggle label="Wall insulation" hint="−7%" on={t.wall} onChange={set('wall')} />
        <Toggle label="Window shading" hint="−13%" on={t.shade} onChange={set('shade')} />
        <Toggle label="Double glazing" hint="−14%" on={t.glass} onChange={set('glass')} />
        <Toggle label="LED lighting" hint="−17%" on={t.led} onChange={set('led')} />
      </div>
      <Meter pct={rem} label={`Cooling demand: ${fmt(rem, 0)} (baseline 100)`} tone={rem < 65 ? 'ok' : ''} />
      <Out items={[[fmt(100 - rem, 0) + '%', 'cooling energy saved', true], [fmt(rem, 0), 'cooling demand index']]} />
      <Note>The four reductions come from one Egyptian residential study reviewed in the paper. Combining them multiplicatively is a simplification.</Note>
    </>
  );
}

/* ---------- 9. Jørgensen: cut demand first, then electrify ---------- */
function SimJorgensen() {
  const [ins, setIns] = useState(false);
  const [hp, setHp] = useState(false);
  const [pv, setPv] = useState(false);
  const [cop, setCop] = useState(3.5);
  const heat = ins ? 60 : 100; // kWh of heat needed per day
  const gas = heat / 0.9;
  const elec = hp ? heat / cop : 0;
  const solar = hp && pv ? elec * 0.5 : 0;
  const grid = elec - solar;
  const co2 = hp ? grid * 0.4 : gas * 0.2;
  const co2Base = (100 / 0.9) * 0.2;
  const fin = hp ? elec : gas;
  return (
    <>
      <p className="sm-ask">Order matters: cut demand first, then electrify, then add rooftop solar.</p>
      <div className="sm-togs">
        <Toggle label="1 · Insulate and seal" hint="demand −40%" on={ins} onChange={setIns} />
        <Toggle label="2 · Replace gas boiler with heat pump" on={hp} onChange={setHp} />
        <Toggle label="3 · Rooftop solar" hint="covers half the electricity" on={pv} onChange={setPv} />
      </div>
      {hp && <Slider label="Heat pump efficiency (heat per unit of electricity)" value={cop} min={3} max={4} step={0.1} unit="×" show={(v) => v.toFixed(1)} onChange={setCop} />}
      <div className="sm-bars">
        <div><span>Energy bought</span><div className="b"><i style={{ width: Math.min(100, (fin / 111) * 100) + '%' }} /></div><b>{fmt(fin - solar * 0, 0)}</b></div>
        <div><span>From the grid or gas</span><div className="b"><i style={{ width: Math.min(100, ((hp ? grid : gas) / 111) * 100) + '%' }} /></div><b>{fmt(hp ? grid : gas, 0)}</b></div>
        <div><span>CO₂ (kg/day)</span><div className="b"><i style={{ width: Math.min(100, (co2 / co2Base) * 100) + '%', background: '#D9432A' }} /></div><b>{fmt(co2, 1)}</b></div>
      </div>
      <Out items={[[fmt((1 - co2 / co2Base) * 100, 0) + '%', 'less CO₂ than the start', true], [fmt(heat, 0) + ' kWh', 'heat needed per day']]} />
      <Note>Heat pumps deliver 3–4 units of heat per unit of electricity, as in the paper. Assumptions: 90% efficient gas boiler, 0.2 kg CO₂/kWh gas, 0.4 kg CO₂/kWh grid.</Note>
    </>
  );
}

/* ---------- 10. Raslan: south vs east-west PV ---------- */
function SimRaslan() {
  const [lay, setLay] = useState('s');
  const S = hours.map((h) => sun(h));
  const E0 = hours.map((h) => bell(h, 9.5, 2.6) + bell(h, 15.3, 2.6));
  const sS = S.reduce((a, b) => a + b, 0), sE = E0.reduce((a, b) => a + b, 0);
  const E = E0.map((v) => (v / sE) * sS * 1.14);
  const cur = lay === 's' ? S : E;
  const kwh = lay === 's' ? 57816 : 57816 * 1.14;
  const panels = lay === 's' ? 57 : 94;
  return (
    <>
      <p className="sm-ask">Same Cairo roof, two ways to lay out the panels.</p>
      <Seg value={lay} onChange={setLay} options={[['s', 'South-facing rows'], ['ew', 'East–west layout']]} />
      <svg className="sm-roof" viewBox="0 0 240 110" role="img" aria-label={`${panels} panels on the roof`}>
        <rect x="14" y="14" width="212" height="86" fill="rgba(20,20,20,.1)" stroke="#141414" />
        {Array.from({ length: panels }, (_, i) => {
          const perRow = lay === 's' ? 10 : 16, c = i % perRow, r = Math.floor(i / perRow);
          const cw = lay === 's' ? 19 : 12, rh = lay === 's' ? 12 : 8;
          return <rect key={i} x={20 + c * (cw + 1.2)} y={20 + r * (rh + (lay === 's' ? 2.6 : 1.4))} width={cw} height={rh} fill={lay === 's' ? '#1F3FB0' : '#D9432A'} />;
        })}
      </svg>
      <Chart max={1.1} unit="relative output" series={[{ v: S, kind: 'dash', c: '#141414' }, { v: cur, kind: 'fill', c: lay === 's' ? '#1F3FB0' : '#D9432A', o: 0.8 }]} />
      <Out items={[[panels + '', 'panels fit on the roof'], [fmt(kwh / 1000, 1) + ' MWh', 'per year, one building', true]]} />
      <Note>Paper: south-facing arrays fit 50–64 panels, east–west 90–98, with east–west producing over 14% more (best south case 57,816 kWh/yr). East–west costs about 60% more up front. Panel counts and curve shapes are simplified.</Note>
    </>
  );
}

export const SIMS = {
  feron: SimFeron, yaici: SimYaici, salah: SimSalah, elshamy: SimElshamy, hossain: SimHossain,
  cavalcanti: SimCavalcanti, nglup: SimNgKayLup, aly: SimAly, jorgensen: SimJorgensen, raslan: SimRaslan,
};

export const SIM_TITLE = {
  feron: 'Village solar survival', yaici: 'Smart building upgrades', salah: 'Egypt sun calculator', elshamy: 'Solar cooling on the roof',
  hossain: 'Smart control, 24 hours', cavalcanti: 'IoT room controller', nglup: 'Village microgrid sizer',
  aly: 'Design a cooler house', jorgensen: 'Demand first, then electrify', raslan: 'South vs east–west roof',
};
