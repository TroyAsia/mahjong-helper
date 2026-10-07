# Mahjong Helper

American mahjong trainer: interactive lessons, Charleston practice, and play vs AI.
No backend and no environment variables.

## Install

```bash
npm install
```

## Run locally

```bash
npm run dev
```

Open the URL Vite prints (usually `http://localhost:5173`).

## Test

```bash
npm test
npm run lint
```

## Build

```bash
npm run build
```

Preview the production build:

```bash
npm run preview
```

## Deploy on Vercel

1. Push this repo to GitHub (or GitLab / Bitbucket).
2. In [Vercel](https://vercel.com): **Add New Project** → import the repo.
3. Framework preset: **Vite**
4. Build command: `npm run build`
5. Output directory: `dist`
6. Leave Environment Variables empty.
7. Deploy.

After deploy, open the live URL and try: Home → Lessons, Play vs AI, and Charleston.
