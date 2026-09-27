# Hack Club Melčice

Interaktívny 3D digitálny les — web pre Hack Club Melčice (ZŠ s MŠ Jána Smreka).
Postavené na **Vite + vanilla JavaScript + Three.js**, bez frameworku.

## Spustenie lokálne

```bash
npm install
npm run dev
```
Otvorí sa na `http://localhost:5173`.

## Build pre produkciu

```bash
npm run build
npm run preview   # vyskúšanie buildu lokálne
```
Výstup je v priečinku `dist/`.

## Nasadenie na Vercel

1. Nahraj tento priečinok do Git repozitára (GitHub/GitLab).
2. Na [vercel.com](https://vercel.com) klikni **New Project** → vyber repozitár.
3. Vercel automaticky rozpozná **Vite** ako framework (build command `vite build`, output `dist`).
4. Deploy.

Alebo priamo z príkazového riadku:
```bash
npm i -g vercel
vercel
```

## Štruktúra projektu

```
index.html        — HTML kostra a obsah jednotlivých scén
src/main.js        — Three.js les, kamera, prechody medzi scénami, UI logika
src/style.css      — glass/dizajn systém, layout, responsive, accessibility
```

## Úprava obsahu

- Texty a sekcie sú priamo v `index.html` (každá scéna = `<section class="scene" id="...">`).
- Pozície kamery a stromov sú v `src/main.js` v objektoch `nodes` a `CAM` — zmenou súradníc vieš upraviť tvar cesty a rozostavenie lesa.
- Farby a glass efekt sú v `src/style.css` v `:root` premenných.
