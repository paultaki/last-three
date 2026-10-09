import * as T from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";
import { OutputPass } from "three/addons/postprocessing/OutputPass.js";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import {
  buildSet,
  updateSet,
  disposeSet,
  mats,
  box,
  cyl,
  mesh,
  textPlate,
} from "./sets.js";
import {
  presentation,
  COLORS,
  crusherEscapePoint,
  crusherDive,
} from "./model.js";
import { filmShot, dialogue } from "./film.js";
const X = new T.Vector3(1, 0, 0),
  Y = new T.Vector3(0, 1, 0),
  Z = new T.Vector3(0, 0, 1);
const ease = (t) => t * t * (3 - 2 * t);
export class Arena {
  constructor(host, labelHost) {
    this.host = host;
    this.labelHost = labelHost;
    this.scene = new T.Scene();
    this.scene.background = new T.Color(0x0a131e);
    this.scene.fog = new T.FogExp2(0x0a131e, 0.017);
    this.camera = new T.PerspectiveCamera(37, 1, 0.1, 160);
    this.camera.position.set(14, 13, 20);
    this.renderer = new T.WebGLRenderer({
      antialias: true,
      alpha: false,
      powerPreference: "high-performance",
    });
    this.renderer.outputColorSpace = T.SRGBColorSpace;
    this.renderer.toneMapping = T.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.08;
    this.renderer.info.autoReset = false;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = T.PCFSoftShadowMap;
    host.append(this.renderer.domElement);
    this.renderer.domElement.setAttribute(
      "aria-label",
      "3D arena. Event description and transcript are below.",
    );
    const pm = new T.PMREMGenerator(this.renderer);
    const env = new RoomEnvironment();
    this.environment = pm.fromScene(env, 0.04);
    this.scene.environment = this.environment.texture;
    env.dispose();
    pm.dispose();
    this.scene.environmentIntensity = 0.4;
    this.scene.add(new T.HemisphereLight(0xbadfea, 0x1e202c, 1.35));
    this.key = new T.DirectionalLight(0xffdfb3, 3);
    this.key.position.set(-8, 16, 10);
    this.key.castShadow = true;
    Object.assign(this.key.shadow.camera, {
      left: -17,
      right: 17,
      top: 17,
      bottom: -17,
      near: 0.1,
      far: 55,
    });
    this.key.shadow.bias = -0.001;
    this.key.shadow.normalBias = 0.04;
    this.scene.add(this.key);
    const fill = new T.DirectionalLight(0x63deef, 2.2);
    fill.position.set(6, 9, -10);
    this.scene.add(fill);
    const floor = mesh(
      new T.PlaneGeometry(180, 180),
      new T.MeshStandardMaterial({
        color: 0x0b141c,
        roughness: 0.62,
        metalness: 0.35,
      }),
      this.scene,
      0,
      -9,
      0,
    );
    floor.rotation.x = -Math.PI / 2;
    this.cast = [];
    this.labels = [];
    this.mode = "cinema";
    this.reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    this.frameTimes = [];
    this.setQuality("auto");
    this.effects = new T.Group();
    this.scene.add(this.effects);
    this.particles = [];
    for (let i = 0; i < 40; i++) {
      const p = box(
        this.effects,
        0.12,
        0.12,
        0.12,
        0,
        0,
        0,
        i % 3 === 0 ? mats.gold : i % 3 === 1 ? mats.cyan : mats.light,
      );
      p.castShadow = false;
      this.particles.push(p);
    }
    this.composer = new EffectComposer(
      this.renderer,
      new T.WebGLRenderTarget(1, 1, { type: T.HalfFloatType, samples: 4 }),
    );
    this.composer.addPass(new RenderPass(this.scene, this.camera));
    this.bloom = new UnrealBloomPass(new T.Vector2(640, 360), 0.24, 0.5, 1.05);
    this.composer.addPass(this.bloom);
    this.composer.addPass(new OutputPass());
    this.observer = new ResizeObserver(() => this.resize());
    this.observer.observe(host);
    this.resize();
  }
  setQuality(q) {
    this.quality = q === "auto" ? (innerWidth < 600 ? "lite" : "balanced") : q;
    const lite = this.quality === "lite";
    this.renderer.setPixelRatio(
      Math.min(devicePixelRatio, lite ? 1 : this.quality === "high" ? 2 : 1.4),
    );
    this.renderer.shadowMap.enabled = !lite;
    this.key.shadow.mapSize.setScalar(this.quality === "high" ? 2048 : 1024);
    if (this.key.shadow.map) {
      this.key.shadow.map.dispose();
      this.key.shadow.map = null;
    }
    if (this.composer)
      this.composer.setPixelRatio(this.renderer.getPixelRatio());
    this.resize();
  }
  resize() {
    const { width, height } = this.host.getBoundingClientRect();
    if (!width || !height) return;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
    if (this.composer) this.composer.setSize(width, height);
  }
  async loadCast(city) {
    let sources = null;
    if (city) {
      const r = await fetch("assets/cast/cast.json");
      if (!r.ok)
        throw new Error(
          "Local City Characters export is missing. Run the documented export command.",
        );
      sources = await r.json();
    }
    const loader = new GLTFLoader();
    for (let i = 0; i < 8; i++) {
      const group = new T.Group();
      const puppet = new T.Group();
      group.add(puppet);
      this.scene.add(group);
      let rig;
      if (sources) {
        rig = (await loader.loadAsync("assets/cast/" + sources[i].file)).scene;
        puppet.add(rig);
        rig.updateMatrixWorld(true);
        const b = new T.Box3().setFromObject(rig);
        const scale = 2.05 / (b.max.y - b.min.y);
        rig.scale.multiplyScalar(scale);
        rig.position.y -= b.min.y * scale;
        rig.updateMatrixWorld(true);
      } else {
        rig = new T.Group();
        puppet.add(rig);
        const m = new T.MeshStandardMaterial({
          color: COLORS[i],
          roughness: 0.75,
        });
        box(rig, 0.64, 0.75, 0.37, 0, 1.05, 0, m);
        cyl(rig, 0.26, 0.48, 0, 1.73, 0, mats.light, 8);
        for (let s of [-1, 1]) {
          box(rig, 0.2, 0.65, 0.24, s * 0.2, 0.35, 0, mats.dark);
          box(rig, 0.2, 0.75, 0.23, s * 0.45, 1.08, 0, m);
        }
      }
      const bones = {};
      rig.traverse((o) => {
        if (o.isMesh) {
          o.castShadow = true;
          o.receiveShadow = true;
          o.frustumCulled = false;
          if (o.material?.map) {
            if (this.cityMap) {
              o.material.map.dispose();
              o.material.map = this.cityMap;
            } else this.cityMap = o.material.map;
            o.material.map.anisotropy = Math.min(
              4,
              this.renderer.capabilities.getMaxAnisotropy(),
            );
          }
        }
        if (o.isBone)
          bones[o.name.toLowerCase()] = { bone: o, base: o.quaternion.clone() };
      });
      const ring = mesh(
        new T.RingGeometry(0.55, 0.61, 40),
        new T.MeshBasicMaterial({
          color: COLORS[i],
          side: T.DoubleSide,
          transparent: true,
          opacity: 0.55,
        }),
        group,
        0,
        0.03,
        0,
      );
      ring.rotation.x = -Math.PI / 2;
      const label = document.createElement("span");
      label.className = "cast-label";
      label.style.setProperty("--seat", COLORS[i]);
      this.labelHost.append(label);
      this.labels.push(label);
      this.cast.push({ group, puppet, rig, bones, ring });
    }
    this.city = !!sources;
  }
  setState(s, prev, cut) {
    this.state = s;
    this.prev = prev;
    this.view = presentation(s, prev, cut);
    this.cut = cut;
    this.dialogue = this.film ? dialogue(s, cut) : null;
    if (this.set?.key !== this.view.key) {
      if (this.set) disposeSet(this.set);
      this.set = buildSet(this.view.key);
      this.scene.add(this.set.group);
    }
    if (this.set.refs.board) {
      const board = this.set.refs.board;
      while (board.children.length) {
        const o = board.children[0];
        o.geometry?.dispose();
        o.material?.map?.dispose();
        o.material?.dispose();
        board.remove(o);
      }
      const notes =
        s.stage === "chalk"
          ? s.chalk?.written
          : s.stage === "lobby"
            ? s.chalk?.shown
            : null;
      (notes || []).slice(0, 3).forEach((n, i) => {
        const str = n.text.length > 70 ? n.text.slice(0, 67) + "..." : n.text;
        textPlate(
          board,
          str,
          11,
          0,
          (s.stage === "lobby" ? 1.6 : 2.5) - i * 0.7,
          s.stage === "chalk" ? -4.34 : -5.2,
          "#d8e4c9",
        ).scale.y = 0.35;
      });
    }
  }
  rotate(c, name, axis, angle) {
    const b = c.bones[name];
    if (!b) return;
    const parent = b.bone.parent.getWorldQuaternion(new T.Quaternion());
    const q = new T.Quaternion().setFromAxisAngle(
      axis
        .clone()
        .applyQuaternion(c.group.getWorldQuaternion(new T.Quaternion())),
      angle,
    );
    b.bone.quaternion.copy(
      parent
        .clone()
        .invert()
        .multiply(q)
        .multiply(parent)
        .multiply(b.bone.quaternion),
    );
    b.bone.updateMatrixWorld(true);
  }
  pose(c, a, t) {
    for (const b of Object.values(c.bones)) b.bone.quaternion.copy(b.base);
    c.group.updateMatrixWorld(true);
    const wave = Math.sin(t * 4 + a.seat) * 0.05,
      beat = Math.sin(Math.min(1, t / 1.05) * Math.PI);
    let armL = -1.26,
      armR = 1.26;
    if (a.pose === "celebrate") {
      armL = 0.8;
      armR = -0.8;
    }
    if (["shove", "rescue", "climb", "hold"].includes(a.pose)) {
      armL = -0.55;
      armR = 0.55;
    }
    if (["brace", "base"].includes(a.pose)) {
      armL = -0.85;
      armR = 0.85;
    }
    this.rotate(c, "upperarm_l", Z, armL + wave);
    this.rotate(c, "upperarm_r", Z, armR - wave);
    if (["shove", "rescue", "climb", "hold"].includes(a.pose)) {
      this.rotate(c, "upperarm_l", X, -0.8 - beat * 0.5);
      this.rotate(c, "upperarm_r", X, -0.8 - beat * 0.5);
      this.rotate(c, "lowerarm_l", X, -0.35);
      this.rotate(c, "lowerarm_r", X, -0.35);
    }
    if (["walk", "climb", "dodge"].includes(a.pose)) {
      const stride = Math.sin(t * 9) * 0.45;
      this.rotate(c, "thigh_l", X, stride);
      this.rotate(c, "thigh_r", X, -stride);
      this.rotate(c, "upperarm_l", X, -stride);
      this.rotate(c, "upperarm_r", X, stride);
    }
    if (
      ["base", "brace"].includes(a.pose) &&
      !(this.film && this.dialogue && a.active)
    ) {
      this.rotate(c, "spine_01", X, 0.5);
      this.rotate(c, "thigh_l", X, -0.5);
      this.rotate(c, "thigh_r", X, -0.5);
      c.puppet.position.y = -0.3;
    }
    if (a.active) this.rotate(c, "head", Y, Math.sin(t * 2) * 0.12);
  }
  render(seconds = 0) {
    if (!this.view || this.cast.length < 8) return;
    this.renderer.info.reset();
    const s = this.state,
      v = this.view;
    const t = this.reduced ? 0 : Math.min(seconds, 2.8),
      p = this.reduced ? 1 : ease(Math.min(1, t / 1.15));
    updateSet(
      this.set,
      s,
      t,
      this.reduced,
      v.key === "crusher" &&
        v.actors.some(
          (a) =>
            a.visible &&
            a.pose === "walk" &&
            a.from[2] >= -4.9 &&
            a.position[2] < -4.9,
        ),
    );
    if (this.set.refs.cameraObstacles) {
      const cutaway =
        this.film &&
        this.mode === "cinema" &&
        (crusherDive(s) || s.crusher.escaped);
      this.set.refs.cameraObstacles.forEach((o) => {
        o.visible = !cutaway;
      });
    }
    // Remove the near wall only in dialogue coverage, like a practical cutaway set.
    if (this.set.refs.wall)
      this.set.refs.wall.visible = !(this.film && this.dialogue);
    this.view.actors.forEach((a, i) => {
      const c = this.cast[i];
      c.group.visible = a.visible;
      c.group.position.fromArray(a.position);
      c.group.rotation.set(0, 0, 0);
      c.puppet.position.set(0, 0, 0);
      c.puppet.rotation.set(0, 0, 0);
      c.puppet.scale.setScalar(1);
      if (!this.reduced && ["climb", "walk", "rescue"].includes(a.pose))
        c.group.position.lerpVectors(
          new T.Vector3(...a.from),
          new T.Vector3(...a.position),
          p,
        );
      c.group.rotation.y =
        v.key === "bridge"
          ? Math.PI
          : v.key === "ledge"
            ? Math.atan2(-a.position[0], -a.position[2])
            : 0.12;
      if (v.key === "crusher" && a.pose === "hold")
        c.group.rotation.y = Math.PI;
      if (v.key === "crusher" && a.pose === "walk" && a.position[2] < -4.9) {
        const point = crusherEscapePoint(a.from, a.position, p);
        c.group.position.fromArray(point);
        const ahead = crusherEscapePoint(
          a.from,
          a.position,
          Math.min(1, p + 0.02),
        );
        c.group.rotation.y = Math.atan2(
          ahead[0] - point[0],
          ahead[2] - point[2],
        );
      }
      if (this.film && this.dialogue && a.active) c.group.rotation.y = 0.28;
      if (this.film && ["shove", "flinch"].includes(a.pose)) {
        const otherName =
          a.pose === "shove" ? String(s.ev.action).split(":")[1] : s.ev.name;
        const other = v.actors.find((b) => b.name === otherName && b.visible);
        if (other) {
          const direction = new T.Vector3(...other.position).sub(
            new T.Vector3(...a.position),
          );
          const distance = direction.length();
          direction.normalize();
          c.group.rotation.y = Math.atan2(direction.x, direction.z);
          if (a.pose === "shove")
            c.group.position.addScaledVector(
              direction,
              Math.max(0, distance - 1.05) * Math.sin(p * Math.PI),
            );
          else
            c.group.position.addScaledVector(
              direction,
              -0.22 * Math.sin(p * Math.PI),
            );
        }
      }
      if (
        this.film &&
        v.key === "pit" &&
        a.position[1] < 0 &&
        a.pose !== "sink"
      ) {
        const waterTop = -0.55 + Math.min(5, s.pit.flood) * 0.44;
        c.group.position.y = Math.max(c.group.position.y, waterTop - 1.5);
      }
      this.pose(c, a, t);
      if (this.film && this.dialogue && a.active && !this.reduced) {
        this.rotate(c, "upperarm_r", X, -0.4 - Math.sin(t * 3) * 0.18);
        this.rotate(c, "lowerarm_r", X, -0.7);
      }
      if (!this.reduced) c.puppet.position.y += Math.sin(t * 2 + i) * 0.015;
      if (a.pose === "flinch") {
        c.puppet.rotation.x = -Math.sin(p * Math.PI) * 0.3;
        c.puppet.position.z += Math.sin(p * Math.PI) * 0.35;
      }
      if (a.pose === "dodge") c.puppet.position.x = Math.sin(p * Math.PI) * 0.7;
      if (a.pose === "shove")
        c.puppet.rotation.x = Math.sin(p * Math.PI) * 0.18;
      if (a.pose === "climb" && !this.reduced) {
        if (v.key === "pit" && a.from[1] < a.position[1]) {
          const baseName = this.prev?.pit?.base || s.pit.base;
          const base = v.actors.find((x) => x.name === baseName);
          const step = new T.Vector3(
            ...(base?.position || [0, -0.8, -2.35]),
          ).add(new T.Vector3(0, 1.1, 0));
          const start = new T.Vector3(...a.from),
            end = new T.Vector3(...a.position);
          if (p < 0.38) c.group.position.lerpVectors(start, step, p / 0.38);
          else c.group.position.lerpVectors(step, end, (p - 0.38) / 0.62);
        }
        c.puppet.position.y += Math.sin(p * Math.PI) * 0.7;
      }
      if (a.pose === "flatten") {
        c.puppet.scale.y = 1 - p * 0.94;
        c.puppet.scale.x = 1 + p * 0.6;
        c.puppet.rotation.z = p > 0.9 ? (p - 0.9) * 2 : 0;
      }
      if (a.pose === "sink") {
        c.group.position.y -= p * 2.2;
        this.rotate(c, "upperarm_r", Z, -1.9);
      }
      if (["shatter", "chute", "tumble"].includes(a.pose)) {
        c.group.position.y -= p * 5;
        c.puppet.rotation.z = p * (a.pose === "chute" ? 6 : 2);
        if (a.pose === "tumble") c.group.position.x += p * 2.5;
      }
      c.ring.material.opacity = a.active ? 0.95 : 0.32;
      c.ring.scale.setScalar(a.active ? 1.15 : 1);
      c.ring.visible = !this.film && (!v.death || !a.active);
      const label = this.labels[i];
      label.textContent =
        String(i + 1).padStart(2, "0") +
        (this.host.clientWidth < 600 && !a.active ? "" : " " + a.name);
      label.title = a.name;
      label.classList.toggle("speaking", a.active);
      label.hidden = this.film || !a.visible || (v.death && a.active);
    });
    if (this.set.refs.rope && s.pit.rope) {
      const by = this.cast[s.order.indexOf(s.pit.rope.by)],
        saved = this.cast[s.order.indexOf(s.pit.rope.saved)];
      if (by && saved) {
        const a = by.group.position.clone().add(new T.Vector3(0, 1.05, 0)),
          b = saved.group.position.clone().add(new T.Vector3(0, 1.45, 0));
        this.set.refs.rope.children.forEach((o, i) => {
          const n = this.set.refs.rope.children.length,
            u = i / n,
            w = (i + 1) / n;
          const c = a.clone().lerp(b, u),
            d = a.clone().lerp(b, w);
          c.y -= Math.sin(u * Math.PI) * 0.25;
          d.y -= Math.sin(w * Math.PI) * 0.25;
          const len = c.distanceTo(d);
          o.position.copy(c).add(d).multiplyScalar(0.5);
          o.quaternion.setFromUnitVectors(Y, d.sub(c).normalize());
          o.scale.y = len / o.geometry.parameters.height;
        });
      }
    }
    const mobile = this.camera.aspect < 1;
    let eye,
      target = [0, 1, 0];
    if (v.key === "bridge") {
      eye = [16, 16, 22];
      target = [0, 0, -1];
    } else if (v.key === "pit") {
      eye = [13, 14, 20];
      target = [0, 1, 0];
    } else if (v.key === "crusher") {
      eye = [15, 12, 19];
      target = [0, 1, 0];
    } else {
      eye = [10, 9, 17];
      target = [0, 1, 0];
    }
    if (["ended", "chalk"].includes(v.key)) {
      eye = [8, 7, 17];
      target = [0, 1.7, 0];
    }
    if (
      this.mode === "cinema" &&
      v.actor &&
      !["stage_start", "game_start", "round_start", "stage_end"].includes(
        s.ev?.type,
      )
    ) {
      const a = v.actors.find((a) => a.name === v.actor);
      if (a?.visible) {
        target = [
          a.position[0] * 0.62,
          a.position[1] + 1,
          a.position[2] * 0.65,
        ];
        const d = v.death ? 10 : 15;
        eye = [target[0] + d * 0.65, target[1] + d * 0.45, target[2] + d];
        if (v.death) {
          target = [
            a.position[0],
            a.position[1] + 0.6 - (a.pose === "flatten" ? 0 : p * 1.5),
            a.position[2],
          ];
          eye =
            v.key === "bridge"
              ? [target[0] + 11, target[1] + 6, target[2] + 4]
              : v.key === "crusher"
                ? [target[0] + 8, target[1] + 2.5, target[2] + 12]
                : [target[0] + 9, target[1] + 7, target[2] + 13];
        }
      }
    }
    if (this.film && this.mode === "cinema") {
      const shot = filmShot(v, s, this.cut, p);
      if (shot) ({ eye, target } = shot);
      else {
        eye = eye.map((n, i) => target[i] + (n - target[i]) * 0.83);
      }
    }
    if (mobile) {
      eye = eye.map((n, i) => target[i] + (n - target[i]) * 1.06);
    }
    if (!this.reduced) {
      eye[0] += 0.18 * Math.sin(t * 0.4);
      eye[2] += 0.15 * Math.cos(t * 0.4);
    }
    this.camera.position.fromArray(eye);
    this.camera.lookAt(...target);
    this.camera.updateMatrixWorld();
    v.actors.forEach((a, i) => {
      const c = this.cast[i],
        vec = c.group.position
          .clone()
          .add(new T.Vector3(0, 2.35, 0))
          .project(this.camera);
      const label = this.labels[i];
      label.style.left =
        Math.round((vec.x * 0.5 + 0.5) * this.host.clientWidth) + "px";
      label.style.top =
        Math.round((-vec.y * 0.5 + 0.5) * this.host.clientHeight) + "px";
      if (vec.z > 1 || Math.abs(vec.x) > 0.97 || Math.abs(vec.y) > 0.95)
        label.hidden = true;
    });
    this.speakerAnchor = null;
    if (this.dialogue) {
      const speaker = this.cast[s.order.indexOf(this.dialogue.name)];
      if (speaker) {
        const point = speaker.group.position
          .clone()
          .add(new T.Vector3(0, 2.15, 0))
          .project(this.camera);
        this.speakerAnchor = {
          x: point.x * 0.5 + 0.5,
          y: -point.y * 0.5 + 0.5,
          visible:
            point.z < 1 && Math.abs(point.x) < 1 && Math.abs(point.y) < 1,
        };
      }
    }
    this.effects.visible = v.death && !this.reduced;
    const victim = v.actors.find((a) => a.active);
    if (victim) {
      this.particles.forEach((o, i) => {
        const angle = i * 2.399;
        const speed = 0.7 + (i % 7) * 0.21;
        o.position.set(
          victim.position[0] + Math.cos(angle) * p * speed,
          victim.position[1] + 1 + Math.sin(i * 4) * p * 2 - p * p * 3,
          victim.position[2] + Math.sin(angle) * p * speed,
        );
        o.rotation.set(p * i, p * 2, p * i * 0.3);
        o.scale.setScalar(1 - p * 0.75);
      });
    }
    // Resolve screen-space name collisions without moving any contestant.
    const occupied = [];
    for (const label of this.labels) {
      if (label.hidden) continue;
      let x = parseFloat(label.style.left),
        y = parseFloat(label.style.top);
      for (
        let attempt = 0;
        attempt < 3 &&
        occupied.some(
          (q) =>
            Math.abs(q.x - x) < (this.host.clientWidth < 600 ? 28 : 65) &&
            Math.abs(q.y - y) < 21,
        );
        attempt++
      )
        y -= 22;
      y = Math.max(20, y);
      label.style.top = Math.round(y) + "px";
      occupied.push({ x, y });
    }
    if (this.quality === "lite") this.renderer.render(this.scene, this.camera);
    else this.composer.render();
  }
  stats() {
    return {
      quality: this.quality,
      city: this.city,
      drawCalls: this.renderer.info.render.calls,
      triangles: this.renderer.info.render.triangles,
      geometries: this.renderer.info.memory.geometries,
      textures: this.renderer.info.memory.textures,
    };
  }
}
