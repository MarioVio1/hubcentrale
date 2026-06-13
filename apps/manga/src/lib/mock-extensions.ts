// Mock data for Keiyoushi extensions
// This provides a fallback when the repository is not accessible

import type { TachiyomiRepoIndex } from './tachiyomi-extension-service';

export const MOCK_KEIYOSHI_EXTENSIONS: TachiyomiRepoIndex = {
  version: 2,
  extensions: [
    {
      name: 'Tachiyomi: MangaWorld',
      pkg: 'eu.kanade.tachiyomi.extension.it.mangaworld',
      apk: 'tachiyomi-it-mangaworld-v1.4.27.apk',
      lang: 'it',
      code: 27,
      version: '1.4.27',
      nsfw: 0,
      icon: 'ic_launcher.webp',
      sources: [
        {
          id: 'mangaworld',
          lang: 'it',
          name: 'MangaWorld',
          baseUrl: 'https://www.mangaworld.mx',
        },
      ],
    },
    {
      name: 'Tachiyomi: MangaWorld Academy',
      pkg: 'eu.kanade.tachiyomi.extension.it.mangaworldacademy',
      apk: 'tachiyomi-it-mangaworldacademy-v1.4.27.apk',
      lang: 'it',
      code: 27,
      version: '1.4.27',
      nsfw: 1,
      icon: 'ic_launcher.webp',
      sources: [
        {
          id: 'mangaworld-academy',
          lang: 'it',
          name: 'MangaWorld Academy',
          baseUrl: 'https://www.mangaworld.mx/academy',
        },
      ],
    },
    {
      name: 'Tachiyomi: MangaWorld In',
      pkg: 'eu.kanade.tachiyomi.extension.it.mangaworldin',
      apk: 'tachiyomi-it-mangaworldin-v1.4.27.apk',
      lang: 'it',
      code: 27,
      version: '1.4.27',
      nsfw: 0,
      icon: 'ic_launcher.webp',
      sources: [
        {
          id: 'mangaworld-in',
          lang: 'it',
          name: 'MangaWorld IN',
          baseUrl: 'https://www.mangaworld.mx/in',
        },
      ],
    },
    {
      name: 'Tachiyomi: MangaDex',
      pkg: 'eu.kanade.tachiyomi.extension.all.mangadex',
      apk: 'tachiyomi-all-mangadex-v2.5.4.apk',
      lang: 'all',
      code: 254,
      version: '2.5.4',
      nsfw: 0,
      icon: 'ic_launcher.webp',
      sources: [
        {
          id: 'mangadex',
          lang: 'all',
          name: 'MangaDex',
          baseUrl: 'https://mangadex.org',
        },
      ],
    },
    {
      name: 'Tachiyomi: Bato.to',
      pkg: 'eu.kanade.tachiyomi.extension.all.batoto',
      apk: 'tachiyomi-all-batoto-v1.7.4.apk',
      lang: 'all',
      code: 174,
      version: '1.7.4',
      nsfw: 0,
      icon: 'ic_launcher.webp',
      sources: [
        {
          id: 'batoto',
          lang: 'all',
          name: 'Bato.to',
          baseUrl: 'https://bato.to',
        },
      ],
    },
    {
      name: 'Tachiyomi: Webtoons.com',
      pkg: 'eu.kanade.tachiyomi.extension.en.webtoons',
      apk: 'tachiyomi-en-webtoons-v1.4.17.apk',
      lang: 'en',
      code: 1417,
      version: '1.4.17',
      nsfw: 0,
      icon: 'ic_launcher.webp',
      sources: [
        {
          id: 'webtoons',
          lang: 'en',
          name: 'Webtoons.com',
          baseUrl: 'https://www.webtoons.com',
        },
      ],
    },
    {
      name: 'Tachiyomi: MangaFox',
      pkg: 'eu.kanade.tachiyomi.extension.en.mangafox',
      apk: 'tachiyomi-en-mangafox-v1.3.2.apk',
      lang: 'en',
      code: 132,
      version: '1.3.2',
      nsfw: 0,
      icon: 'ic_launcher.webp',
      sources: [
        {
          id: 'mangafox',
          lang: 'en',
          name: 'MangaFox',
          baseUrl: 'https://fanfox.net',
        },
      ],
    },
    {
      name: 'Tachiyomi: TuMangaOnline',
      pkg: 'eu.kanade.tachiyomi.extension.es.tumangaonline',
      apk: 'tachiyomi-es-tumangaonline-v3.7.1.apk',
      lang: 'es',
      code: 371,
      version: '3.7.1',
      nsfw: 0,
      icon: 'ic_launcher.webp',
      sources: [
        {
          id: 'tumangaonline',
          lang: 'es',
          name: 'TuMangaOnline',
          baseUrl: 'https://visortmo.com',
        },
      ],
    },
    {
      name: 'Tachiyomi: ComicK',
      pkg: 'eu.kanade.tachiyomi.extension.ja.comick',
      apk: 'tachiyomi-ja-comick-v1.2.6.apk',
      lang: 'ja',
      code: 126,
      version: '1.2.6',
      nsfw: 0,
      icon: 'ic_launcher.webp',
      sources: [
        {
          id: 'comick',
          lang: 'ja',
          name: 'ComicK',
          baseUrl: 'https://comick.io',
        },
      ],
    },
  ],
};
