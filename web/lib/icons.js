// Tiny stroke icons for power badges (24x24 viewBox, currentColor).
const P = {
  glass_eye: '<path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
  wedge: '<path d="M3 19h18V9L3 19z"/><path d="M14 19v-6"/>',
  map: '<path d="M3 6l6-2 6 2 6-2v14l-6 2-6-2-6 2z"/><path d="M9 4v14M15 6v14"/>',
  feather: '<path d="M20 4C10 4 5 10 5 17l-1 3 3-1c7 0 13-5 13-15z"/><path d="M5 19L14 10"/>',
  swap: '<path d="M4 8h14l-3-3M20 16H6l3 3"/>',
  anchor: '<circle cx="12" cy="5" r="2"/><path d="M12 7v14M8 11h8M5 14a7 7 0 0 0 14 0"/>',
  forger: '<path d="M4 20l1-4L16 5l3 3L8 19z"/><path d="M14 7l3 3"/>',
  nothing: '<circle cx="12" cy="12" r="8"/><path d="M6 18L18 6"/>',
};

export function iconSvg(power) {
  const body = P[power] || P.nothing;
  return `<svg viewBox="0 0 24 24" width="100%" height="100%" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${body}</svg>`;
}
