export type FactionId = "solari" | "umbri" | "terra" | "aether";

export interface FactionInfo {
  id: FactionId;
  name: string;
  title: string;
  color: string;
  glow: string;
  badgeBg: string;
  nexusDistrict: string;
  description: string;
}

export interface OstTrack {
  id: string;
  title: string;
  subtitle: string;
  faction: FactionId | "nexus";
  bpm: number;
  durationLabel: string;
  audioFile?: string;
  synthPreset: {
    baseFreq: number;
    chordIntervals: number[];
    pulseRateMs: number;
    waveform: OscillatorType;
    filterFreq: number;
  };
}

export interface ChapterMeta {
  number: number;
  id: string;
  title: string;
  subtitle: string;
  factionFocus: FactionId | "nexus";
  builtInOstId: string;
  synopsis: string;
  featuredCards: string[];
}

export const FACTIONS: Record<FactionId, FactionInfo> = {
  solari: {
    id: "solari",
    name: "Solari",
    title: "Keepers of the Dawnforge",
    color: "#f59e0b",
    glow: "rgba(245, 158, 11, 0.35)",
    badgeBg: "bg-amber-500/15 text-amber-300 border-amber-500/30",
    nexusDistrict: "The Helios Spire",
    description:
      "Radiant zealots and sky-couriers who channel solar flares into living shields above the Fractured Nexus.",
  },
  umbri: {
    id: "umbri",
    name: "Umbri",
    title: "Court of Graveglass",
    color: "#a855f7",
    glow: "rgba(168, 85, 247, 0.35)",
    badgeBg: "bg-purple-500/15 text-purple-300 border-purple-500/30",
    nexusDistrict: "The Obsidian Veil",
    description:
      "Shadow-weavers and Nightfall oracles who read shattered timelines in the obsidian mirrors beneath the Nexus.",
  },
  terra: {
    id: "terra",
    name: "Terra",
    title: "The Rootbound Conclave",
    color: "#10b981",
    glow: "rgba(16, 185, 129, 0.35)",
    badgeBg: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
    nexusDistrict: "The Verdant Fault",
    description:
      "Ancient mystics whose living roots anchor the floating tectonic plates of the Nexus against total collapse.",
  },
  aether: {
    id: "aether",
    name: "Aether",
    title: "Architects of Singularity",
    color: "#06b6d4",
    glow: "rgba(6, 182, 212, 0.35)",
    badgeBg: "bg-cyan-500/15 text-cyan-300 border-cyan-500/30",
    nexusDistrict: "The Chronos Ring",
    description:
      "Dimensional engineers harnessing Singularity Engines to stitch—or weaponize—the rifts between worlds.",
  },
};

const BLOB_OST_3X =
  "https://uviycqegnbsx1wu2.public.blob.vercel-storage.com/manga/ost";

export const OST_TRACKS: OstTrack[] = [
  {
    id: "ost-nexus-overture",
    title: "The Shattered Realm (Extended 3×)",
    subtitle: "Ch. 01 Theme • 8m 10s Seamless Cut",
    faction: "nexus",
    bpm: 84,
    durationLabel: "8:10",
    audioFile: `${BLOB_OST_3X}/shattered_realm_3x.m4a`,
    synthPreset: {
      baseFreq: 110,
      chordIntervals: [0, 3, 7, 10, 14],
      pulseRateMs: 714,
      waveform: "triangle",
      filterFreq: 680,
    },
  },
  {
    id: "ost-aether-singularity",
    title: "Aether: Nexus Weaver (Extended 3×)",
    subtitle: "Ch. 02 Theme • 8m 52s Seamless Cut",
    faction: "aether",
    bpm: 126,
    durationLabel: "8:52",
    audioFile: `${BLOB_OST_3X}/ch02_aether_3x.m4a`,
    synthPreset: {
      baseFreq: 130.81,
      chordIntervals: [0, 7, 12, 14, 19],
      pulseRateMs: 476,
      waveform: "sawtooth",
      filterFreq: 1150,
    },
  },
  {
    id: "ost-solari-dawn",
    title: "Solari: Emberwing Courier (Extended 3×)",
    subtitle: "Ch. 03 Theme • 8m 56s Seamless Cut",
    faction: "solari",
    bpm: 112,
    durationLabel: "8:56",
    audioFile: `${BLOB_OST_3X}/ch03_solari_3x.m4a`,
    synthPreset: {
      baseFreq: 146.83,
      chordIntervals: [0, 4, 7, 11, 14],
      pulseRateMs: 535,
      waveform: "sawtooth",
      filterFreq: 920,
    },
  },
  {
    id: "ost-umbri-graveglass",
    title: "Umbri: Umbral Assassin (Extended 3×)",
    subtitle: "Ch. 04 Theme • 8m 49s Seamless Cut",
    faction: "umbri",
    bpm: 72,
    durationLabel: "8:49",
    audioFile: `${BLOB_OST_3X}/ch04_umbri_3x.m4a`,
    synthPreset: {
      baseFreq: 92.5,
      chordIntervals: [0, 3, 6, 10, 13],
      pulseRateMs: 833,
      waveform: "sine",
      filterFreq: 520,
    },
  },
  {
    id: "ost-colossus",
    title: "Granite Colossus Emergence (Extended 3×)",
    subtitle: "Ch. 05 Theme • 8m 44s Seamless Cut",
    faction: "terra",
    bpm: 132,
    durationLabel: "8:44",
    audioFile: `${BLOB_OST_3X}/ch05_colossus_3x.m4a`,
    synthPreset: {
      baseFreq: 82.41,
      chordIntervals: [0, 3, 7, 10, 12],
      pulseRateMs: 454,
      waveform: "sawtooth",
      filterFreq: 750,
    },
  },
  {
    id: "ost-sanctuary",
    title: "The Grove Sanctuary (Extended 3×)",
    subtitle: "Ch. 06 Theme • 8m 18s Seamless Cut",
    faction: "terra",
    bpm: 74,
    durationLabel: "8:18",
    audioFile: `${BLOB_OST_3X}/ch06_sanctuary_3x.m4a`,
    synthPreset: {
      baseFreq: 110,
      chordIntervals: [0, 4, 7, 12, 16],
      pulseRateMs: 810,
      waveform: "sine",
      filterFreq: 620,
    },
  },
  {
    id: "ost-warzone",
    title: "3v3 Outpost Siege: Monolith Clash (Extended 3×)",
    subtitle: "Ch. 07 Theme • 7m 48s Seamless Cut",
    faction: "solari",
    bpm: 138,
    durationLabel: "7:48",
    audioFile: `${BLOB_OST_3X}/ch07_warzone_3x.m4a`,
    synthPreset: {
      baseFreq: 123.47,
      chordIntervals: [0, 5, 7, 10, 12],
      pulseRateMs: 434,
      waveform: "sawtooth",
      filterFreq: 980,
    },
  },
  {
    id: "ost-duel",
    title: "Tactical Card Duel (Extended 3×)",
    subtitle: "Ch. 08 Theme • 8m 16s Seamless Cut",
    faction: "aether",
    bpm: 118,
    durationLabel: "8:16",
    audioFile: `${BLOB_OST_3X}/ch08_duel_3x.m4a`,
    synthPreset: {
      baseFreq: 130.81,
      chordIntervals: [0, 4, 7, 11, 14],
      pulseRateMs: 508,
      waveform: "triangle",
      filterFreq: 860,
    },
  },
  {
    id: "ost-ch09-abyss",
    title: "Eclipse of the Abyss (Extended 3×)",
    subtitle: "Ch. 09 Theme • 8m 18s Seamless Cut",
    faction: "umbri",
    bpm: 96,
    durationLabel: "8:18",
    audioFile: `${BLOB_OST_3X}/ch09_abyss_3x.m4a`,
    synthPreset: {
      baseFreq: 87.31,
      chordIntervals: [0, 3, 6, 10, 12],
      pulseRateMs: 625,
      waveform: "sawtooth",
      filterFreq: 600,
    },
  },
  {
    id: "ost-finale",
    title: "Astral Convergence Finale (Extended 3×)",
    subtitle: "Ch. 10 Theme • 8m 58s Seamless Cut",
    faction: "nexus",
    bpm: 116,
    durationLabel: "8:58",
    audioFile: `${BLOB_OST_3X}/ch10_finale_3x.m4a`,
    synthPreset: {
      baseFreq: 146.83,
      chordIntervals: [0, 4, 7, 11, 14],
      pulseRateMs: 517,
      waveform: "triangle",
      filterFreq: 900,
    },
  },
  {
    id: "ost-terra-rootbound",
    title: "Terra: Forest Warden (Extended 3×)",
    subtitle: "Bonus Faction Theme • 8m 26s",
    faction: "terra",
    bpm: 68,
    durationLabel: "8:26",
    audioFile: `${BLOB_OST_3X}/terra_3x.m4a`,
    synthPreset: {
      baseFreq: 98.0,
      chordIntervals: [0, 2, 7, 12, 16],
      pulseRateMs: 882,
      waveform: "triangle",
      filterFreq: 600,
    },
  },
  {
    id: "ost-trailer-theme",
    title: "Trailer & Landing Theme (Extended 3×)",
    subtitle: "Official Launch Theme • 3m 03s",
    faction: "nexus",
    bpm: 108,
    durationLabel: "3:03",
    audioFile: `${BLOB_OST_3X}/trailer_3x.m4a`,
    synthPreset: {
      baseFreq: 110,
      chordIntervals: [0, 3, 7, 10, 14],
      pulseRateMs: 714,
      waveform: "triangle",
      filterFreq: 680,
    },
  },
];

export const CHAPTER_METADATA: ChapterMeta[] = [
  {
    number: 1,
    id: "ch-01",
    title: "Rift Over the Fractured Nexus",
    subtitle: "Prologue • When the Sky-Mirror Cracks",
    factionFocus: "nexus",
    builtInOstId: "ost-nexus-overture",
    synopsis:
      "An Aether Reality Fracture splits the heavens above the four floating plates. Emberwing Courier and Prism Courier race across burning sky-lanes while Graveglass Oracle reveals the crack was no accident.",
    featuredCards: ["Reality Fracture", "Emberwing Courier", "Prism Courier", "Solari Vanguard", "Graveglass Oracle"],
  },
  {
    number: 2,
    id: "ch-02",
    title: "The Singularity Parley",
    subtitle: "Act I • Inside the Chronos Ring",
    factionFocus: "aether",
    builtInOstId: "ost-aether-singularity",
    synopsis:
      "Inside the trembling Chronos Ring, Nexus Weaver and Voltage Savant struggle to contain the runaway Singularity Engine—until Rootbound Mystic arrives to bind the machinery with living Terra roots.",
    featuredCards: ["Singularity Engine", "Nexus Weaver", "Voltage Savant", "Rootbound Mystic", "Chronomancer Sage"],
  },
  {
    number: 3,
    id: "ch-03",
    title: "Shadows on the Helios Bridge",
    subtitle: "Act II • Steel Against Night",
    factionFocus: "solari",
    builtInOstId: "ost-solari-dawn",
    synopsis:
      "Above the burning span of Haloed Bastion, Solari Vanguard and Luminous Guide defend the Helios Bridge against an Umbral Assassin ambush.",
    featuredCards: ["Solari Vanguard", "Radiant Shield", "Umbral Assassin", "Shadow Cloak", "Aurora Marshal"],
  },
  {
    number: 4,
    id: "ch-04",
    title: "Reflections of Graveglass",
    subtitle: "Act III • Beneath the Obsidian Veil",
    factionFocus: "umbri",
    builtInOstId: "ost-umbri-graveglass",
    synopsis:
      "Trapped inside the mirror galleries of Umbri, Astral Cartographer confronts Borrowed Face impostors before Graveglass Oracle reveals the awakening Void Gate.",
    featuredCards: ["Graveglass Oracle", "Astral Cartographer", "Void Gate", "Borrowed Face", "Hollow Courtier"],
  },
  {
    number: 5,
    id: "ch-05",
    title: "Awakening of the Tectonic Colossus",
    subtitle: "Act IV • The Verdant Fault",
    factionFocus: "terra",
    builtInOstId: "ost-colossus",
    synopsis:
      "Earthshatter cracks tear across Terra as Void Stalkers crawl upward through the canyons—until Forest Warden awakens the Tectonic Colossus.",
    featuredCards: ["Forest Warden", "Tectonic Colossus", "Granite Behemoth", "Stonekin Elder", "Earthshatter"],
  },
  {
    number: 6,
    id: "ch-06",
    title: "The Grove Sanctuary",
    subtitle: "Act V • Truth of the First Awakening",
    factionFocus: "terra",
    builtInOstId: "ost-sanctuary",
    synopsis:
      "Inside Grove Sanctuary, Gaia, The World-Soul recounts the secret history of The Nightfall King while Dawnblade Templar rallies the outposts.",
    featuredCards: ["Grove Sanctuary", "Gaia, The World-Soul", "Rootbound Mystic", "Dawnblade Templar", "Sapling Defender"],
  },
  {
    number: 7,
    id: "ch-07",
    title: "Siege of the Three Outposts",
    subtitle: "Act VI • Monolith Clash",
    factionFocus: "solari",
    builtInOstId: "ost-warzone",
    synopsis:
      "War erupts across the outer monoliths as Dawnblade Templar and Sunfire Colossus clash against Duskblade Fiends and Voidling Swarms.",
    featuredCards: ["Dawnblade Templar", "Sunfire Colossus", "Voidling Swarm", "Duskblade Fiend", "Zenith Inquisitor"],
  },
  {
    number: 8,
    id: "ch-08",
    title: "The Chronomancer's Gambit",
    subtitle: "Act VII • Tactical Duel Over the Abyss",
    factionFocus: "aether",
    builtInOstId: "ost-duel",
    synopsis:
      "Chronomancer Sage and Nexus Weaver turn an impossible Void Leviathan assault into a tactical duel inside twin Mirrorgates.",
    featuredCards: ["Chronomancer Sage", "Void Leviathan", "Mirrorgate", "Flowbook", "Nexus Weaver"],
  },
  {
    number: 9,
    id: "ch-09",
    title: "The Nightfall King Ascends",
    subtitle: "Act VIII • Eclipse of the Nexus",
    factionFocus: "umbri",
    builtInOstId: "ost-ch09-abyss",
    synopsis:
      "Hovering dead-center under an eclipsed sun, The Nightfall King pulls the four continents inward until Emberwing Courier ignites a blinding Solar Flare.",
    featuredCards: ["The Nightfall King", "Solar Flare", "Emberwing Courier", "Eclipse Ritual", "Graveglass Oracle"],
  },
  {
    number: 10,
    id: "ch-10",
    title: "Astral Convergence",
    subtitle: "Season 1 Finale • The Bridge Between Worlds",
    factionFocus: "nexus",
    builtInOstId: "ost-finale",
    synopsis:
      "All four factions weave their surviving relics through Nexus Weaver into a single Astral Convergence, uniting GlimmerFallTCG and GlimmerFall.Online.",
    featuredCards: ["Astral Convergence", "Nexus Weaver", "Gaia, The World-Soul", "The Nightfall King", "Luminous Guide"],
  },
];
