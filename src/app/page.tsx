const sections = [
  { name: "Multimedia", sub: "CheRoba", href: "https://hub-multimedia.vercel.app", emoji: "🎬", color: "from-blue-900/40 to-blue-700/20" },
  { name: "Cosmetica", sub: "GlowAI", href: "https://hub-cosmetica.vercel.app", emoji: "💄", color: "from-pink-900/40 to-purple-700/20" },
  { name: "LibriFree", sub: "Libreria free", href: "https://hub-libri-murex.vercel.app", emoji: "📚", color: "from-green-900/40 to-green-700/20" },
  { name: "LunaStar", sub: "Game Hub", href: "https://hub-lunastar.vercel.app", emoji: "🎮", color: "from-purple-900/40 to-indigo-700/20" },
  { name: "Manga", sub: "Mangaflow", href: "https://hub-manga.vercel.app", emoji: "📖", color: "from-red-900/40 to-orange-700/20" },
  { name: "Pokémon", sub: "Veneto", href: "https://pokemona.vercel.app", emoji: "⚡", color: "from-teal-900/40 to-cyan-700/20" },
  { name: "LiveTV", sub: "DAMI TV", href: "https://hub-livetv.vercel.app", emoji: "📺", color: "from-yellow-900/40 to-amber-700/20" },
];

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-10 bg-[#141414] text-white">
      <h1 className="text-4xl md:text-5xl font-light mb-10 tracking-wide text-center">
        Dove vuoi entrare?
      </h1>

      <div className="flex flex-wrap justify-center gap-8 max-w-[900px]">
        {sections.map((s) => (
          <a
            key={s.name}
            href={s.href}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center no-underline text-[#808080] hover:text-white transition-colors w-[120px] md:w-[120px] sm:w-[90px] group"
          >
            <div
              className={`w-[120px] h-[120px] sm:w-[90px] sm:h-[90px] rounded-full flex items-center justify-center text-5xl sm:text-4xl border-3 border-transparent transition-all duration-200 bg-gradient-to-br ${s.color} group-hover:border-[#e5e5e5] group-hover:scale-105`}
            >
              {s.emoji}
            </div>
            <span className="mt-3 text-sm sm:text-xs text-center leading-tight">
              {s.name}
              <br />
              <small className="text-[0.75rem] text-[#666]">{s.sub}</small>
            </span>
          </a>
        ))}
      </div>

      <p className="mt-12 text-xs text-zinc-700 font-mono">Tutti i servizi sono su Vercel</p>
    </div>
  );
}
