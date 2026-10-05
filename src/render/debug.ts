// Design §6: a debug FPS counter, shown only with ?debug=1 (for NFR-1 checks on the iPhone).
export const isDebug = (search: string): boolean => new URLSearchParams(search).get('debug') === '1';
