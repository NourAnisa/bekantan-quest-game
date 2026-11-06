/**
 * Bekantan Quest - Procedural Web Audio API Synthesizer
 * Dirancang untuk STI7356: Bebas dependensi eksternal, anti-404, aman CORS, 
 * dan berjalan di semua browser modern termasuk mobile.
 */

class SoundSystem {
    constructor() {
        this.ctx = null;
        this.isMuted = false;
        this.bgmPlaying = false;
        this.bgmTimer = null;
        this.bgmStep = 0;
        this.masterVolume = 0.35;
        this.bgmGainNode = null;
        this.sfxGainNode = null;
    }

    init() {
        if (!this.ctx) {
            const AudioCtx = window.AudioContext || window.webkitAudioContext;
            if (AudioCtx) {
                this.ctx = new AudioCtx();
                this.sfxGainNode = this.ctx.createGain();
                this.sfxGainNode.gain.value = this.masterVolume;
                this.sfxGainNode.connect(this.ctx.destination);

                this.bgmGainNode = this.ctx.createGain();
                this.bgmGainNode.gain.value = this.masterVolume * 0.45;
                this.bgmGainNode.connect(this.ctx.destination);
            }
        }
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }

    toggleMute() {
        this.isMuted = !this.isMuted;
        if (this.isMuted) {
            if (this.sfxGainNode) this.sfxGainNode.gain.value = 0;
            if (this.bgmGainNode) this.bgmGainNode.gain.value = 0;
        } else {
            if (this.sfxGainNode) this.sfxGainNode.gain.value = this.masterVolume;
            if (this.bgmGainNode) this.bgmGainNode.gain.value = this.masterVolume * 0.45;
        }
        return this.isMuted;
    }

    playJump() {
        if (this.isMuted || !this.ctx) return;
        this.init();
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'square';
        osc.frequency.setValueAtTime(160, now);
        osc.frequency.exponentialRampToValueAtTime(420, now + 0.12);

        gain.gain.setValueAtTime(0.18, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.12);

        osc.connect(gain);
        gain.connect(this.sfxGainNode);

        osc.start(now);
        osc.stop(now + 0.12);
    }

    playDoubleJump() {
        if (this.isMuted || !this.ctx) return;
        this.init();
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(320, now);
        osc.frequency.exponentialRampToValueAtTime(650, now + 0.15);

        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);

        osc.connect(gain);
        gain.connect(this.sfxGainNode);

        osc.start(now);
        osc.stop(now + 0.15);
    }

    playDash() {
        if (this.isMuted || !this.ctx) return;
        this.init();
        const now = this.ctx.currentTime;
        const bufferSize = this.ctx.sampleRate * 0.12;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }

        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(800, now);
        filter.frequency.exponentialRampToValueAtTime(2400, now + 0.1);

        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.22, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.12);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(this.sfxGainNode);

        noise.start(now);
    }

    playCollect() {
        if (this.isMuted || !this.ctx) return;
        this.init();
        const now = this.ctx.currentTime;
        const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
        notes.forEach((freq, idx) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            const noteStart = now + idx * 0.035;

            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, noteStart);

            gain.gain.setValueAtTime(0.12, noteStart);
            gain.gain.exponentialRampToValueAtTime(0.005, noteStart + 0.08);

            osc.connect(gain);
            gain.connect(this.sfxGainNode);

            osc.start(noteStart);
            osc.stop(noteStart + 0.08);
        });
    }

    playDiamond() {
        if (this.isMuted || !this.ctx) return;
        this.init();
        const now = this.ctx.currentTime;
        const notes = [659.25, 830.61, 987.77, 1318.51]; // E5, G#5, B5, E6
        notes.forEach((freq, idx) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            const noteStart = now + idx * 0.04;

            osc.type = 'triangle';
            osc.frequency.setValueAtTime(freq, noteStart);

            gain.gain.setValueAtTime(0.18, noteStart);
            gain.gain.exponentialRampToValueAtTime(0.005, noteStart + 0.14);

            osc.connect(gain);
            gain.connect(this.sfxGainNode);

            osc.start(noteStart);
            osc.stop(noteStart + 0.14);
        });
    }

    playBounce() {
        if (this.isMuted || !this.ctx) return;
        this.init();
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(140, now);
        osc.frequency.exponentialRampToValueAtTime(560, now + 0.18);

        gain.gain.setValueAtTime(0.25, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);

        osc.connect(gain);
        gain.connect(this.sfxGainNode);

        osc.start(now);
        osc.stop(now + 0.2);
    }

    playHurt() {
        if (this.isMuted || !this.ctx) return;
        this.init();
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(320, now);
        osc.frequency.exponentialRampToValueAtTime(90, now + 0.18);

        gain.gain.setValueAtTime(0.28, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.18);

        osc.connect(gain);
        gain.connect(this.sfxGainNode);

        osc.start(now);
        osc.stop(now + 0.18);
    }

    playLevelComplete() {
        if (this.isMuted || !this.ctx) return;
        this.init();
        const now = this.ctx.currentTime;
        const melody = [
            { f: 392.00, d: 0.12 },
            { f: 523.25, d: 0.12 },
            { f: 659.25, d: 0.14 },
            { f: 783.99, d: 0.35 }
        ];
        let offset = 0;
        melody.forEach(item => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            const start = now + offset;

            osc.type = 'triangle';
            osc.frequency.setValueAtTime(item.f, start);

            gain.gain.setValueAtTime(0.22, start);
            gain.gain.exponentialRampToValueAtTime(0.01, start + item.d);

            osc.connect(gain);
            gain.connect(this.sfxGainNode);

            osc.start(start);
            osc.stop(start + item.d);
            offset += item.d;
        });
    }

    playGameOver() {
        if (this.isMuted || !this.ctx) return;
        this.init();
        const now = this.ctx.currentTime;
        const notes = [349.23, 311.13, 261.63, 196.00]; // F4, Eb4, C4, G3
        notes.forEach((freq, idx) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            const start = now + idx * 0.2;

            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(freq, start);

            gain.gain.setValueAtTime(0.2, start);
            gain.gain.exponentialRampToValueAtTime(0.01, start + 0.22);

            osc.connect(gain);
            gain.connect(this.sfxGainNode);

            osc.start(start);
            osc.stop(start + 0.22);
        });
    }

    playClick() {
        if (this.isMuted || !this.ctx) return;
        this.init();
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, now);
        osc.frequency.exponentialRampToValueAtTime(400, now + 0.04);

        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.04);

        osc.connect(gain);
        gain.connect(this.sfxGainNode);

        osc.start(now);
        osc.stop(now + 0.04);
    }

    startBGM() {
        if (this.bgmPlaying) return;
        this.init();
        this.bgmPlaying = true;
        this.bgmStep = 0;

        const melodyScale = [
            261.63, 293.66, 329.63, 392.00, 440.00, 523.25, 587.33, 659.25
        ];

        const bassNotes = [130.81, 164.81, 196.00, 220.00];

        const pattern = [
            0, 2, 3, 5, 4, 3, 2, 0,
            1, 3, 4, 6, 5, 4, 3, 1,
            2, 4, 5, 7, 6, 5, 4, 2,
            4, 3, 2, 1, 3, 2, 1, 0
        ];

        const tick = () => {
            if (!this.bgmPlaying || !this.ctx) return;
            const now = this.ctx.currentTime;

            if (!this.isMuted) {
                const noteIdx = pattern[this.bgmStep % pattern.length];
                const freq = melodyScale[noteIdx % melodyScale.length];

                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();

                osc.type = 'square';
                osc.frequency.setValueAtTime(freq, now);

                gain.gain.setValueAtTime(0.035, now);
                gain.gain.exponentialRampToValueAtTime(0.005, now + 0.16);

                osc.connect(gain);
                gain.connect(this.bgmGainNode);

                osc.start(now);
                osc.stop(now + 0.17);

                if (this.bgmStep % 4 === 0) {
                    const bassFreq = bassNotes[(this.bgmStep / 4) % bassNotes.length];
                    const bassOsc = this.ctx.createOscillator();
                    const bassGain = this.ctx.createGain();

                    bassOsc.type = 'triangle';
                    bassOsc.frequency.setValueAtTime(bassFreq, now);

                    bassGain.gain.setValueAtTime(0.07, now);
                    bassGain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);

                    bassOsc.connect(bassGain);
                    bassGain.connect(this.bgmGainNode);

                    bassOsc.start(now);
                    bassOsc.stop(now + 0.45);
                }
            }

            this.bgmStep++;
            this.bgmTimer = setTimeout(tick, 180);
        };

        tick();
    }

    playQuizPopup() {
        if (this.isMuted || !this.ctx) return;
        this.init();
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.exponentialRampToValueAtTime(880, now + 0.15);

        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);

        osc.connect(gain);
        gain.connect(this.sfxGainNode);

        osc.start(now);
        osc.stop(now + 0.16);
    }

    playQuizTick() {
        if (this.isMuted || !this.ctx) return;
        this.init();
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'square';
        osc.frequency.setValueAtTime(800, now);

        gain.gain.setValueAtTime(0.1, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

        osc.connect(gain);
        gain.connect(this.sfxGainNode);

        osc.start(now);
        osc.stop(now + 0.05);
    }

    playQuizCorrect() {
        if (this.isMuted || !this.ctx) return;
        this.init();
        const now = this.ctx.currentTime;
        
        [523.25, 659.25, 783.99, 1046.50].forEach((freq, i) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc.type = 'triangle';
            osc.frequency.setValueAtTime(freq, now + i * 0.08);

            gain.gain.setValueAtTime(0.18, now + i * 0.08);
            gain.gain.exponentialRampToValueAtTime(0.01, now + i * 0.08 + 0.15);

            osc.connect(gain);
            gain.connect(this.sfxGainNode);

            osc.start(now + i * 0.08);
            osc.stop(now + i * 0.08 + 0.16);
        });
    }

    playQuizWrong() {
        if (this.isMuted || !this.ctx) return;
        this.init();
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(220, now);
        osc.frequency.exponentialRampToValueAtTime(110, now + 0.28);

        gain.gain.setValueAtTime(0.22, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.28);

        osc.connect(gain);
        gain.connect(this.sfxGainNode);

        osc.start(now);
        osc.stop(now + 0.29);
    }

    stopBGM() {
        this.bgmPlaying = false;
        if (this.bgmTimer) {
            clearTimeout(this.bgmTimer);
            this.bgmTimer = null;
        }
    }
}

window.soundSystem = new SoundSystem();
