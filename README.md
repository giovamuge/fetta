# Fetta

> Distribute indivisible packages among multiple recipients in proportion — minimising deviation from the target weight.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/giovamuge/fetta)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

---

## What is Fetta?

Fetta solves a common logistics problem: you have packages of fixed sizes and need to split the total weight among several people as fairly as possible. Enter the available package sizes, the desired proportions, and Fetta finds the optimal allocation automatically.

Supports **Italian** and **English**, and respects your system's **dark / light** preference.

## Features

| | |
|---|---|
| ⚖️ Proportional allocation | DFS exact solver + greedy-with-swaps fallback |
| 📦 Multiple package sizes | Weight (kg) × quantity per size |
| 🕑 History | Last 20 calculations, persisted in `localStorage` |
| 📤 Export | Download results as **CSV** or **TXT** |
| 🌗 Dark / light / system theme | Powered by `next-themes` |
| 🌐 Multilingual | Italian & English, switchable at runtime |

## Getting started

### Prerequisites

- Node.js ≥ 20
- npm ≥ 10

### Installation

```bash
git clone https://github.com/giovamuge/fetta.git
cd fetta
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser. The app hot-reloads on every save.

### Production build

```bash
npm run build   # type-checks + generates static output
npm start       # serves the production build locally
```

## Usage

1. **Packages** — add one row per package size: enter the weight in kg and how many units are available.
2. **Proportions** — add one row per recipient: enter a name and a relative weight (e.g. `2 / 3 / 5`).
3. Press **Calculate distribution**. Fetta solves the allocation and shows:
   - a summary card (total weight, packages used, total error, strategy);
   - a breakdown table with target vs. assigned weight and delta per recipient.
4. Use **CSV** or **TXT** to export the results.
5. Previous calculations are stored automatically. Open **History** to restore any past input.

## Deploy to Vercel

### One-click

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/giovamuge/fetta)

### Manual steps

1. Fork this repository on GitHub.
2. Go to [vercel.com](https://vercel.com) and sign in (free account works).
3. Click **Add New → Project** and import your fork.
4. Vercel auto-detects Next.js — no configuration required.
5. Click **Deploy**.

The app will be live in under a minute at the URL Vercel assigns.

> **No environment variables required.** The app is fully client-side — the solver runs in the browser and history is stored in `localStorage`.

### Custom domain

In your Vercel project settings → **Domains**, add your domain and follow the DNS instructions.

## Tech stack

| Layer | Library |
|---|---|
| Framework | [Next.js 16](https://nextjs.org) — App Router, TypeScript, static generation |
| UI components | [shadcn/ui](https://ui.shadcn.com) on `@base-ui/react` |
| Styling | [Tailwind CSS v4](https://tailwindcss.com) |
| Forms | [react-hook-form](https://react-hook-form.com) + [Zod](https://zod.dev) |
| Dark mode | [next-themes](https://github.com/pacocoursey/next-themes) |

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

```bash
# Lint + format
npx prettier . --write
npm run build          # must pass before opening a PR
```

## License

[MIT](LICENSE) © giovamuge
