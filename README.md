# Hub Centrale

Unificazione di tutti i progetti in un unico hub centralizzato.

## Struttura

```
Nuovo sito/
├── index.html                ← Landing page hub
├── Caddyfile                 ← Reverse proxy per sottodomini
├── start.sh                  ← Avvia tutte le app
├── apps/
│   ├── multimedia/           ← Film, Serie TV, Anime, LiveTV + DAMI TV
│   │   └── src/app/api/damitv/   ← Integrazione DAMI TV
│   ├── cosmetica/            ← GlowAI — E-commerce cosmetici
│   ├── libri/                ← Libreria free — Libri digitali
│   ├── lunastar/             ← Luna Star — Giochi da tavolo/carte
│   ├── manga/                ← Mangaflow — Lettore manga
│   └── pokemon/              ← Pokémon Veneto — Gioco retrò
└── README.md
```

## Come avviare

Ogni app è su una porta diversa:

| Sezione      | Porta | Descrizione |
|-------------|-------|-------------|
| Hub landing | `index.html` | Apri direttamente |
| Multimedia  | `:3001` | Film, serie, anime, LiveTV |
| Cosmetica   | `:3002` | GlowAI e-commerce |
| Libri       | `:3003` | Libreria free |
| LunaStar    | `:3004` | Game hub |
| Manga       | `:3005` | Mangaflow reader |
| Pokémon     | `:3006` | Pokémon Veneto |

### Avvio veloce (una finestra per app)

```bash
cd "Nuovo sito"
bash start.sh
```

### Avvio manuale (una per volta)

```bash
cd "Nuovo sito/apps/multimedia"
npm install
npm run dev
# → http://localhost:3001
```

Poi apri `index.html` per la landing page.

## DAMI TV (solo in multimedia)

- **34 canali italiani**: Rai 1-5, Rai News/Sport/Storia/Movie, Canale 5, Italia 1, Rete 4, La7, TV8, Nove, Sky TG24/Sport, Sportitalia, DMAX, Real Time, ecc.
- **Sport live**: Football, basketball, tennis, MMA, cricket, motor-sports, baseball, hockey, rugby, darts, golf
- Embed via iframe da dami-tv.pro

## Prossimi passi

- [ ] DB separati per sezione (Turso/Neon free tier)
- [ ] Login unico SSO via Sallytrix
- [ ] Hosting Vercel free tier
- [ ] Sottodomini con Caddy
