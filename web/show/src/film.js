import {
  visibleActor,
  isStepWorthy,
  RULES,
  TITLES,
  COLORS,
  crusherDive,
} from "./model.js";

// Reading beats preserve the recording verbatim, including whitespace.
export function passages(text, limit = 150) {
  const words = String(text || "").match(/\S+\s*/g) || [];
  const pages = [];
  for (const word of words) {
    if (!pages.length) {
      pages.push(word);
      continue;
    }
    const last = pages.at(-1);
    if (last.length + word.length <= limit) {
      pages[pages.length - 1] += word;
      continue;
    }
    const boundaries = [...last.matchAll(/[.!?;]\s+/g)];
    const boundary = boundaries.at(-1);
    const split = boundary ? boundary.index + boundary[0].length : 0;
    if (split >= 45) {
      pages[pages.length - 1] = last.slice(0, split);
      pages.push(last.slice(split) + word);
    } else pages.push(word);
  }
  if (pages.length > 1 && pages.at(-1).trim().length < 45) {
    const previous = pages[pages.length - 2].match(/\S+\s*/g) || [];
    while (pages.at(-1).length < 65 && previous.length > 1)
      pages[pages.length - 1] = previous.pop() + pages.at(-1);
    pages[pages.length - 2] = previous.join("");
  }
  return pages.length ? pages : [""];
}
export const readingTime = (text) =>
  Math.max(3200, 1500 + String(text).trim().split(/\s+/).length * 340);
export function dialogue(s, cut) {
  const e = s.ev || {};
  if (!["say", "thought", "whisper", "chalk_write"].includes(e.type))
    return null;
  if (["thought", "whisper"].includes(e.type) && !cut) return null;
  const name = visibleActor(s, cut);
  if (!name || !e.text) return null;
  return {
    name,
    text: String(e.text),
    pages: passages(e.text),
    kind: e.type,
    label:
      e.type === "thought"
        ? "PRIVATE THOUGHT"
        : e.type === "whisper"
          ? `WHISPER TO ${e.to}`
          : e.type === "chalk_write"
            ? "LEAVES A NOTE"
            : "SAYS",
    color: COLORS[s.order.indexOf(name)] || "#edc181",
  };
}
export function filmDuration(s, cut) {
  const d = dialogue(s, cut);
  if (d) return d.pages.reduce((sum, text) => sum + readingTime(text), 0) + 600;
  return s.ev?.type === "death"
    ? 3800
    : s.ev?.type === "stage_start"
      ? 4200
      : 2300;
}
export function pageAt(d, ms) {
  let end = 0;
  for (let i = 0; i < d.pages.length; i++) {
    end += readingTime(d.pages[i]);
    if (ms < end) return i;
  }
  return d.pages.length - 1;
}
export function editList(tape, demo, cut) {
  if (tape.id !== demo.tape) return [];
  return [
    ...new Set(
      demo.segments.flatMap(({ from, to }) => {
        const indices = [];
        for (let i = from; i <= to && i < tape.events.length; i++) {
          if (i >= 0 && isStepWorthy(tape.events[i], cut)) indices.push(i);
        }
        return indices;
      }),
    ),
  ].sort((a, b) => a - b);
}

// Camera composition leaves the right half of dialogue shots for the bubble.
export function filmShot(view, state, cut, p) {
  if (view.key === "crusher" && (crusherDive(state) || state.crusher.escaped)) {
    return { eye: [15, 3, -1.8], target: [0, 1, -4.5] };
  }
  const speaker = dialogue(state, cut);
  const actor = view.actors.find((a) => a.name === view.actor && a.visible);
  if (speaker && actor) {
    const [x, y, z] = actor.position;
    return {
      eye: [x + 3.6, y + 2.9, z + 6.8],
      target: [x + 1.65, y + 1.6, z - 0.4],
    };
  }
  if (actor && state.ev?.type === "action") {
    const name = String(state.ev.action).split(":")[1];
    const other = view.actors.find((a) => a.name === name && a.visible);
    const center = actor.position.map((n, i) =>
      other ? (n + other.position[i]) / 2 : n,
    );
    const distance = other
      ? Math.hypot(...actor.position.map((n, i) => n - other.position[i]))
      : 0;
    const d = Math.max(8, distance * 1.25);
    return {
      target: [center[0], center[1] + 0.9, center[2]],
      eye: [center[0] + d * 0.48, center[1] + d * 0.45, center[2] + d],
    };
  }
  if (actor && view.death) {
    const [x, y, z] = actor.position;
    const down = ["shatter", "chute", "tumble"].includes(actor.pose)
      ? p * 2.5
      : 0;
    return {
      target: [x, y + 0.8 - down, z],
      eye: [x + 8, y + 4 - down, z + (view.key === "bridge" ? 3 : 9)],
    };
  }
  return null;
}

export class FilmOverlay {
  constructor(host) {
    this.host = host;
    host.innerHTML =
      '<div class="film-heading"><span>LAST THREE</span><b></b></div><svg class="speech-leader" aria-hidden="true"><path/><circle r="5"/></svg><article class="speech-bubble" hidden aria-live="polite"><div class="speaker"><strong></strong><span></span></div><p></p><small></small></article><div class="film-beat" hidden><span></span><p></p></div>';
    this.bubble = host.querySelector("article");
    this.leader = host.querySelector("svg");
    this.beat = host.querySelector(".film-beat");
  }
  setState(state, cut) {
    this.state = state;
    this.d = dialogue(state, cut);
    this.currentPage = -1;
    this.host.querySelector(".film-heading b").textContent =
      TITLES[state.stage] || "";
    this.bubble.hidden = !this.d;
    this.leader.toggleAttribute("hidden", !this.d);
    if (this.d) {
      this.bubble.dataset.kind = this.d.kind;
      this.bubble.style.setProperty("--speaker", this.d.color);
      this.bubble.querySelector("strong").textContent = this.d.name;
      this.bubble.querySelector(".speaker span").textContent = this.d.label;
    }
    const hiddenPrivate =
      ["thought", "whisper"].includes(state.ev?.type) && !cut;
    const caption = cut ? state.captionCut : state.caption;
    this.beat.hidden = !!this.d || hiddenPrivate;
    this.beat.querySelector("span").textContent =
      state.ev?.type === "stage_start" ? "THE RULE" : "";
    this.beat.querySelector("p").textContent =
      state.ev?.type === "stage_start"
        ? RULES[state.stage]
        : caption?.text || RULES[state.stage];
    if (crusherDive(state))
      this.beat.querySelector("p").textContent =
        `${state.crusher.holder} dives clear. The crusher slams shut.`;
    this.render(0);
  }
  render(ms, anchor) {
    if (!this.d) return;
    const page = pageAt(this.d, ms);
    if (page !== this.currentPage) {
      this.currentPage = page;
      this.bubble.querySelector("p").textContent = this.d.pages[page];
      this.bubble.querySelector("small").textContent =
        this.d.pages.length > 1 ? `${page + 1} / ${this.d.pages.length}` : "";
    }
    if (!anchor) return;
    const w = this.host.clientWidth,
      h = this.host.clientHeight;
    const x = anchor.x * w,
      y = anchor.y * h;
    const box = this.bubble.getBoundingClientRect(),
      rect = this.host.getBoundingClientRect();
    const bx = box.left - rect.left + 25,
      by = box.bottom - rect.top - 12;
    this.leader.style.display = anchor.visible ? "" : "none";
    this.leader.setAttribute("viewBox", `0 0 ${w} ${h}`);
    this.leader
      .querySelector("path")
      .setAttribute("d", `M ${bx} ${by} Q ${bx - 25} ${by + 28} ${x} ${y}`);
    this.leader.querySelector("circle").setAttribute("cx", x);
    this.leader.querySelector("circle").setAttribute("cy", y);
  }
}
