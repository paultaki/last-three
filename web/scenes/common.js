// Small DOM and geometry helpers shared by every scene.

export function h(tag, cls, text) {
  const node = document.createElement(tag);
  if (cls) node.className = cls;
  if (text != null) node.textContent = text;
  return node;
}

export const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

// Arena measurements. Layouts are expressed in percentages of the arena, so they
// survive resizes; `u` (px) is the size of one figure "unit".
export function measure(root) {
  const r = root.getBoundingClientRect();
  const W = Math.max(1, r.width);
  const H = Math.max(1, r.height);
  const portrait = W / H < 1.2;
  const u = portrait ? Math.min(W * 0.088, H * 0.075) : Math.min(W * 0.052, H * 0.092);
  return { W, H, portrait, u: Math.max(18, u) };
}

export const pctX = (px, env) => (px / env.W) * 100;
export const pctY = (px, env) => (px / env.H) * 100;

export function place(node, x, y, w, hgt) {
  node.style.left = `${x}%`;
  node.style.top = `${y}%`;
  if (w != null) node.style.width = `${w}%`;
  if (hgt != null) node.style.height = `${hgt}%`;
  return node;
}

// Short chip under a figure's name tag while an action is "current" this round.
export function actLabel(act, cut) {
  if (!act) return '';
  if (act.valid === false) return cut ? 'oops?' : '';
  const { verb, arg } = act;
  switch (verb) {
    case 'volunteer':
      return 'volunteers!';
    case 'swap':
      return `swap ${arg}?`;
    case 'step':
      return `step ${arg === 'L' ? 'left' : arg === 'R' ? 'right' : arg}`;
    case 'hold_lever':
      return 'holds lever';
    case 'push_lever':
      return `pushes ${arg}`;
    case 'jam_lever':
      return cut ? 'JAMS it' : '';
    case 'tile':
      return `tile ${arg}`;
    case 'swap_tile':
      return cut ? `swaps ${arg}` : '';
    case 'shove':
      return `shoves ${arg}`;
    case 'brace':
      return 'braces';
    case 'dodge':
      return 'dodges';
    default:
      return '';
  }
}

// Position a figure inside a grid of slots, snaking rows from the front.
export function fill(list, fn) {
  const out = {};
  list.forEach((name, k) => {
    out[name] = fn(k, name);
  });
  return out;
}
