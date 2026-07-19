// Zen Synthesizer & Sound Sanctuary Engine using Web Audio API
// Custom synthesized therapeutic audio. Zero external files required.

class SoundEngine {
  private ctx: AudioContext | null = null;
  private _enabled: boolean = true;
  private _volume: number = 0.5;

  // Ambient track states
  public rainActive: boolean = false;
  public windActive: boolean = false;
  public forestActive: boolean = false;
  public currentTheme: "bright" | "dark" = "dark";

  // Web Audio Nodes
  private ambientMixer: GainNode | null = null;
  private compressorNode: DynamicsCompressorNode | null = null;

  // Sources
  private rainNoiseSource: AudioBufferSourceNode | null = null;
  private windNoiseSource: AudioBufferSourceNode | null = null;
  private forestNoiseSource: AudioBufferSourceNode | null = null;

  // Filters
  private rainFilter: BiquadFilterNode | null = null;
  private windFilter: BiquadFilterNode | null = null;
  private forestFilter: BiquadFilterNode | null = null;

  // Gains
  private rainGainNode: GainNode | null = null;
  private windGainNode: GainNode | null = null;
  private forestGainNode: GainNode | null = null;

  // LFO modulation for wind
  private windLFO: OscillatorNode | null = null;
  private windLFOGain: GainNode | null = null;

  // Cached buffers for zero-latency loops
  private pinkNoiseBuffer: AudioBuffer | null = null;
  private brownNoiseBuffer: AudioBuffer | null = null;
  private whiteNoiseBuffer: AudioBuffer | null = null;

  // Interval timers
  private rainInterval: any = null;
  private forestInterval: any = null;
  private birdInterval: any = null;

  public get enabled() {
    return this._enabled;
  }

  public set enabled(val: boolean) {
    this._enabled = val;
    this.normalizeAmbientVolumes();
  }

  public get volume() {
    return this._volume;
  }

  public set volume(val: number) {
    this._volume = val;
    this.normalizeAmbientVolumes();
  }

  private initCtx() {
    if (!this.ctx) {
      // @ts-ignore
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioContextClass();

      // Initialize master ambient dynamics compressor & mixer
      this.compressorNode = this.ctx.createDynamicsCompressor();
      this.ambientMixer = this.ctx.createGain();

      const now = this.ctx.currentTime;
      this.compressorNode.threshold.setValueAtTime(-24, now);
      this.compressorNode.knee.setValueAtTime(30, now);
      this.compressorNode.ratio.setValueAtTime(12, now);
      this.compressorNode.attack.setValueAtTime(0.003, now);
      this.compressorNode.release.setValueAtTime(0.25, now);

      this.ambientMixer.gain.setValueAtTime(0, now);

      this.ambientMixer.connect(this.compressorNode);
      this.compressorNode.connect(this.ctx.destination);
    }
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume();
    }
    return this.ctx;
  }

  // --- NOISE GENERATION BUFFER UTILITIES ---
  private getPinkNoiseBuffer(): AudioBuffer {
    if (this.pinkNoiseBuffer) return this.pinkNoiseBuffer;
    const ctx = this.initCtx();
    if (!ctx) throw new Error("AudioContext not available");

    const bufferSize = ctx.sampleRate * 4; // 4 seconds of unique pink noise
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);

    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      const pink = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
      b6 = white * 0.115926;
      data[i] = pink * 0.11;
    }
    this.pinkNoiseBuffer = buffer;
    return buffer;
  }

  private getBrownNoiseBuffer(): AudioBuffer {
    if (this.brownNoiseBuffer) return this.brownNoiseBuffer;
    const ctx = this.initCtx();
    if (!ctx) throw new Error("AudioContext not available");

    const bufferSize = ctx.sampleRate * 4;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);

    let lastOut = 0.0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      data[i] = (lastOut + (0.02 * white)) / 1.02;
      lastOut = data[i];
      data[i] *= 3.5; // Gain compensation
    }
    this.brownNoiseBuffer = buffer;
    return buffer;
  }

  // --- AMBIENT SOUND CONTROLS & SYNTHESIS ---
  public setAmbientSound(soundType: "rain" | "wind" | "forest", active: boolean) {
    try {
      const ctx = this.initCtx();
      if (!ctx) return;

      if (soundType === "rain") {
        this.rainActive = active;
        this.updateRainNode();
      } else if (soundType === "wind") {
        this.windActive = active;
        this.updateWindNode();
      } else if (soundType === "forest") {
        this.forestActive = active;
        this.updateForestNode();
      }

      this.normalizeAmbientVolumes();
    } catch (e) {
      console.warn("Failed to set ambient sound:", e);
    }
  }

  public setThemeDynamics(theme: "bright" | "dark") {
    this.currentTheme = theme;
    if (!this.ctx) return;
    const now = this.ctx.currentTime;

    // Apply real-time smooth filter sweeps to active loops based on theme
    if (this.rainActive && this.rainFilter) {
      this.rainFilter.frequency.exponentialRampToValueAtTime(
        theme === "bright" ? 2200 : 1100,
        now + 1.5
      );
    }

    if (this.windActive && this.windFilter && this.windLFO && this.windLFOGain) {
      this.windFilter.Q.exponentialRampToValueAtTime(
        theme === "bright" ? 2.8 : 4.5,
        now + 1.5
      );
      this.windFilter.frequency.setValueAtTime(
        theme === "bright" ? 520 : 310,
        now
      );
      this.windLFO.frequency.setValueAtTime(
        theme === "bright" ? 0.09 : 0.04,
        now
      );
      this.windLFOGain.gain.setValueAtTime(
        theme === "bright" ? 240 : 130,
        now
      );
    }

    if (this.forestActive) {
      this.updateForestNode();
    }
  }

  private get ambientGainScale(): number {
    return this._volume * (this._enabled ? 1 : 0);
  }

  private normalizeAmbientVolumes() {
    if (!this.ctx || !this.ambientMixer) return;
    const now = this.ctx.currentTime;

    let activeCount = 0;
    if (this.rainActive) activeCount++;
    if (this.windActive) activeCount++;
    if (this.forestActive) activeCount++;

    // Prevent clipping by scaling volumes using 1/sqrt(N) normalization
    const baseTarget = activeCount > 0 ? (1 / Math.sqrt(activeCount)) * 0.45 : 0;
    const targetNormalized = baseTarget * this._volume * (this._enabled ? 1 : 0);

    this.ambientMixer.gain.cancelScheduledValues(now);
    this.ambientMixer.gain.setValueAtTime(this.ambientMixer.gain.value, now);
    this.ambientMixer.gain.linearRampToValueAtTime(targetNormalized, now + 0.8);
  }

  // --- INDIVIDUAL COMPONENT NODES ---
  private updateRainNode() {
    if (!this.ctx) return;
    const ctx = this.ctx;
    const now = ctx.currentTime;

    if (this.rainActive) {
      if (this.rainNoiseSource) return; // Already running

      this.rainGainNode = ctx.createGain();
      this.rainGainNode.gain.setValueAtTime(0, now);
      this.rainGainNode.gain.linearRampToValueAtTime(0.35, now + 1.0);

      this.rainFilter = ctx.createBiquadFilter();
      this.rainFilter.type = "lowpass";
      this.rainFilter.frequency.setValueAtTime(
        this.currentTheme === "bright" ? 2200 : 1100,
        now
      );

      this.rainNoiseSource = ctx.createBufferSource();
      this.rainNoiseSource.buffer = this.getPinkNoiseBuffer();
      this.rainNoiseSource.loop = true;

      this.rainNoiseSource.connect(this.rainFilter);
      this.rainFilter.connect(this.rainGainNode);
      this.rainGainNode.connect(this.ambientMixer!);
      
      this.rainNoiseSource.start(now);

      // Micro-droplets pitter-patter generator
      if (this.rainInterval) clearInterval(this.rainInterval);
      this.rainInterval = setInterval(() => {
        this.triggerDroplet();
      }, 100 + Math.random() * 50);
    } else {
      // Clean up rain node
      if (this.rainGainNode) {
        this.rainGainNode.gain.cancelScheduledValues(now);
        this.rainGainNode.gain.setValueAtTime(this.rainGainNode.gain.value, now);
        this.rainGainNode.gain.exponentialRampToValueAtTime(0.0001, now + 1.0);
      }
      const src = this.rainNoiseSource;
      const interval = this.rainInterval;

      this.rainNoiseSource = null;
      this.rainInterval = null;

      setTimeout(() => {
        if (src) {
          try { src.stop(); } catch (e) {}
          try { src.disconnect(); } catch (e) {}
        }
        if (interval) clearInterval(interval);
      }, 1100);
    }
  }

  private updateWindNode() {
    if (!this.ctx) return;
    const ctx = this.ctx;
    const now = ctx.currentTime;

    if (this.windActive) {
      if (this.windNoiseSource) return;

      this.windGainNode = ctx.createGain();
      this.windGainNode.gain.setValueAtTime(0, now);
      this.windGainNode.gain.linearRampToValueAtTime(0.4, now + 1.5);

      this.windFilter = ctx.createBiquadFilter();
      this.windFilter.type = "bandpass";
      this.windFilter.Q.setValueAtTime(
        this.currentTheme === "bright" ? 2.8 : 4.5,
        now
      );
      this.windFilter.frequency.setValueAtTime(
        this.currentTheme === "bright" ? 520 : 310,
        now
      );

      // Very slow LFO for gusty howling effects
      this.windLFO = ctx.createOscillator();
      this.windLFO.frequency.setValueAtTime(
        this.currentTheme === "bright" ? 0.09 : 0.04,
        now
      );

      this.windLFOGain = ctx.createGain();
      this.windLFOGain.gain.setValueAtTime(
        this.currentTheme === "bright" ? 240 : 130,
        now
      );

      this.windNoiseSource = ctx.createBufferSource();
      this.windNoiseSource.buffer = this.getPinkNoiseBuffer();
      this.windNoiseSource.loop = true;

      this.windLFO.connect(this.windLFOGain);
      this.windLFOGain.connect(this.windFilter.frequency);

      this.windNoiseSource.connect(this.windFilter);
      this.windFilter.connect(this.windGainNode);
      this.windGainNode.connect(this.ambientMixer!);

      this.windLFO.start(now);
      this.windNoiseSource.start(now);
    } else {
      if (this.windGainNode) {
        this.windGainNode.gain.cancelScheduledValues(now);
        this.windGainNode.gain.setValueAtTime(this.windGainNode.gain.value, now);
        this.windGainNode.gain.exponentialRampToValueAtTime(0.0001, now + 1.2);
      }
      const src = this.windNoiseSource;
      const lfo = this.windLFO;

      this.windNoiseSource = null;
      this.windLFO = null;

      setTimeout(() => {
        if (src) {
          try { src.stop(); } catch (e) {}
          try { src.disconnect(); } catch (e) {}
        }
        if (lfo) {
          try { lfo.stop(); } catch (e) {}
          try { lfo.disconnect(); } catch (e) {}
        }
      }, 1300);
    }
  }

  private updateForestNode() {
    if (!this.ctx) return;
    const ctx = this.ctx;
    const now = ctx.currentTime;

    if (this.forestActive) {
      // Clear timers to reinitialize with current theme settings
      if (this.forestInterval) clearInterval(this.forestInterval);
      if (this.birdInterval) clearInterval(this.birdInterval);

      if (!this.forestNoiseSource) {
        this.forestGainNode = ctx.createGain();
        this.forestGainNode.gain.setValueAtTime(0, now);
        this.forestGainNode.gain.linearRampToValueAtTime(0.22, now + 1.5);

        this.forestFilter = ctx.createBiquadFilter();
        this.forestFilter.type = "lowpass";
        this.forestFilter.frequency.setValueAtTime(
          this.currentTheme === "bright" ? 1400 : 750,
          now
        );

        this.forestNoiseSource = ctx.createBufferSource();
        this.forestNoiseSource.buffer = this.getBrownNoiseBuffer();
        this.forestNoiseSource.loop = true;

        this.forestNoiseSource.connect(this.forestFilter);
        this.forestFilter.connect(this.forestGainNode);
        this.forestGainNode.connect(this.ambientMixer!);

        this.forestNoiseSource.start(now);
      } else {
        // Just adjust existing filter settings
        this.forestFilter?.frequency.exponentialRampToValueAtTime(
          this.currentTheme === "bright" ? 1400 : 750,
          now + 1.0
        );
      }

      // Twilight/Midnight Crickets Interval
      this.forestInterval = setInterval(() => {
        this.triggerCricket();
      }, this.currentTheme === "bright" ? 2500 : 1600);

      // Daytime Forest Birds (Only on Bright theme)
      if (this.currentTheme === "bright") {
        this.birdInterval = setInterval(() => {
          this.triggerBird();
        }, 5500 + Math.random() * 3000);
      }
    } else {
      if (this.forestGainNode) {
        this.forestGainNode.gain.cancelScheduledValues(now);
        this.forestGainNode.gain.setValueAtTime(this.forestGainNode.gain.value, now);
        this.forestGainNode.gain.exponentialRampToValueAtTime(0.0001, now + 1.2);
      }
      const src = this.forestNoiseSource;
      const interval = this.forestInterval;
      const birdInt = this.birdInterval;

      this.forestNoiseSource = null;
      this.forestInterval = null;
      this.birdInterval = null;

      setTimeout(() => {
        if (src) {
          try { src.stop(); } catch (e) {}
          try { src.disconnect(); } catch (e) {}
        }
        if (interval) clearInterval(interval);
        if (birdInt) clearInterval(birdInt);
      }, 1300);
    }
  }

  // --- MICRO-SYNTH BREAKDOWN TRIGGER GENERATORS ---
  private triggerDroplet() {
    if (!this.rainActive || !this._enabled || !this.ctx) return;
    try {
      const ctx = this.ctx;
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";

      const baseFreq = this.currentTheme === "bright" ? 1300 : 850;
      osc.frequency.setValueAtTime(baseFreq + Math.random() * 800, now);

      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime((0.015 + Math.random() * 0.035) * this.ambientGainScale, now + 0.005);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.04 + Math.random() * 0.05);

      const filter = ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.setValueAtTime(2200, now);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.ambientMixer!);

      osc.start(now);
      osc.stop(now + 0.12);
    } catch (e) {}
  }

  private triggerCricket() {
    if (!this.forestActive || !this._enabled || !this.ctx) return;
    try {
      const ctx = this.ctx;
      const now = ctx.currentTime;

      // Crickets chirp in triplets/quads
      const pulses = this.currentTheme === "bright" ? 3 : 4;
      const pulseDuration = this.currentTheme === "bright" ? 0.012 : 0.016;
      const pulseGap = this.currentTheme === "bright" ? 0.010 : 0.014;
      const baseFreq = this.currentTheme === "bright" ? 4300 : 3750;

      for (let p = 0; p < pulses; p++) {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(baseFreq + Math.random() * 150, now + p * (pulseDuration + pulseGap));

        const tStart = now + p * (pulseDuration + pulseGap);
        const tEnd = tStart + pulseDuration;

        gain.gain.setValueAtTime(0, tStart);
        gain.gain.linearRampToValueAtTime(0.012 * this.ambientGainScale, tStart + 0.002);
        gain.gain.exponentialRampToValueAtTime(0.0001, tEnd);

        osc.connect(gain);
        gain.connect(this.ambientMixer!);

        osc.start(tStart);
        osc.stop(tEnd + 0.02);
      }
    } catch (e) {}
  }

  private triggerBird() {
    if (!this.forestActive || !this._enabled || !this.ctx || this.currentTheme === "dark") return;
    try {
      const ctx = this.ctx;
      const now = ctx.currentTime;

      const count = 2 + Math.floor(Math.random() * 2); // 2-3 chirps
      let startTime = now;

      for (let i = 0; i < count; i++) {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";

        const startFreq = 2100 + Math.random() * 400;
        const endFreq = 3900 + Math.random() * 600;

        osc.frequency.setValueAtTime(startFreq, startTime);
        osc.frequency.exponentialRampToValueAtTime(endFreq, startTime + 0.11);

        gain.gain.setValueAtTime(0, startTime);
        gain.gain.linearRampToValueAtTime(0.008 * this.ambientGainScale, startTime + 0.015);
        gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.11);

        osc.connect(gain);
        gain.connect(this.ambientMixer!);

        osc.start(startTime);
        osc.stop(startTime + 0.13);

        startTime += 0.22; // gap
      }
    } catch (e) {}
  }

  // --- DISCRETE CHIME SOUND ACTIONS ---
  public playSingingBowl() {
    if (!this._enabled) return;
    try {
      const ctx = this.initCtx();
      if (!ctx) return;

      const now = ctx.currentTime;
      const mainGain = ctx.createGain();
      mainGain.gain.setValueAtTime(0, now);
      mainGain.gain.linearRampToValueAtTime(this._volume * 0.8, now + 0.1);
      mainGain.gain.exponentialRampToValueAtTime(0.0001, now + 4.5); // long resonance
      mainGain.connect(ctx.destination);

      const fundamental = 136.10;
      const overtones = [
        { mult: 1.0, vol: 1.0, type: "sine" as OscillatorType },
        { mult: 1.98, vol: 0.6, type: "sine" as OscillatorType },
        { mult: 2.92, vol: 0.45, type: "sine" as OscillatorType },
        { mult: 4.05, vol: 0.3, type: "sine" as OscillatorType },
        { mult: 5.12, vol: 0.15, type: "sine" as OscillatorType },
        { mult: 6.25, vol: 0.08, type: "sine" as OscillatorType }
      ];

      overtones.forEach((ot) => {
        const osc = ctx.createOscillator();
        const oscGain = ctx.createGain();

        osc.type = ot.type;
        osc.frequency.setValueAtTime(fundamental * ot.mult, now);
        
        const lfo = ctx.createOscillator();
        const lfoGain = ctx.createGain();
        lfo.frequency.value = 1.8 + Math.random() * 1.5;
        lfoGain.gain.value = 1.2;

        lfo.connect(lfoGain);
        lfoGain.connect(osc.frequency);

        oscGain.gain.setValueAtTime(ot.vol * 0.3, now);
        oscGain.gain.exponentialRampToValueAtTime(0.001, now + 2.0 + Math.random() * 2.0);

        osc.connect(oscGain);
        oscGain.connect(mainGain);

        lfo.start(now);
        osc.start(now);

        lfo.stop(now + 5.0);
        osc.stop(now + 5.0);
      });
    } catch (e) {
      console.warn("Web Audio bowl chime failed.", e);
    }
  }

  public playTingsha() {
    if (!this._enabled) return;
    try {
      const ctx = this.initCtx();
      if (!ctx) return;

      const now = ctx.currentTime;
      const mainGain = ctx.createGain();
      mainGain.gain.setValueAtTime(0, now);
      mainGain.gain.linearRampToValueAtTime(this._volume * 0.6, now + 0.01);
      mainGain.gain.exponentialRampToValueAtTime(0.0001, now + 3.0);
      mainGain.connect(ctx.destination);

      const frequencies = [2048, 2054, 4096, 6144];
      frequencies.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const oscGain = ctx.createGain();

        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, now);

        const lfo = ctx.createOscillator();
        const lfoGain = ctx.createGain();
        lfo.frequency.value = 8 + idx * 3;
        lfoGain.gain.value = 0.05;

        lfo.connect(lfoGain);
        lfoGain.connect(oscGain.gain);

        oscGain.gain.setValueAtTime(0.2, now);
        oscGain.gain.exponentialRampToValueAtTime(0.001, now + 1.2 + idx * 0.4);

        osc.connect(oscGain);
        oscGain.connect(mainGain);

        lfo.start(now);
        osc.start(now);

        lfo.stop(now + 3.5);
        osc.stop(now + 3.5);
      });
    } catch (e) {
      console.warn("Tingsha chime failed.", e);
    }
  }

  public playBreath() {
    if (!this._enabled) return;
    try {
      const ctx = this.initCtx();
      if (!ctx) return;

      const now = ctx.currentTime;
      const bufferSize = ctx.sampleRate * 4;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }

      const noise = ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = ctx.createBiquadFilter();
      filter.type = "bandpass";
      filter.Q.setValueAtTime(2.0, now);
      filter.frequency.setValueAtTime(250, now);
      filter.frequency.exponentialRampToValueAtTime(650, now + 1.8);
      filter.frequency.exponentialRampToValueAtTime(150, now + 3.8);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.linearRampToValueAtTime(this._volume * 0.35, now + 1.6);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 4.0);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      noise.start(now);
      noise.stop(now + 4.0);
    } catch (e) {
      console.warn("Breath simulator failed.", e);
    }
  }

  public playDroplet() {
    if (!this._enabled) return;
    try {
      const ctx = this.initCtx();
      if (!ctx) return;

      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(320, now);
      osc.frequency.exponentialRampToValueAtTime(1400, now + 0.08);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(this._volume * 0.4, now + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.15);
    } catch (e) {}
  }

  public playWoodblock() {
    if (!this._enabled) return;
    try {
      const ctx = this.initCtx();
      if (!ctx) return;

      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      osc.type = "triangle";
      osc.frequency.setValueAtTime(195, now);
      osc.frequency.exponentialRampToValueAtTime(160, now + 0.04);

      filter.type = "bandpass";
      filter.frequency.setValueAtTime(320, now);
      filter.Q.setValueAtTime(4, now);

      gain.gain.setValueAtTime(this._volume * 0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.06);
    } catch (e) {}
  }

  public stopAllAmbient() {
    this.rainActive = false;
    this.windActive = false;
    this.forestActive = false;
    this.updateRainNode();
    this.updateWindNode();
    this.updateForestNode();
    this.normalizeAmbientVolumes();
  }
}

export const sound = new SoundEngine();
