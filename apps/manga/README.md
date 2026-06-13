# MangaFlow - Lettore di Manga stile Tachiyomi

Un'applicazione web moderna per leggere manga, ispirata a Tachiyomi/Mihon, con supporto completo per il sistema di estensioni di Keiyoushi.

## 🌟 Caratteristiche

### 📚 Sistema di Estensioni Tachiyomi
- **Compatibilità Keiyoushi**: Supporto completo per il repository [keiyoushi/extensions](https://github.com/keiyoushi/extensions)
- **Fonti Italiane**: Estensioni per MangaWorld, MangaWorld Academy, e altri siti italiani
- **Fonti Internazionali**: MangaDex, Bato.to, Webtoons, e molte altre
- **Sistema Fallback**: Dati mock quando il repository non è accessibile
- **Filtri per Lingua**: Cerca estensioni per lingua (italiano, inglese, spagnolo, giapponese, ecc.)
- **Gestione NSFW**: Filtro per contenuti adulti

### 🎨 Interfaccia Utente
- **Design stile Tachiyomi**: Familiare agli utenti di Tachiyomi/Mihon
- **Ottimizzato Mobile**: Touch-friendly e responsive
- **Tema Scuro**: Comfort per la lettura notturna
- **Navigazione Intuitiva**: Bottom nav con Home, Esplora, Libreria, Cronologia, Impostazioni

### 📖 Funzionalità di Lettura
- **Lettore Completo**: Navigazione tap (sinistra=prec, destra=succ)
- **Progresso Automatico**: Salvataggio automatico della pagina corrente
- **Navigazione Capitoli**: Passa facilmente tra capitoli
- **Barra di Progresso**: Vedi quanto manca alla fine del capitolo

### 📦 Gestione Libreria
- **Salva Manga**: Aggiungi i tuoi manga preferiti alla libreria
- **Vista Griglia/Lista**: Cambia il layout come preferisci
- **Categorie**: Organizza i manga per categorie
- **Stato di Lettura**: Vedi i capitoli letti e da leggere

### 🕐 Cronologia
- **Tracciamento Lettura**: Tutti i manga letti con timestamp
- **Cronologia Completa**: 50 entry recenti
- **Cancella Facile**: Rimuovi singolarmente o cancella tutto

## 🚀 Installazione e Avvio

### Prerequisiti
- Node.js 18+
- Bun (raccomandato) o npm

### Setup

```bash
# Installa le dipendenze
bun install

# Avvia il server di sviluppo
bun run dev
```

L'applicazione sarà disponibile su `http://localhost:3000`

## 📖 Come Usare

### 1. Configura le Estensioni

#### Opzione A: Usa Dati Mock (Offline)
L'applicazione usa automaticamente i dati mock quando il repository Keiyoushi non è accessibile. Questo include:
- 2 estensioni italiane (MangaWorld, MangaWorld In)
- 7 estensioni internazionali (MangaDex, Bato.to, Webtoons, ecc.)

#### Opzione B: Connessione al Repository Keiyoushi
Per usare le estensioni reali:

1. Vai alla pagina "Impostazioni"
2. Clicca su "Aggiungi repository"
3. Inserisci: `https://github.com/keiyoushi/extensions`
4. Clicca su "Aggiungi"
5. Clicca sull'icona refresh 🔄 per sincronizzare le estensioni

**Nota**: Se il repository non è accessibile (firewall, rete limitata), l'app userà automaticamente i dati mock.

### 2. Esplora i Manga

1. Vai alla pagina "Esplora"
2. Usa la barra di ricerca per trovare manga per:
   - Titolo
   - Autore
   - Genere
3. Clicca su un manga per vedere i dettagli

### 3. Leggi i Manga

1. Dai dettagli del manga, clicca su "Inizia lettura"
2. Naviga tra le pagine:
   - Clicca sul **lato sinistro** della pagina per andare indietro
   - Clicca sul **lato destro** della pagina per andare avanti
   - Clicca al **centro** per mostrare/nascondere i controlli
3. Usa i pulsanti in basso per cambiare capitolo

### 4. Gestisci la Libreria

1. Dalla pagina dei dettagli, clicca "Aggiungi" per salvare nella libreria
2. Vai alla pagina "Libreria" per vedere tutti i tuoi manga
3. Usa l'icona in alto a destra per cambiare vista (griglia/lista)

## 🔧 API Endpoints

### Gestione Estensioni Keiyoushi

#### `GET /api/keiyoushi?lang=<lingua>`
Recupera le estensioni dal repository Keiyoushi (o usa mock).

**Parametri:**
- `lang`: Filtro lingua (es. `it`, `en`, `all`)
- `mock`: Forza uso dati mock (`true`/`false`)

**Risposta:**
```json
{
  "version": 2,
  "totalExtensions": 9,
  "filteredExtensions": 2,
  "languages": ["all", "en", "es", "it", "ja"],
  "isMock": true,
  "extensions": [
    {
      "name": "MangaWorld",
      "pkg": "eu.kanade.tachiyomi.extension.it.mangaworld",
      "version": "1.4.27",
      "lang": "it",
      "nsfw": 0,
      "icon": "ic_launcher.webp",
      "sources": [...]
    }
  ],
  "popularItalianSources": [...]
}
```

#### `POST /api/keiyoushi`
Testa la connessione al repository.

**Body:**
```json
{
  "repoUrl": "https://raw.githubusercontent.com/keiyoushi/extensions/repo/index.min.json"
}
```

### Gestione Repository Locali

#### `GET /api/repos`
Lista tutti i repository configurati.

#### `POST /api/repos`
Aggiunge un nuovo repository.

**Body:**
```json
{
  "name": "Keiyoushi Extensions",
  "url": "https://github.com/keiyoushi/extensions",
  "icon": "📚"
}
```

#### `PATCH /api/repos/<id>`
Attiva/disattiva un repository.

#### `DELETE /api/repos/<id>`
Rimuove un repository.

### Gestione Estensioni Locali

#### `GET /api/extensions?lang=<lingua>&enabled=<true|false>`
Lista le estensioni sincronizzate localmente.

#### `POST /api/extensions`
Sincronizza le estensioni da un repository.

**Body:**
```json
{
  "repoId": "repo-id-here"
}
```

### Gestione Manga

#### `GET /api/manga?type=<tipo>&query=<ricerca>`
Ottieni la lista dei manga.

**Parametri:**
- `type`: `popular` | `latest` | `all`
- `query`: Termine di ricerca (opzionale)

#### `GET /api/chapters?mangaId=<id>`
Ottieni i capitoli di un manga.

#### `GET /api/pages?chapterId=<id>`
Ottieni le pagine di un capitolo.

### Gestione Libreria

#### `GET /api/library?category=<categoria>`
Ottieni la libreria personale.

#### `POST /api/library`
Aggiungi manga alla libreria.

**Body:**
```json
{
  "mangaId": "manga-id-here",
  "category": "Reading"
}
```

#### `DELETE /api/library?mangaId=<id>`
Rimuovi dalla libreria.

### Gestione Cronologia

#### `GET /api/history`
Ottieni la cronologia di lettura.

#### `POST /api/history`
Aggiungi alla cronologia.

**Body:**
```json
{
  "mangaId": "manga-id-here",
  "chapterId": "chapter-id-here",
  "chapterNum": 1
}
```

#### `DELETE /api/history?mangaId=<id>`
Cancella cronologia (singola o completa).

## 🏗️ Architettura

### Database (Prisma + SQLite)

```
Repo (Repository)
  └─ Extension (Estensione)
      └─ Manga
          ├─ Chapter (Capitolo)
          ├─ LibraryEntry (Voce Libreria)
          ├─ ReadingHistory (Cronologia)
          └─ ReadingProgress (Progresso)
```

### Servizi

#### `TachiyomiExtensionService`
Gestisce il fetch e il parsing del repository Keiyoushi con:
- Sistema di retry automatico (3 tentativi)
- Timeout di 15 secondi
- Fallback a dati mock
- Filtri per lingua e NSFW

#### `MangaSourceService`
Interfaccia con le vere fonti manga:
- Scraper per MangaWorld
- Sistema estendibile per altre fonti
- Gestione cache
- Parsing HTML

### Frontend

- **Next.js 16** con App Router
- **TypeScript** per type-safety
- **Tailwind CSS 4** per lo styling
- **shadcn/ui** per i componenti
- **Lucide React** per le icone

## 📚 Estensioni Disponibili

### Italiane (Mock + Reali)
- **MangaWorld**: Fonte principale di manga italiani
- **MangaWorld Academy**: Manga accademici/doujinshi
- **MangaWorld In**: Manga in italiano da varie fonti

### Internazionali (Mock)
- **MangaDex**: Aggregatore multi-lingua
- **Bato.to**: Grande database di scanlation
- **Webtoons**: Webtoon originali
- **MangaFox**: Manga in inglese
- **TuMangaOnline**: Manga in spagnolo
- **ComicK**: Manga in giapponese

## 🔒 Note di Sicurezza

### Dati Mock vs Dati Reali
L'applicazione usa **dati mock** per:
- Dimostrare le funzionalità
- Funzionare offline
- Evitare problemi di copyright
- Non dipendere da API esterne

### Implementazione Reale
Per un'implementazione in produzione:
1. Implementa scraper reali per ogni fonte
2. Aggiungi rate limiting per evitare blocchi
3. Implementa sistema di cache
4. Rispetta i ToS delle fonti manga
5. Gestisci correttamente i cookie e sessioni

## 🚀 Sviluppi Futuri

- [ ] Implementazione scraper reali per MangaWorld
- [ ] Sistema di download offline
- [ ] Sincronizzazione cloud (backup libreria)
- [ ] Tracciamento avanzato progresso
- [ ] Filtri multipli (genere, stato, anno)
- [ ] Categorie personalizzate
- [ ] Temi personalizzati
- [ ] Supporto multi-lingua UI
- [ ] PWA per installazione mobile
- [ ] WebView per estensioni reali

## 🤝 Contribuire

Contributi sono benvenuti! Aree di interesse:
- Implementazione scraper per nuove fonti
- Miglioramento UI/UX
- Fix bug
- Documentazione
- Traduzioni

## 📄 License

Questo progetto è creato a scopo educativo e dimostrativo. L'uso dei dati mock evita problemi di copyright.

## 🙏 Riconoscimenti

- **Tachiyomi**: L'ispirazione originale per l'architettura
- **Mihon**: Il fork continuativo di Tachiyomi
- **Keiyoushi**: Per l'ecellente repository di estensioni
- **MangaWorld**: Per essere una delle migliori fonti di manga italiani
- **shadcn/ui**: Per i componenti UI bellissimi
- **Next.js Team**: Per il framework fantastico

## 📧 Supporto

Per domande, problemi o suggerimenti:
1. Apri una issue su GitHub
2. Controlla la documentazione esistente
3. Cerca nelle issue già aperte

## 🔗 Link Utili

- [Keiyoushi Extensions Repository](https://github.com/keiyoushi/extensions)
- [Keiyoushi Extensions Source Issues](https://github.com/keiyoushi/extensions-source/issues)
- [Tachiyomi](https://github.com/tachiyomiorg/tachiyomi)
- [Mihon](https://github.com/mihonapp/mihon)
- [MangaDex API](https://api.mangadex.org/)

---

⚠️ **Disclaimer**: Questa applicazione usa dati mock per scopi dimostrativi. L'uso di vere estensioni e scraper deve rispettare i Termini di Servizio delle fonti manga.
