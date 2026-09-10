export class GameAudio {
  constructor() { this.enabled = true; this.context = null; this.counts = {}; this.errors = []; }
  async arm() {
    try {
      if (!this.context) this.context = new (window.AudioContext || window.webkitAudioContext)();
      if (this.context.state === 'suspended') await this.context.resume();
    } catch (error) { this.errors.push(String(error)); }
  }
  toggle() { this.enabled = !this.enabled; if (this.enabled) this.arm(); return this.enabled; }
  play(name) {
    if (!this.enabled || !this.context || this.context.state !== 'running') return;
    const notes = { move: [330], push: [261.63, 392], undo: [392, 293.66], blocked: [164.81], beacon: [523.25, 659.25, 783.99], battery: [440, 659.25], damage: [164.81, 123.47], shield: [220, 440], dash: [261.63, 523.25], win: [392, 523.25, 659.25, 783.99], loss: [293.66, 246.94, 196], start: [261.63, 392], reset: [329.63, 261.63] }[name] || [330];
    this.counts[name] = (this.counts[name] || 0) + 1;
    notes.forEach((frequency, index) => {
      const oscillator = this.context.createOscillator();
      const gain = this.context.createGain();
      const at = this.context.currentTime + index * (name === 'win' ? 0.14 : 0.07);
      oscillator.type = name === 'damage' ? 'triangle' : 'sine';
      oscillator.frequency.setValueAtTime(frequency, at);
      gain.gain.setValueAtTime(0.00001, at);
      gain.gain.exponentialRampToValueAtTime(name === 'move' ? 0.025 : 0.06, at + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.00001, at + (name === 'win' ? 0.6 : 0.22));
      oscillator.connect(gain); gain.connect(this.context.destination);
      oscillator.start(at); oscillator.stop(at + 0.65);
      oscillator.onended = () => { oscillator.disconnect(); gain.disconnect(); };
    });
  }
  diagnostics() { return { enabled: this.enabled, contextState: this.context?.state ?? 'not-created', eventCounts: { ...this.counts }, errors: [...this.errors] }; }
}
