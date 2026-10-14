// Reports the structure of a purchased character pack without copying any of it:
// files, and for every .glb its skeleton bone names, meshes, triangles, materials,
// morph targets (facial expressions) and animation clips.
//
//   node web/show/tools/inspect-cast.mjs <pack folder> > docs/show/cast-inspection.json
//
// The output holds names and counts only (no geometry or textures), so it is safe to commit.
import fs from "node:fs";
import path from "node:path";

const root = process.argv[2];
if (!root || !fs.existsSync(root)) {
  console.error("Usage: node web/show/tools/inspect-cast.mjs <pack folder>");
  process.exit(1);
}

const walk = (dir) =>
  fs.readdirSync(dir, { withFileTypes: true }).flatMap((d) => {
    const p = path.join(dir, d.name);
    return d.isDirectory() ? walk(p) : [p];
  });

function glbJson(file) {
  const buf = fs.readFileSync(file);
  if (buf.readUInt32LE(0) !== 0x46546c67) throw new Error("not a GLB");
  const length = buf.readUInt32LE(12);
  return JSON.parse(buf.subarray(20, 20 + length).toString("utf8"));
}

function inspectGlb(file) {
  const g = glbJson(file);
  const nodes = g.nodes ?? [];
  const triangles = (g.meshes ?? []).reduce(
    (sum, mesh) =>
      sum +
      mesh.primitives.reduce((s, p) => {
        const count = p.indices !== undefined ? g.accessors[p.indices].count : g.accessors[p.attributes.POSITION].count;
        return s + ((p.mode ?? 4) === 4 ? count / 3 : 0);
      }, 0),
    0,
  );
  return {
    skins: (g.skins ?? []).map((s) => ({ joints: s.joints.map((j) => nodes[j]?.name) })),
    meshes: (g.meshes ?? []).map((m) => ({
      name: m.name,
      morphTargets: m.extras?.targetNames ?? (m.primitives[0]?.targets ? `${m.primitives[0].targets.length} unnamed` : []),
    })),
    triangles: Math.round(triangles),
    materials: (g.materials ?? []).map((m) => m.name),
    textures: (g.images ?? []).map((i) => i.name ?? i.uri ?? i.mimeType),
    animations: (g.animations ?? []).map((a) => a.name),
    nodeCount: nodes.length,
  };
}

const files = walk(root).map((p) => path.relative(root, p));
const byExt = {};
for (const f of files) byExt[path.extname(f).toLowerCase() || "(none)"] = (byExt[path.extname(f).toLowerCase() || "(none)"] ?? 0) + 1;
const glbs = {};
for (const f of files.filter((f) => f.toLowerCase().endsWith(".glb"))) {
  try {
    glbs[f] = inspectGlb(path.join(root, f));
  } catch (e) {
    glbs[f] = { error: e.message };
  }
}
console.log(JSON.stringify({ pack: path.basename(root), fileCount: files.length, byExtension: byExt, files: files.slice(0, 400), glbs }, null, 2));
