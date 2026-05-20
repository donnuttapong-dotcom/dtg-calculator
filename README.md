# DTG Studio Calculator

A mobile-first DTG quote calculator built with React, TypeScript, Vite, and Tailwind CSS.

## Features

- Responsive calculator UI for mobile and desktop
- Front, back, and sleeve T-shirt mockup views using image assets
- Artwork upload with drag, resize, rotate, and zoom controls
- Print area sizing for front, back, and sleeve placements
- DTG pricing calculator with configurable minimum print charge
- Admin pricing page backed by `localStorage`

## Local Development

1. Install dependencies:

```bash
npm install
```

2. Start the dev server:

```bash
npm run dev
```

3. Open the URL shown in the terminal, usually:

```bash
http://localhost:5173
```

## Production Build

```bash
npm run build
```

The production files are generated in `dist/`.

## Deploy To Vercel

This project is ready to deploy on Vercel as a Vite app.

### Option 1: Deploy with GitHub

1. Push this folder to a GitHub repository.
2. Go to [Vercel](https://vercel.com).
3. Click `Add New...` -> `Project`.
4. Import the GitHub repository.
5. Vercel should detect the project settings automatically.

Expected settings:

- Framework Preset: `Vite`
- Build Command: `npm run build`
- Output Directory: `dist`

6. Click `Deploy`.

### Option 2: Deploy with Vercel CLI

```bash
npm install -g vercel
vercel
```

For production deployment:

```bash
vercel --prod
```

## Pricing Storage

Admin pricing values are stored in the browser under:

```text
dtg-pricing-config-v3
```

## Project Structure

- `src/App.tsx` - main calculator and admin pricing UI
- `src/data/mockups.ts` - mockup view data and print area overlays
- `src/data/mockupAssets/` - embedded front, back, and side shirt mockup image assets
- `src/lib/pricing.ts` - quote and pricing calculation logic
