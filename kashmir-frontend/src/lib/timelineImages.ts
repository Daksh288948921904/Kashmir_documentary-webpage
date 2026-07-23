/**
 * Local images bundled in /public/timeline/ — served at /timeline/<file>.
 * Keyed by event title (exact match from the API) so it works regardless
 * of whether the backend populates image_url or not.
 */
export const TIMELINE_IMAGES: Record<string, string> = {
  'Shah Mir Dynasty Founded':                   '/timeline/1339-shah-mir.jpg',
  'Mughal Conquest':                            '/timeline/1586-mughal.jpg',
  'Sikh Rule Begins':                           '/timeline/1819-sikh.png',
  'Treaty of Amritsar — Kashmir Is Sold':       '/timeline/1846-treaty.jpg',
  'Partition & Instrument of Accession':        '/timeline/1947-partition.jpg',
  'Partition & First Kashmir War':              '/timeline/1947-partition.jpg',
  'UN Ceasefire & Resolution 47':               '/timeline/1948-un.jpg',
  'UN Ceasefire & Resolution':                  '/timeline/1948-un.jpg',
  'Article 370 — Special Autonomous Status':    '/timeline/1949-article370.jpg',
  'Indus Waters Treaty Signed':                 '/timeline/1960-indus.png',
  'Second Kashmir War':                         '/timeline/1965-war.jpg',
  'Tashkent Declaration':                       '/timeline/1966-tashkent.jpg',
  'Simla Agreement — Line of Control Named':    '/timeline/1972-simla.jpg',
  'Disputed Elections':                         '/timeline/1987-elections.jpg',
  'Armed Insurgency Erupts':                    '/timeline/1989-insurgency.jpg',
  'Insurgency Begins':                          '/timeline/1989-insurgency.jpg',
  'Kashmiri Pandit Exodus':                     '/timeline/1990-exodus.jpg',
  'Lahore Declaration':                         '/timeline/1999-lahore.jpg',
  'Kargil War':                                 '/timeline/1999-kargil.jpg',
  'Amarnath Land Row & Mass Protests':          '/timeline/2008-amarnath.jpg',
  "Burhan Wani Killed — A Generation Rises":    '/timeline/2016-wani.jpg',
  "Burhan Wani's Death & Unrest":               '/timeline/2016-wani.jpg',
  'Article 370 Revoked':                        '/timeline/2019-370.jpg',
  'J&K Reorganisation Act':                     '/timeline/2019-reorganisation.jpg',
  'Supreme Court Upholds Article 370 Repeal':   '/timeline/2023-court.png',
  'First Assembly Elections Since Article 370': '/timeline/2024-elections.jpg',
  'First Elections Post-370':                   '/timeline/2024-elections.jpg',
  'Pahalgam Attack & Operation Sindoor':        '/timeline/2025-pahalgam.jpg',
  'India Suspends the Indus Waters Treaty':     '/timeline/2025-indus.jpg',
  'Kashmir — An Unresolved Present':            '/timeline/2026-present.jpg',
};
