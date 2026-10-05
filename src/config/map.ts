// The single map (AC-2.1). Grid coordinates: c grows toward screen bottom-right,
// r toward screen bottom-left (see sim/iso.ts). Frame names are Kenney atlas names.

export const GRID_SIZE = 8;

export type Cell = readonly [c: number, r: number];

/** Path corners, entry first. Consecutive waypoints share a row or column. */
export const PATH_WAYPOINTS: readonly Cell[] = [
  [0, 1],
  [6, 1],
  [6, 3],
  [1, 3],
  [1, 5],
  [6, 5],
  [6, 7],
];

/** Where enemies appear and leave, one step outside the first/last cell (map edge). */
const ENTRY_DIR: Cell = [-1, 0];
const EXIT_DIR: Cell = [0, 1];

export interface Spot {
  readonly id: string;
  readonly c: number;
  readonly r: number;
}

/** AC-2.3: 10 build spots, ≥ 2 tiles apart (DES-1). */
export const SPOTS: readonly Spot[] = (
  [
    [3, 0],
    [1, 2],
    [3, 2],
    [5, 2],
    [0, 4],
    [3, 4],
    [5, 4],
    [7, 4],
    [2, 6],
    [5, 6],
  ] as const
).map(([c, r], i) => ({ id: `s${i}`, c, r }));

export interface Scenery {
  readonly c: number;
  readonly r: number;
  readonly frame: string;
}

/** Decorative full tiles (trees, rocks, crystals) on free cells, mostly at the back and edges. */
export const SCENERY: readonly Scenery[] = [
  { c: 0, r: 0, frame: 'trees_7.png' },
  { c: 1, r: 0, frame: 'rocks_2.png' },
  { c: 5, r: 0, frame: 'trees_3.png' },
  { c: 7, r: 0, frame: 'crystals_1.png' },
  { c: 7, r: 1, frame: 'trees_10.png' },
  { c: 7, r: 2, frame: 'rocks_5.png' },
  { c: 0, r: 2, frame: 'trees_1.png' },
  { c: 7, r: 6, frame: 'trees_4.png' },
  { c: 7, r: 7, frame: 'rocks_1.png' },
  { c: 0, r: 7, frame: 'trees_8.png' },
  { c: 3, r: 7, frame: 'rocks_6.png' },
  { c: 1, r: 7, frame: 'trees_2.png' },
];

export const GRASS_FRAME = 'landscape_13.png';

/**
 * Tower looks: pieces stacked bottom to top; `rises` is how far (in px) each
 * piece after the first sits above the previous one. Checked in the T-2 mock.
 */
export const TOWER_FRAMES = {
  archer: { atlas: 'towers-grey', pieces: ['tower_07.png', 'tower_01.png', 'tower_41.png'], rises: [30, 33] },
  cannon: { atlas: 'towers-red', pieces: ['tower_50.png', 'tower_44.png', 'tower_24.png'], rises: [30, 33] },
} as const;

/** Px from a tile's top-face centre down to where a tower's base sits. */
export const TOWER_BASE_OFFSET_Y = 45;

/** Every path cell in walking order. */
export function pathCells(): Cell[] {
  const cells: Cell[] = [];
  for (let i = 1; i < PATH_WAYPOINTS.length; i++) {
    const [c0, r0] = PATH_WAYPOINTS[i - 1];
    const [c1, r1] = PATH_WAYPOINTS[i];
    const dc = Math.sign(c1 - c0);
    const dr = Math.sign(r1 - r0);
    for (let c = c0, r = r0; c !== c1 || r !== r1; c += dc, r += dr) cells.push([c, r]);
  }
  cells.push(PATH_WAYPOINTS[PATH_WAYPOINTS.length - 1]);
  return cells;
}

/**
 * The polyline enemies walk, in grid units: from the entry edge, through each
 * waypoint centre, to the exit edge.
 */
export function pathPolyline(): Cell[] {
  const first = PATH_WAYPOINTS[0];
  const last = PATH_WAYPOINTS[PATH_WAYPOINTS.length - 1];
  return [
    [first[0] + ENTRY_DIR[0] / 2, first[1] + ENTRY_DIR[1] / 2],
    ...PATH_WAYPOINTS,
    [last[0] + EXIT_DIR[0] / 2, last[1] + EXIT_DIR[1] / 2],
  ];
}

/** Length of the walking polyline in tiles. */
export function pathLengthTiles(): number {
  const pts = pathPolyline();
  let len = 0;
  for (let i = 1; i < pts.length; i++) {
    len += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
  }
  return len;
}

// Kenney path pieces by their two open sides. Sides: NW = c-1, SE = c+1, NE = r-1, SW = r+1.
const PATH_FRAMES: Record<string, string> = {
  'NW,SE': 'landscape_32.png',
  'NE,SW': 'landscape_29.png',
  'SE,SW': 'landscape_31.png',
  'NE,NW': 'landscape_39.png',
  'NE,SE': 'landscape_34.png',
  'NW,SW': 'landscape_35.png',
};

function side(from: Cell, to: Cell): string {
  const dc = to[0] - from[0];
  const dr = to[1] - from[1];
  if (dc === -1) return 'NW';
  if (dc === 1) return 'SE';
  if (dr === -1) return 'NE';
  if (dr === 1) return 'SW';
  throw new Error(`cells ${from} and ${to} are not neighbours`);
}

const tileFrames: Map<string, string> = (() => {
  const cells = pathCells();
  const first = cells[0];
  const last = cells[cells.length - 1];
  const chain: Cell[] = [
    [first[0] + ENTRY_DIR[0], first[1] + ENTRY_DIR[1]],
    ...cells,
    [last[0] + EXIT_DIR[0], last[1] + EXIT_DIR[1]],
  ];
  const map = new Map<string, string>();
  for (let i = 1; i < chain.length - 1; i++) {
    const sides = [side(chain[i], chain[i - 1]), side(chain[i], chain[i + 1])].sort().join(',');
    map.set(`${chain[i][0]},${chain[i][1]}`, PATH_FRAMES[sides]);
  }
  for (const s of SCENERY) map.set(`${s.c},${s.r}`, s.frame);
  return map;
})();

/** The landscape frame to draw at a grid cell. */
export function tileFrameAt(c: number, r: number): string {
  return tileFrames.get(`${c},${r}`) ?? GRASS_FRAME;
}
