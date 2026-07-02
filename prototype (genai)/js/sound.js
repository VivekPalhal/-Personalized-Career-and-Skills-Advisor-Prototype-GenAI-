export class SoundSystem {
    constructor(storage) {
        this.storage = storage;
        this.ctx = null;
        this.settings = this.storage.getSettings();
        this.isMuted = false;
    }

    init() {
        // Deferred instantiation to respect user interaction policy restrictions
        if (!this.ctx) {
            this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        }
    }

    playSynthTone(frequency, type, duration, volumeMultiplier = 1.0) {
        if (this.isMuted) return;
        this.init();
        try {
            const osc = this.ctx.createOscillator();
            const gainNode = this.ctx.createGain();
            
            osc.type = type;
            osc.frequency.setValueAtTime(frequency, this.ctx.currentTime);
            
            const totalVol = this.settings.sfxVolume * volumeMultiplier;
            gainNode.gain.setValueAtTime(totalVol, this.ctx.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);
            
            osc.connect(gainNode);
            gainNode.connect(this.ctx.destination);
            
            osc.start();
            osc.stop(this.ctx.currentTime + duration);
        } catch(e) { /* Audio fallback protection */ }
    }

    playLaser() { this.playSynthTone(880, 'sawtooth', 0.15, 0.3); }
    playEnemyLaser() { this.playSynthTone(330, 'square', 0.2, 0.2); }
    playExplosion() { this.playSynthTone(120, 'triangle', 0.4, 0.6); }
    playPowerup() { this.playSynthTone(660, 'sine', 0.3, 0.5); }
    playBossWarning() { this.playSynthTone(90, 'sawtooth', 0.8, 0.8); }
    
    setSFXVolume(v) { this.settings.sfxVolume = v; }
}