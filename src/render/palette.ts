// Colours for code-drawn UI and sprites (AC-7.3, NFR-7). Greens, dirt and sky
// are sampled from the Kenney sheets so code-drawn parts match the art.

export const COLORS = {
  sky: 0x3b6fb6,
  grassTop: 0x5b8e50,
  grassSideLight: 0x517f47,
  grassSideDark: 0x3d6235,
  dirt: 0xba8c5d,
  water: 0x9bd3e1,
  stone: 0xd9ded6,

  panel: 0x1b2638,
  panelEdge: 0x0f1622,
  text: 0xffffff,
  textMuted: 0xc9d3e0,
  gold: 0xffd166,
  lives: 0xff8a8a,
  button: 0x3d6235,
  buttonHover: 0x4a7541,
  buttonDisabled: 0x4b5361,
  buttonText: 0xffffff,
  buttonTextDisabled: 0xb4bcc8,
  accent: 0xffd166,
  danger: 0xd94b4b,
  spotOutline: 0xffffff,
} as const;

/** NFR-7: every text-on-background combination the UI uses. */
export const TEXT_PAIRS: Record<string, [number, number]> = {
  'HUD on panel': [COLORS.text, COLORS.panel],
  'muted on panel': [COLORS.textMuted, COLORS.panel],
  'gold on panel': [COLORS.gold, COLORS.panel],
  'lives on panel': [COLORS.lives, COLORS.panel],
  'button label': [COLORS.buttonText, COLORS.button],
  'disabled button label': [COLORS.buttonTextDisabled, COLORS.panel],
};

export const hex = (c: number) => `#${c.toString(16).padStart(6, '0')}`;

function luminance(rgb: number): number {
  const ch = [(rgb >> 16) & 255, (rgb >> 8) & 255, rgb & 255].map((v) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * ch[0] + 0.7152 * ch[1] + 0.0722 * ch[2];
}

/** WCAG 2.x contrast ratio between two colours. */
export function contrastRatio(a: number, b: number): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}
