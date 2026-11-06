# SDG 7 Energy Archive

Animated single-page site for GEO 217 (Sustainability and Climate Change), Alamein International University.
Ten research papers on solar energy and energy saving (SDG 7) stand on a curved 3D shelf. Click the centre cover to open a detail sheet.

**Stack:** React 18 + Vite. Fonts from Google Fonts (Inter Tight, Newsreader, Big Shoulders Display).

## Run

```bash
npm install
npm run dev      # local dev server
npm run build    # production build in dist/
```

## Structure

- `src/engine.js` — the shelf animation loop (one `requestAnimationFrame`, writes transforms directly to the DOM so React never re-renders per frame)
- `src/components/` — `Shelf`, `Caption`, `Timeline`, `Detail`, `Chrome` (top bar, arrows, footer, cursor), `Defs`
- `src/data.js` — the ten papers; `src/art.js` — generated SVG covers and spines

## Deploy

Vercel detects Vite automatically (build `npm run build`, output `dist`).

## Controls

Drag, scroll or arrow keys to browse. Click the centre cover (or press Enter) to open, Esc to close.
