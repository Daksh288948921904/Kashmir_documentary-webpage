/**
 * Film Content Module — Local Source of Truth
 *
 * The backend's documentary_data.py returns stale identity (wrong title, wrong director).
 * This file overrides it for all display purposes.
 *
 * Film identity, synopsis, chapter timestamps, and pull quotes live here.
 * Backend is the source of truth for: timeline events, news, social, payment.
 */

export const FILM = {
  /* ── Identity ─────────────────────── */
  title: 'Kashmir — Fighting for Peace',
  titleLine1: 'Kashmir',
  titleLine2: '— Fighting for Peace',
  tagline: 'Two truths. Same sky. Same soil.',
  productionCompany: 'Rig 360 Media',
  director: 'Rig 360 Media',
  durationMinutes: 70,
  durationDisplay: '70 min',
  releaseYear: 2026,
  language: 'Hindi / English',
  certificate: 'U/A',
  genres: ['Documentary', 'History', 'Human Rights'],

  /* ── Synopsis ────────────────────── */
  synopsis: {
    /* Short: used in overview section above the fold */
    short: 'A witness, not an argument.',

    /* Medium: used in the film section */
    medium:
      'This film went to Kashmir. Not from a distance — from inside. ' +
      'The journalist is present. The camera is present. The people are present. ' +
      'It places the camera in front of ordinary human beings and asks them to speak. ' +
      'Then it listens.',

    /* Long: used in expanded section or meta description */
    long:
      'Kashmir — Fighting for Peace documents ordinary lives in an extraordinary conflict. ' +
      'Neither propaganda nor polemic, the film is a witness. It follows fathers who have ' +
      'lost sons, mothers who keep asking where their children are, militants who surrendered ' +
      'and reconsidered, officers who grieve, and girls on bicycles in the afternoon sun. ' +
      'It does not explain the conflict. It shows the people it happened to.',
  },

  /* ── Pull Quotes (from the film) ─── */
  pullQuotes: [
    {
      text: 'It is not what they are. The conflict is something that happened to them.',
      attribution: null, /* Deliberately unattributed — audience discovers in film */
      scene: 2,
    },
    {
      text: 'His son called once. He said: I cannot come back.',
      attribution: 'Father Two',
      scene: 10,
    },
    {
      text: 'She keeps asking for her son. Every day. Just asking.',
      attribution: 'Father Four',
      scene: 27,
    },
  ],

  /* ── Primary pull quote ─── */
  primaryPullQuote: 'This conflict happens at intersection of territory, religion and language divide.',

  /* ── Chapter Timestamps ─────────────
     These OVERRIDE the backend's get_documentary_timestamps().
     The backend has placeholder data — we use these real chapter markers.
     Once the actual film is delivered, update timestamp_seconds here.
  ─────────────────────────────────── */
  chapters: [
    {
      id: 'prologue',
      title: 'Prologue',
      subtitle: 'Night Patrol',
      timestamp_seconds: 0,
      description:
        'The film opens in darkness. A military night patrol on a Kashmir road. ' +
        'No context yet. No explanation. Just the sound, the dark, the tension.',
      chapter: 'Prologue',
      sceneRef: 1,
    },
    {
      id: 'chapter-1',
      title: 'Chapter One',
      subtitle: 'The Paradise You Did Not Choose',
      timestamp_seconds: 240,
      description:
        'Kashmir morning. Beauty that is almost unbearable. ' +
        'The valley at dawn, the craftsmen, the ordinary day — ' +
        'before you know what this beauty costs.',
      chapter: 'Origins',
      sceneRef: 2,
    },
    {
      id: 'chapter-2',
      title: 'Chapter Two',
      subtitle: 'The Line on the Map',
      timestamp_seconds: 840,
      description:
        'History arrives. Partition, the Line of Control, the decisions made ' +
        'in rooms far from Kashmir about people who were never asked.',
      chapter: 'Partition',
      sceneRef: 5,
    },
    {
      id: 'chapter-3',
      title: 'Chapter Three',
      subtitle: 'The Fathers',
      timestamp_seconds: 1680,
      description:
        'The first father. Then the second. Then the third. Each one received a phone ' +
        'call or a knock or a silence. The film stays with them until you cannot look away.',
      chapter: 'Human Stories',
      sceneRef: 10,
    },
    {
      id: 'chapter-4',
      title: 'Chapter Four',
      subtitle: 'The Armed',
      timestamp_seconds: 2520,
      description:
        'The militants. The soldiers. The people on both sides of the same argument, ' +
        'both of them wrong about something, both of them right about something.',
      chapter: 'Conflict',
      sceneRef: 16,
    },
    {
      id: 'chapter-5',
      title: 'Chapter Five',
      subtitle: 'The Girls on Bicycles',
      timestamp_seconds: 3240,
      description:
        'Scene 17. The film\'s breath. Girls on bicycles in the sunlight. ' +
        'The most ordinary thing in the world — made extraordinary by everything around it.',
      chapter: 'Ordinary Life',
      sceneRef: 17,
    },
    {
      id: 'chapter-6',
      title: 'Chapter Six',
      subtitle: 'After 370',
      timestamp_seconds: 3840,
      description:
        'August 5, 2019. The legal status of Kashmir changes overnight. ' +
        'What happens to the people when the politics changes around them.',
      chapter: 'Present Day',
      sceneRef: 24,
    },
    {
      id: 'chapter-7',
      title: 'Chapter Seven',
      subtitle: 'The Ideology That Failed',
      timestamp_seconds: 4380,
      description:
        'A militant\'s certainty collapses. The moment when the idea that ' +
        'held everything together stops being true.',
      chapter: 'Reckoning',
      sceneRef: 25,
    },
    {
      id: 'epilogue',
      title: 'Epilogue',
      subtitle: 'Faces in Silence',
      timestamp_seconds: 4980,
      description:
        'The final section of the film. Faces. No voiceover. ' +
        'The silence after everything has been said. Scene 31.',
      chapter: 'Epilogue',
      sceneRef: 31,
    },
  ],

  /* ── Characters (for FilmOverview people column) ─── */
  characters: [
    {
      role: 'The Deceived',
      description: 'He came with certainty. Something happened to the certainty.',
    },
    {
      role: 'A Father, Waiting',
      description: "His son called once. Said he couldn't come back.",
    },
    {
      role: 'A Mother',
      description: 'Every day, the same question. Every day, no answer.',
    },
    {
      role: 'A Daughter',
      description: 'She speaks about what happened to her father without shelter.',
    },
    {
      role: 'A Father, Undone',
      description: 'He describes his son with love. Then describes what he now hopes for his son.',
    },
    {
      role: 'Girls on Bicycles',
      description: 'A cycle rally through Kashmir. The girls talk about wanting ordinary lives.',
    },
    {
      role: 'An Army Officer',
      description: 'The numbers do not interest him. He speaks about what comes before.',
    },
    {
      role: 'A Police Officer',
      description: 'He was trapped once. He has been going back to that day ever since.',
    },
  ],

  /* ── Scene Map (for Designed Twice layer) ─── */
  scenes: {
    1:  { title: 'Night patrol', note: 'Opens in darkness — disorienting, immediate' },
    2:  { title: 'Kashmir morning', note: 'Beauty + military = the duality' },
    10: { title: 'Father Two', note: 'Son called once, said he cannot come back' },
    16: { title: 'Surrender', note: 'Parents calling in mother tongue = grace' },
    17: { title: 'Girls on bicycles', note: 'The film\'s breath' },
    23: { title: 'The Sikh officer\'s daughter', note: 'Someone looked at a row of buses and chose his' },
    25: { title: 'Ideology collapses', note: 'The militant reconsiders everything' },
    27: { title: 'The mother', note: 'Keeps asking for her son. Every day.' },
    31: { title: 'Faces in silence', note: 'Closing gallery. No voiceover.' },
  },
} as const;

export type FilmChapter = typeof FILM.chapters[number];
export type FilmPullQuote = typeof FILM.pullQuotes[number];
export type FilmCharacter = typeof FILM.characters[number];
