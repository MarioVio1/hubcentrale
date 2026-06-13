# Fonti di Libri Implementate in ShadowKindle

## Riepilogo Totale: 14 Fonti di Libri

### 🟢 Download Diretto (3 fonti)
Queste fonti permettono il download immediato con un click.

| Fonte | Descrizione | Lingua | Note |
|-------|-------------|--------|------|
| **Project Gutenberg** | Libri di dominio pubblico | Multi | Grande libreria di classici |
| **LibGen** | Libri scientifici e accademici | Multi | Eccellente per testi universitari |
| **Z-Library** | Vasta collezione internazionale | Multi | Uno dei più grandi archivi |

### 🇮🇹 Fonti Italiane (3 fonti)
Specializzate in libri in lingua italiana.

| Fonte | Descrizione | Note |
|-------|-------------|------|
| **Liber Liber** | Archivio di classici italiani | Libri di dominio pubblico italiano |
| **EUREKAddl** | Libri italiani vari | Specializzato in libri in italiano |
| **EbookSpy** | Motore di ricerca eBook | Ricerca across multiple source |

### 🌐 Altre Fonti Internazionali (5 fonti)
Biblioteche digitali e cataloghi.

| Fonte | Descrizione | Lingua | Note |
|-------|-------------|--------|------|
| **Internet Archive** | Biblioteca digitale | Multi | Vasta collezione di libri in italiano |
| **ManyBooks** | Libri gratuiti | Multi | Formati vari (EPUB, PDF, MOBI) |
| **Feedbooks** | Libri di dominio pubblico | Multi | Catalogo ben organizzato |
| **Open Library** | Catalogo bibliotecario | Multi | API potente |
| **Google Books** | Anteprima libri | Multi | Previews e some full texts |

### ⚠️ Directory e Aggregatori (3 fonti)
Portali che raggruppano link a diverse risorse.

| Fonte | Descrizione | Note |
|-------|-------------|------|
| **Anna's Archive** | Shadow library | ⚠️ Verifica legalità locale |
| **Unblockit.date** | Directory di risorse | Eccellente per libri in inglese |
| **Unblocked** | Alternative mirror | Fallback per altri siti |

---

## Come Usare le Fonti

### 1. Download Diretto
- Cerca usando Project Gutenberg, LibGen o Z-Library
- Clicca il pulsante verde "Scarica"
- Il libro viene scaricato automaticamente

### 2. Fonti Italiane
- Attiva le fonti italiane (Liber Liber, EUREKAddl, EbookSpy)
- Cerca autori o titoli in italiano
- Clicca "Vedi e Scarica" per accedere alla pagina di download

### 3. Directory e Aggregatori
- Clicca "Apri Directory" o "Vedi e Scarica"
- Naviga nella pagina per trovare il link di download appropriato
- Segui le istruzioni della fonte originale

---

## Note Importanti

### Legale
- **⚠️ AVVERTENZA LEGALE:** Alcune fonti potrebbero contenere materiale protetto da copyright
- Verifica sempre la legalità del download nella tua giurisdizione
- L'utente è responsabile dell'uso delle fonti

### Compatibilità
- Tutte le fonti supportano i formati EPUB e/o PDF
- EPUB è il formato consigliato per i lettori di eBook
- I PDF sono supportati ma meno adatti alla lettura su eReader

### Performance
- Le ricerche sono eseguite in parallelo su tutte le fonti selezionate
- I risultati vengono deduplicati automaticamente
- Limite di 50 risultati per query per evitare tempi di attesa lunghi

---

## Dettagli Tecnici

### Moduli Implementati
- `/src/lib/book-sources/gutenberg.ts` - Project Gutenberg
- `/src/lib/book-sources/libgen.ts` - LibGen
- `/src/lib/book-sources/zlibrary.ts` - Z-Library
- `/src/lib/book-sources/liber-liber.ts` - Liber Liber
- `/src/lib/book-sources/eurekaddl.ts` - EUREKAddl
- `/src/lib/book-sources/ebookspy.ts` - EbookSpy
- `/src/lib/book-sources/internet-archive.ts` - Internet Archive
- `/src/lib/book-sources/manybooks.ts` - ManyBooks
- `/src/lib/book-sources/feedbooks.ts` - Feedbooks
- `/src/lib/book-sources/open-library.ts` - Open Library
- `/src/lib/book-sources/google-books.ts` - Google Books
- `/src/lib/book-sources/annas-archive.ts` - Anna's Archive
- `/src/lib/book-sources/unblocked.ts` - Unblockit.date

### Funzioni di Utilità
- `searchBooks()` - Cerca su tutte le fonti
- `getSourceLabel()` - Ottieni nome formattato della fonte
- `getSourceColor()` - Ottieni colore del badge
- `supportsDirectDownload()` - Controlla se supporta download diretto
- `isItalianSource()` - Controlla se è una fonte italiana
- `isDirectorySource()` - Controlla se è una directory

---

## Suggerimenti per l'Uso

### Per Libri Italiani
1. Attiva tutte le **Fonti Italiane**
2. Attiva **Internet Archive** (ha molti libri in italiano)
3. Cerca usando parole chiave in italiano

### Per Libri di Dominio Pubblico
1. Usa **Project Gutenberg** come fonte primaria
2. Controlla **Liber Liber** per classici italiani
3. **Internet Archive** ha molte opere non protette da copyright

### Per Libri Scientifici/Accademici
1. **LibGen** è la fonte migliore
2. **Z-Library** ha una vasta collezione scientifica
3. Controlla anche **Anna's Archive** come fallback

### Per Libri in Inglese
1. **Z-Library** ha la collezione più ampia
2. **Unblockit.date** è eccellente per risorse in inglese
3. **ManyBooks** e **Feedbooks** per libri gratuiti

---

## Futuri Sviluppi

Possibili miglioramenti:
- [ ] Aggiungere filtri per lingua
- [ ] Aggiungere filtri per formato (EPUB/PDF)
- [ ] Implementare sistema di preferenze personali
- [ ] Aggiungere valutazioni alle fonti
- [ ] Mostrare statistiche di affidabilità delle fonti
- [ ] Implementare cache per ridurre i tempi di risposta

---

## Supporto

Per problemi con una specifica fonte:
- Controlla se la fonte è accessibile nel tuo paese
- Alcune fonti potrebbero richiedere proxy o VPN
- Le fonti possono cambiare dominio periodicamente
- Usa più fonti contemporaneamente per massimizzare i risultati

---

**Ultimo aggiornamento:** 2026
**Versione:** 2.0
**Fonti totali:** 14
**Fonti italiane:** 3
**Download diretto:** 3
