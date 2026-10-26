/**
 * ============================================================================
 * ZEN PDF STUDIO — SPECULAR LIGHTING & SENSORY ENGINE
 * Apple VisionOS / macOS Sequoia Precision Lighting Architecture
 * Created by Aravind o k
 * ============================================================================
 */

class LiquidEngine {
    constructor() {
        this.audioEnabled = false; // Muted by default for clean, professional experience
        this.audioCtx = null;
        this.bindEvents();
        this.attachLiquidRipples();
    }

    initAudio() {
        if (!this.audioCtx && typeof (window.AudioContext || window.webkitAudioContext) !== 'undefined') {
            const AudioContextClass = window.AudioContext || window.webkitAudioContext;
            this.audioCtx = new AudioContextClass();
        }
        if (this.audioCtx && this.audioCtx.state === 'suspended') {
            this.audioCtx.resume();
        }
    }

    // Ultra-subtle, haptic mechanical click (similar to MacBook Force Touch trackpad)
    playHapticTap() {
        if (!this.audioEnabled) return;
        try {
            this.initAudio();
            if (!this.audioCtx) return;

            const now = this.audioCtx.currentTime;
            const osc = this.audioCtx.createOscillator();
            const gain = this.audioCtx.createGain();

            osc.type = 'sine';
            osc.frequency.setValueAtTime(180, now);
            osc.frequency.exponentialRampToValueAtTime(60, now + 0.025);

            gain.gain.setValueAtTime(0.04, now);
            gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.025);

            osc.connect(gain);
            gain.connect(this.audioCtx.destination);

            osc.start(now);
            osc.stop(now + 0.03);
        } catch (e) {}
    }

    playWaterDrop(pitch = 1.0) {
        // Redirected to clean subtle haptic tap
        this.playHapticTap();
    }

    playGlassTap() {
        this.playHapticTap();
    }

    toggleAudio() {
        this.audioEnabled = !this.audioEnabled;
        localStorage.setItem('zenAudioEnabled', this.audioEnabled);
        const icon = document.getElementById('sound-icon');
        if (icon) {
            icon.className = this.audioEnabled ? 'fa-solid fa-volume-high' : 'fa-solid fa-volume-xmark';
        }
        if (this.audioEnabled) this.playHapticTap();
    }

    bindEvents() {
        // Track mouse movement across glass cards for Apple VisionOS specular dynamic illumination
        window.addEventListener('pointermove', (e) => {
            const targetCard = e.target.closest('.glass-card, .glass-panel');
            if (targetCard) {
                const rect = targetCard.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                targetCard.style.setProperty('--mouse-x', `${x}px`);
                targetCard.style.setProperty('--mouse-y', `${y}px`);
            }
        }, { passive: true });
    }

    // Liquid Water Drop Click Ripple Physics
    attachLiquidRipples() {
        document.addEventListener('pointerdown', (e) => {
            const target = e.target.closest('.glass-card, .bento-card, .btn-primary, .btn-secondary, .cat-pill');
            if (!target) return;

            const rect = target.getBoundingClientRect();
            const ripple = document.createElement('span');
            ripple.className = 'liquid-water-ripple';

            const size = Math.max(rect.width, rect.height) * 1.6;
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;

            ripple.style.width = `${size}px`;
            ripple.style.height = `${size}px`;
            ripple.style.left = `${x}px`;
            ripple.style.top = `${y}px`;

            target.appendChild(ripple);
            setTimeout(() => {
                if (ripple.parentNode) ripple.parentNode.removeChild(ripple);
            }, 550);
        }, { passive: true });
    }
}

// Global Specular Engine Instance
window.liquidEngine = new LiquidEngine();
