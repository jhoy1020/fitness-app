// Sound Service - Audio feedback for the app

class SoundService {
  private audioContext: AudioContext | null = null;
  private enabled: boolean = true;

  constructor() {
    // Load preference
    try {
      const saved = localStorage.getItem('soundEnabled');
      this.enabled = saved !== 'false';
    } catch (e) {}
  }

  private getAudioContext(): AudioContext {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return this.audioContext;
  }

  setEnabled(enabled: boolean) {
    this.enabled = enabled;
    try {
      localStorage.setItem('soundEnabled', enabled.toString());
    } catch (e) {}
  }

  isEnabled(): boolean {
    return this.enabled;
  }

  // Play a simple beep tone
  playBeep(frequency: number = 800, duration: number = 200, volume: number = 0.3) {
    if (!this.enabled) return;
    
    try {
      const ctx = this.getAudioContext();
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      oscillator.frequency.value = frequency;
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(volume, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration / 1000);
      
      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + duration / 1000);
    } catch (e) {
      console.log('Could not play sound:', e);
    }
  }

  // Timer complete sound - 3 ascending beeps
  playTimerComplete() {
    if (!this.enabled) return;
    
    this.playBeep(600, 150, 0.4);
    setTimeout(() => this.playBeep(800, 150, 0.4), 200);
    setTimeout(() => this.playBeep(1000, 300, 0.5), 400);
  }

  // Set logged sound - single confirmation beep
  playSetLogged() {
    if (!this.enabled) return;
    this.playBeep(1200, 100, 0.2);
  }

  // Workout complete sound - celebratory ascending
  playWorkoutComplete() {
    if (!this.enabled) return;
    
    this.playBeep(523, 150, 0.3); // C5
    setTimeout(() => this.playBeep(659, 150, 0.3), 150); // E5
    setTimeout(() => this.playBeep(784, 150, 0.3), 300); // G5
    setTimeout(() => this.playBeep(1047, 400, 0.4), 450); // C6
  }

  // PR sound - fanfare
  playPR() {
    if (!this.enabled) return;
    
    this.playBeep(523, 100, 0.4);
    setTimeout(() => this.playBeep(659, 100, 0.4), 100);
    setTimeout(() => this.playBeep(784, 100, 0.4), 200);
    setTimeout(() => this.playBeep(1047, 150, 0.5), 300);
    setTimeout(() => this.playBeep(1047, 400, 0.5), 500);
  }

  // Error/warning sound
  playError() {
    if (!this.enabled) return;
    this.playBeep(200, 300, 0.3);
  }

  // Button tap sound
  playTap() {
    if (!this.enabled) return;
    this.playBeep(1000, 50, 0.1);
  }
}

export const soundService = new SoundService();
export default soundService;
