# LibriVault / ShadowKindle

**LibriVault** (noto anche come ShadowKindle) è un lettore ebook self-hosted open-source che ti permette di creare la tua libreria personale di libri digitale.

![LibriVault](https://img.shields.io/badge/Status-Production%20Ready-brightgreen)
![License](https://img.shields.io/badge/License-MIT-blue)
![Version](https://img.shields.io/badge/Next.js-16-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)

## 🌟 Caratteristiche

### Core Features
- **📚 Libreria Personale**: Organizza i tuoi libri in "In lettura", "Completati", e "Wishlist"
- **🔍 Ricerca Potente**: Cerca libri per titolo o autore in tutta la tua libreria
- **📤 Upload Facile**: Carica file EPUB e PDF direttamente nel browser
- **📖 Lettore Integrato**: Leggi i tuoi libri con un lettore EPUB/PDF integrato nel browser
- **💾 Salvataggio Automatico**: Il punto di lettura viene salvato automaticamente (localStorage + backend sync)
- **🔖 Segnalibri**: Crea e gestisci segnalibri per i tuoi libri preferiti
- **🎨 Evidenziature**: Evidenzia passaggi importanti dei tuoi libri
- **🌓 Dark Mode**: Design elegante con supporto per dark mode
- **📱 Responsive**: Funziona perfettamente su desktop e mobile

### Shadow Libraries Integration
- **🔗 Anna's Archive**: Cerca e scarica libri da Anna's Archive
- **🎯 Mirror Support**: Supporta molteplici mirror di Anna's Archive
- **⚡ Direct Download**: Supporto per link direct download
- **🛡️ Avvertenze di Sicurezza**: Avvertenze integrate per la conformità legale

### Technical Features
- **🐳 Docker Ready**: Deploy semplice con Docker e docker-compose
- **⚡ Performance**: Next.js 16 con App Router per ottimo performance
- **🗄️ SQLite**: Database SQLite locale senza dipendenze esterne
- **🎨 Modern UI**: Tailwind CSS con componenti shadcn/ui
- **📖 EPUB.js**: Lettore EPUB avanzato con supporto per CFI (Canonical Fragment Identifier)
- **🔒 Self-Hosted**: Tutti i tuoi dati rimangono sul tuo server

## 🚀 Quick Start

### Docker Installation (Consigliato)

#### Prerequisiti
- Docker 20.10+
- Docker Compose 2.0+

#### Installazione

1. **Clona il repository**:
```bash
git clone https://github.com/yourusername/librivault.git
cd librivault
```

2. **Avvia con Docker Compose**:
```bash
docker-compose up -d
```

3. **Accedi all'applicazione**:
```
http://localhost:3000
```

#### Volumi e Persistenza

Il file `docker-compose.yml` configura i volumi per garantire la persistenza dei dati:

- `./db`: Database SQLite con tutti i libri, progressi, segnalibri, etc.
- `./public/uploads`: File EPUB/PDF caricati

I dati persisteranno anche se il container viene riavviato o ricreato.

### Development Setup

#### Prerequisiti
- Node.js 18+
- Bun 1.0+ (raccomandato) o npm/pnpm/yarn

#### Installazione

1. **Clona il repository**:
```bash
git clone https://github.com/yourusername/librivault.git
cd librivault
```

2. **Installa le dipendenze**:
```bash
bun install
```

3. **Configura le variabili d'ambiente**:
```bash
cp .env.example .env
```

Modifica `.env` se necessario:
```env
DATABASE_URL="file:./db/custom.db"
```

4. **Inizializza il database**:
```bash
bun run db:push
```

5. **Avvia il server di sviluppo**:
```bash
bun run dev
```

6. **Accedi all'applicazione**:
```
http://localhost:3000
```

## 📚 Utilizzo

### Upload di Libri

1. Clicca sul pulsante **"Upload Book"** in alto a destra
2. Seleziona un file EPUB o PDF dal tuo computer
3. I metadati del libro (titolo, autore, descrizione) vengono estratti automaticamente
4. Il libro viene salvato nella libreria e classificato come "In lettura"

### Lettura di un Libro

1. Clicca sul pulsante **"Read"** su una card libro
2. Il lettore si aprirà con le seguenti funzionalità:
   - **Navigazione**: Usa le frecce laterali o la progress bar per navigare
   - **Font Size**: Usa lo slider per regolare la dimensione del font
   - **Dark/Light Mode**: Clicca sull'icona luna/sole per cambiare tema
   - **Fullscreen**: Clicca sull'icona fullscreen per lettura a schermo intero
   - **Segnalibri**: Clicca sull'icona settings per aggiungere un segnalibro
   - **Progresso**: Il progresso viene salvato automaticamente

### Gestione della Libreria

#### Categorie
- **All**: Tutti i libri
- **Reading**: Libri che stai leggendo attualmente
- **Completed**: Libri completati (100% progresso)
- **Wishlist**: Libri che vuoi leggere in futuro

#### Modifica Categoria
Un libro viene spostato automaticamente:
- Da "Wishlist" a "Reading" quando inizi a leggerlo
- Da "Reading" a "Completed" quando raggiungi il 100%

Puoi anche modificare manualmente la categoria tramite l'API.

### Ricerca

1. Usa la barra di ricerca in alto
2. Digita il titolo o l'autore
3. I risultati vengono filtrati in tempo reale

### Anna's Archive Integration

#### Ricerca su Anna's Archive

1. Clicca sul pulsante **"Search Anna's Archive"**
2. Digita il titolo o l'autore
3. Clicca su "Search Anna's Archive"
4. Si aprirà una nuova finestra con i risultati di ricerca
5. Scarica il libro desiderato
6. Importalo nella tua libreria locale

#### Aggiungere Nuovi Mirror

Per aggiungere nuovi mirror di Anna's Archive, modifica il file:
`src/app/api/shadowlib/annas-archive/route.ts`

```typescript
const ANNAS_ARCHIVE_MIRRORS = [
  'https://annas-archive.pk',
  'https://annas-archive.org',
  'https://annas-archive.gs',  // Aggiungi qui nuovi mirror
  'https://your-mirror.com',    // Aggiungi qui nuovi mirror
];
```

#### Disabilitare Anna's Archive

Se non vuoi usare questa funzionalità, puoi:
1. Rimuovere il pulsante dalla UI in `src/app/page.tsx`
2. Eliminare la route API `src/app/api/shadowlib/annas-archive/route.ts`

## 🗄️ Gestione di Grandi Collezioni

### Ottimizzazioni per Librerie con Milioni di Libri

Per gestire collezioni molto grandi, considera le seguenti strategie:

#### 1. Database Partitioning

Attualmente LibriVault usa SQLite che ha limiti (~281 TB), ma per performance migliori con milioni di record:

```prisma
// Considera PostgreSQL per grandi collezioni
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

#### 2. Indicizzazione

Assicurati di avere indici appropriati:
```prisma
model Book {
  id        String   @id @default(cuid())
  title     String
  author    String
  // Aggiungi indici per ricerche comuni
  @@index([title])
  @@index([author])
  @@index([category])
}
```

#### 3. Paginazione

Per librerie molto grandi, implementa la paginazione:

```typescript
// API route example
const page = parseInt(searchParams.get('page') || '1')
const limit = parseInt(searchParams.get('limit') || '20')

const books = await db.book.findMany({
  skip: (page - 1) * limit,
  take: limit,
  // ...
})
```

#### 4. Lazy Loading e Virtual Scrolling

Implementa il virtual scrolling nel frontend per caricare solo i libri visibili:

```tsx
// Usa react-virtual o react-window
import { useVirtualizer } from '@tanstack/react-virtual'
```

#### 5. Caching

Implementa il caching per le ricerche comuni:

```typescript
// Usa Redis o un caching in-memory
const cachedBooks = await cache.get(`books:${search}:${category}`)
if (cachedBooks) return cachedBooks
```

### Gestione di Dataset Anna's Archive

Per importare milioni di libri da Anna's Archive:

#### 1. Scarica il Dataset

Scarica i dataset dal mirror GitHub:
```bash
# Direct Downloads
https://shadowlibraries.github.io/DirectDownloads/AnnasArchive/

# Oppure via torrent (se disponibile)
```

#### 2. Script di Importazione

Crea uno script per importare i metadati (non i file):

```typescript
// scripts/import-annas-archive.ts
import { db } from '@/lib/db'
import fs from 'fs'
import Papa from 'papaparse'

async function importMetadata(csvPath: string) {
  const csv = fs.readFileSync(csvPath, 'utf-8')
  const results = Papa.parse(csv, { header: true })

  for (const row of results.data) {
    await db.book.create({
      data: {
        title: row.title,
        author: row.author,
        description: row.description,
        // Non salvare il file, solo i metadati
        filePath: null,
        category: 'wishlist',
        // Aggiungi campo per link esterno
        annasArchiveUrl: row.url,
        annasArchiveMd5: row.md5,
      },
    })
  }
}

importMetadata('./annas-archive-data.csv')
```

#### 3. Download On-Demand

Invece di scaricare tutti i file, consenti all'utente di scaricare su richiesta:

```typescript
// API route per download on-demand
app.get('/api/books/:id/download-external', async (req, res) => {
  const book = await db.book.findUnique({ where: { id: req.params.id } })

  // Reindirizza al link di Anna's Archive
  res.redirect(book.annasArchiveUrl)
})
```

#### 4. Storage Esterno

Per milioni di file, considera:
- **S3-compatible storage**: MinIO, Wasabi, Backblaze B2
- **CDN**: CloudFlare R2, Bunny CDN
- **NFS/SMB**: Storage di rete per self-hosting

```typescript
// Configurazione per S3
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'

const s3 = new S3Client({
  endpoint: process.env.S3_ENDPOINT,
  region: 'us-east-1',
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY_ID!,
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY!,
  },
})
```

## 🔒 Sicurezza

### Best Practices

1. **Autenticazione**: LibriVault al momento non include autenticazione. Per deploy pubblici:
   - Aggiungi NextAuth.js per autenticazione
   - Limita l'accesso a utenti autorizzati
   - Usa HTTPS

2. **Validazione File**:
   - Valida sempre il tipo di file uploadato
   - Limita la dimensione dei file
   - Scansiona i file per malware (opzionale ma consigliato)

3. **Rate Limiting**:
   - Implementa rate limiting per prevenire abusi
   - Limita il numero di upload per utente

4. **Shadow Libraries**:
   - ⚠️ **Disclaimer**: L'uso di shadow libraries come Anna's Archive può violare le leggi sul copyright.
   - Gli utenti sono responsabili di assicurarsi di essere in conformità con le leggi del loro paese.
   - LibriVault non ospita o distribuisce materiale protetto da copyright.
   - L'integrazione con Anna's Archive fornisce solo collegamenti a risorse esterne.

### Variabili d'Ambiente

```env
# Database
DATABASE_URL="file:./db/custom.db"

# Security (opzionale)
ALLOWED_ORIGINS="http://localhost:3000"
MAX_FILE_SIZE_MB=50
UPLOAD_LIMIT_PER_DAY=100

# Shadow Libraries (opzionale)
ENABLE_SHADOW_LIBRARIES=true
DEFAULT_ANNAS_ARCHIVE_MIRROR="https://annas-archive.pk"

# S3 Storage (opzionale, per grandi collezioni)
S3_ENDPOINT=
S3_ACCESS_KEY_ID=
S3_SECRET_ACCESS_KEY=
S3_BUCKET=
```

## 🛠️ Configurazione Avanzata

### Temi Personalizzati

Modifica i colori e il tema in `tailwind.config.ts`:

```typescript
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f5f3ff',
          500: '#8b5cf6', // Colore principale
          600: '#7c3aed', // Colore hover
          // ...
        },
      },
    },
  },
}
```

### Modificare il Lettore EPUB

Il lettore EPUB usa epub.js. Puoi personalizzarlo in `src/app/reader/[id]/page.tsx`:

```typescript
// Esempio: Aggiungere nuove impostazioni
const rendition = epubBook.renderTo(viewerRef.current, {
  width: '100%',
  height: '100%',
  spread: 'none',
  flow: 'paginated', // 'scrolled' per scroll verticale
  manager: 'default', // o 'continuous'
  // ...
})
```

### Aggiungere Altri Formati

Per aggiungere supporto per altri formati (es. MOBI):

1. Installa le librerie necessarie:
```bash
bun add mobi-converter
```

2. Crea una funzione di conversione:
```typescript
// lib/converters.ts
export async function convertMobiToEpub(mobiPath: string): Promise<string> {
  // Logica di conversione
  // Restituisce il path del file EPUB convertito
}
```

3. Aggiungi il supporto nell'API di upload:
```typescript
if (fileName.endsWith('.mobi')) {
  const epubPath = await convertMobiToEpub(filePath)
  // Usa il file EPUB
}
```

## 📊 API Documentation

### Books API

#### GET /api/books
Ottieni tutti i libri con filtri opzionali.

Query Parameters:
- `category`: `all | reading | completed | wishlist`
- `search`: stringa di ricerca

Response:
```json
{
  "books": [
    {
      "id": "cuid123",
      "title": "Book Title",
      "author": "Author Name",
      "description": "Description",
      "fileType": "epub",
      "fileSize": 1234567,
      "category": "reading",
      "addedAt": "2024-01-01T00:00:00.000Z",
      "progress": {
        "percentage": 45,
        "cfi": "epubcfi(/6/4[chap1ref]!/4/2/1:0)"
      }
    }
  ]
}
```

#### POST /api/books/upload
Carica un nuovo libro.

Request Body (multipart/form-data):
- `file`: File EPUB o PDF

Response:
```json
{
  "success": true,
  "book": {
    "id": "cuid123",
    "title": "Book Title",
    "author": "Author Name",
    // ...
  }
}
```

#### GET /api/books/[id]
Ottieni un libro specifico.

#### PUT /api/books/[id]
Aggiorna un libro.

Request Body:
```json
{
  "category": "reading",
  "title": "New Title",
  "author": "New Author"
}
```

#### DELETE /api/books/[id]
Elimina un libro.

### Progress API

#### GET /api/progress?bookId=[id]
Ottieni il progresso di lettura per un libro.

#### POST /api/progress
Salva o aggiorna il progresso di lettura.

Request Body:
```json
{
  "bookId": "cuid123",
  "percentage": 45.5,
  "cfi": "epubcfi(/6/4[chap1ref]!/4/2/1:0)",
  "lastPosition": "{\"cfi\":\"epubcfi(/6/4[chap1ref]!/4/2/1:0)\"}"
}
```

### Bookmarks API

#### GET /api/bookmarks?bookId=[id]
Ottieni tutti i segnalibri per un libro.

#### POST /api/bookmarks
Crea un nuovo segnalibro.

Request Body:
```json
{
  "bookId": "cuid123",
  "title": "Bookmark at 45%",
  "cfi": "epubcfi(/6/4[chap1ref]!/4/2/1:0)"
}
```

#### DELETE /api/bookmarks?id=[id]
Elimina un segnalibro.

### Highlights API

#### GET /api/highlights?bookId=[id]
Ottieni tutte le evidenziature per un libro.

#### POST /api/highlights
Crea una nuova evidenziatura.

Request Body:
```json
{
  "bookId": "cuid123",
  "text": "Highlighted text",
  "cfi": "epubcfi(/6/4[chap1ref]!/4/2/1:0)",
  "color": "#ffff00",
  "note": "Optional note"
}
```

#### DELETE /api/highlights?id=[id]
Elimina una evidenziatura.

### Shadow Library API

#### GET /api/shadowlib/annas-archive
Ottieni i mirror disponibili.

Query Parameters:
- `action`: `search | download`
- `q`: query di ricerca (per action=search)
- `md5`: hash MD5 (per action=download)

#### POST /api/shadowlib/annas-archive
Genera link di ricerca e istruzioni.

Request Body:
```json
{
  "title": "Book Title",
  "author": "Author Name"
}
```

## 🐛 Troubleshooting

### Problemi Comuni

#### Il lettore EPUB non si carica
- Controlla che il file sia un EPUB valido
- Verifica che il path del file sia corretto
- Controlla la console del browser per errori

#### I progressi non vengono salvati
- Verifica che il database sia scrivibile
- Controlla le permissions sul file `db/custom.db`
- Controlla la console per errori API

#### Upload fallisce
- Verifica che il file sia un EPUB o PDF valido
- Controlla le permissions della directory `public/uploads`
- Verifica che non sia stato superato il limite di dimensione del file

#### Il database SQLite si corrompe
- SQLite è robusto ma può corrompersi se il server crasha durante una scrittura
- Per produzione, considera PostgreSQL
- Fai regolarmente backup del file `db/custom.db`

### Backup e Restore

#### Backup
```bash
# Backup database
cp db/custom.db backups/custom.db.$(date +%Y%m%d)

# Backup uploads
tar -czf backups/uploads.$(date +%Y%m%d).tar.gz public/uploads
```

#### Restore
```bash
# Restore database
cp backups/custom.db.20240101 db/custom.db

# Restore uploads
tar -xzf backups/uploads.20240101.tar.gz -C public
```

## 🤝 Contribuire

Le contribuzioni sono benvenute!

1. Fork il repository
2. Crea un branch feature (`git checkout -b feature/AmazingFeature`)
3. Commit i cambiamenti (`git commit -m 'Add some AmazingFeature'`)
4. Push al branch (`git push origin feature/AmazingFeature`)
5. Apri una Pull Request

## 📄 License

Questo progetto è distribuito sotto la licenza MIT. Vedi il file LICENSE per maggiori dettagli.

## ⚠️ Disclaimer

LibriVault è un progetto open-source per la gestione di libri personali. L'uso di shadow libraries come Anna's Archive è a discrezione dell'utente e deve essere conforme alle leggi locali sul copyright.

**Gli sviluppatori di LibriVault non sono responsabili per l'uso improprio di questo software.**

## 🙏 Ringraziamenti

- [Next.js](https://nextjs.org/) - Il framework React
- [Tailwind CSS](https://tailwindcss.com/) - Il framework CSS
- [shadcn/ui](https://ui.shadcn.com/) - Componenti UI
- [EPUB.js](https://github.com/futurepress/epub.js) - Lettore EPUB
- [Prisma](https://www.prisma.io/) - ORM per database
- [Anna's Archive](https://annas-archive.pk/) - Shadow library (link esterno)

## 📞 Supporto

- **GitHub Issues**: [github.com/yourusername/librivault/issues](https://github.com/yourusername/librivault/issues)
- **Discussions**: [github.com/yourusername/librivault/discussions](https://github.com/yourusername/librivault/discussions)

---

**Creato con ❤️ per gli amanti dei libri**

Se ti piace questo progetto, considera di dargli una ⭐ su GitHub!
