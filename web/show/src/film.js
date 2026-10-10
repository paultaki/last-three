import {
  climbDuration,
  climbNames,
  coverage,
  reactionAllowed,
} from "./cinematography.js";
import { contextBeat, finalists } from "./performance.js";
import { consequence } from "./direction.js";
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
export function filmDuration(s, cut, directing = {}) {
  const d = dialogue(s, cut);
  if (d) {
    const read = d.pages.reduce((sum, text) => sum + readingTime(text), 0);
    return (
      read +
      (reactionAllowed(s, directing) ? 2000 : 600) +
      (directing.receipt
        ? readingTime(directing.receipt.text)
        : directing.forged
          ? 3800
          : 0)
    );
  }
  if (climbDuration(s)) return climbDuration(s);
  if (directing.receipt) return readingTime(directing.receipt.text) + 2400;
  const context = contextBeat(s, cut);
  if (context) return readingTime(context.title + " " + context.detail) + 800;
  if (s.ev?.type === "game_end") return 6500;
  return s.ev?.type === "death"
    ? 5400
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
export function filmShot(view, state, cut, p, directing = {}, ms = 0) {
  if (climbNames(state).length)
    return { eye: [7, 5.6, 8.8], target: [0, 1.8, -2.9] };
  if (view.key === "crusher" && (crusherDive(state) || state.crusher.escaped)) {
    return { eye: [15, 3, -1.8], target: [0, 1, -4.5] };
  }
  if (state.ev?.type === "game_end")
    return { eye: [4, 6, 16], target: [0, 2, 0] };
  const speaker = dialogue(state, cut);
  const actor = view.actors.find((a) => a.name === view.actor && a.visible);
  if (speaker && actor) {
    const read = speaker.pages.reduce((n, text) => n + readingTime(text), 0);
    const phase = coverage(state, directing, read, ms);
    const listener = view.actors.find(
      (a) => a.name === directing.listener && a.visible,
    );
    const focus = phase === "listener" && listener ? listener : actor;
    const [x, y, z] = focus.position;
    if (phase === "establish" && directing.pit)
      return { eye: [6.5, 5.8, 8.4], target: [2.6, 2.2, -2.5] };
    const wide = phase === "establish" ? 1.35 : 1;
    return {
      eye: [x + 1.8 * wide, y + 2.2, z + 4.6 * wide],
      target: [x + 1.2, y + 1.5, z],
    };
  }
  if (actor && contextBeat(state, cut)?.kind === "power") {
    const [x, y, z] = actor.position;
    if (view.key === "crusher")
      return { eye: [x - 3, y + 2.7, z - 5.5], target: [x, y + 1, z] };
    return { eye: [x + 4, y + 3.4, z + 7.8], target: [x + 1, y + 1, z] };
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
      target: [
        center[0] + (directing.receipt ? 1.8 : 0),
        center[1] + 0.9,
        center[2],
      ],
      eye: [center[0] + d * 0.48, center[1] + d * 0.35, center[2] + d],
    };
  }
  if (actor && view.death) {
    if (view.key === "ledge" || view.key === "disc")
      return { eye: [6, 5, 7], target: [0, 0.3, 0] };
    if (view.key === "pit")
      return { eye: [6.5, 5.8, 8.4], target: [2.6, 2.2, -2.5] };
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
    this.directing = {};
    host.innerHTML =
      '<div class="film-heading"><span>LAST THREE</span><b></b></div><svg class="speech-leader" aria-hidden="true"><path/><circle r="5"/></svg><article class="speech-bubble" hidden aria-live="polite"><div class="speaker"><strong></strong><span></span></div><p></p><small></small></article><aside class="evidence-card" hidden><span></span><p></p><small></small></aside><div class="focal-names"></div><div class="film-stakes" hidden></div><div class="consequence" hidden><span>THE CONSEQUENCE</span><strong></strong><p></p></div><aside class="context-card" hidden><span></span><strong></strong><p></p></aside><div class="film-finish" hidden><span>THE LAST THREE</span><strong></strong></div><div class="film-beat" hidden><span></span><p></p></div>';
    this.bubble = host.querySelector("article");
    this.leader = host.querySelector("svg");
    this.beat = host.querySelector(".film-beat");
    this.evidence = host.querySelector(".evidence-card");
    this.names = host.querySelector(".focal-names");
    this.stakes = host.querySelector(".film-stakes");
    this.outcome = host.querySelector(".consequence");
    this.context = host.querySelector(".context-card");
    this.finish = host.querySelector(".film-finish");
  }
  setState(state, cut, directing = {}) {
    this.host.classList.remove("cold-open");
    this.state = state;
    this.directing = directing;
    this.result = consequence(state);
    const context = contextBeat(state, cut),
      podium = finalists(state);
    this.context.hidden = !context;
    this.context.dataset.kind = context?.kind || "";
    this.context.querySelector("span").textContent = context?.label || "";
    this.context.querySelector("strong").textContent = context?.title || "";
    this.context.querySelector("p").textContent = context?.detail || "";
    this.finish.hidden = podium[0]?.place !== 1;
    this.finish.querySelector("strong").textContent =
      podium[0]?.place === 1 ? `${podium[0].name} wins.` : "";
    this.names.replaceChildren();
    this.evidence.hidden = true;
    this.outcome.hidden = true;
    this.host.dataset.scene = state.stage;
    this.host.dataset.dialogue = !!dialogue(state, cut);
    this.host.dataset.rule = state.ev?.type === "stage_start";
    this.stakes.hidden = !directing.pit;
    this.stakes.textContent = directing.pit
      ? "ONE ROPE · RESCUE COSTS 2 FOOTING"
      : "";
    this.d = dialogue(state, cut);
    this.currentPage = -1;
    this.host.querySelector(".film-heading b").textContent =
      TITLES[state.stage] || "";
    this.bubble.hidden = !this.d;
    this.leader.toggleAttribute("hidden", !this.d);
    if (this.d) {
      this.bubble.dataset.kind = this.d.kind;
      this.leader.dataset.kind = this.d.kind;
      this.bubble.style.setProperty("--speaker", this.d.color);
      this.bubble.querySelector("strong").textContent = this.d.name;
      this.bubble.querySelector(".speaker span").textContent = directing.forged
        ? `SIGNED ${directing.forged.signed} · TO ${directing.forged.to}`
        : this.d.label;
      this.revealAt = this.d.pages.reduce(
        (sum, text) => sum + readingTime(text),
        0,
      );
    }
    const hiddenPrivate =
      ["thought", "whisper"].includes(state.ev?.type) && !cut;
    const caption = cut ? state.captionCut : state.caption;
    this.beat.hidden =
      !!this.d || hiddenPrivate || !!context || !!podium.length;
    this.beat.querySelector("span").textContent =
      state.ev?.type === "stage_start" ? "THE RULE" : "";
    this.beat.querySelector("p").textContent =
      state.ev?.type === "stage_start"
        ? RULES[state.stage]
        : caption?.text || RULES[state.stage];
    if (crusherDive(state))
      this.beat.querySelector("p").textContent =
        `${state.crusher.holder} dives clear. The crusher slams shut.`;
    if (directing.contrast)
      this.beat.querySelector("p").textContent = directing.contrast;
    this.render(0);
  }
  setHook() {
    this.host.classList.add("cold-open");
    this.d = null;
    this.host.querySelector(".film-heading b").textContent = "LATER";
    this.beat.hidden = false;
    this.beat.querySelector("span").textContent = "THREE PRIZES. EIGHT MINDS.";
    this.beat.querySelector("p").textContent = "Who would you trust?";
  }
  render(ms, anchor, names = []) {
    if (this.host.classList.contains("cold-open")) return;
    const revealAt = this.d ? this.revealAt : 0;
    const evidence = this.directing.receipt;
    const forged = this.directing.forged;
    const showEvidence = (evidence || forged) && ms >= revealAt;
    this.evidence.hidden = !showEvidence;
    this.evidence.dataset.kind = forged
      ? "forgery"
      : evidence?.private
        ? "private"
        : "callback";
    if (showEvidence) {
      this.evidence.querySelector("span").textContent = forged
        ? "THE NAME WAS A DISGUISE"
        : evidence.label.toUpperCase();
      this.evidence.querySelector("p").textContent = evidence
        ? `“${evidence.text}”`
        : "";
      if (forged)
        this.evidence.querySelector("p").textContent =
          `${forged.sender} sent this. ${forged.signed} did not.`;
      this.evidence.querySelector("small").textContent = forged
        ? `FORGED WHISPER · REAL SENDER: ${forged.sender.toUpperCase()}`
        : evidence.private
          ? evidence.kind === "whisper"
            ? "PRIVATE WHISPER · RECORDED EXCERPT"
            : "PRIVATE THOUGHT · RECORDED EXCERPT"
          : "EARLIER IN THE RECORDING";
    }
    this.outcome.hidden = !this.result || ms < 2700;
    if (this.result) {
      this.beat.hidden = true;
      this.outcome.querySelector("strong").textContent = this.result.title;
      this.outcome.querySelector("p").textContent = this.result.detail;
    }
    const visibleNames = names.filter(
      (n) => n.visible && n.x > 0.04 && n.x < 0.94 && n.y > 0.12 && n.y < 0.85,
    );
    while (this.names.children.length < visibleNames.length)
      this.names.append(document.createElement("span"));
    Array.from(this.names.children).forEach((el, i) => {
      const n = visibleNames[i];
      el.hidden = !n;
      if (!n) return;
      el.textContent = n.label || n.name;
      el.style.left = `${n.x * 100}%`;
      el.style.top = `${n.y * 100}%`;
      el.style.setProperty("--speaker", n.color);
      // Keep names in the picture area, clear of dialogue/evidence cards.
      el.hidden = n.x > 0.5 && ((!!this.d && n.y < 0.55) || !!showEvidence);
    });
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
