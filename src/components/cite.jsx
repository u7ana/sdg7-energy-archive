// Small helpers for the Cite tab and the References overlay.
export function Italic({ text }) {
  return text.split('*').map((t, i) => (i % 2 ? <i key={i}>{t}</i> : <span key={i}>{t}</span>));
}

// the reference list uses "de Oliveira Cavalcanti" as the surname, so the in-text citation must match
const OVERRIDE = { cavalcanti: 'de Oliveira Cavalcanti & Pimenta' };
const surname = (f) => OVERRIDE[f.id] || f.auFull.replace(/,\s*[A-Z]\.$/, '');

// (Raslan et al., 2025)  or  Raslan et al. (2025)
export function citeParen(f, narrative = false) {
  const n = surname(f);
  return narrative ? `${n} (${f.year})` : `(${n}, ${f.year})`;
}

export function copyText(text) {
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) return navigator.clipboard.writeText(text).catch(() => fallback(text));
  } catch (e) { /* fall through */ }
  return fallback(text);
}
function fallback(text) {
  return new Promise((res) => {
    const ta = document.createElement('textarea');
    ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = '0';
    document.body.appendChild(ta); ta.select();
    try { document.execCommand('copy'); } catch (e) { /* ignore */ }
    ta.remove(); res();
  });
}
