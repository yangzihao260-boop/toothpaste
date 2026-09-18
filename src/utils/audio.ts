/**
 * Audio Synthesizer and Speech Controller
 * Strictly ensures:
 * 1. Cheerful, gentle BGM (Web Audio procedural marimba/music-box)
 * 2. Squeeze sound effects (cute squelch, squirt, plop)
 * 3. ONLY the English word "toothpaste" is ever spoken aloud, NO OTHER SPEECH.
 */

class SoundController {
  private ctx: AudioContext | null = null;
  private bgmGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;
  private bgmTimer: number | null = null;
  private isBgmPlaying = false;
  private bgmStep = 0;
  private lastSpokenTime = 0;
  private continuousSqueezeOsc: OscillatorNode | null = null;
  private continuousSqueezeGain: GainNode | null = null;

  // Settings
  public bgmEnabled = true;
  public sfxEnabled = true;
  public speechEnabled = true;

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();

      this.bgmGain = this.ctx.createGain();
      this.bgmGain.gain.value = 0.22;
      this.bgmGain.connect(this.ctx.destination);

      this.sfxGain = this.ctx.createGain();
      this.sfxGain.gain.value = 0.35;
      this.sfxGain.connect(this.ctx.destination);
    }

    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  // --- Background Music (Playful, relaxing pentatonic music box) ---
  public startBGM() {
    this.initContext();
    if (this.isBgmPlaying || !this.bgmEnabled) return;
    this.isBgmPlaying = true;
    this.scheduleBgmLoop();
  }

  public stopBGM() {
    this.isBgmPlaying = false;
    if (this.bgmTimer) {
      clearTimeout(this.bgmTimer);
      this.bgmTimer = null;
    }
  }

  public toggleBGM(): boolean {
    this.bgmEnabled = !this.bgmEnabled;
    if (this.bgmEnabled) {
      this.startBGM();
    } else {
      this.stopBGM();
    }
    return this.bgmEnabled;
  }

  private scheduleBgmLoop() {
    if (!this.isBgmPlaying || !this.bgmEnabled || !this.ctx || !this.bgmGain) return;

    // Friendly, cheerful melody notes (Pentatonic C major)
    const notes = [
      523.25, // C5
      659.25, // E5
      783.99, // G5
      880.00, // A5
      1046.50, // C6
      880.00,  // A5
      783.99,  // G5
      659.25,  // E5
      587.33,  // D5
      659.25,  // E5
      783.99,  // G5
      659.25,  // E5
      523.25,  // C5
      0,       // rest
      587.33,  // D5
      523.25   // C5
    ];

    const note = notes[this.bgmStep % notes.length];
    this.bgmStep++;

    if (note > 0) {
      this.playMarimbaNote(note, 0.45);
    }

    // Interval between notes (around 240ms = ~125 BPM 8th notes)
    this.bgmTimer = window.setTimeout(() => {
      this.scheduleBgmLoop();
    }, 280);
  }

  private playMarimbaNote(freq: number, duration: number) {
    if (!this.ctx || !this.bgmGain) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      // Soft sine + triangle for cute wooden music box tone
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.exponentialRampToValueAtTime(0.2, now + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

      osc.connect(gain);
      gain.connect(this.bgmGain);

      osc.start(now);
      osc.stop(now + duration + 0.05);
    } catch {
      // ignore
    }
  }

  // --- Squeeze Sound Effects ---
  public playSqueezePop() {
    this.initContext();
    if (!this.sfxEnabled || !this.ctx || !this.sfxGain) return;

    try {
      const now = this.ctx.currentTime;

      // Cute bubbly squirt: pitch sweeps down rapidly with a slight wobble
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      const startFreq = 500 + Math.random() * 200;
      const endFreq = 220 + Math.random() * 80;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(startFreq, now);
      osc.frequency.exponentialRampToValueAtTime(endFreq, now + 0.16);

      gain.gain.setValueAtTime(0.01, now);
      gain.gain.linearRampToValueAtTime(0.4, now + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(now);
      osc.stop(now + 0.22);

      // Bubble click/plop accompaniment
      const plopOsc = this.ctx.createOscillator();
      const plopGain = this.ctx.createGain();
      plopOsc.type = 'triangle';
      plopOsc.frequency.setValueAtTime(650 + Math.random() * 250, now);
      plopOsc.frequency.exponentialRampToValueAtTime(300, now + 0.09);

      plopGain.gain.setValueAtTime(0.2, now);
      plopGain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);

      plopOsc.connect(plopGain);
      plopGain.connect(this.sfxGain);

      plopOsc.start(now);
      plopOsc.stop(now + 0.12);
    } catch {
      // ignore
    }
  }

  // Continuous extrusion sound when long-pressing & dragging
  public startContinuousExtrusion() {
    this.initContext();
    if (!this.sfxEnabled || !this.ctx || !this.sfxGain) return;
    if (this.continuousSqueezeOsc) return;

    try {
      const now = this.ctx.currentTime;
      this.continuousSqueezeOsc = this.ctx.createOscillator();
      this.continuousSqueezeGain = this.ctx.createGain();

      this.continuousSqueezeOsc.type = 'sine';
      this.continuousSqueezeOsc.frequency.setValueAtTime(280, now);

      this.continuousSqueezeGain.gain.setValueAtTime(0.01, now);
      this.continuousSqueezeGain.gain.linearRampToValueAtTime(0.18, now + 0.05);

      this.continuousSqueezeOsc.connect(this.continuousSqueezeGain);
      this.continuousSqueezeGain.connect(this.sfxGain);

      this.continuousSqueezeOsc.start(now);
    } catch {
      // ignore
    }
  }

  public updateContinuousExtrusion(speedRatio: number) {
    if (!this.ctx || !this.continuousSqueezeOsc) return;
    const targetFreq = 240 + Math.min(speedRatio * 180, 240);
    this.continuousSqueezeOsc.frequency.setTargetAtTime(targetFreq, this.ctx.currentTime, 0.05);
  }

  public stopContinuousExtrusion() {
    if (this.continuousSqueezeOsc && this.continuousSqueezeGain && this.ctx) {
      try {
        const now = this.ctx.currentTime;
        this.continuousSqueezeGain.gain.linearRampToValueAtTime(0.001, now + 0.06);
        this.continuousSqueezeOsc.stop(now + 0.08);
      } catch {
        // ignore
      }
      this.continuousSqueezeOsc = null;
      this.continuousSqueezeGain = null;
    }
  }

  // Brush clean wash sound
  public playWashSound() {
    this.initContext();
    if (!this.sfxEnabled || !this.ctx || !this.sfxGain) return;

    try {
      const now = this.ctx.currentTime;
      // Soft water splash sparkle
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(800, now);
      osc.frequency.exponentialRampToValueAtTime(1400, now + 0.15);
      osc.frequency.exponentialRampToValueAtTime(600, now + 0.35);

      gain.gain.setValueAtTime(0.01, now);
      gain.gain.linearRampToValueAtTime(0.25, now + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(now);
      osc.stop(now + 0.45);
    } catch {
      // ignore
    }
  }

  // Sparkle chime when word completed
  public playSparkleSuccess() {
    this.initContext();
    if (!this.sfxEnabled || !this.ctx || !this.sfxGain) return;

    const chords = [523.25, 659.25, 783.99, 1046.50, 1318.51];
    chords.forEach((freq, index) => {
      window.setTimeout(() => {
        if (!this.ctx || !this.sfxGain) return;
        try {
          const now = this.ctx.currentTime;
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now);

          gain.gain.setValueAtTime(0.01, now);
          gain.gain.linearRampToValueAtTime(0.25, now + 0.02);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.4);

          osc.connect(gain);
          gain.connect(this.sfxGain);
          osc.start(now);
          osc.stop(now + 0.45);
        } catch {}
      }, index * 80);
    });
  }

  // =========================================================================
  // PRONUNCIATION: STRICT REQUIREMENT
  // "每次挤压牙膏都会有牙膏的英文读音，除了牙膏的英文读音外，其他读音都不要。"
  // ONLY "toothpaste" is ever pronounced. No letters, no phrases, no other words!
  // =========================================================================
  public speakToothpaste(force = false) {
    if (!this.speechEnabled) return;
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    const now = Date.now();
    // Prevent choppy overlapping stutter if squeezed in rapid succession,
    // but ensure fresh pronunciation when squeezed
    if (!force && now - this.lastSpokenTime < 1100) {
      return;
    }
    this.lastSpokenTime = now;

    try {
      window.speechSynthesis.cancel(); // Stop any pending utterance cleanly

      // Strictly the word "toothpaste"
      const utterance = new SpeechSynthesisUtterance("toothpaste");
      utterance.lang = "en-US";
      utterance.rate = 0.88; // Slightly slower, very clear for kids
      utterance.pitch = 1.08; // Friendly, warm tone

      // Pick best English voice if available
      const voices = window.speechSynthesis.getVoices();
      const preferredVoice = voices.find(v => 
        (v.lang.startsWith('en') && (v.name.includes('Natural') || v.name.includes('Samantha') || v.name.includes('Google') || v.name.includes('Junior') || v.name.includes('Victoria')))
      ) || voices.find(v => v.lang.startsWith('en'));

      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }

      window.speechSynthesis.speak(utterance);
    } catch {
      // ignore
    }
  }
}

export const soundCtrl = new SoundController();
