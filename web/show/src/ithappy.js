// ithappy "City Characters Mini" cast. The purchased pack stays local: web/show/assets/ithappy/
// links to its Separate_Assets_glb folder (ignored). cast-ithappy.json picks one prebuilt adult
// per seat, a brand tint for its clothes, and the face set used for expressions.
import * as T from "three";

// The pack uses Mixamo-style bone names; the show poses Unreal-style ones.
export const BONE_ALIASES = {
  spine: "spine_01",
  leftarm: "upperarm_l",
  rightarm: "upperarm_r",
  leftforearm: "lowerarm_l",
  rightforearm: "lowerarm_r",
  lefthand: "hand_l",
  righthand: "hand_r",
  leftupleg: "thigh_l",
  rightupleg: "thigh_r",
  leftleg: "calf_l",
  rightleg: "calf_r",
};

export const EXPRESSIONS = ["Usual", "Neutral", "Happy", "Sad", "Angry", "Anger", "Evil", "Surprised", "Confuse", "Impatience"];
const CLOTHES = /(Jacket|Pants|Outwear|Dress|Shirt|Shorts|Skirt|Hat_\d|Coat|Top|Sweater)/i;

/** Rebind a skinned mesh from another file to `bones` (matched by name). */
function rebind(mesh, bones) {
  const mapped = mesh.skeleton.bones.map((b) => bones[b.name] ?? b);
  mesh.bind(new T.Skeleton(mapped, mesh.skeleton.boneInverses), mesh.bindMatrix);
}

/** Load one contestant: the prebuilt character, tinted clothes, and swappable faces. */
export async function loadIthappySeat(loader, base, seat) {
  const rig = (await loader.loadAsync(`${base}Characters/${seat.character}.glb`)).scene;
  const bones = {};
  rig.traverse((o) => {
    if (o.isBone) bones[o.name] = o;
  });
  const faces = {};
  rig.traverse((o) => {
    if (!o.isMesh) return;
    if (/_Face_/.test(o.name)) faces.Usual = o;
    else if (seat.tint && CLOTHES.test(o.name)) {
      // Clothes use a flat colour palette; a solid brand colour keeps them clean.
      o.material = o.material.clone();
      o.material.map = null;
      o.material.color = new T.Color(seat.tint);
    }
  });
  const parent = faces.Usual?.parent ?? rig;
  for (const expr of EXPRESSIONS.filter((e) => e !== "Usual")) {
    try {
      const part = (await loader.loadAsync(`${base}Body_Items/${seat.faces}_Face_${expr}.glb`)).scene;
      let face = null;
      part.traverse((o) => {
        if (o.isSkinnedMesh && !face) face = o;
      });
      if (!face) continue;
      parent.add(face);
      rebind(face, bones);
      face.visible = false;
      faces[expr] = face;
    } catch {
      // A missing expression just falls back to the usual face.
    }
  }
  return { rig, faces };
}

export function setExpression(member, expr) {
  if (!member.faces) return;
  const want = member.faces[expr] ? expr : "Usual";
  if (member.expression === want) return;
  for (const [name, mesh] of Object.entries(member.faces)) mesh.visible = name === want;
  member.expression = want;
}

/** Expression for a seat in the current recorded moment. */
export function expressionFor(s, name, cut) {
  const e = s.ev ?? {};
  if (e.type === "death" && e.name === name) return "Surprised";
  if (!s.players?.[name]?.alive) return "Sad";
  if ((e.type === "thought" && cut) && e.name === name) return "Evil";
  if (e.type === "whisper" && cut && e.from === name) return "Evil";
  if (e.type === "death") return "Surprised";
  return "Usual";
}
