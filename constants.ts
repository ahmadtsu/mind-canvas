import type { CustomizationOptions, Zone } from './types';

// A seamless, SVG-based texture to simulate a real corkboard.
export const CORKBOARD_TEXTURE_SVG = `url("data:image/svg+xml;base64,PHN2ZyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnIHdpZHRoPScxMDAnIGhlaWdodD0nMTAwJz48ZmlsdGVyIGlkPSdub2lzZScgeD0nMCcgeT0nMCcgd2lkdGg9JzEwMCUnIGhlaWdodD0nMTAwJSc+PGZlVHVyYnVsZW5jZSB0eXBlPSdmcmFjdGFsTm9pc2UnIGJhc2VGcmVxdWVuY3k9JzAuNjUnIG51bU9jdGF2ZXM9JzMnIHN0aXRjaFRpbGVzPSdzdGl0Y2gnLz48L2ZpbHRlcj48cmVjdCB3aWR0aD0nMTAwJScgaGVpZ2h0PScxMDAlJyBmaWxsPScjRDJCNDhDJy8+PHJlY3Qgd2lkdGg9JzEwMCUnIGhlaWdodD0nMTAwJScgZmlsdGVyPSd1cmwoI25vaXNlKScgb3BhY3R5PScwLjE1Jy8+PC9zdmc+")`;


export const NOTE_DEFAULT_WIDTH = 200;
export const NOTE_DEFAULT_HEIGHT = 150;
export const NOTE_DEFAULT_FONT_SIZE = 16; // Corresponds to text-base

export const NOTE_MIN_WIDTH = 100;
export const NOTE_MIN_HEIGHT = 75;
export const NOTE_MIN_FONT_SIZE = 10;

// Define zone dimensions and spacing for a cleaner, more organized layout
const ZONE_WIDTH = 600;
const ZONE_HEIGHT = 500;
const ZONE_GAP = 150;

export const WORLD_WIDTH = (ZONE_WIDTH * 2) + ZONE_GAP;
export const WORLD_HEIGHT = (ZONE_HEIGHT * 2) + ZONE_GAP;

export const ZONES: Record<string, Zone> = {
  BRAIN_DUMP: {
    id: 'BRAIN_DUMP',
    name: 'Brain Dump',
    bounds: { x: 0, y: 0, width: ZONE_WIDTH, height: ZONE_HEIGHT },
    color: '',
    borderClasses: 'border-2 border-gray-400' // Full border
  },
  TASKS: {
    id: 'TASKS',
    name: 'Tasks',
    bounds: { x: ZONE_WIDTH + ZONE_GAP, y: 0, width: ZONE_WIDTH, height: ZONE_HEIGHT },
    color: '',
    borderClasses: 'border-2 border-gray-400' // Full border
  },
  NOW: {
    id: 'NOW',
    name: 'Now',
    bounds: { x: 0, y: ZONE_HEIGHT + ZONE_GAP, width: ZONE_WIDTH, height: ZONE_HEIGHT },
    color: '',
    borderClasses: 'border-2 border-gray-400' // Full border
  },
  DONE: {
    id: 'DONE',
    name: 'Done',
    bounds: { x: ZONE_WIDTH + ZONE_GAP, y: ZONE_HEIGHT + ZONE_GAP, width: ZONE_WIDTH, height: ZONE_HEIGHT },
    color: '',
    borderClasses: 'border-2 border-gray-400' // Full border
  },
};

export const COLOR_PALETTE = {
  board: ['corkboard', 'bg-white', 'bg-slate-100', 'bg-gray-800', 'bg-stone-50'],
  notes: ['bg-amber-100', 'bg-rose-100', 'bg-teal-100', 'bg-sky-100', 'bg-violet-100'],
  connections: ['stroke-slate-900', 'stroke-sky-600', 'stroke-rose-600', 'stroke-emerald-600']
};

export const DEFAULT_CUSTOMIZATION: CustomizationOptions = {
    boardColor: 'bg-white',
    noteColor: COLOR_PALETTE.notes[0],
    connectionColor: COLOR_PALETTE.connections[0],
};