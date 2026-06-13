import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

interface CategorySeed {
  name: string
  slug: string
  icon: string
  color: string
  sortOrder: number
  isVisible: boolean
}

interface ChannelSeed {
  title: string
  mpdUrl: string
  thumbnailUrl: string | null
  drmType: string | null
  drmKeyId: string | null
  drmKey: string | null
  categoryName: string
  player: string
}

const categories: CategorySeed[] = [
  { name: 'Nazionali', slug: 'nazionali', icon: '🇮🇹', color: '#ef4444', sortOrder: 1, isVisible: true },
  { name: 'Notizie', slug: 'notizie', icon: '📰', color: '#3b82f6', sortOrder: 2, isVisible: true },
  { name: 'Musicali', slug: 'musicali', icon: '🎵', color: '#a855f7', sortOrder: 3, isVisible: true },
  { name: 'Sportivi', slug: 'sportivi', icon: '⚽', color: '#22c55e', sortOrder: 4, isVisible: true },
  { name: 'Bambini', slug: 'bambini', icon: '👶', color: '#eab308', sortOrder: 5, isVisible: true },
  { name: 'Regionali', slug: 'regionali', icon: '📍', color: '#f97316', sortOrder: 6, isVisible: true },
  { name: 'Sport Premium', slug: 'sport-premium', icon: '👑', color: '#f59e0b', sortOrder: 7, isVisible: true },
  { name: 'Sport Estero', slug: 'sport-estero', icon: '🌍', color: '#14b8a6', sortOrder: 8, isVisible: true },
  { name: 'Francia', slug: 'francia', icon: '🇫🇷', color: '#2563eb', sortOrder: 9, isVisible: true },
  { name: 'Germania', slug: 'germania', icon: '🇩🇪', color: '#1e293b', sortOrder: 10, isVisible: true },
  { name: 'Regno Unito', slug: 'regno-unito', icon: '🇬🇧', color: '#dc2626', sortOrder: 11, isVisible: true },
  { name: 'Internazionali', slug: 'internazionali', icon: '🌐', color: '#6366f1', sortOrder: 12, isVisible: true },
]

const channels: ChannelSeed[] = [
  // ======================== CANALI.PHP ========================
  // ---- Nazionali ----
  { title: 'Rai 1', mpdUrl: 'https://raiuno3-live.akamaized.net/hls/live/2017910/raiuno3/raiuno3/rai1_2400/chunklist.m3u8', thumbnailUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/fa/Rai_1_-_Logo_2016.svg/3840px-Rai_1_-_Logo_2016.svg.png', drmType: null, drmKeyId: null, drmKey: null, categoryName: 'Nazionali', player: 'plyr' },
  { title: 'Rai 2', mpdUrl: 'https://raidue3-live.akamaized.net/hls/live/2017983/raidue3/raidue3/playlist.m3u8', thumbnailUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/99/Rai_2_-_Logo_2016.svg/330px-Rai_2_-_Logo_2016.svg.png', drmType: null, drmKeyId: null, drmKey: null, categoryName: 'Nazionali', player: 'plyr' },
  { title: 'Rai 3', mpdUrl: 'https://ilglobotv-live.akamaized.net/channels/RAI3/Live.m3u8', thumbnailUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Rai_3_-_Logo_2016.svg/250px-Rai_3_-_Logo_2016.svg.png', drmType: null, drmKeyId: null, drmKey: null, categoryName: 'Nazionali', player: 'plyr' },
  { title: 'Rete 4', mpdUrl: 'https://live02-seg.msf.cdn.mediaset.net/live/ch-r4/r4-clr.isml/index.m3u8', thumbnailUrl: 'https://upload.wikimedia.org/wikipedia/commons/c/c0/Rete_4_-_Logo_2018.svg', drmType: null, drmKeyId: null, drmKey: null, categoryName: 'Nazionali', player: 'plyr' },
  { title: 'Canale 5', mpdUrl: 'https://live02-seg.msf.cdn.mediaset.net/live/ch-c5/c5-clr.isml/index.m3u8', thumbnailUrl: 'https://upload.wikimedia.org/wikipedia/commons/0/02/Canale_5_-_2018_logo.svg', drmType: null, drmKeyId: null, drmKey: null, categoryName: 'Nazionali', player: 'plyr' },
  { title: 'Italia 1', mpdUrl: 'https://live02-seg.msf.cdn.mediaset.net/live/ch-i1/i1-clr.isml/index.m3u8', thumbnailUrl: 'https://upload.wikimedia.org/wikipedia/commons/c/cc/Italia_1_logo.svg', drmType: null, drmKeyId: null, drmKey: null, categoryName: 'Nazionali', player: 'plyr' },
  { title: 'La7', mpdUrl: 'https://jmp2.uk/stvp-ITBD1500002NL', thumbnailUrl: 'https://upload.wikimedia.org/wikipedia/commons/0/02/LA7_-_Logo_2011.svg', drmType: null, drmKeyId: null, drmKey: null, categoryName: 'Nazionali', player: 'plyr' },
  { title: 'TV8', mpdUrl: 'https://hlslive-web-gcdn-skycdn-it.akamaized.net/TACT/11223/tv8web/master.m3u8?hdnts=st=1764666351~exp=1829466206~acl=/*~hmac=b0e9165b6c55027903ad103c8219f363d8765eb300c0d9a339e9767fc3509556', thumbnailUrl: 'https://upload.wikimedia.org/wikipedia/commons/9/9a/TV8_logo.png', drmType: null, drmKeyId: null, drmKey: null, categoryName: 'Nazionali', player: 'plyr' },
  { title: 'Nove', mpdUrl: 'https://timlivetu0.cb.ticdn.it/Content/DASH/Live/channel(novehd)/manifest.mpd', thumbnailUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2d/Nove_-_Logo_2017.svg/1280px-Nove_-_Logo_2017.svg.png', drmType: 'clearkey', drmKeyId: '0031f2d547834954984a3129ce089065', drmKey: 'f7242c56586eae265cfc96e1efc1c3c6', categoryName: 'Nazionali', player: 'hls' },
  { title: 'Rai Italia', mpdUrl: 'https://ilglobotv-live.akamaized.net/channels/RAIItaliaSudAfrica/Live.m3u8', thumbnailUrl: 'https://seeklogo.com/images/R/rai-italia-logo-CD2B7BAB1A-seeklogo.com.png', drmType: null, drmKeyId: null, drmKey: null, categoryName: 'Nazionali', player: 'plyr' },
  { title: 'Mediaset Italia', mpdUrl: 'https://ilglobotv-live.akamaized.net/channels/MediasetItalia/Live.m3u8', thumbnailUrl: 'https://upload.wikimedia.org/wikipedia/commons/4/4b/Mediaset_Italia_%28TV_channel%29.png', drmType: null, drmKeyId: null, drmKey: null, categoryName: 'Nazionali', player: 'plyr' },
  { title: 'Gambero Rosso', mpdUrl: 'https://www.dailymotion.com/cdn/live/video/x9u215s.mpd?sec=3FE6qHnAR5mSywqiY3XmMw', thumbnailUrl: 'https://upload.wikimedia.org/wikipedia/it/2/21/Gambero_Rosso.png', drmType: null, drmKeyId: null, drmKey: null, categoryName: 'Nazionali', player: 'plyr' },
  { title: '20', mpdUrl: 'https://live02-seg.msf.cdn.mediaset.net/live/ch-lb/lb-clr.isml/index.m3u8', thumbnailUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/70/20_Mediaset.svg/330px-20_Mediaset.svg.png', drmType: null, drmKeyId: null, drmKey: null, categoryName: 'Nazionali', player: 'plyr' },
  { title: 'Rai 4', mpdUrl: 'https://mediapolis.rai.it/relinker/relinkerServlet.htm?cont=746966&output=7&forceUserAgent=raiplayappletv', thumbnailUrl: 'https://upload.wikimedia.org/wikipedia/commons/4/4d/Rai_4_-_Logo_2016.svg', drmType: null, drmKeyId: null, drmKey: null, categoryName: 'Nazionali', player: 'plyr' },
  { title: 'Iris', mpdUrl: 'https://live02-seg.msf.cdn.mediaset.net/live/ch-ki/ki-clr.isml/index.m3u8', thumbnailUrl: 'https://upload.wikimedia.org/wikipedia/commons/5/51/Iris_-_Logo_2013.svg', drmType: null, drmKeyId: null, drmKey: null, categoryName: 'Nazionali', player: 'plyr' },
  { title: 'Rai 5', mpdUrl: 'https://raicinque1-dash-live.akamaized.net/dash/live/664003/raicinque1/manifest.mpd', thumbnailUrl: 'https://upload.wikimedia.org/wikipedia/commons/f/f8/Rai_5_-_Logo_2017.svg', drmType: null, drmKeyId: null, drmKey: null, categoryName: 'Nazionali', player: 'plyr' },
  { title: 'Rai Movie', mpdUrl: 'https://raimovie1-dash-live.akamaized.net/dash/live/663983/raimovie1/manifest.mpd', thumbnailUrl: 'https://upload.wikimedia.org/wikipedia/commons/6/61/Rai_Movie_-_Logo_2017.svg', drmType: null, drmKeyId: null, drmKey: null, categoryName: 'Nazionali', player: 'plyr' },
  { title: 'Rai Premium', mpdUrl: 'https://raipremium1-dash-live.akamaized.net/dash/live/663979/raipremium1/manifest.mpd', thumbnailUrl: 'https://upload.wikimedia.org/wikipedia/commons/a/ad/Rai_Premium_-_Logo_2017.svg', drmType: null, drmKeyId: null, drmKey: null, categoryName: 'Nazionali', player: 'plyr' },
  { title: 'Cielo TV', mpdUrl: 'https://hlslive-web-gcdn-skycdn-it.akamaized.net/TACT/11219/cieloweb/master.m3u8?hdnts=st=1764666351~exp=1829466206~acl=/*~hmac=b0e9165b6c55027903ad103c8219f363d8765eb300c0d9a339e9767fc3509556', thumbnailUrl: 'https://upload.wikimedia.org/wikipedia/commons/f/f2/Cielo_TV_logo_2013.svg', drmType: null, drmKeyId: null, drmKey: null, categoryName: 'Nazionali', player: 'plyr' },
  { title: '27', mpdUrl: 'https://live02-seg.msf.cdn.mediaset.net/live/ch-ts/ts-clr.isml/index.m3u8', thumbnailUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/26/Twentyseven_logo.svg/330px-Twentyseven_logo.svg.png', drmType: null, drmKeyId: null, drmKey: null, categoryName: 'Nazionali', player: 'plyr' },
  { title: 'TV 2000', mpdUrl: 'https://hls-live-tv2000.akamaized.net/hls/live/2028510/tv2000/master.m3u8', thumbnailUrl: 'https://upload.wikimedia.org/wikipedia/it/thumb/0/0d/Logo_tv2000_2015.svg/960px-Logo_tv2000_2015.svg.png', drmType: null, drmKeyId: null, drmKey: null, categoryName: 'Nazionali', player: 'plyr' },
  { title: 'LA7 Cinema (LA7d)', mpdUrl: 'https://d15umi5iaezxgx.cloudfront.net/LA7D/DRM/DASH/Live.mpd', thumbnailUrl: 'https://upload.wikimedia.org/wikipedia/commons/8/8b/LA7d_%282024%29.svg', drmType: 'clearkey', drmKeyId: 'a2b202e78a244da6876d5adbcf5d6a75', drmKey: '88c5efd5d7e49194cd780e773318f69d', categoryName: 'Nazionali', player: 'hls' },
  { title: 'La 5', mpdUrl: 'https://live02-seg.msf.cdn.mediaset.net/live/ch-ka/ka-clr.isml/index.m3u8', thumbnailUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/da/La5_Mediaset.svg/960px-La5_Mediaset.svg.png', drmType: null, drmKeyId: null, drmKey: null, categoryName: 'Nazionali', player: 'plyr' },
  { title: 'Realtime', mpdUrl: 'https://timlivetu0.cb.ticdn.it/Content/DASH/Live/channel(realtimehd)/manifest.mpd', thumbnailUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7a/Real_Time_logo.svg/1280px-Real_Time_logo.svg.png', drmType: 'clearkey', drmKeyId: 'caf42465d9234a38ac88266f41ec7166', drmKey: 'fbe063fb052090f029e43beb872e3025', categoryName: 'Nazionali', player: 'hls' },
  { title: 'Food', mpdUrl: 'https://timlivetu0.cb.ticdn.it/Content/DASH/Live/channel(foodnetworkhd)/manifest.mpd', thumbnailUrl: 'https://upload.wikimedia.org/wikipedia/commons/f/f9/Food_Network_New_Logo.png', drmType: 'clearkey', drmKeyId: 'be51c5f92caf46beb3bb08e87adc9ef7', drmKey: 'd2906cbd3693cd47300b5b7620075a80', categoryName: 'Nazionali', player: 'hls' },
  { title: 'Cine34', mpdUrl: 'https://live02-seg.msf.cdn.mediaset.net/live/ch-b6/b6-clr.isml/index.m3u8', thumbnailUrl: 'https://upload.wikimedia.org/wikipedia/commons/d/d7/Cine34_logo.svg', drmType: null, drmKeyId: null, drmKey: null, categoryName: 'Nazionali', player: 'plyr' },
  { title: 'FOCUS', mpdUrl: 'https://live02-seg.msf.cdn.mediaset.net/live/ch-fu/fu-clr.isml/index.m3u8', thumbnailUrl: 'https://upload.wikimedia.org/wikipedia/commons/d/d0/Focus_channel.png', drmType: null, drmKeyId: null, drmKey: null, categoryName: 'Nazionali', player: 'plyr' },
  { title: 'Discovery (Warner TV)', mpdUrl: 'https://timlivetu0.cb.ticdn.it/Content/DASH/Live/channel(warnertv)/manifest.mpd', thumbnailUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f9/Warner_TV_logo.svg/3840px-Warner_TV_logo.svg.png', drmType: 'clearkey', drmKeyId: '9472e480a6e0451e82038792f4b5e065', drmKey: 'd731ffd8e16fbd1ed58f78334c9a9582', categoryName: 'Nazionali', player: 'hls' },
  { title: 'Giallo', mpdUrl: 'https://timlivetu0.cb.ticdn.it/Content/DASH/Live/channel(giallo)/manifest.mpd', thumbnailUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/Giallo_-_Logo_2014.svg/3840px-Giallo_-_Logo_2014.svg.png', drmType: 'clearkey', drmKeyId: '97cbb06a1ff34f2d918af98a31ad8d91', drmKey: '38914e9b063e6d8ec17975c528854e2f', categoryName: 'Nazionali', player: 'hls' },
  { title: 'Top Crime', mpdUrl: 'https://live02-seg.msf.cdn.mediaset.net/live/ch-lt/lt-clr.isml/index.m3u8', thumbnailUrl: 'https://upload.wikimedia.org/wikipedia/commons/e/e3/Top_Crime_-_Logo_2013.svg', drmType: null, drmKeyId: null, drmKey: null, categoryName: 'Nazionali', player: 'plyr' },
  { title: 'Italia 2', mpdUrl: 'https://live02-seg.msf.cdn.mediaset.net/live/ch-i2/i2-clr.isml/index.m3u8', thumbnailUrl: 'https://upload.wikimedia.org/wikipedia/commons/c/c5/Logo_Italia2.svg', drmType: null, drmKeyId: null, drmKey: null, categoryName: 'Nazionali', player: 'plyr' },
  { title: 'DMAX', mpdUrl: 'https://timlivetu0.cb.ticdn.it/Content/DASH/Live/channel(dmaxhd)/manifest.mpd', thumbnailUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4f/DMAX_-_Logo_2016.svg/960px-DMAX_-_Logo_2016.svg.png', drmType: 'clearkey', drmKeyId: '5ed566ba4ab844ff82e286578c524f1d', drmKey: '5282adabb806830cd7360d5b87ec118a', categoryName: 'Nazionali', player: 'hls' },
  { title: 'Rai Storia', mpdUrl: 'https://raistoria1-dash-live.akamaized.net/dash/live/663959/raistoria1/manifest.mpd', thumbnailUrl: 'https://upload.wikimedia.org/wikipedia/commons/f/f8/Rai_Storia_-_Logo_2017.svg', drmType: null, drmKeyId: null, drmKey: null, categoryName: 'Nazionali', player: 'plyr' },
  { title: 'Mediaset Extra', mpdUrl: 'https://live02-seg.msf.cdn.mediaset.net/live/ch-kq/kq-clr.isml/index.m3u8', thumbnailUrl: 'https://upload.wikimedia.org/wikipedia/commons/e/e3/Mediaset_Extra_logo.svg', drmType: null, drmKeyId: null, drmKey: null, categoryName: 'Nazionali', player: 'plyr' },
  { title: 'HGTV', mpdUrl: 'https://timlivetu0.cb.ticdn.it/Content/DASH/Live/channel(hgtvhd)/manifest.mpd', thumbnailUrl: 'https://upload.wikimedia.org/wikipedia/commons/0/05/HGTV_logo.png', drmType: 'clearkey', drmKeyId: 'e188d1cf542b4d1fa22546b07d86df60', drmKey: '07b6823e46630ad0e83f964db8d1ea79', categoryName: 'Nazionali', player: 'hls' },
  { title: 'Turbo', mpdUrl: 'https://timlivetu0.cb.ticdn.it/Content/DASH/Live/channel(motortrendhd)/manifest.mpd', thumbnailUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ec/Discovery_Turbo_logo.svg/3840px-Discovery_Turbo_logo.svg.png', drmType: 'clearkey', drmKeyId: 'b1f533e2ee35459e9be2d0ef1e2b61ab', drmKey: '749bd263e98796fbaf739088862de387', categoryName: 'Nazionali', player: 'hls' },
  { title: 'Senato TV', mpdUrl: 'https://senato-live.morescreens.com/SENATO_1_001/playlist.m3u8', thumbnailUrl: null, drmType: null, drmKeyId: null, drmKey: null, categoryName: 'Nazionali', player: 'plyr' },
  { title: 'Camera dei Deputati', mpdUrl: 'https://video-ar.radioradicale.it/diretta/camera2/playlist.m3u8', thumbnailUrl: null, drmType: null, drmKeyId: null, drmKey: null, categoryName: 'Nazionali', player: 'plyr' },
  { title: 'Rai 4K', mpdUrl: 'https://raievent10-elem-live.akamaized.net/hls/live/619189/raievent10/raievent10/playlist.m3u8', thumbnailUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/ad/Rai_4K_-_Logo_2016.svg/250px-Rai_4K_-_Logo_2016.svg.png', drmType: null, drmKeyId: null, drmKey: null, categoryName: 'Nazionali', player: 'plyr' },
  { title: 'GF Regia 1', mpdUrl: 'https://live02-seg.msf.cdn.mediaset.net/live/ch-b7/b7-clr.isml/index.m3u8', thumbnailUrl: 'https://upload.wikimedia.org/wikipedia/it/archive/a/a6/20230823190003%21Grande_Fratello_logo.png', drmType: null, drmKeyId: null, drmKey: null, categoryName: 'Nazionali', player: 'plyr' },
  { title: 'GF Regia 2', mpdUrl: 'https://live02-seg.msf.cdn.mediaset.net/live/ch-b8/b8-clr.isml/index.m3u8', thumbnailUrl: 'https://upload.wikimedia.org/wikipedia/it/archive/a/a6/20230823190003%21Grande_Fratello_logo.png', drmType: null, drmKeyId: null, drmKey: null, categoryName: 'Nazionali', player: 'plyr' },
  { title: 'GF 1 ora fa', mpdUrl: 'https://live02-seg.msf.cdn.mediaset.net/live/ch-b9/b9-clr.isml/index.m3u8', thumbnailUrl: 'https://upload.wikimedia.org/wikipedia/it/archive/a/a6/20230823190003%21Grande_Fratello_logo.png', drmType: null, drmKeyId: null, drmKey: null, categoryName: 'Nazionali', player: 'plyr' },

  // ---- Notizie ----
  { title: 'ADN 24', mpdUrl: 'https://64b16f23efbee.streamlock.net/adn24tv/adn24tv/chunklist_w942000025.m3u8', thumbnailUrl: null, drmType: null, drmKeyId: null, drmKey: null, categoryName: 'Notizie', player: 'plyr' },
  { title: 'Rai News 24', mpdUrl: 'https://d27wu3gni4gipu.cloudfront.net/v1/master/3722c60a815c199d9c0ef36c5b73da68a62b09d1/cc-7i6bsjw4lfg88/ABCD/Rai/RaiNews24_IT/rainews1/playlist.m3u8', thumbnailUrl: 'https://upload.wikimedia.org/wikipedia/commons/a/a1/Rai_News_24_logo_%282022%29.svg', drmType: null, drmKeyId: null, drmKey: null, categoryName: 'Notizie', player: 'plyr' },
  { title: 'Sky TG24', mpdUrl: 'https://hlslive-web-gcdn-skycdn-it.akamaized.net/TACT/12221/web/master.m3u8?hdnts=st=1764666351~exp=1829466206~acl=/*~hmac=b0e9165b6c55027903ad103c8219f363d8765eb300c0d9a339e9767fc3509556', thumbnailUrl: 'https://upload.wikimedia.org/wikipedia/commons/4/46/Sky_TG24_logo.svg', drmType: null, drmKeyId: null, drmKey: null, categoryName: 'Notizie', player: 'plyr' },
  { title: 'TGCOM 24', mpdUrl: 'https://live02-seg.msf.cdn.mediaset.net/live/ch-kf/kf-clr.isml/index.m3u8', thumbnailUrl: 'https://upload.wikimedia.org/wikipedia/it/1/1a/Mediaset_TGCom24.png', drmType: null, drmKeyId: null, drmKey: null, categoryName: 'Notizie', player: 'plyr' },
  { title: 'Class CNBC', mpdUrl: 'https://www.dailymotion.com/cdn/live/video/x91c8ww.m3u8?sec=D9OwEfHs-e7O6pQ-qlnROg', thumbnailUrl: 'https://upload.wikimedia.org/wikipedia/commons/8/8d/Class_CNBC_2026.svg', drmType: null, drmKeyId: null, drmKey: null, categoryName: 'Notizie', player: 'plyr' },
  { title: 'TG Norba 24', mpdUrl: 'https://live-telenorba.cdn.netrw.it/telenorba/hls/ccr/tgnorba/master.m3u8?start=now-1h&end=now', thumbnailUrl: 'https://upload.wikimedia.org/wikipedia/commons/1/15/Tg_norba24.png', drmType: null, drmKeyId: null, drmKey: null, categoryName: 'Notizie', player: 'plyr' },
  // Rai TGR channels (dynamic scraping - using base relay URL)
  { title: 'Rai BG Italia', mpdUrl: 'https://mediapolis.rai.it/relinker/relinkerServlet.htm?cont=default&output=7', thumbnailUrl: 'https://upload.wikimedia.org/wikipedia/it/thumb/a/a6/TGR_logo.svg/960px-TGR_logo.svg.png', drmType: null, drmKeyId: null, drmKey: null, categoryName: 'Notizie', player: 'plyr' },
  { title: 'Rai TGR Campania', mpdUrl: 'https://mediapolis.rai.it/relinker/relinkerServlet.htm?cont=default&output=7', thumbnailUrl: 'https://upload.wikimedia.org/wikipedia/it/thumb/a/a6/TGR_logo.svg/960px-TGR_logo.svg.png', drmType: null, drmKeyId: null, drmKey: null, categoryName: 'Notizie', player: 'plyr' },
  { title: 'Rai TGR Lombardia', mpdUrl: 'https://mediapolis.rai.it/relinker/relinkerServlet.htm?cont=default&output=7', thumbnailUrl: 'https://upload.wikimedia.org/wikipedia/it/thumb/a/a6/TGR_logo.svg/960px-TGR_logo.svg.png', drmType: null, drmKeyId: null, drmKey: null, categoryName: 'Notizie', player: 'plyr' },
  { title: 'Rai TGR Liguria', mpdUrl: 'https://mediapolis.rai.it/relinker/relinkerServlet.htm?cont=default&output=7', thumbnailUrl: 'https://upload.wikimedia.org/wikipedia/it/thumb/a/a6/TGR_logo.svg/960px-TGR_logo.svg.png', drmType: null, drmKeyId: null, drmKey: null, categoryName: 'Notizie', player: 'plyr' },
  { title: 'Rai TGR Sicilia', mpdUrl: 'https://mediapolis.rai.it/relinker/relinkerServlet.htm?cont=default&output=7', thumbnailUrl: 'https://upload.wikimedia.org/wikipedia/it/thumb/a/a6/TGR_logo.svg/960px-TGR_logo.svg.png', drmType: null, drmKeyId: null, drmKey: null, categoryName: 'Notizie', player: 'plyr' },
  { title: 'Rai TGR Veneto', mpdUrl: 'https://mediapolis.rai.it/relinker/relinkerServlet.htm?cont=default&output=7', thumbnailUrl: 'https://upload.wikimedia.org/wikipedia/it/thumb/a/a6/TGR_logo.svg/960px-TGR_logo.svg.png', drmType: null, drmKeyId: null, drmKey: null, categoryName: 'Notizie', player: 'plyr' },
  { title: 'Rai TGR Trento', mpdUrl: 'https://mediapolis.rai.it/relinker/relinkerServlet.htm?cont=default&output=7', thumbnailUrl: 'https://upload.wikimedia.org/wikipedia/it/thumb/a/a6/TGR_logo.svg/960px-TGR_logo.svg.png', drmType: null, drmKeyId: null, drmKey: null, categoryName: 'Notizie', player: 'plyr' },
  { title: "Rai TGR Valle D'Aosta", mpdUrl: 'https://mediapolis.rai.it/relinker/relinkerServlet.htm?cont=default&output=7', thumbnailUrl: 'https://upload.wikimedia.org/wikipedia/it/thumb/a/a6/TGR_logo.svg/960px-TGR_logo.svg.png', drmType: null, drmKeyId: null, drmKey: null, categoryName: 'Notizie', player: 'plyr' },
  { title: 'Rai TGR Lazio', mpdUrl: 'https://mediapolis.rai.it/relinker/relinkerServlet.htm?cont=default&output=7', thumbnailUrl: 'https://upload.wikimedia.org/wikipedia/it/thumb/a/a6/TGR_logo.svg/960px-TGR_logo.svg.png', drmType: null, drmKeyId: null, drmKey: null, categoryName: 'Notizie', player: 'plyr' },
  { title: 'Rai TGR Piemonte', mpdUrl: 'https://mediapolis.rai.it/relinker/relinkerServlet.htm?cont=default&output=7', thumbnailUrl: 'https://upload.wikimedia.org/wikipedia/it/thumb/a/a6/TGR_logo.svg/960px-TGR_logo.svg.png', drmType: null, drmKeyId: null, drmKey: null, categoryName: 'Notizie', player: 'plyr' },
  { title: 'Rai TGR Puglia', mpdUrl: 'https://mediapolis.rai.it/relinker/relinkerServlet.htm?cont=default&output=7', thumbnailUrl: 'https://upload.wikimedia.org/wikipedia/it/thumb/a/a6/TGR_logo.svg/960px-TGR_logo.svg.png', drmType: null, drmKeyId: null, drmKey: null, categoryName: 'Notizie', player: 'plyr' },
  { title: 'Rai TGR Abruzzo', mpdUrl: 'https://mediapolis.rai.it/relinker/relinkerServlet.htm?cont=default&output=7', thumbnailUrl: 'https://upload.wikimedia.org/wikipedia/it/thumb/a/a6/TGR_logo.svg/960px-TGR_logo.svg.png', drmType: null, drmKeyId: null, drmKey: null, categoryName: 'Notizie', player: 'plyr' },
  { title: 'Rai TGR Emilia Romagna', mpdUrl: 'https://mediapolis.rai.it/relinker/relinkerServlet.htm?cont=default&output=7', thumbnailUrl: 'https://upload.wikimedia.org/wikipedia/it/thumb/a/a6/TGR_logo.svg/960px-TGR_logo.svg.png', drmType: null, drmKeyId: null, drmKey: null, categoryName: 'Notizie', player: 'plyr' },
  { title: 'Rai TGR Marche', mpdUrl: 'https://mediapolis.rai.it/relinker/relinkerServlet.htm?cont=default&output=7', thumbnailUrl: 'https://upload.wikimedia.org/wikipedia/it/thumb/a/a6/TGR_logo.svg/960px-TGR_logo.svg.png', drmType: null, drmKeyId: null, drmKey: null, categoryName: 'Notizie', player: 'plyr' },
  { title: 'Rai TGR Toscana', mpdUrl: 'https://mediapolis.rai.it/relinker/relinkerServlet.htm?cont=default&output=7', thumbnailUrl: 'https://upload.wikimedia.org/wikipedia/it/thumb/a/a6/TGR_logo.svg/960px-TGR_logo.svg.png', drmType: null, drmKeyId: null, drmKey: null, categoryName: 'Notizie', player: 'plyr' },
  { title: 'Rai TGR Umbria', mpdUrl: 'https://mediapolis.rai.it/relinker/relinkerServlet.htm?cont=default&output=7', thumbnailUrl: 'https://upload.wikimedia.org/wikipedia/it/thumb/a/a6/TGR_logo.svg/960px-TGR_logo.svg.png', drmType: null, drmKeyId: null, drmKey: null, categoryName: 'Notizie', player: 'plyr' },
  { title: 'Rai TGR Calabria', mpdUrl: 'https://mediapolis.rai.it/relinker/relinkerServlet.htm?cont=default&output=7', thumbnailUrl: 'https://upload.wikimedia.org/wikipedia/it/thumb/a/a6/TGR_logo.svg/960px-TGR_logo.svg.png', drmType: null, drmKeyId: null, drmKey: null, categoryName: 'Notizie', player: 'plyr' },
  { title: 'Rai TGR Sardegna', mpdUrl: 'https://mediapolis.rai.it/relinker/relinkerServlet.htm?cont=default&output=7', thumbnailUrl: 'https://upload.wikimedia.org/wikipedia/it/thumb/a/a6/TGR_logo.svg/960px-TGR_logo.svg.png', drmType: null, drmKeyId: null, drmKey: null, categoryName: 'Notizie', player: 'plyr' },

  // ---- Musicali ----
  { title: 'Rai Radio 2', mpdUrl: 'https://visualradiodue3-live.akamaized.net/hls/live/2034078/visualradiodue3/visualradiodue3/visualradio2_2400/chunklist.m3u8', thumbnailUrl: 'https://upload.wikimedia.org/wikipedia/commons/f/fd/Rai_Radio_2_-_Logo_2017.svg', drmType: null, drmKeyId: null, drmKey: null, categoryName: 'Musicali', player: 'plyr' },
  { title: 'Kiss Kiss TV', mpdUrl: 'https://kk.fluid.stream/KKMulti/smil:KissKissTV.smil/chunklist_w1533852618_b3128000_slita.m3u8?FLID=1', thumbnailUrl: null, drmType: null, drmKeyId: null, drmKey: null, categoryName: 'Musicali', player: 'plyr' },
  { title: 'Radio 105 TV', mpdUrl: 'https://live02-seg.msr.cdn.mediaset.net/live/ch-ec/ec-clr.isml/index.m3u8', thumbnailUrl: 'https://upload.wikimedia.org/wikipedia/commons/9/97/Radio_105_italy_2023.png', drmType: null, drmKeyId: null, drmKey: null, categoryName: 'Musicali', player: 'plyr' },
  { title: 'R101 TV', mpdUrl: 'https://live02-seg.msr.cdn.mediaset.net/live/ch-er/er-clr.isml/index.m3u8', thumbnailUrl: 'https://upload.wikimedia.org/wikipedia/commons/f/f3/Logo_R101_Wiki.jpg', drmType: null, drmKeyId: null, drmKey: null, categoryName: 'Musicali', player: 'plyr' },
  { title: 'Deejay TV', mpdUrl: 'https://4c4b867c89244861ac216426883d1ad0.msvdn.net/live/S85984808/sMO0tz9Sr2Rk/playlist.m3u8', thumbnailUrl: 'https://upload.wikimedia.org/wikipedia/en/f/f9/DeeJay_TV.svg', drmType: null, drmKeyId: null, drmKey: null, categoryName: 'Musicali', player: 'plyr' },
  { title: 'RadioItaliaTV', mpdUrl: 'https://radioitaliatv.akamaized.net/hls/live/2093117/RadioitaliaTV/master.m3u8', thumbnailUrl: null, drmType: null, drmKeyId: null, drmKey: null, categoryName: 'Musicali', player: 'plyr' },
  { title: 'RadioFreccia', mpdUrl: 'https://dd782ed59e2a4e86aabf6fc508674b59.msvdn.net/live/S3160845/0tuSetc8UFkF/playlist_video.m3u8', thumbnailUrl: 'https://upload.wikimedia.org/wikipedia/commons/b/b1/Logo-freccia-no-claim-black.png', drmType: null, drmKeyId: null, drmKey: null, categoryName: 'Musicali', player: 'plyr' },
  { title: 'RDS Social TV', mpdUrl: 'https://stream.rdstv.radio/index.m3u8', thumbnailUrl: null, drmType: null, drmKeyId: null, drmKey: null, categoryName: 'Musicali', player: 'plyr' },
  { title: 'Radio ZETA', mpdUrl: 'https://dd782ed59e2a4e86aabf6fc508674b59.msvdn.net/live/S9346184/XEx1LqlYbNic/playlist_video.m3u8', thumbnailUrl: null, drmType: null, drmKeyId: null, drmKey: null, categoryName: 'Musicali', player: 'plyr' },
  { title: 'Radio TV Serie A', mpdUrl: 'https://tr.legaseriea-live1.cdn.netrw.it/seriea/restreamer/seriea_client/gpu-a-c0-8/restreamer/outgest/84d19a87-f82f-4aa2-80cd-2ab1105eac79/manifest.m3u8', thumbnailUrl: null, drmType: null, drmKeyId: null, drmKey: null, categoryName: 'Musicali', player: 'plyr' },
  { title: 'RTL 102.5', mpdUrl: 'https://dd782ed59e2a4e86aabf6fc508674b59.msvdn.net/live/S97044836/tbbP8T1ZRPBL/playlist_video.m3u8', thumbnailUrl: 'https://upload.wikimedia.org/wikipedia/commons/0/0e/RTL_102.5_logo.svg', drmType: null, drmKeyId: null, drmKey: null, categoryName: 'Musicali', player: 'plyr' },
  { title: 'RTL 102.5 NEWS', mpdUrl: 'https://dd782ed59e2a4e86aabf6fc508674b59.msvdn.net/live/S38122967/2lyQRIAAGgRR/playlist_video.m3u8', thumbnailUrl: null, drmType: null, drmKeyId: null, drmKey: null, categoryName: 'Musicali', player: 'plyr' },
  { title: 'Radio Montecarlo TV', mpdUrl: 'https://live02-seg.msr.cdn.mediaset.net/live/ch-bb/bb-clr.isml/index.m3u8', thumbnailUrl: null, drmType: null, drmKeyId: null, drmKey: null, categoryName: 'Musicali', player: 'plyr' },
  { title: 'Virgin Radio TV', mpdUrl: 'https://live02-seg.msr.cdn.mediaset.net/live/ch-ew/ew-clr.isml/index.m3u8', thumbnailUrl: null, drmType: null, drmKeyId: null, drmKey: null, categoryName: 'Musicali', player: 'plyr' },
  { title: 'Radio 51 Tv', mpdUrl: 'https://59d7d6f47d7fc.streamlock.net/canale51/canale51/chunklist_w1193883900.m3u8', thumbnailUrl: null, drmType: null, drmKeyId: null, drmKey: null, categoryName: 'Musicali', player: 'plyr' },
  { title: 'Radio Birikina Tv', mpdUrl: 'https://tvd-bk.fluid.stream/RadioBirikinaTV/livestream/chunklist_w84398277.m3u8', thumbnailUrl: null, drmType: null, drmKeyId: null, drmKey: null, categoryName: 'Musicali', player: 'plyr' },
  { title: 'Radio Bruno Tv', mpdUrl: 'https://router.xdevel.com/video0s975758-473/stream/playlist.m3u8', thumbnailUrl: null, drmType: null, drmKeyId: null, drmKey: null, categoryName: 'Musicali', player: 'plyr' },
  { title: 'Radio Libertà', mpdUrl: 'https://router.xdevel.com/video0s975360-67/stream/playlist_dvr.m3u8', thumbnailUrl: null, drmType: null, drmKeyId: null, drmKey: null, categoryName: 'Musicali', player: 'plyr' },
  { title: 'Radio m2o Tv', mpdUrl: 'https://4c4b867c89244861ac216426883d1ad0.msvdn.net/live/S62628868/uhdWBlkC1AoO/playlist.m3u8', thumbnailUrl: null, drmType: null, drmKeyId: null, drmKey: null, categoryName: 'Musicali', player: 'plyr' },
  { title: 'Radio Norba Tv', mpdUrl: 'https://router.xdevel.com/video0s975885-462/stream/playlist_dvr.m3u8', thumbnailUrl: null, drmType: null, drmKeyId: null, drmKey: null, categoryName: 'Musicali', player: 'plyr' },
  { title: 'Radio Piter Pan Tv', mpdUrl: 'https://tvd-piter.fluid.stream/RadioPiterpanTV/livestream/chunklist_w1866496033.m3u8', thumbnailUrl: null, drmType: null, drmKeyId: null, drmKey: null, categoryName: 'Musicali', player: 'plyr' },
  { title: 'Bella Radio Tv', mpdUrl: 'https://server.bellaradio.it:1443/live/bellaradiotv/playlist.m3u8', thumbnailUrl: null, drmType: null, drmKeyId: null, drmKey: null, categoryName: 'Musicali', player: 'plyr' },
  { title: 'Ibiza Tv', mpdUrl: 'https://str48.fluid.stream/RadioIbizaTV/livestream/chunklist_w1850866745.m3u8?FLID=1', thumbnailUrl: null, drmType: null, drmKeyId: null, drmKey: null, categoryName: 'Musicali', player: 'plyr' },

  // ---- Sportivi ----
  { title: 'Italian Fishing TV', mpdUrl: 'https://fms.premio.link/fishingtv/tracks-v1a1/mono.m3u8', thumbnailUrl: null, drmType: null, drmKeyId: null, drmKey: null, categoryName: 'Sportivi', player: 'plyr' },
  { title: 'Sportitalia HD', mpdUrl: 'https://edge-003.streamup.eu/sportitalia/sihd_abr2/sportitalia/sihd_1080p/chunks.m3u8', thumbnailUrl: 'https://upload.wikimedia.org/wikipedia/it/c/c0/Sportitalia_Logo.JPG', drmType: null, drmKeyId: null, drmKey: null, categoryName: 'Sportivi', player: 'plyr' },
  { title: 'Sportitalia SOLO CALCIO', mpdUrl: 'https://distribution.sportitalialive.it/sportitalia/sisolocalcio_abr/playlist.m3u8', thumbnailUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/36/SI_Solo_Calcio_logo_%282019%29.svg/500px-SI_Solo_Calcio_logo_%282019%29.svg.png', drmType: null, drmKeyId: null, drmKey: null, categoryName: 'Sportivi', player: 'plyr' },
  { title: 'Primavera TV', mpdUrl: 'https://distribution.sportitalialive.it/sportitalia/silive24_abr/playlist.m3u8', thumbnailUrl: 'https://www.sportitalia.it/wp-content/uploads/2024/08/primaveratv.jpg', drmType: null, drmKeyId: null, drmKey: null, categoryName: 'Sportivi', player: 'plyr' },
  { title: 'SuperTennis', mpdUrl: 'https://live-embed.supertennix.hiway.media/restreamer/supertennix_client/gpu-a-c0-16/restreamer/outgest/aa3673f1-e178-44a9-a947-ef41db73211a/manifest.m3u8', thumbnailUrl: 'https://upload.wikimedia.org/wikipedia/it/thumb/6/6a/SuperTennis_-_Logo_2016.svg/960px-SuperTennis_-_Logo_2016.svg.png', drmType: null, drmKeyId: null, drmKey: null, categoryName: 'Sportivi', player: 'plyr' },
  { title: 'Rai Sport', mpdUrl: 'https://mediapolis.rai.it/relinker/relinkerServlet.htm?cont=358025&output=7&forceUserAgent=rainet/4.0.5', thumbnailUrl: 'https://upload.wikimedia.org/wikipedia/commons/b/b3/Rai_Sport_-_Logo_2022.svg', drmType: null, drmKeyId: null, drmKey: null, categoryName: 'Sportivi', player: 'plyr' },
  { title: 'BIKE', mpdUrl: 'https://stream.prod-01.milano.nxmedge.net/argocdn/bikechannel/tracks-v1a1/mono.m3u8', thumbnailUrl: null, drmType: null, drmKeyId: null, drmKey: null, categoryName: 'Sportivi', player: 'plyr' },

  // ---- Bambini ----
  { title: 'BOING', mpdUrl: 'https://live02-seg.msf.cdn.mediaset.net/live/ch-kb/kb-clr.isml/index.m3u8', thumbnailUrl: 'https://upload.wikimedia.org/wikipedia/commons/e/ef/Boing_-_Logo_2020.svg', drmType: null, drmKeyId: null, drmKey: null, categoryName: 'Bambini', player: 'plyr' },
  { title: 'K2', mpdUrl: 'https://alwaysdata-api.zappr.stream/k2.mpd', thumbnailUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b4/K2_new_logo.svg/960px-K2_new_logo.svg.png', drmType: 'clearkey', drmKeyId: '0100f3b37d2a3ad2542d78d000ff91fa,0101d89b4d19006867fa32807a520b3c,0102744f58a20d0e5153c97be37abac5', drmKey: '507ead932fe25e6f1e3ba0fc39fc7040,6b7fad6b36b9db9f2e5a95f4b934a6fd,cfdc30074c2b9c006b77d103b0566fa6', categoryName: 'Bambini', player: 'hls' },
  { title: 'Rai Gulp', mpdUrl: 'https://raigulp1-dash-live.akamaized.net/dash/live/663985/raigulp1/manifest.mpd', thumbnailUrl: 'https://upload.wikimedia.org/wikipedia/commons/c/c1/Rai_Gulp_-_Logo_2017.svg', drmType: null, drmKeyId: null, drmKey: null, categoryName: 'Bambini', player: 'plyr' },
  { title: 'Rai YoYo', mpdUrl: 'https://raiyoyo1-dash-live.akamaized.net/dash/live/663949/raiyoyo1/manifest.mpd', thumbnailUrl: 'https://upload.wikimedia.org/wikipedia/commons/0/01/Rai_Yoyo_-_Logo_2017.svg', drmType: null, drmKeyId: null, drmKey: null, categoryName: 'Bambini', player: 'plyr' },
  { title: 'Cartoonito', mpdUrl: 'https://live02-seg.msf.cdn.mediaset.net/live/ch-la/la-clr.isml/index.m3u8', thumbnailUrl: 'https://upload.wikimedia.org/wikipedia/commons/a/a5/Cartoonito_-_Logo_2021.svg', drmType: null, drmKeyId: null, drmKey: null, categoryName: 'Bambini', player: 'plyr' },
  { title: 'Super!', mpdUrl: 'https://streamcdng6-495c5a85d9074f29acffeaea9e0215eb.msvdn.net/super/super_main/super_main_hbbtv/playlist.m3u8', thumbnailUrl: 'https://upload.wikimedia.org/wikipedia/commons/d/d3/Super%21_logo_2025.png', drmType: null, drmKeyId: null, drmKey: null, categoryName: 'Bambini', player: 'shaka' },
  { title: 'Rai Scuola', mpdUrl: 'https://raiscuola1-dash-live.akamaized.net/dash/live/663975/raiscuola1/manifest.mpd', thumbnailUrl: 'https://upload.wikimedia.org/wikipedia/commons/1/11/Rai_Scuola_-_Logo_2017.svg', drmType: null, drmKeyId: null, drmKey: null, categoryName: 'Bambini', player: 'plyr' },

  // ---- Regionali ----
  { title: 'QVC', mpdUrl: 'https://qrg.akamaized.net/hls/live/2017383/lsqvc1it/master.m3u8', thumbnailUrl: 'https://upload.wikimedia.org/wikipedia/commons/3/31/QVC_logo_2019.svg', drmType: null, drmKeyId: null, drmKey: null, categoryName: 'Regionali', player: 'plyr' },
  { title: 'Alma TV', mpdUrl: 'https://streaming.softwarecreation.it/AlmaTv/AlmaTv/playlist.m3u8', thumbnailUrl: null, drmType: null, drmKeyId: null, drmKey: null, categoryName: 'Regionali', player: 'plyr' },
  { title: 'Amaranto Channel', mpdUrl: 'https://10529e63b0a84fb6bdf487096cc5eaab.msvdn.net/live/S10857183/qMq5TNxA3ouH/chunklist.m3u8', thumbnailUrl: null, drmType: null, drmKeyId: null, drmKey: null, categoryName: 'Regionali', player: 'plyr' },
  { title: 'UniNettuno', mpdUrl: 'https://stream6-rai-it.akamaized.net/live/uninettuno/playlist.m3u8', thumbnailUrl: null, drmType: null, drmKeyId: null, drmKey: null, categoryName: 'Regionali', player: 'plyr' },
  { title: '12 Tv Parma', mpdUrl: 'https://5929b138b139d.streamlock.net/12TVParma/livestream/playlist.m3u8', thumbnailUrl: null, drmType: null, drmKeyId: null, drmKey: null, categoryName: 'Regionali', player: 'plyr' },
  { title: 'Alto Adige Tv', mpdUrl: 'https://5f204aff97bee.streamlock.net/AltoAdigeTV/livestream/playlist.m3u8', thumbnailUrl: null, drmType: null, drmKeyId: null, drmKey: null, categoryName: 'Regionali', player: 'plyr' },
  { title: 'Antenna 2 Bergamo', mpdUrl: 'https://58f12ffd2447a.streamlock.net/Antenna2/livestream/playlist.m3u8', thumbnailUrl: null, drmType: null, drmKeyId: null, drmKey: null, categoryName: 'Regionali', player: 'plyr' },
  { title: 'Aristanis SuperTv', mpdUrl: 'https://video2.azotosolutions.com:1936/supertvoristano/supertvoristano/playlist.m3u8', thumbnailUrl: null, drmType: null, drmKeyId: null, drmKey: null, categoryName: 'Regionali', player: 'plyr' },
  { title: 'Arte Network Orler', mpdUrl: 'https://tsw.streamingwebtv24.it:1936/artenetwork/artenetwork/playlist.m3u8', thumbnailUrl: null, drmType: null, drmKeyId: null, drmKey: null, categoryName: 'Regionali', player: 'plyr' },
  { title: 'Aurora Arte', mpdUrl: 'https://59d7d6f47d7fc.streamlock.net/auroraarte/auroraarte/playlist.m3u8', thumbnailUrl: null, drmType: null, drmKeyId: null, drmKey: null, categoryName: 'Regionali', player: 'plyr' },
  { title: 'Bergamo TV', mpdUrl: 'https://db142859fd5541b09de25d6507f1f2d3.msvdn.net/live/S17501676/oIxAsgEEA46M/chunklist_DVR.m3u8', thumbnailUrl: null, drmType: null, drmKeyId: null, drmKey: null, categoryName: 'Regionali', player: 'plyr' },
  { title: 'Cafe Tv 24', mpdUrl: 'https://srvx1.selftv.video/cafe/live/playlist.m3u8', thumbnailUrl: null, drmType: null, drmKeyId: null, drmKey: null, categoryName: 'Regionali', player: 'plyr' },
  { title: 'Canale 2', mpdUrl: 'https://59d7d6f47d7fc.streamlock.net/canale2/canale2/playlist.m3u8', thumbnailUrl: null, drmType: null, drmKeyId: null, drmKey: null, categoryName: 'Regionali', player: 'plyr' },
  { title: 'Canale 21', mpdUrl: 'https://0ff9dd7fe9b64bc08a5fc4ed525454c3.msvdn.net/live/S38994111/B7j0ql4XaZtE/playlist.m3u8', thumbnailUrl: null, drmType: null, drmKeyId: null, drmKey: null, categoryName: 'Regionali', player: 'plyr' },
  { title: 'Canale 21 Extra', mpdUrl: 'https://0ff9dd7fe9b64bc08a5fc4ed525454c3.msvdn.net/live/S42170132/sT6C3LFaD1iA/playlist.m3u8', thumbnailUrl: null, drmType: null, drmKeyId: null, drmKey: null, categoryName: 'Regionali', player: 'plyr' },
  { title: 'Canale Italia', mpdUrl: 'https://ovp-live.akamaized.net/ac115_live/canale1.smil/playlist.m3u8', thumbnailUrl: null, drmType: null, drmKeyId: null, drmKey: null, categoryName: 'Regionali', player: 'plyr' },
  { title: 'Casa Sanremo Tv', mpdUrl: 'https://router.xdevel.com/video0s975911-633/stream/playlist_dvr.m3u8', thumbnailUrl: null, drmType: null, drmKeyId: null, drmKey: null, categoryName: 'Regionali', player: 'plyr' },
  { title: 'Cusano Italia Tv', mpdUrl: 'https://router.xdevel.com/video0s975363-69/stream/playlist.m3u8', thumbnailUrl: null, drmType: null, drmKeyId: null, drmKey: null, categoryName: 'Regionali', player: 'plyr' },
  { title: 'Deluxe 139', mpdUrl: 'https://59d7d6f47d7fc.streamlock.net/pierstyle/pierstyle/playlist.m3u8', thumbnailUrl: null, drmType: null, drmKeyId: null, drmKey: null, categoryName: 'Regionali', player: 'plyr' },
  { title: 'Di.Tv 92', mpdUrl: 'https://5f22d76e220e1.streamlock.net/ditv80/ditv80/chunklist_w1949812551.m3u8', thumbnailUrl: null, drmType: null, drmKeyId: null, drmKey: null, categoryName: 'Regionali', player: 'plyr' },
  { title: 'E live Brescia Tv', mpdUrl: 'https://59d7d6f47d7fc.streamlock.net/elivebresciatv/elivebresciatv/playlist.m3u8', thumbnailUrl: null, drmType: null, drmKeyId: null, drmKey: null, categoryName: 'Regionali', player: 'plyr' },
  { title: 'Entella Tv', mpdUrl: 'https://5f22d76e220e1.streamlock.net:443/EntellaTV/EntellaTV/playlist.m3u8', thumbnailUrl: null, drmType: null, drmKeyId: null, drmKey: null, categoryName: 'Regionali', player: 'plyr' },
  { title: 'Etv Marche', mpdUrl: 'https://live.ipstream.it/etvmarche/etvmarche.stream/playlist.m3u8', thumbnailUrl: null, drmType: null, drmKeyId: null, drmKey: null, categoryName: 'Regionali', player: 'plyr' },
  { title: 'Etv Rete7', mpdUrl: 'https://live.ipstream.it/etv/etv.stream/playlist.m3u8', thumbnailUrl: null, drmType: null, drmKeyId: null, drmKey: null, categoryName: 'Regionali', player: 'plyr' },
  { title: 'Euro Tv', mpdUrl: 'https://5f22d76e220e1.streamlock.net/eurotv/eurotv/playlist.m3u8', thumbnailUrl: null, drmType: null, drmKeyId: null, drmKey: null, categoryName: 'Regionali', player: 'plyr' },
  { title: 'GarganoTv', mpdUrl: 'https://load-balancer.azotosolutions.com/cdnedge3/smil:live3.smil/chunklist_w2090950315_b4500000_slen.m3u8', thumbnailUrl: null, drmType: null, drmKeyId: null, drmKey: null, categoryName: 'Regionali', player: 'plyr' },
  { title: 'Giovanni Paolo Tv', mpdUrl: 'https://media2021.rtvweb.com/giovannipaolotv/web/chunklist_w663456797.m3u8', thumbnailUrl: null, drmType: null, drmKeyId: null, drmKey: null, categoryName: 'Regionali', player: 'plyr' },
  { title: 'Gold Tv', mpdUrl: 'https://streaming.softwarecreation.it/GoldTv/GoldTv/playlist.m3u8', thumbnailUrl: null, drmType: null, drmKeyId: null, drmKey: null, categoryName: 'Regionali', player: 'plyr' },
  { title: 'Icaro Tv Rimini', mpdUrl: 'https://59d7d6f47d7fc.streamlock.net/icarotv/icarotv/playlist.m3u8', thumbnailUrl: null, drmType: null, drmKeyId: null, drmKey: null, categoryName: 'Regionali', player: 'plyr' },
  { title: 'Italia 2 Tv', mpdUrl: 'https://59d7d6f47d7fc.streamlock.net/italia2/italia2/playlist.m3u8', thumbnailUrl: null, drmType: null, drmKeyId: null, drmKey: null, categoryName: 'Regionali', player: 'plyr' },
  { title: 'Italia 7', mpdUrl: 'https://streaming.softwarecreation.it/Italia7/Italia7/playlist.m3u8', thumbnailUrl: null, drmType: null, drmKeyId: null, drmKey: null, categoryName: 'Regionali', player: 'plyr' },
  { title: 'Iunior Tv', mpdUrl: 'https://5f22d76e220e1.streamlock.net/iuniortv/iuniortv/playlist.m3u8', thumbnailUrl: null, drmType: null, drmKeyId: null, drmKey: null, categoryName: 'Regionali', player: 'plyr' },
  { title: 'LaC News 24', mpdUrl: 'https://f5842579ff984c1c98d63b8d789673eb.msvdn.net/live/S27391994/HVvPMzy/playlist.m3u8', thumbnailUrl: null, drmType: null, drmKeyId: null, drmKey: null, categoryName: 'Regionali', player: 'plyr' },
  { title: 'LaC Tv Calabria', mpdUrl: 'https://f5842579ff984c1c98d63b8d789673eb.msvdn.net/live/S47282891/JWjL3xqPf4bX/playlist.m3u8', thumbnailUrl: null, drmType: null, drmKeyId: null, drmKey: null, categoryName: 'Regionali', player: 'plyr' },
  { title: 'Made in BO', mpdUrl: 'https://srvx1.selftv.video/dmchannel/live/playlist.m3u8', thumbnailUrl: null, drmType: null, drmKeyId: null, drmKey: null, categoryName: 'Regionali', player: 'plyr' },
  { title: 'Medjugorje Italia Tv', mpdUrl: 'https://5f22d76e220e1.streamlock.net/medjugorjeitaliatv/medjugorjeitaliatv/playlist.m3u8', thumbnailUrl: null, drmType: null, drmKeyId: null, drmKey: null, categoryName: 'Regionali', player: 'plyr' },
  { title: 'Nuova Tv 1', mpdUrl: 'https://nuovatv.net:8443/tv/stream.m3u8', thumbnailUrl: null, drmType: null, drmKeyId: null, drmKey: null, categoryName: 'Regionali', player: 'plyr' },
  { title: 'Nuvola Tv', mpdUrl: 'https://stream.nuvola.tv:8181/memfs/4aaa6328-1879-4ebf-b18a-498146d0c61c_output_0.m3u8?session=J6Vz89swafjSew3iFyx7bF', thumbnailUrl: null, drmType: null, drmKeyId: null, drmKey: null, categoryName: 'Regionali', player: 'plyr' },
  { title: 'Onda Tv Sicilia', mpdUrl: 'https://5926fc9c7c5b2.streamlock.net/9040/9040/playlist.m3u8', thumbnailUrl: null, drmType: null, drmKeyId: null, drmKey: null, categoryName: 'Regionali', player: 'plyr' },
  { title: 'Padre Pio Tv', mpdUrl: 'https://600f07e114306.streamlock.net/PadrePioTV/livestream/playlist.m3u8', thumbnailUrl: null, drmType: null, drmKeyId: null, drmKey: null, categoryName: 'Regionali', player: 'plyr' },
  { title: 'Paradise Tv', mpdUrl: 'https://tsw.streamingwebtv24.it:1936/paradisetv/paradisetv/playlist.m3u8', thumbnailUrl: null, drmType: null, drmKeyId: null, drmKey: null, categoryName: 'Regionali', player: 'plyr' },
  { title: 'Prima Tv Sicilia', mpdUrl: 'https://5db313b643fd8.streamlock.net/PrimaTV/PrimaTV/playlist.m3u8', thumbnailUrl: null, drmType: null, drmKeyId: null, drmKey: null, categoryName: 'Regionali', player: 'plyr' },
  { title: 'PrimaFREE', mpdUrl: 'https://5f22d76e220e1.streamlock.net/primafree/primafree/playlist.m3u8', thumbnailUrl: null, drmType: null, drmKeyId: null, drmKey: null, categoryName: 'Regionali', player: 'plyr' },
  { title: 'Primocanale', mpdUrl: 'https://msh0203.stream.seeweb.it/live/flv:stream2.sdp/playlist.m3u8', thumbnailUrl: null, drmType: null, drmKeyId: null, drmKey: null, categoryName: 'Regionali', player: 'plyr' },
  { title: 'Promovideo Tv', mpdUrl: 'https://media2021.rtvweb.com/promovideo_web/promovideo/playlist.m3u8', thumbnailUrl: null, drmType: null, drmKeyId: null, drmKey: null, categoryName: 'Regionali', player: 'plyr' },
  { title: 'Quarto Canale Flegreo', mpdUrl: 'http://live.mariatvcdn.com/dialogos/171e41deedf405f10c7dd6311387fb43.sdp/playlist.m3u8', thumbnailUrl: null, drmType: null, drmKeyId: null, drmKey: null, categoryName: 'Regionali', player: 'plyr' },
  { title: 'Rei Tv', mpdUrl: 'https://5f22d76e220e1.streamlock.net/reitv/reitv/playlist.m3u8', thumbnailUrl: null, drmType: null, drmKeyId: null, drmKey: null, categoryName: 'Regionali', player: 'plyr' },
  { title: 'Rete Biella Tv', mpdUrl: 'https://sb.top-ix.org/retebiella/streaming/playlist.m3u8', thumbnailUrl: null, drmType: null, drmKeyId: null, drmKey: null, categoryName: 'Regionali', player: 'plyr' },
  { title: 'Rete Oro Tv', mpdUrl: 'https://5926fc9c7c5b2.streamlock.net/9094/9094/playlist.m3u8', thumbnailUrl: null, drmType: null, drmKeyId: null, drmKey: null, categoryName: 'Regionali', player: 'plyr' },
  { title: 'Rete Tv Italia', mpdUrl: 'https://57068da1deb21.streamlock.net/retetvitalia/retetvitalia/playlist.m3u8', thumbnailUrl: null, drmType: null, drmKeyId: null, drmKey: null, categoryName: 'Regionali', player: 'plyr' },
  { title: 'RTC Telecalabria', mpdUrl: 'https://w1.mediastreaming.it/calabriachannel/livestream/playlist.m3u8', thumbnailUrl: null, drmType: null, drmKeyId: null, drmKey: null, categoryName: 'Regionali', player: 'plyr' },
  { title: 'RTM Manduria', mpdUrl: 'https://5f22d76e220e1.streamlock.net/rtm/rtm/playlist.m3u8', thumbnailUrl: null, drmType: null, drmKeyId: null, drmKey: null, categoryName: 'Regionali', player: 'plyr' },
  { title: 'RTR99 Tv', mpdUrl: 'https://5e73cf528f404.streamlock.net/RTR99TV/livestream/playlist.m3u8', thumbnailUrl: null, drmType: null, drmKeyId: null, drmKey: null, categoryName: 'Regionali', player: 'plyr' },
  { title: 'Rtp Tv', mpdUrl: 'https://stream9.xdevel.com/video0s975966-1969/stream/chunks.m3u8', thumbnailUrl: null, drmType: null, drmKeyId: null, drmKey: null, categoryName: 'Regionali', player: 'clappr' },
  { title: 'Rttr', mpdUrl: 'https://5f204aff97bee.streamlock.net/RTTRlive/livestream/playlist.m3u8', thumbnailUrl: null, drmType: null, drmKeyId: null, drmKey: null, categoryName: 'Regionali', player: 'plyr' },
  { title: 'ST Europe Channel', mpdUrl: 'https://5f22d76e220e1.streamlock.net/steuropetv/steuropetv/playlist.m3u8', thumbnailUrl: null, drmType: null, drmKeyId: null, drmKey: null, categoryName: 'Regionali', player: 'plyr' },
  { title: 'Sicilia 24 Tv', mpdUrl: 'https://5f22d76e220e1.streamlock.net/sicilia24/sicilia24/playlist.m3u8', thumbnailUrl: null, drmType: null, drmKeyId: null, drmKey: null, categoryName: 'Regionali', player: 'plyr' },
  { title: 'Sienatv', mpdUrl: 'https://router.xdevel.com/video0s976727-1441/stream/playlist.m3u8', thumbnailUrl: null, drmType: null, drmKeyId: null, drmKey: null, categoryName: 'Regionali', player: 'plyr' },
  { title: 'Super J Tv', mpdUrl: 'https://59d39900ebfb8.streamlock.net/SuperJtv/SuperJtv/chunklist_w297267373.m3u8', thumbnailUrl: null, drmType: null, drmKeyId: null, drmKey: null, categoryName: 'Regionali', player: 'plyr' },
  { title: 'Super Six', mpdUrl: 'https://5db313b643fd8.streamlock.net/SUPERSIXLombardia/SUPERSIXLombardia/playlist.m3u8', thumbnailUrl: null, drmType: null, drmKeyId: null, drmKey: null, categoryName: 'Regionali', player: 'plyr' },
  { title: 'TRL Tele Radio Leo', mpdUrl: 'https://5db313b643fd8.streamlock.net/TRL/TRL/playlist.m3u8', thumbnailUrl: null, drmType: null, drmKeyId: null, drmKey: null, categoryName: 'Regionali', player: 'plyr' },
  { title: 'TSD Tv Arezzo', mpdUrl: 'https://stream.mariatvcdn.com/tsd/7c59373bfdb38201b9215ff86f0ce6af.sdp/playlist.m3u8', thumbnailUrl: null, drmType: null, drmKeyId: null, drmKey: null, categoryName: 'Regionali', player: 'plyr' },
  { title: 'Tele A', mpdUrl: 'https://lostream.it/hls/telea/video.m3u8', thumbnailUrl: null, drmType: null, drmKeyId: null, drmKey: null, categoryName: 'Regionali', player: 'plyr' },
  { title: 'Tele Arena', mpdUrl: 'https://5e73cf528f404.streamlock.net/TeleArena/TeleArena.stream/playlist.m3u8', thumbnailUrl: null, drmType: null, drmKeyId: null, drmKey: null, categoryName: 'Regionali', player: 'plyr' },
  { title: 'Tele Bari', mpdUrl: 'https://w1.mediastreaming.it/telebari/livestream/playlist.m3u8', thumbnailUrl: null, drmType: null, drmKeyId: null, drmKey: null, categoryName: 'Regionali', player: 'plyr' },
  { title: 'Tele Boario', mpdUrl: 'https://stream7.xdevel.com/video0s976425-1244/stream/playlist_dvr.m3u8', thumbnailUrl: null, drmType: null, drmKeyId: null, drmKey: null, categoryName: 'Regionali', player: 'plyr' },
  { title: 'Tele Bruzzano', mpdUrl: 'https://playerssl.telemia.tv/fileadmin/hls/Telebruzzano/telebruzzano_mediachunks.m3u8', thumbnailUrl: null, drmType: null, drmKeyId: null, drmKey: null, categoryName: 'Regionali', player: 'plyr' },
  { title: 'Tele Chiara', mpdUrl: 'https://fms.telemar.it:1936/telechiara/diretta/chunklist_w1929011196.m3u8', thumbnailUrl: null, drmType: null, drmKeyId: null, drmKey: null, categoryName: 'Regionali', player: 'plyr' },
  { title: 'Tele Club Italia', mpdUrl: 'https://www.theclubfactory.com/streaming/index.m3u8', thumbnailUrl: null, drmType: null, drmKeyId: null, drmKey: null, categoryName: 'Regionali', player: 'plyr' },
  { title: 'Telecolor', mpdUrl: 'https://1aadf145546f475282c5b4e658c0ac4b.msvdn.net/live/324149/hlbAWtl/playlist.m3u8', thumbnailUrl: null, drmType: null, drmKeyId: null, drmKey: null, categoryName: 'Regionali', player: 'plyr' },
  { title: 'Tele Ischia', mpdUrl: 'https://rst.saiuzwebnetwork.it:8081/teleischia/index.m3u8', thumbnailUrl: null, drmType: null, drmKeyId: null, drmKey: null, categoryName: 'Regionali', player: 'plyr' },
  { title: 'Tele Jonio', mpdUrl: 'http://59d7d6f47d7fc.streamlock.net/telejonio/telejonio/playlist.m3u8', thumbnailUrl: null, drmType: null, drmKeyId: null, drmKey: null, categoryName: 'Regionali', player: 'plyr' },
  { title: 'Travel TV', mpdUrl: 'https://5a1178b42cc03.streamlock.net/travel/travel/chunklist_w2129560705.m3u8', thumbnailUrl: null, drmType: null, drmKeyId: null, drmKey: null, categoryName: 'Regionali', player: 'plyr' },
  { title: 'Videolina', mpdUrl: 'https://7e1cc2454f2242afabe05cc0a2f483cd.msvdn.net/videolina/videolina_live/videolina_live/playlist.m3u8', thumbnailUrl: 'https://upload.wikimedia.org/wikipedia/commons/2/2b/Videolina_-_secondo_logo.jpg', drmType: null, drmKeyId: null, drmKey: null, categoryName: 'Regionali', player: 'plyr' },
  { title: 'ByoBlu', mpdUrl: 'https://streamcdng5-09bd1346f7a44cc9ac230cc1cb22ca4f.msvdn.net/live/S39249178/EnTK3KeeN1Eg/playlist.m3u8', thumbnailUrl: null, drmType: null, drmKeyId: null, drmKey: null, categoryName: 'Regionali', player: 'plyr' },
  { title: 'Odeon', mpdUrl: 'https://streaming.softwarecreation.it/Odeon/Odeon/manifest.mpd', thumbnailUrl: null, drmType: null, drmKeyId: null, drmKey: null, categoryName: 'Regionali', player: 'plyr' },
  { title: 'Tele Genova', mpdUrl: 'https://64b16f23efbee.streamlock.net/telegenova/telegenova/chunklist_w919807344.m3u8', thumbnailUrl: null, drmType: null, drmKeyId: null, drmKey: null, categoryName: 'Regionali', player: 'plyr' },
  { title: 'Tele Norba', mpdUrl: 'https://live-telenorba.cdn.netrw.it/telenorba/hls/ccr/telenorba/master.m3u8?start=now-1h&end=now', thumbnailUrl: 'https://upload.wikimedia.org/wikipedia/it/f/fc/Logo_Telenorba.png', drmType: null, drmKeyId: null, drmKey: null, categoryName: 'Regionali', player: 'plyr' },
  { title: 'Antenna sud', mpdUrl: 'https://live-antennasud.cdn.netrw.it/antennasud/hls/ccr/antennasud/master.m3u8?start=now-2h', thumbnailUrl: null, drmType: null, drmKeyId: null, drmKey: null, categoryName: 'Regionali', player: 'plyr' },
  { title: 'Teleregione', mpdUrl: 'https://live-antennasud.cdn.netrw.it/antennasud/hls/ccr/teleregione/master.m3u8', thumbnailUrl: null, drmType: null, drmKeyId: null, drmKey: null, categoryName: 'Regionali', player: 'plyr' },
  { title: 'DolomitiLife TV', mpdUrl: 'https://stream.mariatvcdn.com/teledolomiti/a66b8b8ac2baee06f136e87b9805774d.sdp/chunks.m3u8', thumbnailUrl: null, drmType: null, drmKeyId: null, drmKey: null, categoryName: 'Regionali', player: 'plyr' },
  { title: 'Stile TV', mpdUrl: 'https://proxy.media.convergenze.it/stiletv/streams/oQOFd7JglHjO1631525551097.m3u8', thumbnailUrl: null, drmType: null, drmKeyId: null, drmKey: null, categoryName: 'Regionali', player: 'plyr' },
  { title: 'Tele Nord', mpdUrl: 'https://64b16f23efbee.streamlock.net/telenord/telenord/chunklist_w535199238.m3u8', thumbnailUrl: null, drmType: null, drmKeyId: null, drmKey: null, categoryName: 'Regionali', player: 'plyr' },
  { title: 'Rossini TV', mpdUrl: 'https://stream.rossinitv.it/memfs/3bca4ad7-adfc-4610-ac0e-e826743ddc57_output_0.m3u8', thumbnailUrl: null, drmType: null, drmKeyId: null, drmKey: null, categoryName: 'Regionali', player: 'plyr' },

  // ======================== CANALI-EXTRA.PHP ========================
  // ---- Sport Premium (iframe via popcdn.day) ----
  { title: 'Sky Sport Uno', mpdUrl: 'https://popcdn.day/go.php?stream=SkySportUnoIT&autoplay=1', thumbnailUrl: 'https://upload.wikimedia.org/wikipedia/commons/0/06/Sky_Sport_Uno_-_Logo_2021.svg', drmType: null, drmKeyId: null, drmKey: null, categoryName: 'Sport Premium', player: 'iframe' },
  { title: 'Sky Sport Calcio', mpdUrl: 'https://popcdn.day/go.php?stream=SkySportCalcioIT&autoplay=1', thumbnailUrl: 'https://upload.wikimedia.org/wikipedia/commons/4/4f/Sky_Sport_Calcio_-_Logo_2021.svg', drmType: null, drmKeyId: null, drmKey: null, categoryName: 'Sport Premium', player: 'iframe' },
  { title: 'Sky Sport Arena', mpdUrl: 'https://popcdn.day/go.php?stream=SkySportArenaIT&autoplay=1', thumbnailUrl: 'https://upload.wikimedia.org/wikipedia/commons/5/55/Sky_Sport_Arena_-_Logo_2021.svg', drmType: null, drmKeyId: null, drmKey: null, categoryName: 'Sport Premium', player: 'iframe' },
  { title: 'Sky Sport Max', mpdUrl: 'https://popcdn.day/go.php?stream=SkySportMaxIT&autoplay=1', thumbnailUrl: 'https://upload.wikimedia.org/wikipedia/commons/6/66/Sky_Sport_Max_-_Logo_2021.svg', drmType: null, drmKeyId: null, drmKey: null, categoryName: 'Sport Premium', player: 'iframe' },
  { title: 'Sky Sport F1', mpdUrl: 'https://popcdn.day/go.php?stream=SkySportF1IT&autoplay=1', thumbnailUrl: 'https://upload.wikimedia.org/wikipedia/commons/c/c2/Sky_Sport_F1_-_Logo_2021.svg', drmType: null, drmKeyId: null, drmKey: null, categoryName: 'Sport Premium', player: 'iframe' },
  { title: 'Sky Sport MotoGP', mpdUrl: 'https://popcdn.day/go.php?stream=SkySportMotoGPIT&autoplay=1', thumbnailUrl: 'https://upload.wikimedia.org/wikipedia/commons/5/5a/Sky_Sport_MotoGP_-_Logo_2021.svg', drmType: null, drmKeyId: null, drmKey: null, categoryName: 'Sport Premium', player: 'iframe' },
  { title: 'Sky Sport Tennis', mpdUrl: 'https://popcdn.day/go.php?stream=SkySportTennisIT&autoplay=1', thumbnailUrl: 'https://upload.wikimedia.org/wikipedia/commons/7/70/Sky_Sport_Tennis_-_Logo_2021.svg', drmType: null, drmKeyId: null, drmKey: null, categoryName: 'Sport Premium', player: 'iframe' },
  { title: 'Sky Sport NBA', mpdUrl: 'https://popcdn.day/go.php?stream=SkySportNBAIT&autoplay=1', thumbnailUrl: 'https://upload.wikimedia.org/wikipedia/commons/d/d0/Sky_Sport_NBA_-_Logo_2021.svg', drmType: null, drmKeyId: null, drmKey: null, categoryName: 'Sport Premium', player: 'iframe' },
  { title: 'Sky Sport 24', mpdUrl: 'https://popcdn.day/go.php?stream=SkySport24IT&autoplay=1', thumbnailUrl: 'https://upload.wikimedia.org/wikipedia/commons/b/b2/Sky_Sport_24_-_Logo_2021.svg', drmType: null, drmKeyId: null, drmKey: null, categoryName: 'Sport Premium', player: 'iframe' },
  { title: 'Sky Sport Golf', mpdUrl: 'https://popcdn.day/go.php?stream=SkySportGolfIT&autoplay=1', thumbnailUrl: 'https://upload.wikimedia.org/wikipedia/commons/8/87/Sky_Sport_Golf_-_Logo_2021.svg', drmType: null, drmKeyId: null, drmKey: null, categoryName: 'Sport Premium', player: 'iframe' },
  { title: 'Sky Sport Mix', mpdUrl: 'https://popcdn.day/go.php?stream=SkySportMixIT&autoplay=1', thumbnailUrl: 'https://upload.wikimedia.org/wikipedia/commons/3/3f/Sky_Sport_Mix_-_Logo_2021.svg', drmType: null, drmKeyId: null, drmKey: null, categoryName: 'Sport Premium', player: 'iframe' },
  { title: 'Zona DAZN', mpdUrl: 'https://popcdn.day/go.php?stream=ZonaDAZN&autoplay=1', thumbnailUrl: 'https://upload.wikimedia.org/wikipedia/commons/7/75/DAZN_logo_2019.svg', drmType: null, drmKeyId: null, drmKey: null, categoryName: 'Sport Premium', player: 'iframe' },
  { title: 'Euro 1', mpdUrl: 'https://popcdn.day/go.php?stream=Euro1IT&autoplay=1', thumbnailUrl: null, drmType: null, drmKeyId: null, drmKey: null, categoryName: 'Sport Premium', player: 'iframe' },
  { title: 'Euro 2', mpdUrl: 'https://popcdn.day/go.php?stream=Euro2IT&autoplay=1', thumbnailUrl: null, drmType: null, drmKeyId: null, drmKey: null, categoryName: 'Sport Premium', player: 'iframe' },
  { title: 'Eurosport 1', mpdUrl: 'https://timlivetu0.cb.ticdn.it/Content/DASH/Live/channel(eurosport1)/manifest.mpd', thumbnailUrl: 'https://upload.wikimedia.org/wikipedia/commons/8/8d/Eurosport_1_Logo_2025.svg', drmType: 'clearkey', drmKeyId: '610bcda111c74c97b0792b059630a10b', drmKey: 'b9817853538459b371f3fb56a267d55c', categoryName: 'Sport Premium', player: 'hls' },
  { title: 'Eurosport 2', mpdUrl: 'https://timlivetu0.cb.ticdn.it/Content/DASH/Live/channel(eurosport2)/manifest.mpd', thumbnailUrl: 'https://upload.wikimedia.org/wikipedia/commons/1/1d/Eurosport_2_Logo_2025.svg', drmType: 'clearkey', drmKeyId: '700b3619ccfb4c0cbd2bb26832e643cf', drmKey: 'b2c7c4b6f3375b8e07c42f95668dadeb', categoryName: 'Sport Premium', player: 'hls' },
  { title: 'Eurosport 3', mpdUrl: 'https://timlivetu0.cb.ticdn.it/Content/DASH/Live/channel(eurosport3)/manifest.mpd', thumbnailUrl: 'https://upload.wikimedia.org/wikipedia/commons/7/7c/Eurosport_3_Logo_2025.svg', drmType: 'clearkey', drmKeyId: '5fd7709359db4103ae799d5f8d79ae0b', drmKey: '6d39ec4186bed97705274a6c78c69d94', categoryName: 'Sport Premium', player: 'hls' },

  // ---- Sport Estero (iframe via popcdn.day) ----
  { title: 'Eurosport 1 BG', mpdUrl: 'https://popcdn.day/go.php?stream=EUROSPORT1BG&autoplay=1', thumbnailUrl: 'https://upload.wikimedia.org/wikipedia/commons/8/8d/Eurosport_1_Logo_2025.svg', drmType: null, drmKeyId: null, drmKey: null, categoryName: 'Sport Estero', player: 'iframe' },
  { title: 'Eurosport 2 BG', mpdUrl: 'https://popcdn.day/go.php?stream=EUROSPORT2BG&autoplay=1', thumbnailUrl: 'https://upload.wikimedia.org/wikipedia/commons/1/1d/Eurosport_2_Logo_2025.svg', drmType: null, drmKeyId: null, drmKey: null, categoryName: 'Sport Estero', player: 'iframe' },
  { title: 'Nova Sport BG', mpdUrl: 'https://popcdn.day/go.php?stream=NOVASPORTBG&autoplay=1', thumbnailUrl: null, drmType: null, drmKeyId: null, drmKey: null, categoryName: 'Sport Estero', player: 'iframe' },
  { title: 'Max Sport 1', mpdUrl: 'https://popcdn.day/go.php?stream=MAXSPORT1BG&autoplay=1', thumbnailUrl: null, drmType: null, drmKeyId: null, drmKey: null, categoryName: 'Sport Estero', player: 'iframe' },
  { title: 'Max Sport 2', mpdUrl: 'https://popcdn.day/go.php?stream=MAXSPORT2BG&autoplay=1', thumbnailUrl: null, drmType: null, drmKeyId: null, drmKey: null, categoryName: 'Sport Estero', player: 'iframe' },
  { title: 'Max Sport 3', mpdUrl: 'https://popcdn.day/go.php?stream=MAXSPORT3BG&autoplay=1', thumbnailUrl: null, drmType: null, drmKeyId: null, drmKey: null, categoryName: 'Sport Estero', player: 'iframe' },
  { title: 'Max Sport 4', mpdUrl: 'https://popcdn.day/go.php?stream=MAXSPORT4BG&autoplay=1', thumbnailUrl: null, drmType: null, drmKeyId: null, drmKey: null, categoryName: 'Sport Estero', player: 'iframe' },
  { title: 'Diema Sport 1', mpdUrl: 'https://popcdn.day/go.php?stream=DIEMASPORT&autoplay=1', thumbnailUrl: null, drmType: null, drmKeyId: null, drmKey: null, categoryName: 'Sport Estero', player: 'iframe' },
  { title: 'Diema Sport 2', mpdUrl: 'https://popcdn.day/go.php?stream=DIEMASPORT2&autoplay=1', thumbnailUrl: null, drmType: null, drmKeyId: null, drmKey: null, categoryName: 'Sport Estero', player: 'iframe' },
  { title: 'Diema Sport 3', mpdUrl: 'https://popcdn.day/go.php?stream=DIEMASPORT3&autoplay=1', thumbnailUrl: null, drmType: null, drmKeyId: null, drmKey: null, categoryName: 'Sport Estero', player: 'iframe' },
  { title: 'Eleven Sports 1', mpdUrl: 'https://popcdn.day/go.php?stream=ElevenSports1PL&autoplay=1', thumbnailUrl: 'https://upload.wikimedia.org/wikipedia/commons/d/d3/Eleven_Sports_logo.svg', drmType: null, drmKeyId: null, drmKey: null, categoryName: 'Sport Estero', player: 'iframe' },
  { title: 'Eleven Sports 2', mpdUrl: 'https://popcdn.day/go.php?stream=ElevenSports2PL&autoplay=1', thumbnailUrl: 'https://upload.wikimedia.org/wikipedia/commons/d/d3/Eleven_Sports_logo.svg', drmType: null, drmKeyId: null, drmKey: null, categoryName: 'Sport Estero', player: 'iframe' },
  { title: 'Eleven Sports 3', mpdUrl: 'https://popcdn.day/go.php?stream=ElevenSports3PL&autoplay=1', thumbnailUrl: 'https://upload.wikimedia.org/wikipedia/commons/d/d3/Eleven_Sports_logo.svg', drmType: null, drmKeyId: null, drmKey: null, categoryName: 'Sport Estero', player: 'iframe' },
  { title: 'Eleven Sports 4', mpdUrl: 'https://popcdn.day/go.php?stream=ElevenSports4PL&autoplay=1', thumbnailUrl: 'https://upload.wikimedia.org/wikipedia/commons/d/d3/Eleven_Sports_logo.svg', drmType: null, drmKeyId: null, drmKey: null, categoryName: 'Sport Estero', player: 'iframe' },
  { title: 'Polsat Sport Premium 1', mpdUrl: 'https://popcdn.day/go.php?stream=PolsatSportPremium1&autoplay=1', thumbnailUrl: null, drmType: null, drmKeyId: null, drmKey: null, categoryName: 'Sport Estero', player: 'iframe' },
  { title: 'Polsat Sport Premium 2', mpdUrl: 'https://popcdn.day/go.php?stream=PolsatSportPremium2&autoplay=1', thumbnailUrl: null, drmType: null, drmKeyId: null, drmKey: null, categoryName: 'Sport Estero', player: 'iframe' },

  // ---- Francia ----
  { title: 'TF1', mpdUrl: 'https://frlive-tv-emea-1.prod.fastly.sky.com/Content/HLS/Live/channel(tf1)/stream_0323.m3u8', thumbnailUrl: 'https://upload.wikimedia.org/wikipedia/commons/0/05/TF1_-_Logo_2012.svg', drmType: null, drmKeyId: null, drmKey: null, categoryName: 'Francia', player: 'plyr' },
  { title: 'France 2', mpdUrl: 'https://frlive-tv-emea-1.prod.fastly.sky.com/Content/HLS/Live/channel(fr2)/stream_0323.m3u8', thumbnailUrl: 'https://upload.wikimedia.org/wikipedia/commons/3/3c/France_2_-_Logo_2018.svg', drmType: null, drmKeyId: null, drmKey: null, categoryName: 'Francia', player: 'plyr' },
  { title: 'France 3', mpdUrl: 'https://frlive-tv-emea-1.prod.fastly.sky.com/Content/HLS/Live/channel(fr3)/stream_0323.m3u8', thumbnailUrl: 'https://upload.wikimedia.org/wikipedia/commons/8/85/France_3_-_Logo_2018.svg', drmType: null, drmKeyId: null, drmKey: null, categoryName: 'Francia', player: 'plyr' },
  { title: 'France 4', mpdUrl: 'https://frlive-tv-emea-1.prod.fastly.sky.com/Content/HLS/Live/channel(fr4)/stream_0323.m3u8', thumbnailUrl: 'https://upload.wikimedia.org/wikipedia/commons/d/d0/France_4_-_Logo_2018.svg', drmType: null, drmKeyId: null, drmKey: null, categoryName: 'Francia', player: 'plyr' },
  { title: 'France 5', mpdUrl: 'https://frlive-tv-emea-1.prod.fastly.sky.com/Content/HLS/Live/channel(fr5)/stream_0323.m3u8', thumbnailUrl: 'https://upload.wikimedia.org/wikipedia/commons/c/c2/France_5_-_Logo_2018.svg', drmType: null, drmKeyId: null, drmKey: null, categoryName: 'Francia', player: 'plyr' },
  { title: 'M6', mpdUrl: 'https://frlive-tv-emea-1.prod.fastly.sky.com/Content/HLS/Live/channel(m6)/stream_0323.m3u8', thumbnailUrl: 'https://upload.wikimedia.org/wikipedia/commons/9/98/M6_Logo_2023.svg', drmType: null, drmKeyId: null, drmKey: null, categoryName: 'Francia', player: 'plyr' },
  { title: 'C8', mpdUrl: 'https://frlive-tv-emea-1.prod.fastly.sky.com/Content/HLS/Live/channel(c8)/stream_0323.m3u8', thumbnailUrl: null, drmType: null, drmKeyId: null, drmKey: null, categoryName: 'Francia', player: 'plyr' },
  { title: 'W9', mpdUrl: 'https://frlive-tv-emea-1.prod.fastly.sky.com/Content/HLS/Live/channel(w9)/stream_0323.m3u8', thumbnailUrl: null, drmType: null, drmKeyId: null, drmKey: null, categoryName: 'Francia', player: 'plyr' },
  { title: 'TMC', mpdUrl: 'https://frlive-tv-emea-1.prod.fastly.sky.com/Content/HLS/Live/channel(tmc)/stream_0323.m3u8', thumbnailUrl: null, drmType: null, drmKeyId: null, drmKey: null, categoryName: 'Francia', player: 'plyr' },
  { title: 'BFM TV', mpdUrl: 'https://frlive-tv-emea-1.prod.fastly.sky.com/Content/HLS/Live/channel(bfmtv)/stream_0323.m3u8', thumbnailUrl: 'https://upload.wikimedia.org/wikipedia/commons/8/84/BFM_TV_2019_logo.svg', drmType: null, drmKeyId: null, drmKey: null, categoryName: 'Francia', player: 'plyr' },
  { title: 'France 24', mpdUrl: 'https://frlive-tv-emea-1.prod.fastly.sky.com/Content/HLS/Live/channel(f24)/stream_0323.m3u8', thumbnailUrl: null, drmType: null, drmKeyId: null, drmKey: null, categoryName: 'Francia', player: 'plyr' },
  { title: 'Arte FR', mpdUrl: 'https://frlive-tv-emea-1.prod.fastly.sky.com/Content/HLS/Live/channel(arte)/stream_0323.m3u8', thumbnailUrl: 'https://upload.wikimedia.org/wikipedia/commons/3/34/Arte_logo_2023.svg', drmType: null, drmKeyId: null, drmKey: null, categoryName: 'Francia', player: 'plyr' },
  { title: 'Gulli', mpdUrl: 'https://frlive-tv-emea-1.prod.fastly.sky.com/Content/HLS/Live/channel(gulli)/stream_0323.m3u8', thumbnailUrl: null, drmType: null, drmKeyId: null, drmKey: null, categoryName: 'Francia', player: 'plyr' },
  { title: 'CNews', mpdUrl: 'https://frlive-tv-emea-1.prod.fastly.sky.com/Content/HLS/Live/channel(cnews)/stream_0323.m3u8', thumbnailUrl: null, drmType: null, drmKeyId: null, drmKey: null, categoryName: 'Francia', player: 'plyr' },

  // ---- Germania ----
  { title: 'ARD', mpdUrl: 'https://dailivegeo.dashlive.edgesuite.net/out/v1/1c27d8543c57406986df7a693414f22c/csm.mpd', thumbnailUrl: 'https://upload.wikimedia.org/wikipedia/commons/3/3a/ARD_logo_2024.svg', drmType: null, drmKeyId: null, drmKey: null, categoryName: 'Germania', player: 'plyr' },
  { title: 'ZDF', mpdUrl: 'https://zdf-hls-18.akamaized.net/hls/live/2016501/dach/manifest.mpd', thumbnailUrl: 'https://upload.wikimedia.org/wikipedia/commons/e/e5/ZDF_logo_2021.svg', drmType: null, drmKeyId: null, drmKey: null, categoryName: 'Germania', player: 'plyr' },
  { title: 'RTL', mpdUrl: 'https://dai.google.com/linear/hls/event/1wV1lVx2Q5OqWj6gGQd5dA/master.m3u8', thumbnailUrl: 'https://upload.wikimedia.org/wikipedia/commons/4/4b/RTL_Logo_2021.svg', drmType: null, drmKeyId: null, drmKey: null, categoryName: 'Germania', player: 'plyr' },
  { title: 'SAT.1', mpdUrl: 'https://dai.google.com/linear/hls/event/rNvLk0bqRb6qjGvHqW7rPA/master.m3u8', thumbnailUrl: 'https://upload.wikimedia.org/wikipedia/commons/0/07/SAT.1_Logo_2023.svg', drmType: null, drmKeyId: null, drmKey: null, categoryName: 'Germania', player: 'plyr' },
  { title: 'ProSieben', mpdUrl: 'https://dai.google.com/linear/hls/event/zYb0m9n4SnKg8H6rTQ6jvQ/master.m3u8', thumbnailUrl: 'https://upload.wikimedia.org/wikipedia/commons/9/93/ProSieben_Logo_2023.svg', drmType: null, drmKeyId: null, drmKey: null, categoryName: 'Germania', player: 'plyr' },
  { title: 'VOX', mpdUrl: 'https://dai.google.com/linear/hls/event/MNkz9qV3vN5oL8pZ5rS2tQ/master.m3u8', thumbnailUrl: 'https://upload.wikimedia.org/wikipedia/commons/1/19/VOX_Logo_2023.svg', drmType: null, drmKeyId: null, drmKey: null, categoryName: 'Germania', player: 'plyr' },
  { title: 'RTL II', mpdUrl: 'https://dai.google.com/linear/hls/event/T6Z2Wn0j9qL8gB5q5rV9xN/master.m3u8', thumbnailUrl: null, drmType: null, drmKeyId: null, drmKey: null, categoryName: 'Germania', player: 'plyr' },
  { title: 'n-tv', mpdUrl: 'https://dai.google.com/linear/hls/event/7vL0m3v6q5pR7nZ8rU9zXQ/master.m3u8', thumbnailUrl: null, drmType: null, drmKeyId: null, drmKey: null, categoryName: 'Germania', player: 'plyr' },
  { title: 'N24', mpdUrl: 'https://dai.google.com/linear/hls/event/Z3K5m2v8w7oQ9mY5rT2xYQ/master.m3u8', thumbnailUrl: null, drmType: null, drmKeyId: null, drmKey: null, categoryName: 'Germania', player: 'plyr' },
  { title: '3sat', mpdUrl: 'https://zdf-hls-18.akamaized.net/hls/live/2016503/dach/manifest.mpd', thumbnailUrl: null, drmType: null, drmKeyId: null, drmKey: null, categoryName: 'Germania', player: 'plyr' },
  { title: 'Arte DE', mpdUrl: 'https://artelive-lh.akamaihd.net/i/artelive_de@393593/master.m3u8', thumbnailUrl: 'https://upload.wikimedia.org/wikipedia/commons/3/34/Arte_logo_2023.svg', drmType: null, drmKeyId: null, drmKey: null, categoryName: 'Germania', player: 'plyr' },
  { title: 'Deutsche Welle', mpdUrl: 'https://dwamdstream102.akamaized.net/hls/live/2015525/dwstream102/index.m3u8', thumbnailUrl: 'https://upload.wikimedia.org/wikipedia/commons/2/2f/Deutsche_Welle_logo_2012.svg', drmType: null, drmKeyId: null, drmKey: null, categoryName: 'Germania', player: 'plyr' },

  // ---- Regno Unito ----
  { title: 'BBC One', mpdUrl: 'https://vs-hls-ww-ss-ae-1.cdn02.sky.com/Content/HLS/Live/channel(bbc1)/index.m3u8', thumbnailUrl: 'https://upload.wikimedia.org/wikipedia/commons/1/12/BBC_One_logo_2021.svg', drmType: null, drmKeyId: null, drmKey: null, categoryName: 'Regno Unito', player: 'plyr' },
  { title: 'BBC Two', mpdUrl: 'https://vs-hls-ww-ss-ae-1.cdn02.sky.com/Content/HLS/Live/channel(bbc2)/index.m3u8', thumbnailUrl: 'https://upload.wikimedia.org/wikipedia/commons/9/9f/BBC_Two_logo_2021.svg', drmType: null, drmKeyId: null, drmKey: null, categoryName: 'Regno Unito', player: 'plyr' },
  { title: 'ITV', mpdUrl: 'https://vs-hls-ww-ss-ae-1.cdn02.sky.com/Content/HLS/Live/channel(itv)/index.m3u8', thumbnailUrl: 'https://upload.wikimedia.org/wikipedia/commons/5/5a/ITV_logo_2019.svg', drmType: null, drmKeyId: null, drmKey: null, categoryName: 'Regno Unito', player: 'plyr' },
  { title: 'Channel 4', mpdUrl: 'https://vs-hls-ww-ss-ae-1.cdn02.sky.com/Content/HLS/Live/channel(c4)/index.m3u8', thumbnailUrl: 'https://upload.wikimedia.org/wikipedia/commons/3/3c/Channel_4_logo_2023.svg', drmType: null, drmKeyId: null, drmKey: null, categoryName: 'Regno Unito', player: 'plyr' },
  { title: 'Channel 5', mpdUrl: 'https://vs-hls-ww-ss-ae-1.cdn02.sky.com/Content/HLS/Live/channel(c5)/index.m3u8', thumbnailUrl: 'https://upload.wikimedia.org/wikipedia/commons/9/9e/Channel_5_logo_2023.svg', drmType: null, drmKeyId: null, drmKey: null, categoryName: 'Regno Unito', player: 'plyr' },
  { title: 'Sky News', mpdUrl: 'https://vs-hls-ww-ss-ae-1.cdn02.sky.com/Content/HLS/Live/channel(skynews)/index.m3u8', thumbnailUrl: 'https://upload.wikimedia.org/wikipedia/commons/a/ab/Sky_News_logo_2019.svg', drmType: null, drmKeyId: null, drmKey: null, categoryName: 'Regno Unito', player: 'plyr' },
  { title: 'BBC News', mpdUrl: 'https://vs-hls-ww-ss-ae-1.cdn02.sky.com/Content/HLS/Live/channel(bbcnews)/index.m3u8', thumbnailUrl: 'https://upload.wikimedia.org/wikipedia/commons/3/3d/BBC_News_logo_2022.svg', drmType: null, drmKeyId: null, drmKey: null, categoryName: 'Regno Unito', player: 'plyr' },

  // ---- Internazionali ----
  { title: 'CNN International', mpdUrl: 'https://cnn-cnninternational-1-eu.rakuten.wurl.tv/playlist.m3u8', thumbnailUrl: 'https://upload.wikimedia.org/wikipedia/commons/b/b1/CNN_International_logo.svg', drmType: null, drmKeyId: null, drmKey: null, categoryName: 'Internazionali', player: 'plyr' },
  { title: 'BBC World News', mpdUrl: 'https://vs-hls-ww-ss-ae-1.cdn02.sky.com/Content/HLS/Live/channel(bbcworld)/index.m3u8', thumbnailUrl: 'https://upload.wikimedia.org/wikipedia/commons/f/fc/BBC_World_News_logo_2022.svg', drmType: null, drmKeyId: null, drmKey: null, categoryName: 'Internazionali', player: 'plyr' },
  { title: 'Euronews', mpdUrl: 'https://euronews-euronews-1-eu.rakuten.wurl.tv/playlist.m3u8', thumbnailUrl: 'https://upload.wikimedia.org/wikipedia/commons/c/c3/Euronews_logo_2022.svg', drmType: null, drmKeyId: null, drmKey: null, categoryName: 'Internazionali', player: 'plyr' },
  { title: 'Al Jazeera English', mpdUrl: 'https://aljazeera-eng-hls-live.hls.adaptive.level3.net/aljazeera/english2/index.m3u8', thumbnailUrl: 'https://upload.wikimedia.org/wikipedia/commons/f/f4/Al_Jazeera_English_logo_2023.svg', drmType: null, drmKeyId: null, drmKey: null, categoryName: 'Internazionali', player: 'plyr' },
  { title: 'CGTN', mpdUrl: 'https://cgtn-live.akamaized.net/1000/prog_index.m3u8', thumbnailUrl: null, drmType: null, drmKeyId: null, drmKey: null, categoryName: 'Internazionali', player: 'plyr' },
  { title: 'NHK World', mpdUrl: 'https://nhkwlive-ojp.akamaized.net/hls/live/2003459/nhkwlive-ojp-en/index.m3u8', thumbnailUrl: 'https://upload.wikimedia.org/wikipedia/commons/0/07/NHK_World_logo_2020.svg', drmType: null, drmKeyId: null, drmKey: null, categoryName: 'Internazionali', player: 'plyr' },
  { title: 'RT', mpdUrl: 'https://rt-rtd.rttv.com/dvr/rtnews/playlist_4500Kb.m3u8', thumbnailUrl: null, drmType: null, drmKeyId: null, drmKey: null, categoryName: 'Internazionali', player: 'plyr' },
  { title: 'TRT World', mpdUrl: 'https://tv-trtworld.live.trt.com.tr/master.m3u8', thumbnailUrl: null, drmType: null, drmKeyId: null, drmKey: null, categoryName: 'Internazionali', player: 'plyr' },
  { title: 'ABC News', mpdUrl: 'https://abcnewslive2-lh.akamaihd.net/i/abcnewslive2_1@507834/master.m3u8', thumbnailUrl: null, drmType: null, drmKeyId: null, drmKey: null, categoryName: 'Internazionali', player: 'plyr' },
  { title: 'CBS News', mpdUrl: 'https://cbsn-us-cedexis.cbsnstream.cbsnews.com/out/v1/5a5777874d54498e9e8891fae1d87708/master_1.m3u8', thumbnailUrl: null, drmType: null, drmKeyId: null, drmKey: null, categoryName: 'Internazionali', player: 'plyr' },
  { title: 'NBC News', mpdUrl: 'https://nbcnews-lh.akamaihd.net/i/nbcnews_1@74823/master.m3u8', thumbnailUrl: null, drmType: null, drmKeyId: null, drmKey: null, categoryName: 'Internazionali', player: 'plyr' },
  { title: 'BBC Four', mpdUrl: 'https://viamotionhsi.netplus.ch/live/eds/bbc4cbeebies/browser-dash/bbc4cbeebies.mpd', thumbnailUrl: null, drmType: null, drmKeyId: null, drmKey: null, categoryName: 'Internazionali', player: 'plyr' },
  { title: 'ITV 2', mpdUrl: 'https://viamotionhsi.netplus.ch/live/eds/itv2/browser-dash/itv2.mpd', thumbnailUrl: null, drmType: null, drmKeyId: null, drmKey: null, categoryName: 'Internazionali', player: 'plyr' },
  { title: 'ITV 3', mpdUrl: 'https://viamotionhsi.netplus.ch/live/eds/itv3/browser-dash/itv3.mpd', thumbnailUrl: null, drmType: null, drmKeyId: null, drmKey: null, categoryName: 'Internazionali', player: 'plyr' },
  { title: 'ITV 4', mpdUrl: 'https://viamotionhsi.netplus.ch/live/eds/itv4/browser-dash/itv4.mpd', thumbnailUrl: null, drmType: null, drmKeyId: null, drmKey: null, categoryName: 'Internazionali', player: 'plyr' },
  { title: 'CNBC', mpdUrl: 'https://viamotionhsi.netplus.ch/live/eds/cnbc/browser-dash/cnbc.mpd', thumbnailUrl: null, drmType: null, drmKeyId: null, drmKey: null, categoryName: 'Internazionali', player: 'plyr' },
  { title: 'Bloomberg', mpdUrl: 'https://viamotionhsi.netplus.ch/live/eds/bloomberg/browser-dash/bloomberg.mpd', thumbnailUrl: null, drmType: null, drmKeyId: null, drmKey: null, categoryName: 'Internazionali', player: 'plyr' },
  { title: 'France 24 EN', mpdUrl: 'https://france24-france24-1-eu.rakuten.wurl.tv/playlist.m3u8', thumbnailUrl: null, drmType: null, drmKeyId: null, drmKey: null, categoryName: 'Internazionali', player: 'plyr' },
  { title: 'CGTN ENG', mpdUrl: 'https://english-livebkali.cgtn.com/live/encgtn_0.m3u8', thumbnailUrl: null, drmType: null, drmKeyId: null, drmKey: null, categoryName: 'Internazionali', player: 'plyr' },

  // ---- Italia (nuovi da canali-extra) ----
  { title: 'LA7d', mpdUrl: 'https://live01-edge1.sanpaolostream.net/la7d/smil:la7d.smil/chunklist.m3u8', thumbnailUrl: 'https://upload.wikimedia.org/wikipedia/commons/8/8b/LA7d_%282024%29.svg', drmType: null, drmKeyId: null, drmKey: null, categoryName: 'Nazionali', player: 'plyr' },
  { title: 'Paramount Network', mpdUrl: 'https://live01-edge1.sanpaolostream.net/paramount/smil:paramount.smil/chunklist.m3u8', thumbnailUrl: 'https://upload.wikimedia.org/wikipedia/commons/0/03/Paramount_Network_IT_logo_2024.svg', drmType: null, drmKeyId: null, drmKey: null, categoryName: 'Nazionali', player: 'plyr' },
]

async function main() {
  console.log('🌱 Seeding LiveTV database...\n')

  // Clear existing data
  await prisma.channel.deleteMany()
  await prisma.category.deleteMany()
  console.log('🗑️  Cleared existing data\n')

  // Create categories
  const categoryMap = new Map<string, string>()
  for (const cat of categories) {
    const created = await prisma.category.create({ data: cat })
    categoryMap.set(cat.name, created.id)
    console.log(`✅ Categoria: ${cat.icon} ${cat.name} (${cat.slug})`)
  }
  console.log(`\n📁 ${categories.length} categorie create\n`)

  // Create channels
  let inserted = 0
  let skipped = 0

  for (const ch of channels) {
    const categoryId = categoryMap.get(ch.categoryName)
    if (!categoryId) {
      console.warn(`⚠️  Categoria non trovata: "${ch.categoryName}" per il canale "${ch.title}"`)
      skipped++
      continue
    }

    const drmType = ch.drmType || null
    const isIframe = ch.player === 'iframe'

    await prisma.channel.create({
      data: {
        title: ch.title,
        mpdUrl: ch.mpdUrl,
        thumbnailUrl: ch.thumbnailUrl,
        drmType,
        drmKeyId: ch.drmKeyId || null,
        drmKey: ch.drmKey || null,
        categoryId,
        isLive: true,
        useProxy: isIframe,
        description: `player:${ch.player}`,
      }
    })
    inserted++
  }

  console.log(`\n📺 ${inserted} canali inseriti`)
  if (skipped > 0) console.log(`⚠️  ${skipped} canali saltati`)
  console.log('\n✅ Seed completato!')
}

main()
  .catch((e) => {
    console.error('❌ Errore durante il seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
