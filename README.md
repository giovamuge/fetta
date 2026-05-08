# Fetta

**Fetta** è un'app web per distribuire pacchi indivisibili tra più partecipanti rispettando proporzioni desiderate, minimizzando lo scarto dal target.

> **Fetta** is a web app for distributing indivisible packages among multiple recipients according to desired proportions, minimising deviation from the target.

## Funzionalità / Features

- Inserimento taglie di pacchi (peso × quantità) e proporzioni per partecipante
- Algoritmo DFS esatto + greedy con swap per ottimizzare l'allocazione
- Storico dei calcoli salvato in localStorage (ultimi 20)
- Esportazione risultati in CSV e TXT
- Tema chiaro / scuro / sistema
- Interfaccia in italiano e inglese

## Stack tecnico

- [Next.js 16](https://nextjs.org) — App Router, TypeScript, generazione statica
- [shadcn/ui](https://ui.shadcn.com) — componenti basati su `@base-ui/react`
- [Tailwind CSS v4](https://tailwindcss.com)
- [Zod](https://zod.dev) + [react-hook-form](https://react-hook-form.com)
- [next-themes](https://github.com/pacocoursey/next-themes) — dark mode

## Sviluppo locale / Local development

```bash
# Installa le dipendenze
npm install

# Avvia il server di sviluppo
npm run dev
```

Apri [http://localhost:3000](http://localhost:3000) nel browser.

```bash
# Build di produzione
npm run build

# Avvia il server di produzione
npm start
```

## Deploy su Vercel

### Deploy con un click

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/giovamuge/fetta)

### Deploy manuale

1. **Fork** questo repository su GitHub
2. Vai su [vercel.com](https://vercel.com) e accedi (o crea un account gratuito)
3. Clicca **Add New → Project**
4. Seleziona il repository `fetta` dalla lista
5. Vercel rileva automaticamente Next.js — nessuna configurazione necessaria
6. Clicca **Deploy**

L'app sarà online in meno di un minuto all'URL assegnato da Vercel.

### Variabili d'ambiente

Nessuna variabile d'ambiente richiesta. L'app è completamente client-side (localStorage per la cronologia, nessun backend).

### Dominio personalizzato

Nelle impostazioni del progetto Vercel → **Domains**, aggiungi il tuo dominio personalizzato e segui le istruzioni DNS.

## Licenza

MIT

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
