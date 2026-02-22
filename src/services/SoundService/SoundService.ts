// Sound Service - Audio feedback for the app

import { Platform } from 'react-native';
import { Audio } from 'expo-av';
import { Storage } from '../../utils/storage';

class SoundService {
  private audioContext: AudioContext | null = null;
  private enabled: boolean = true;
  private initialized: boolean = false;

  constructor() {
    this.init();
  }

  private async init() {
    // Load preference
    try {
      const saved = await Storage.getItem('soundEnabled');
      this.enabled = saved !== 'false';
      
      // Set up audio mode for mobile
      if (Platform.OS !== 'web') {
        await Audio.setAudioModeAsync({
          playsInSilentModeIOS: true,
          staysActiveInBackground: false,
        });
      }
      this.initialized = true;
    } catch (e) {
      console.log('Sound init error:', e);
    }
  }

  private getAudioContext(): AudioContext | null {
    if (Platform.OS !== 'web') return null;
    
    if (!this.audioContext) {
      try {
        this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      } catch (e) {
        console.log('AudioContext not available');
        return null;
      }
    }
    return this.audioContext;
  }

  async setEnabled(enabled: boolean) {
    this.enabled = enabled;
    try {
      await Storage.setItem('soundEnabled', enabled.toString());
    } catch (e) {}
  }

  isEnabled(): boolean {
    return this.enabled;
  }

  // Play a simple beep tone using web audio or expo-av
  private async playTone(frequency: number = 800, duration: number = 200, volume: number = 0.3) {
    if (!this.enabled) return;
    
    if (Platform.OS === 'web') {
      // Use Web Audio API for web
      try {
        const ctx = this.getAudioContext();
        if (!ctx) return;
        
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
        console.log('Could not play web sound:', e);
      }
    } else {
      // Use expo-av for native - generate a simple beep
      try {
        const { sound } = await Audio.Sound.createAsync(
          { uri: `data:audio/wav;base64,${this.generateBeepBase64(frequency, duration)}` },
          { volume }
        );
        await sound.playAsync();
        // Unload after playing
        setTimeout(async () => {
          await sound.unloadAsync();
        }, duration + 100);
      } catch (e) {
        console.log('Could not play native sound:', e);
      }
    }
  }

  // Generate a simple beep as base64 WAV
  private generateBeepBase64(frequency: number, durationMs: number): string {
    const sampleRate = 22050;
    const numSamples = Math.floor(sampleRate * durationMs / 1000);
    const samples = new Float32Array(numSamples);
    
    for (let i = 0; i < numSamples; i++) {
      const t = i / sampleRate;
      // Sine wave with fade out
      const envelope = Math.max(0, 1 - (i / numSamples));
      samples[i] = Math.sin(2 * Math.PI * frequency * t) * envelope;
    }
    
    // Convert to 16-bit PCM
    const buffer = new ArrayBuffer(44 + numSamples * 2);
    const view = new DataView(buffer);
    
    // WAV header
    const writeString = (offset: number, str: string) => {
      for (let i = 0; i < str.length; i++) {
        view.setUint8(offset + i, str.charCodeAt(i));
      }
    };
    
    writeString(0, 'RIFF');
    view.setUint32(4, 36 + numSamples * 2, true);
    writeString(8, 'WAVE');
    writeString(12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, 1, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * 2, true);
    view.setUint16(32, 2, true);
    view.setUint16(34, 16, true);
    writeString(36, 'data');
    view.setUint32(40, numSamples * 2, true);
    
    // Audio data
    for (let i = 0; i < numSamples; i++) {
      const sample = Math.max(-1, Math.min(1, samples[i]));
      view.setInt16(44 + i * 2, sample * 32767, true);
    }
    
    // Convert to base64
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.length; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }

  // Play a simple beep tone
  playBeep(frequency: number = 800, duration: number = 200, volume: number = 0.3) {
    this.playTone(frequency, duration, volume);
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
