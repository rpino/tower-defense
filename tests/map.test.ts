import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import {
  GRID_SIZE,
  PATH_WAYPOINTS,
  SCENERY,
  SPOTS,
  TOWER_FRAMES,
  pathCells,
  pathLengthTiles,
  tileFrameAt,
} from '../src/config/map';

function atlasFrames(sheet: string): Set<string> {
  const xml = readFileSync(`public/assets/${sheet}.xml`, 'utf8');
  return new Set([...xml.matchAll(/name="([^"]+)"/g)].map((m) => m[1]));
}

const key = (c: number, r: number) => `${c},${r}`;
const onEdge = ([c, r]: readonly [number, number]) =>
  c === 0 || r === 0 || c === GRID_SIZE - 1 || r === GRID_SIZE - 1;

describe('T-2 map data', () => {
  const cells = pathCells();
  const pathSet = new Set(cells.map(([c, r]) => key(c, r)));

  it('AC-2.1: path waypoints only move horizontally or vertically on the grid', () => {
    for (let i = 1; i < PATH_WAYPOINTS.length; i++) {
      const [c0, r0] = PATH_WAYPOINTS[i - 1];
      const [c1, r1] = PATH_WAYPOINTS[i];
      expect(c0 === c1 || r0 === r1).toBe(true);
    }
  });

  it('AC-2.1: path cells form one continuous chain without repeats', () => {
    for (let i = 1; i < cells.length; i++) {
      const [c0, r0] = cells[i - 1];
      const [c1, r1] = cells[i];
      expect(Math.abs(c1 - c0) + Math.abs(r1 - r0)).toBe(1);
    }
    expect(pathSet.size).toBe(cells.length);
  });

  it('AC-2.1: path is about 24 tiles long (22–26)', () => {
    expect(pathLengthTiles()).toBeGreaterThanOrEqual(22);
    expect(pathLengthTiles()).toBeLessThanOrEqual(26);
  });

  it('AC-2.1: entry and exit are on the map edge, and all cells are inside the grid', () => {
    expect(onEdge(cells[0])).toBe(true);
    expect(onEdge(cells[cells.length - 1])).toBe(true);
    for (const [c, r] of cells) {
      expect(c >= 0 && r >= 0 && c < GRID_SIZE && r < GRID_SIZE).toBe(true);
    }
  });

  it('AC-2.3: exactly 10 build spots, none on the path or on scenery', () => {
    expect(SPOTS).toHaveLength(10);
    const scenery = new Set(SCENERY.map((s) => key(s.c, s.r)));
    for (const s of SPOTS) {
      expect(pathSet.has(key(s.c, s.r))).toBe(false);
      expect(scenery.has(key(s.c, s.r))).toBe(false);
    }
  });

  it('AC-2.1: scenery never blocks the path', () => {
    for (const s of SCENERY) expect(pathSet.has(key(s.c, s.r))).toBe(false);
  });

  it('AC-10.2 / DES-1: every pair of build spots is at least 2 tiles apart', () => {
    for (let i = 0; i < SPOTS.length; i++) {
      for (let j = i + 1; j < SPOTS.length; j++) {
        const d = Math.max(Math.abs(SPOTS[i].c - SPOTS[j].c), Math.abs(SPOTS[i].r - SPOTS[j].r));
        expect(d, `spots ${SPOTS[i].id} and ${SPOTS[j].id}`).toBeGreaterThanOrEqual(2);
      }
    }
  });

  it('every frame the map uses exists in the Kenney atlases', () => {
    const land = atlasFrames('landscape_sheet');
    for (let c = 0; c < GRID_SIZE; c++) {
      for (let r = 0; r < GRID_SIZE; r++) expect(land.has(tileFrameAt(c, r))).toBe(true);
    }
    const grey = atlasFrames('towers_grey_sheet');
    const red = atlasFrames('towers_red_sheet');
    for (const f of TOWER_FRAMES.archer.pieces) expect(grey.has(f)).toBe(true);
    for (const f of TOWER_FRAMES.cannon.pieces) expect(red.has(f)).toBe(true);
  });

  it('path tiles connect to their neighbours (straight vs corner pieces)', () => {
    // A cell between two neighbours in a straight line uses a straight piece.
    expect(tileFrameAt(2, 1)).toBe('landscape_32.png'); // along c
    expect(tileFrameAt(6, 2)).toBe('landscape_29.png'); // along r
    // Corner pieces at the turns of the snake.
    expect(tileFrameAt(6, 1)).toBe('landscape_35.png'); // from c-1, to r+1
    expect(tileFrameAt(6, 3)).toBe('landscape_39.png'); // from r-1, to c-1
    expect(tileFrameAt(1, 3)).toBe('landscape_31.png'); // from c+1, to r+1
    expect(tileFrameAt(1, 5)).toBe('landscape_34.png'); // from r-1, to c+1
  });
});
