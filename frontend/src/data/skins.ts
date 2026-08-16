// Purely cosmetic CEO appearances. These ONLY change how the character looks.
// They grant no bonuses, stats, powers, or abilities of any kind.
export interface Skin {
  id: string;
  name: string;
  theme: string;
  accent: string; // hex accent used for UI framing/glow
  blurb: string;  // flavor text describing the LOOK only
}

export const SKINS: Skin[] = [
  {
    id: 'cyberpunk',
    name: 'Cyberpunk Executive',
    theme: 'Neon / Night City',
    accent: '#ec4899',
    blurb: 'Neon-soaked silhouette built for the night skyline.',
  },
  {
    id: 'researcher',
    name: 'AI Researcher',
    theme: 'Lab / Intelligence',
    accent: '#22d3ee',
    blurb: 'White lab coat and softly glowing smart-glasses.',
  },
  {
    id: 'quant',
    name: 'Quant Trader',
    theme: 'Finance / Markets',
    accent: '#22c55e',
    blurb: 'Sharp dark suit lit by ticker-green accents.',
  },
  {
    id: 'stealth',
    name: 'Stealth Agent',
    theme: 'Shadow / Espionage',
    accent: '#94a3b8',
    blurb: 'Dressed in shadow beneath a low-brimmed hat.',
  },
  {
    id: 'space',
    name: 'Space Entrepreneur',
    theme: 'Orbital / Frontier',
    accent: '#a855f7',
    blurb: 'Sealed helmet glinting with violet starlight.',
  },
  {
    id: 'hacker',
    name: 'Hacker',
    theme: 'Underground / Code',
    accent: '#4ade80',
    blurb: 'Hooded figure glowing in terminal green.',
  },
];

export const DEFAULT_SKIN = 'researcher';
