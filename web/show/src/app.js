import { performanceKind, discSaves, contextBeat } from "./performance.js";
import { direction, directedList } from "./direction.js";
import { FilmOverlay, filmDuration, editList } from "./film.js";
import { Arena } from "./scene.js";
import { Score } from "./audio.js";
import {
  stateAt,
  chapters,
  isStepWorthy,
  TITLES,
  RULES,
  COLORS,
  safeTapeId,
  duration,
} from "./model.js";
import { timeline } from "../../lib/state.js";
import { shortModel, powerName, STAGE_SHORT } from "../../lib/text.js";
const $ = (id) => document.getElementById(id),
  params = new URLSearchParams(location.search);
let film = params.get("view") !== "studio",
  clean = film && params.get("clean") === "1",
  demo,
  story = false,
  playlist = [],
  overlay;
document.body.classList.toggle("film", film);
document.body.classList.toggle("clean", clean);
let arena,
  score = new Score(),
  tape,
  state,
  directing,
  index = 0,
  cut = false,
  playing = false,
  speed = 1,
  elapsed = 0,
  animationMs = 0,
  last = 0,
  loadVersion = 0,
  lines = [],
  roster = [],
  chapterButtons = [];
const metrics = { frames: [], errors: [], ready: false };
function notice(text) {
  $("notice").textContent = text;
  $("notice").style.display = "block";
  clearTimeout(notice.timer);
  notice.timer = setTimeout(() => ($("notice").style.display = "none"), 2500);
}
let urlTimer = null,
  lastURLAt = -Infinity,
  pendingURL = "";
function momentURL() {
  const p = new URLSearchParams(location.search);
  p.set("tape", tape.id);
  p.set("i", String(index));
  p.set("view", film ? "film" : "studio");
  if (story) p.set("edit", "story");
  else p.delete("edit");
  if (clean) p.set("clean", "1");
  else p.delete("clean");
  return "?" + p;
}
function updateURL() {
  pendingURL = momentURL();
  $("flat-link").href =
    "../?tape=" + encodeURIComponent(tape.id) + "&i=" + index;
  if (urlTimer !== null) return;
  urlTimer = setTimeout(
    () => {
      history.replaceState(null, "", pendingURL);
      lastURLAt = performance.now();
      urlTimer = null;
    },
    Math.max(0, 500 - (performance.now() - lastURLAt)),
  );
}

function paint() {
  $("presentation").setAttribute("aria-pressed", film);
  $("presentation").textContent = film ? "Film view" : "Studio view";
  $("clean-frame").setAttribute("aria-pressed", clean);
  $("edit-status").textContent = story
    ? "Story cut · " +
      (playlist.indexOf(index) + 1) +
      " / " +
      playlist.length +
      " beats"
    : "Full recording";
  $("director").setAttribute("aria-pressed", cut);
  $("director").querySelector("span").textContent = cut ? "ON" : "OFF";
  $("stage-title").textContent = TITLES[state.stage] || "LAST THREE";
  $("rule").textContent = RULES[state.stage] || "";
  $("stage-number").textContent =
    state.stageIdx >= 0
      ? `OBSTACLE ${String(state.stageIdx + 1).padStart(2, "0")} / 05${state.round ? "  ·  ROUND " + state.round : ""}`
      : state.ended
        ? "FINAL STANDINGS"
        : "THE GAUNTLET / SEASON 01";
  const caption = cut ? state.captionCut : state.caption;
  $("caption").textContent = caption?.text || RULES[state.stage];
  $("event-kind").textContent = caption?.kind?.toUpperCase() || "ARENA FEED";
  $("event-counter").textContent =
    String(index + 1).padStart(3, "0") + " / " + tape.events.length;
  $("scrub").value = index;
  $("back").disabled = index <= (story ? playlist[0] : 0);
  $("next").disabled =
    index >= (story ? playlist.at(-1) : tape.events.length - 1);
  $("play").textContent = playing ? "Ⅱ" : "▶";
  $("play").setAttribute("aria-label", playing ? "Pause" : "Play");
  $("alive").textContent =
    state.order.filter((n) => state.players[n].alive).length + " / 8";
  roster.forEach((r, i) => {
    const p = state.players[state.order[i]];
    r.row.classList.toggle("dead", !p.alive && !p.place);
    r.fate.textContent = p.place ? "#" + p.place : p.alive ? "●" : "OUT";
    r.power.hidden = !(cut || state.ended);
    r.power.textContent = cut || state.ended ? powerName(p.power) : "";
  });
  chapterButtons.forEach((b, j) =>
    b.classList.toggle(
      "active",
      index >= b.dataset.i &&
        (j === chapterButtons.length - 1 ||
          index < +chapterButtons[j + 1].dataset.i),
    ),
  );
  if ($("transcript-panel").open) paintTranscript();
}
function paintTranscript() {
  const ol = $("transcript");
  ol.replaceChildren();
  for (const l of lines) {
    if (l.i > index) break;
    const text = cut ? l.cut : l.pub;
    if (!text) continue;
    const li = document.createElement("li"),
      b = document.createElement("button");
    b.textContent = String(l.i + 1).padStart(3, "0") + "  " + text;
    b.onclick = () => {
      playing = false;
      seek(l.i);
    };
    if (l.i === index) li.className = "current";
    li.append(b);
    ol.append(li);
  }
}
function seek(i, { sound = false } = {}) {
  if (!tape) return;
  index = Math.max(
    0,
    Math.min(tape.events.length - 1, Math.floor(Number(i) || 0)),
  );
  if (story && !playlist.includes(index)) {
    story = false;
    playlist = [];
  }
  state = stateAt(tape, index);
  const previous = stateAt(tape, index - 1);
  elapsed = 0;
  animationMs = 0;
  directing = direction(tape, state, cut);
  arena.setState(state, previous, cut);
  arena.direction = directing;
  arena.performanceKind = performanceKind(state, cut, tape.id);
  arena.discSaves = discSaves(tape, state, cut);
  overlay.setState(state, cut, directing);
  arena.render(0);
  overlay.render(0, arena.speakerAnchor, arena.focalAnchors);
  paint();
  updateURL();
  if (sound) score.event(state);
}
function nextIndex(dir) {
  if (story)
    return playlist[
      Math.max(0, Math.min(playlist.length - 1, playlist.indexOf(index) + dir))
    ];
  let n = index + dir;
  while (n >= 0 && n < tape.events.length && !isStepWorthy(tape.events[n], cut))
    n += dir;
  return Math.max(0, Math.min(tape.events.length - 1, n));
}
async function load(id, start = 0, asStory = false) {
  const ticket = ++loadVersion;
  playing = false;
  metrics.ready = false;
  $("loading").hidden = false;
  $("loading").querySelector("p").textContent = "Loading the recording";
  try {
    const valid = safeTapeId(id);
    if (!valid) throw new Error("Invalid recording ID");
    const r = await fetch("../tapes/" + valid + ".json");
    if (!r.ok) throw new Error("Recording unavailable");
    const data = await r.json();
    if (ticket !== loadVersion) return;
    if (
      !Array.isArray(data.events) ||
      !data.events.length ||
      data.players?.length !== 8
    )
      throw new Error("Invalid recording");
    tape = data;
    story = asStory && data.id === demo?.tape;
    if (story) cut = !!demo.cut;
    playlist = story ? directedList(tape, editList(tape, demo, cut), cut) : [];
    if (story && !playlist.length) story = false;
    if (story && !playlist.includes(Number(start))) start = playlist[0];
    lines = timeline(tape);
    $("scrub").max = tape.events.length - 1;
    $("tape").value = valid;
    $("roster").replaceChildren();
    roster = tape.players.map((p, i) => {
      const row = document.createElement("div");
      row.className = "contestant";
      row.style.setProperty("--seat", COLORS[i]);
      const number = document.createElement("span");
      number.className = "seat-dot";
      number.textContent = String(i + 1).padStart(2, "0");
      const info = document.createElement("div"),
        name = document.createElement("strong"),
        model = document.createElement("span"),
        power = document.createElement("span"),
        fate = document.createElement("span");
      name.textContent = p.name;
      model.className = "model-name";
      model.textContent = shortModel(p.model);
      model.title = p.model;
      power.className = "power";
      fate.className = "fate";
      info.append(name, model, power);
      row.append(number, info, fate);
      $("roster").append(row);
      return { row, power, fate };
    });
    $("chapters").replaceChildren();
    chapterButtons = chapters(tape).map((c) => {
      const b = document.createElement("button");
      b.textContent = STAGE_SHORT[c.id] || c.id;
      b.dataset.i = c.i;
      b.onclick = () => {
        playing = false;
        seek(c.i);
      };
      $("chapters").append(b);
      return b;
    });
    seek(start);
    metrics.ready = true;
    $("loading").hidden = true;
  } catch (e) {
    if (ticket !== loadVersion) return;
    $("loading").querySelector("p").textContent = e.message;
    metrics.errors.push(e.message);
  }
}
function advance(ms) {
  if (!metrics.ready) return;
  animationMs = Math.min(2800, animationMs + ms * speed);
  if (playing) {
    elapsed += ms * speed;
    const hold = film
      ? filmDuration(state, cut, directing)
      : duration(tape.events[index]);
    if (elapsed >= hold) {
      const next = nextIndex(1);
      if (next <= index) {
        playing = false;
        paint();
      } else seek(next, { sound: true });
    }
  }
  arena.render(animationMs / 1000);
  overlay.render(elapsed, arena.speakerAnchor, arena.focalAnchors);
}
function loop(now) {
  requestAnimationFrame(loop);
  const dt = last ? Math.min(100, now - last) : 0;
  last = now;
  if (!metrics.ready || document.hidden) return;
  metrics.frames.push(dt);
  if (metrics.frames.length > 600) metrics.frames.shift();
  advance(dt);
}
function setFilm(on) {
  film = on;
  if (!on) clean = false;
  arena.film = film;
  document.body.classList.toggle("film", film);
  document.body.classList.toggle("clean", clean);
  $("film-overlay").hidden = !film;
  arena.resize();
  seek(index);
}
function toggleClean() {
  clean = !clean;
  setFilm(true);
}
async function init() {
  arena = new Arena($("canvas"), $("labels"));
  arena.film = film;
  overlay = new FilmOverlay($("film-overlay"));
  $("film-overlay").hidden = !film;
  const demoResponse = await fetch("../demo.json");
  if (demoResponse.ok) demo = await demoResponse.json();
  $("demo").disabled = !demo;
  $("demo").onclick = async () => {
    await load(demo.tape, 0, true);
    if (metrics.ready && story) {
      setFilm(true);
      playing = true;
      paint();
    }
  };
  $("presentation").onclick = () => setFilm(!film);
  $("clean-frame").onclick = toggleClean;
  await arena.loadCast(params.get("cast") === "city");
  $("cast-status").textContent = arena.city
    ? "SYNTY CAST / LOCAL PREVIEW"
    : "ORIGINAL STAND-IN CAST";
  const r = await fetch("../tapes/index.json");
  if (!r.ok) throw new Error("Recording list unavailable");
  const tapes = await r.json();
  $("tape").replaceChildren();
  for (const t of tapes) {
    const o = document.createElement("option");
    o.value = t.id;
    o.textContent =
      (t.tier === "heavy" ? "Heavyweights" : "Mixed models") +
      " / " +
      t.id +
      " / v" +
      (t.rules || 1);
    $("tape").append(o);
  }
  $("tape").onchange = () => load($("tape").value);
  $("play").onclick = () => {
    if (!metrics.ready) return;
    if (index >= (story ? playlist.at(-1) : tape.events.length - 1))
      seek(story ? playlist[0] : 0);
    playing = !playing;
    paint();
  };
  $("back").onclick = () => {
    playing = false;
    seek(nextIndex(-1));
  };
  $("next").onclick = () => {
    playing = false;
    seek(nextIndex(1));
  };
  $("scrub").oninput = () => {
    playing = false;
    seek($("scrub").value);
  };
  $("speed").onchange = () => (speed = Number($("speed").value));
  $("director").onclick = () => {
    cut = !cut;
    if (story) {
      playlist = directedList(tape, editList(tape, demo, cut), cut);
      if (!playlist.includes(index))
        seek(playlist.find((i) => i > index) ?? playlist.at(-1));
    }
    $("director").setAttribute("aria-pressed", cut);
    $("director").querySelector("span").textContent = cut ? "ON" : "OFF";
    seek(index);
  };
  $("camera").onclick = () => {
    arena.mode = arena.mode === "wide" ? "cinema" : "wide";
    $("camera").textContent = "Camera: " + arena.mode;
    $("camera").setAttribute("aria-pressed", arena.mode === "wide");
    arena.render(animationMs / 1000);
  };
  $("quality").onchange = () => arena.setQuality($("quality").value);
  $("sound").onclick = async () => {
    try {
      const on = await score.toggle();
      $("sound").textContent = on ? "Sound on" : "Sound off";
      $("sound").setAttribute("aria-pressed", on);
      if (on && state) score.event(state);
    } catch {
      notice("Audio is unavailable in this browser.");
    }
  };
  $("share").onclick = async () => {
    try {
      await navigator.clipboard.writeText(
        new URL(momentURL(), location.href).href,
      );
      notice("Link copied to this moment");
    } catch {
      notice("Copy the current URL to share this moment");
    }
  };
  $("transcript-panel").ontoggle = () => {
    if ($("transcript-panel").open && state) paintTranscript();
  };
  document.addEventListener("keydown", (e) => {
    const tag = document.activeElement?.tagName;
    if (
      ["INPUT", "SELECT", "TEXTAREA"].includes(tag) ||
      document.activeElement?.isContentEditable ||
      e.ctrlKey ||
      e.metaKey ||
      e.altKey
    )
      return;
    if (e.key === " " && ["BUTTON", "A", "SUMMARY"].includes(tag)) return;
    const map = {
      " ": "play",
      ArrowLeft: "back",
      ArrowRight: "next",
      d: "director",
      D: "director",
      f: "clean-frame",
      F: "clean-frame",
    };
    if (e.key === "Escape" && clean) {
      toggleClean();
      return;
    }
    if (map[e.key]) {
      e.preventDefault();
      $(map[e.key]).click();
    }
  });
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      playing = false;
      if (state) paint();
    }
  });
  window.__show = {
    seek,
    load,
    preview: (ms) => {
      playing = false;
      elapsed = Math.max(0, Number(ms) || 0);
      animationMs = Math.min(2800, elapsed);
      arena.render(animationMs / 1000);
      overlay.render(elapsed, arena.speakerAnchor, arena.focalAnchors);
    },
    settle: () => {
      animationMs = 2800;
      arena.render(2.8);
    },
    get film() {
      return film;
    },
    get story() {
      return story;
    },
    get playlist() {
      return [...playlist];
    },
    get elapsed() {
      return elapsed;
    },
    get state() {
      return state;
    },
    get index() {
      return index;
    },
    get playing() {
      return playing;
    },
    get cut() {
      return cut;
    },
    get metrics() {
      return { ...metrics, ...arena.stats() };
    },
    snapshot: () => JSON.stringify({ state, view: arena.view }),
  };
  window.advanceTime = (ms) => {
    for (
      let left = Math.max(0, Math.min(Number(ms) || 0, 60000));
      left > 0;
      left -= 1000 / 60
    )
      advance(Math.min(left, 1000 / 60));
  };
  window.render_game_to_text = () =>
    JSON.stringify({
      index,
      playing,
      film,
      story,
      stage: state?.stage,
      dialogue: overlay.d,
      page: overlay.currentPage,
      direction: directing,
      performance: arena.performanceKind,
      context: contextBeat(state, cut),
      actors: arena.view?.actors,
      coordinates: "world units; x right, y up, z toward front",
    });
  const requested = safeTapeId(params.get("tape"));
  await load(
    (params.get("edit") === "story" && demo ? demo.tape : requested) ||
      tapes.find((t) => t.rules === 4)?.id ||
      tapes[0].id,
    params.get("i") || 0,
    params.get("edit") === "story",
  );
  requestAnimationFrame(loop);
}
init().catch((e) => {
  metrics.errors.push(e.message);
  $("loading").querySelector("p").textContent = e.message;
  console.error(e);
});
