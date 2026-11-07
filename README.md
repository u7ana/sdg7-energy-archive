# SDG 7 Energy Library

GEO 217 project (Sustainability and Climate Change): ten research papers on SDG 7 (solar energy and energy saving) in one animated library.

Each paper opens a sheet with four tabs:

- **Overview**: one-line synopsis, key figures, link to the paper (DOI)
- **Watch**: a 24-second animated explainer (4 scenes, one per topic or experiment in the paper) with play/pause and a timeline
- **Summary**: the full 600-1000 word original summary
- **Simulate**: a small interactive model built on the paper's numbers
- **Cite**: APA 7 reference (copy button) and in-text citations

The **References** button in the top bar lists all ten papers in APA order.

## Run

```bash
npm install
npm run dev      # local
npm run build    # production build in dist/
```

Deploy: import the repo in Vercel (framework preset Vite, build `npm run build`, output `dist`).

Stack: React 18, Vite. Shelf animation is an imperative rAF engine (`src/engine.js`); content lives in `src/data.js`, `src/summaries.js` and `src/sims.jsx`.
