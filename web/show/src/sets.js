import * as T from "three";
import { crusherCeiling } from "./model.js";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
export const mats = {
  concrete: new T.MeshStandardMaterial({ color: 0x7d939b, roughness: 0.82 }),
  light: new T.MeshStandardMaterial({ color: 0xa5b6b6, roughness: 0.74 }),
  dark: new T.MeshStandardMaterial({
    color: 0x172632,
    roughness: 0.56,
    metalness: 0.5,
  }),
  metal: new T.MeshStandardMaterial({
    color: 0x3d5662,
    roughness: 0.3,
    metalness: 0.8,
  }),
  gold: new T.MeshStandardMaterial({
    color: 0xdd9d46,
    roughness: 0.36,
    metalness: 0.55,
  }),
  black: new T.MeshStandardMaterial({ color: 0x090e14, roughness: 0.86 }),
  cyan: new T.MeshStandardMaterial({
    color: 0x81ffff,
    emissive: 0x30b8c2,
    emissiveIntensity: 2,
  }),
  amber: new T.MeshStandardMaterial({
    color: 0xffd68a,
    emissive: 0xffa947,
    emissiveIntensity: 1.5,
  }),
  water: new T.MeshPhysicalMaterial({
    color: 0x177780,
    metalness: 0.48,
    roughness: 0.17,
    transparent: true,
    opacity: 0.73,
    clearcoat: 1,
  }),
  glass: new T.MeshPhysicalMaterial({
    color: 0xa7eced,
    metalness: 0.12,
    roughness: 0.09,
    transparent: true,
    opacity: 0.36,
    clearcoat: 1,
    side: T.DoubleSide,
  }),
};
mats.water.userData.clock = { value: 0 };
mats.water.onBeforeCompile = (shader) => {
  shader.uniforms.showTime = mats.water.userData.clock;
  shader.vertexShader = "varying vec3 showPos;\n" + shader.vertexShader;
  shader.vertexShader = shader.vertexShader.replace(
    "#include <begin_vertex>",
    "#include <begin_vertex>\nshowPos=position;",
  );
  shader.fragmentShader =
    "uniform float showTime; varying vec3 showPos;\n" + shader.fragmentShader;
  shader.fragmentShader = shader.fragmentShader.replace(
    "#include <normal_fragment_maps>",
    "#include <normal_fragment_maps>\nnormal=normalize(normal+vec3(sin(showPos.x*3.0+showTime)*0.13,0.0,cos(showPos.z*2.7+showTime)*0.13));",
  );
};
export function mesh(g, m, parent, x = 0, y = 0, z = 0) {
  const o = new T.Mesh(g, m);
  o.position.set(x, y, z);
  o.castShadow = true;
  o.receiveShadow = true;
  parent.add(o);
  return o;
}
export function box(parent, w, h, d, x, y, z, m = mats.concrete) {
  return mesh(
    new RoundedBoxGeometry(
      w,
      h,
      d,
      1,
      Math.min(0.08, w * 0.08, h * 0.08, d * 0.08),
    ),
    m,
    parent,
    x,
    y,
    z,
  );
}
export function cyl(parent, r, h, x, y, z, m = mats.metal, segments = 48) {
  return mesh(new T.CylinderGeometry(r, r, h, segments), m, parent, x, y, z);
}
export function bar(parent, a, b, r = 0.06, m = mats.metal) {
  const va = new T.Vector3(...a),
    vb = new T.Vector3(...b);
  const o = mesh(new T.CylinderGeometry(r, r, va.distanceTo(vb), 8), m, parent);
  o.position.copy(va).add(vb).multiplyScalar(0.5);
  o.quaternion.setFromUnitVectors(
    new T.Vector3(0, 1, 0),
    vb.sub(va).normalize(),
  );
  return o;
}
export function textPlate(
  parent,
  text,
  w,
  x,
  y,
  z,
  color = "#d4e8df",
  bg = null,
) {
  const c = document.createElement("canvas");
  c.width = 1024;
  c.height = 192;
  const a = c.getContext("2d");
  if (bg) {
    a.fillStyle = bg;
    a.fillRect(0, 0, 1024, 192);
  }
  a.fillStyle = color;
  a.font = "800 104px Arial";
  a.textAlign = "center";
  a.textBaseline = "middle";
  a.fillText(text, 512, 96, 990);
  const tex = new T.CanvasTexture(c);
  tex.colorSpace = T.SRGBColorSpace;
  const o = mesh(
    new T.PlaneGeometry(w, (w * 192) / 1024),
    new T.MeshBasicMaterial({
      map: tex,
      transparent: true,
      side: T.DoubleSide,
      depthWrite: false,
    }),
    parent,
    x,
    y,
    z,
  );
  o.castShadow = false;
  return o;
}
function annulus(
  parent,
  inner,
  outer,
  h,
  y,
  m,
  start = 0,
  length = Math.PI * 2,
) {
  const shape = new T.Shape();
  shape.absarc(0, 0, outer, start, start + length, false);
  shape.absarc(0, 0, inner, start + length, start, true);
  shape.closePath();
  const o = mesh(
    new T.ExtrudeGeometry(shape, {
      depth: h,
      bevelEnabled: false,
      curveSegments: 48,
    }),
    m,
    parent,
    0,
    y,
    0,
  );
  o.rotation.x = -Math.PI / 2;
  return o;
}
function studs(parent, r, y, count = 40) {
  const inst = new T.InstancedMesh(
    new T.CylinderGeometry(0.075, 0.075, 0.035, 6),
    mats.metal,
    count,
  );
  const d = new T.Object3D();
  for (let i = 0; i < count; i++) {
    const a = (i / count) * Math.PI * 2;
    d.position.set(Math.cos(a) * r, y, Math.sin(a) * r);
    d.updateMatrix();
    inst.setMatrixAt(i, d.matrix);
  }
  parent.add(inst);
}
function stripes(parent, width, x, y, z) {
  for (let i = 0; i < width; i++) {
    const o = box(
      parent,
      0.38,
      0.02,
      0.6,
      x + i * 0.62,
      y,
      z,
      i % 2 ? mats.black : mats.gold,
    );
    o.rotation.y = 0.35;
  }
}
function railing(parent, a, b) {
  bar(parent, [a[0], a[1] + 1, a[2]], [b[0], b[1] + 1, b[2]], 0.045);
  for (let i = 0; i <= 6; i++) {
    let t = i / 6;
    const p = a.map((v, j) => v + (b[j] - v) * t);
    bar(parent, p, [p[0], p[1] + 1, p[2]], 0.04);
  }
}
export function buildSet(key) {
  const g = new T.Group();
  const refs = {};
  // Practical lighting and architectural framing repeat across the arena.
  const pad = cyl(g, 10, 0.65, 0, -1.6, 0, mats.dark, 64);
  if (["bridge", "ledge", "disc"].includes(key)) pad.visible = false;
  for (let k = 0; k < 12; k++) {
    const a = (k / 12) * Math.PI * 2;
    const x = Math.sin(a) * 11,
      z = Math.cos(a) * 11;
    box(g, 0.42, 3.5, 0.5, x, 0.25, z, mats.dark);
    box(g, 0.09, 2.5, 0.12, x, 0.75, z + 0.26, mats.cyan);
    cyl(g, 0.4, 0.18, x, -1.3, z, mats.metal, 12);
  }
  if (key === "pit") {
    pad.position.y = -1.5;
    cyl(g, 4.55, 0.32, 0, -1.06, 0, mats.dark);
    // Open viewing face; side and rear reservoir walls retain the full height.
    annulus(g, 4.35, 5.35, 3.7, -0.9, mats.concrete, 0, Math.PI);
    annulus(g, 4.35, 5.35, 0.4, -0.9, mats.concrete, Math.PI, Math.PI);
    annulus(g, 4.33, 5.4, 0.2, 2.8, mats.light, 0, Math.PI);
    box(g, 12, 0.35, 3.1, 0, 2.62, -4.5, mats.light);
    box(g, 12, 0.12, 0.15, 0, 2.86, -3.02, mats.gold);
    railing(g, [-6, 2.8, -5.9], [6, 2.8, -5.9]);
    for (let i = 0; i < 7; i++)
      box(
        g,
        2,
        0.4 + i * 0.42,
        1,
        -6.2,
        -0.65 + i * 0.21,
        3.2 - i * 0.93,
        mats.concrete,
      );
    refs.water = cyl(g, 4.3, 0.055, 0, -0.5, 0, mats.water, 64);
    refs.ripples = [];
    for (let i = 0; i < 6; i++) {
      const r = mesh(
        new T.RingGeometry(0.5 + i * 0.55, 0.52 + i * 0.55, 64),
        new T.MeshBasicMaterial({
          color: 0x95e7df,
          transparent: true,
          opacity: 0.22,
          side: T.DoubleSide,
        }),
        g,
      );
      r.rotation.x = -Math.PI / 2;
      refs.ripples.push(r);
    }
    for (let i = 0; i < 3; i++) {
      bar(g, [-5.1 + i * 0.5, 4, -6.1], [-5.1 + i * 0.5, -0.5, -6.1], 0.12);
      bar(g, [-5.1 + i * 0.5, -0.5, -6.1], [-5.1 + i * 0.5, -0.5, -2.7], 0.12);
    }
    box(g, 3.7, 0.6, 0.35, 0, 5, -6.15, mats.black);
    textPlate(g, "03 / THE PIT", 3.4, 0, 5, -5.95);
    for (let i = 0; i < 4; i++) {
      box(g, 0.12, 0.16, 2, -3 + i * 2, 2.82, -4.6, mats.cyan);
    }
    stripes(g, 17, -5.1, 2.82, -3.35);
    studs(g, 4.8, 2.98);
    refs.rope = new T.Group();
    g.add(refs.rope);
    for (let i = 0; i < 8; i++) {
      const t = i / 7;
      bar(
        refs.rope,
        [0, 3.4 - t * 3.8, -3.25 + 0.7 * Math.sin(t * Math.PI)],
        [
          0,
          3.4 - (t + 1 / 7) * 3.8,
          -3.25 + 0.7 * Math.sin((t + 1 / 7) * Math.PI),
        ],
        0.04,
        mats.gold,
      );
    }
    refs.rope.visible = false;
    textPlate(g, "RESERVOIR / 03", 3.3, 0, -0.32, 4.9);
  } else if (key === "bridge") {
    pad.scale.set(0.8, 1, 1.6);
    box(g, 8, 0.6, 4, 0, -0.32, 11.6, mats.light);
    box(g, 8, 0.6, 3, 0, -0.32, -12, mats.light);
    for (let x of [-3, 3]) {
      box(g, 0.22, 0.55, 23, x, -0.5, -0.5, mats.metal);
      box(g, 0.06, 0.08, 23, x, -0.17, -0.5, mats.cyan);
    }
    refs.panes = [];
    refs.bridgePosts = [];
    refs.laneLabels = [];
    for (let i = 0; i < 8; i++)
      for (let j = 0; j < 2; j++) {
        const z = 10 - (i + 1) * 2.35,
          x = j ? 1.45 : -1.45;
        for (let dx of [-1.4, 1.4])
          box(g, 0.09, 0.18, 2.25, x + dx, -0.15, z, mats.metal);
        for (let dz of [-1.1, 1.1])
          box(g, 2.88, 0.18, 0.09, x, -0.15, z + dz, mats.metal);
        const p = box(g, 2.62, 0.15, 1.98, x, 0, z, mats.glass);
        refs.panes.push(p);
        const lane = textPlate(
          g,
          `${i + 1} / ${j ? "RIGHT" : "LEFT"}`,
          1.4,
          x,
          0.11,
          z + 0.58,
          "#fff5db",
        );
        lane.rotation.x = -Math.PI / 2;
        refs.laneLabels.push(lane);
        box(g, 2.4, 0.045, 0.025, x, 0.09, z + 0.85, mats.cyan);
        textPlate(
          g,
          String(i + 1).padStart(2, "0"),
          0.55,
          -3.9,
          0.12,
          z,
        ).rotation.x = -Math.PI / 2;
      }
    for (let z of [-12, 11.5]) {
      refs.bridgePosts.push(box(g, 8, 0.2, 0.2, 0, 5, z, mats.gold));
      for (let x of [-4, 4])
        refs.bridgePosts.push(box(g, 0.23, 5, 0.23, x, 2.5, z, mats.metal));
    }
    textPlate(g, "01 / TRUST YOUR STEP", 6, 0, 4, -12);
    stripes(g, 12, -3.4, 0.01, 10.3);
  } else if (key === "crusher") {
    box(g, 13, 0.7, 12, 0, -0.38, 0, mats.light);
    // A real doorway and exit apron, rather than a door painted over a solid wall.
    refs.cameraObstacles = [
      box(g, 8.3, 5, 0.4, -2.35, 2.5, -6, mats.concrete),
      box(g, 1.7, 5, 0.4, 5.65, 2.5, -6, mats.concrete),
      box(g, 3, 1.4, 0.4, 3.3, 4.3, -6, mats.concrete),
    ];
    box(g, 5, 0.7, 5, 3.3, -0.38, -7.8, mats.light);
    stripes(g, 7, 1.1, 0.01, -9.8);
    for (let x of [-5.8, 5.8])
      for (let z of [-4.5, 4.5]) {
        const post = cyl(g, 0.35, 7, x, 3.2, z, mats.metal, 16);
        const foot = cyl(g, 0.56, 0.6, x, 0.1, z, mats.dark);
        refs.cameraObstacles.push(post, foot);
      }
    refs.ceiling = box(g, 11, 0.85, 9, 0, 5, 0, mats.dark);
    for (let i = 0; i < 12; i++)
      box(
        refs.ceiling,
        0.5,
        0.06,
        8,
        -5 + i * 0.88,
        -0.46,
        0,
        i % 2 ? mats.gold : mats.black,
      );
    refs.cameraObstacles.push(
      box(g, 3.2, 3.8, 0.15, 3.3, 1.9, -5.72, mats.black),
    );
    refs.door = box(g, 3, 3.4, 0.23, 3.3, 1.7, -5.6, mats.metal);
    textPlate(g, "EXIT", 2, 3.3, 4.3, -5.73, "#90f9df");
    box(g, 0.9, 1.25, 0.75, -4.3, 0.63, -2.5, mats.dark);
    refs.lever = new T.Group();
    refs.lever.position.set(-4.3, 1.2, -2.5);
    g.add(refs.lever);
    bar(refs.lever, [0, 0, 0], [0, 0.75, 0.45], 0.09, mats.gold);
    bar(refs.lever, [-0.35, 0.75, 0.45], [0.35, 0.75, 0.45], 0.13, mats.black);
    stripes(g, 17, -5, 0.04, 4.5);
    textPlate(g, "02 / NO FREE EXIT", 5, -1.3, 4.1, -5.72);
  } else if (key === "disc") {
    annulus(g, 4.6, 5.7, 0.65, -0.7, mats.dark);
    annulus(g, 4.6, 5.7, 0.15, 0, mats.light);
    studs(g, 5.2, 0.2);
    refs.tiles = [];
    refs.numbers = [];
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2,
        x = Math.sin(a) * 3.4,
        z = Math.cos(a) * 3.4;
      const p = box(g, 1.8, 0.16, 1.8, x, 0, z, mats.gold);
      refs.tiles.push(p);
      const t = textPlate(
        g,
        String(i + 1).padStart(2, "0"),
        0.75,
        x,
        0.095,
        z,
        "#101d28",
      );
      t.rotation.x = -Math.PI / 2;
      refs.numbers.push(t);
    }
    cyl(g, 1.55, 0.32, 0, 0, 0, mats.metal);
    const t = textPlate(g, "CHOOSE", 2, 0, 0.18, 0);
    t.rotation.x = -Math.PI / 2;
    textPlate(g, "04 / LUCK HAS A NUMBER", 7, 0, 4.7, -6);
  } else if (key === "ledge") {
    refs.ledge = new T.Group();
    g.add(refs.ledge);
    cyl(refs.ledge, 4.5, 0.85, 0, -0.45, 0, mats.light, 5);
    annulus(refs.ledge, 4.28, 4.48, 0.06, -0.02, mats.gold);
    for (let i = 0; i < 5; i++) {
      const a = (i / 5) * Math.PI * 2;
      box(
        refs.ledge,
        0.07,
        0.015,
        6,
        Math.sin(a) * 0.1,
        0.015,
        0,
        mats.dark,
      ).rotation.y = a;
    }
    const o = mesh(
      new T.CylinderGeometry(3.6, 1.5, 3, 5),
      mats.concrete,
      refs.ledge,
      0,
      -2.25,
      0,
    );
    o.rotation.y = 0.2;
    for (let k = 0; k < 5; k++) {
      const a = (k / 5) * Math.PI * 2;
      bar(
        g,
        [Math.sin(a) * 4, -1, Math.cos(a) * 4],
        [Math.sin(a) * 9, -6, Math.cos(a) * 9],
        0.12,
      );
    }
    textPlate(g, "05 / NOTHING TO SHARE", 7, 0, 5, -6);
  } else if (key === "chalk" || key === "ended") {
    box(g, 13, 0.7, 9, 0, -0.4, 0, mats.light);
    for (let [x, h] of [
      [0, 1.5],
      [-3, 0.9],
      [3, 0.5],
    ]) {
      box(g, 2.4, h, 2.7, x, h / 2, 0, mats.dark);
      box(g, 2.42, 0.1, 2.72, x, h + 0.02, 0, mats.gold);
      textPlate(
        g,
        x === 0 ? "01" : x < 0 ? "02" : "03",
        1,
        x,
        h / 2,
        1.365,
        "#ffce80",
      );
    }
    box(g, 13, 5, 0.4, 0, 2.5, -4.6, mats.dark);
    textPlate(
      g,
      key === "chalk" ? "LEAVE SOMETHING BEHIND" : "ONLY THREE. NEVER SHARED.",
      10,
      0,
      4,
      -4.35,
      "#f1ce91",
    );
    refs.board = new T.Group();
    g.add(refs.board);
  } else {
    box(g, 15, 0.8, 11, 0, -0.44, 0, mats.light);
    box(g, 15, 5, 0.4, 0, 2.5, -5.5, mats.dark);
    textPlate(g, "LAST THREE", 10, 0, 3.9, -5.23, "#f2d7a9");
    textPlate(g, "EIGHT MINDS. THREE PRIZES.", 6, 0, 2.7, -5.22);
    for (let x of [-7, 7]) {
      box(g, 0.3, 5, 0.5, x, 2.5, -5.2, mats.gold);
      box(g, 0.08, 3, 0.1, x, 2.5, -4.88, mats.amber);
    }
    if (key === "waiting") {
      refs.wall = box(g, 14, 2.8, 0.55, 0, 1.4, 5.2, mats.concrete);
      stripes(g, 22, -6.5, 0.01, 4.8);
    }
    refs.board = new T.Group();
    g.add(refs.board);
  }
  if (!["bridge", "ledge"].includes(key)) {
    annulus(g, 9.75, 9.88, 0.025, -1.25, mats.cyan);
    studs(g, 9.5, -1.24, 56);
    for (let i = 0; i < 24; i++) {
      const a = (i / 24) * Math.PI * 2;
      const o = box(
        g,
        0.035,
        0.018,
        1.6,
        Math.sin(a) * 8.65,
        -1.265,
        Math.cos(a) * 8.65,
        mats.metal,
      );
      o.rotation.y = a;
    }
  }
  if (key === "pit") {
    for (let j = 0; j < 9; j++) {
      const a = (j / 8) * Math.PI,
        x = Math.cos(a) * 5.39,
        z = -Math.sin(a) * 5.39;
      const seam = box(g, 0.04, 3.3, 0.04, x, 0.85, z, mats.dark);
      const panel = box(
        g,
        0.12,
        0.65,
        0.65,
        x * 1.02,
        0.7,
        z * 1.02,
        mats.metal,
      );
      panel.rotation.y = -a;
    }
    for (let side of [-1, 1]) {
      box(g, 1.3, 1.8, 1, side * 5.65, 0.1, -0.8, mats.dark);
      box(g, 0.8, 0.9, 0.03, side * 5.65, 0.35, -0.28, mats.metal);
      for (let j = 0; j < 5; j++)
        box(
          g,
          0.62,
          0.04,
          0.05,
          side * 5.65,
          0.05 + j * 0.12,
          -0.25,
          mats.black,
        );
      box(g, 0.45, 0.07, 0.08, side * 5.65, 0.95, -0.27, mats.amber);
    }
    for (let j = 1; j <= 5; j++) {
      box(g, 0.25, 0.035, 0.04, 2.85, -0.55 + j * 0.44, -3.23, mats.gold);
      textPlate(g, String(j), 0.16, 3.12, -0.55 + j * 0.44, -3.2, "#d4b573");
    }
  }
  if (["disc", "ledge"].includes(key)) {
    box(g, 8.5, 0.8, 0.18, 0, 4.7, -6.2, mats.black);
    for (let x of [-4.5, 4.5]) {
      box(g, 0.2, 5.8, 0.2, x, 1.8, -6.3, mats.metal);
      box(g, 0.05, 2, 0.1, x, 3.5, -6.15, mats.amber);
    }
  }
  if (key === "crusher") {
    for (let side of [-1, 1])
      for (let j = 0; j < 5; j++) {
        const rail = box(
          g,
          0.24,
          0.07,
          10,
          side * 6.2,
          0.35 + j * 0.65,
          0,
          mats.metal,
        );
        if (side > 0) refs.cameraObstacles.push(rail);
      }
    for (let i = 0; i < 4; i++) {
      box(g, 1.2, 0.07, 0.2, -3.3 + i * 2.2, 0.04, 3.8, mats.amber);
    }
  }
  return { group: g, refs, key };
}
export function updateSet(set, s, t, settled = false, escaping = false) {
  const r = set.refs;
  mats.water.userData.clock.value = t;
  if (r.water) {
    const waterTop = -0.55 + Math.min(5, s.pit.flood) * 0.44;
    const depth = waterTop + 0.9;
    r.water.scale.y = depth / 0.055;
    r.water.position.y = -0.9 + depth / 2;
    for (const [i, o] of r.ripples.entries()) {
      o.position.y = waterTop + 0.025;
      o.scale.setScalar(1 + 0.05 * Math.sin(t * 2 + i));
    }
    r.rope.visible = !!s.pit.rope;
  }
  if (r.panes)
    r.panes.forEach((p, i) => {
      const row = Math.floor(i / 2) + 1,
        side = i % 2 ? "R" : "L";
      const falling =
        s.ev?.type === "death" && s.ev.style === "shatter"
          ? s.bridge.stepping[s.ev.name]
          : null;
      p.visible =
        s.bridge.rows[row]?.weak !== side &&
        !(falling?.row === row && falling.side === side);
    });
  if (r.wall) r.wall.position.z = 6.3 - (s.round || 0) * 0.3;
  if (r.ceiling) {
    r.ceiling.position.y = crusherCeiling(s, settled ? 2.8 : t, escaping);
    r.door.position.y = s.crusher.door ? 4.4 : 1.7;
    r.lever.rotation.x = s.crusher.holder || s.crusher.jam ? -0.7 : 0;
  }
  if (r.tiles) {
    r.tiles.forEach((p, i) => {
      const a = (i / s.disc.n) * Math.PI * 2;
      p.position.set(Math.sin(a) * 3.4, 0, Math.cos(a) * 3.4);
      p.visible = i < s.disc.n && !s.disc.open.includes(i + 1);
      r.numbers[i].position.set(p.position.x, 0.095, p.position.z);
      r.numbers[i].visible = p.visible;
    });
  }
  if (r.ledge)
    r.ledge.scale.setScalar(Math.max(0.4, 1 - s.ledge.shrunk * 0.085));
}
export function disposeSet(set) {
  set.group.traverse((o) => {
    if (o.geometry) o.geometry.dispose();
    if (o.material && !Object.values(mats).includes(o.material)) {
      o.material.map?.dispose();
      o.material.dispose();
    }
  });
  set.group.removeFromParent();
}
