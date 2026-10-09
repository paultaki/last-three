// Small original synthesized score. No recordings, network assets or speech.
export class Score {
  constructor() {
    this.enabled = false;
    this.ctx = null;
    this.last = -1;
  }
  async toggle() {
    if (!this.ctx) {
      this.ctx = new AudioContext();
      this.master = this.ctx.createGain();
      this.master.gain.value = 0;
      this.master.connect(this.ctx.destination);
      this.drone = this.ctx.createOscillator();
      this.drone.type = "sine";
      this.drone.frequency.value = 55;
      const g = this.ctx.createGain();
      g.gain.value = 0.055;
      this.drone.connect(g).connect(this.master);
      this.drone.start();
      this.harmony = this.ctx.createOscillator();
      this.harmony.type = "triangle";
      this.harmony.frequency.value = 82.5;
      this.musicGain = this.ctx.createGain();
      this.musicGain.gain.value = 0.012;
      this.harmony.connect(this.musicGain).connect(this.master);
      this.harmony.start();
      this.pulse = this.ctx.createOscillator();
      this.pulse.frequency.value = 1;
      this.pulseGain = this.ctx.createGain();
      this.pulseGain.gain.value = 0.007;
      this.pulse.connect(this.pulseGain).connect(this.musicGain.gain);
      this.pulse.start();
    }
    await this.ctx.resume();
    this.enabled = !this.enabled;
    this.master.gain.setTargetAtTime(
      this.enabled ? 1 : 0,
      this.ctx.currentTime,
      0.08,
    );
    return this.enabled;
  }
  event(s) {
    if (!this.enabled || !this.ctx || !s) return;
    const c = this.ctx,
      t = c.currentTime,
      e = s.ev || {};
    const frequencies = {
      bridge: 55,
      crusher: 46,
      pit: 65,
      disc: 73,
      ledge: 41,
      chalk: 82,
      ended: 110,
      lobby: 55,
    };
    const base = frequencies[s.stage] || 55;
    this.drone.frequency.setTargetAtTime(base, t, 0.8);
    this.harmony.frequency.setTargetAtTime(
      base * (s.stage === "ended" ? 2 : 1.5),
      t,
      0.8,
    );
    const tension =
      s.stage === "pit"
        ? (s.pit?.flood || 0) / 5
        : s.stage === "crusher"
          ? 1 - (s.crusher?.ceiling || 0) / 5
          : s.stage === "ledge"
            ? Math.min(1, (s.round || 0) / 8)
            : 0.2;
    this.pulse.frequency.setTargetAtTime(0.7 + tension * 2.1, t, 0.4);
    this.musicGain.gain.setTargetAtTime(0.012 + tension * 0.012, t, 0.5);
    if (
      !["death", "reveal", "action", "stage_start", "game_end"].includes(e.type)
    )
      return;
    const o = c.createOscillator(),
      g = c.createGain(),
      pan = c.createStereoPanner();
    pan.pan.value = ((s.order.indexOf(e.name) + 1) / 8 - 0.5) * 0.8;
    o.type = e.type === "death" ? "sawtooth" : "sine";
    o.frequency.setValueAtTime(
      e.type === "death" ? 120 : e.type === "reveal" ? 330 : 160,
      t,
    );
    o.frequency.exponentialRampToValueAtTime(
      e.type === "death" ? 24 : 80,
      t + 0.45,
    );
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(e.type === "death" ? 0.09 : 0.04, t + 0.015);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.6);
    o.connect(g).connect(pan).connect(this.master);
    o.start(t);
    o.stop(t + 0.65);
  }
}
