/**
 * Bekantan Quest - Particle System & Visual Game Feel (Juiciness)
 * Sesuai materi Pertemuan 15 (Polishing & Feedback Visual):
 * - Dust puff particles (footstep, jumping, landing)
 * - Sparkle stars (collecting fruits & diamonds)
 * - Floating score text popups (+100, +500, LEVEL UP)
 * - Screen Shake camera controller
 */

class Particle {
    constructor(x, y, vx, vy, color, size, life, shape = 'circle') {
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        this.color = color;
        this.size = size;
        this.initialSize = size;
        this.life = life;
        this.maxLife = life;
        this.shape = shape; // 'circle', 'star', 'square'
        this.gravity = 120;
    }

    update(dt) {
        this.x += this.vx * dt;
        this.y += this.vy * dt;
        this.vy += this.gravity * dt;
        this.life -= dt;
        this.size = this.initialSize * Math.max(0, this.life / this.maxLife);
    }

    draw(ctx, camera) {
        if (this.life <= 0) return;
        const screenX = this.x - camera.x;
        const screenY = this.y - camera.y;

        ctx.save();
        ctx.globalAlpha = Math.max(0, Math.min(1, this.life / this.maxLife));
        ctx.fillStyle = this.color;

        if (this.shape === 'circle') {
            ctx.beginPath();
            ctx.arc(screenX, screenY, Math.max(0.5, this.size), 0, Math.PI * 2);
            ctx.fill();
        } else if (this.shape === 'star') {
            ctx.beginPath();
            const s = this.size;
            ctx.moveTo(screenX, screenY - s);
            ctx.lineTo(screenX + s * 0.3, screenY - s * 0.3);
            ctx.lineTo(screenX + s, screenY);
            ctx.lineTo(screenX + s * 0.3, screenY + s * 0.3);
            ctx.lineTo(screenX, screenY + s);
            ctx.lineTo(screenX - s * 0.3, screenY + s * 0.3);
            ctx.lineTo(screenX - s, screenY);
            ctx.lineTo(screenX - s * 0.3, screenY - s * 0.3);
            ctx.closePath();
            ctx.fill();
        } else {
            ctx.fillRect(screenX - this.size / 2, screenY - this.size / 2, this.size, this.size);
        }
        ctx.restore();
    }
}

class TextPopup {
    constructor(x, y, text, color = '#FFD700', size = 14) {
        this.x = x;
        this.y = y;
        this.text = text;
        this.color = color;
        this.size = size;
        this.life = 0.85;
        this.maxLife = 0.85;
        this.vy = -45;
    }

    update(dt) {
        this.y += this.vy * dt;
        this.life -= dt;
    }

    draw(ctx, camera) {
        if (this.life <= 0) return;
        const screenX = this.x - camera.x;
        const screenY = this.y - camera.y;

        ctx.save();
        ctx.globalAlpha = Math.max(0, Math.min(1, this.life / this.maxLife));
        ctx.font = `bold ${this.size}px "Courier New", monospace`;
        ctx.textAlign = 'center';
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 3;
        ctx.strokeText(this.text, screenX, screenY);
        ctx.fillStyle = this.color;
        ctx.fillText(this.text, screenX, screenY);
        ctx.restore();
    }
}

class ParticleSystem {
    constructor() {
        this.particles = [];
        this.popups = [];
    }

    emitDust(x, y, count = 5) {
        for (let i = 0; i < count; i++) {
            const vx = (Math.random() - 0.5) * 60;
            const vy = -Math.random() * 40 - 10;
            const size = Math.random() * 3 + 2;
            const life = Math.random() * 0.25 + 0.15;
            this.particles.push(new Particle(x, y, vx, vy, '#D0C2A0', size, life, 'circle'));
        }
    }

    emitSparkle(x, y, color = '#FFE082', count = 10) {
        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * 120 + 30;
            const vx = Math.cos(angle) * speed;
            const vy = Math.sin(angle) * speed;
            const size = Math.random() * 4 + 3;
            const life = Math.random() * 0.35 + 0.2;
            this.particles.push(new Particle(x, y, vx, vy, color, size, life, 'star'));
        }
    }

    emitSplash(x, y, count = 8) {
        for (let i = 0; i < count; i++) {
            const vx = (Math.random() - 0.5) * 90;
            const vy = -Math.random() * 80 - 40;
            const size = Math.random() * 3.5 + 1.5;
            const life = Math.random() * 0.4 + 0.2;
            this.particles.push(new Particle(x, y, vx, vy, '#80DEEA', size, life, 'circle'));
        }
    }

    addPopup(x, y, text, color = '#FFD700', size = 15) {
        this.popups.push(new TextPopup(x, y, text, color, size));
    }

    update(dt) {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            this.particles[i].update(dt);
            if (this.particles[i].life <= 0) {
                this.particles.splice(i, 1);
            }
        }

        for (let i = this.popups.length - 1; i >= 0; i--) {
            this.popups[i].update(dt);
            if (this.popups[i].life <= 0) {
                this.popups.splice(i, 1);
            }
        }
    }

    draw(ctx, camera) {
        for (const p of this.particles) {
            p.draw(ctx, camera);
        }
        for (const pop of this.popups) {
            pop.draw(ctx, camera);
        }
    }

    clear() {
        this.particles = [];
        this.popups = [];
    }
}

class Camera {
    constructor(viewportWidth, viewportHeight) {
        this.viewportWidth = viewportWidth;
        this.viewportHeight = viewportHeight;
        this.x = 0;
        this.y = 0;
        this.shakeTime = 0;
        this.shakeIntensity = 0;
    }

    shake(intensity = 6, duration = 0.25) {
        this.shakeIntensity = intensity;
        this.shakeTime = duration;
    }

    update(dt, targetX, targetY, worldWidth, worldHeight) {
        // Smooth camera follow (Lerp)
        const targetCamX = targetX - this.viewportWidth / 2;
        const targetCamY = targetY - this.viewportHeight * 0.58;

        this.x += (targetCamX - this.x) * (dt * 5.0);
        this.y += (targetCamY - this.y) * (dt * 4.0);

        // Clamp inside world bounds
        this.x = Math.max(0, Math.min(this.x, worldWidth - this.viewportWidth));
        this.y = Math.max(0, Math.min(this.y, worldHeight - this.viewportHeight));

        // Screen Shake calculation
        if (this.shakeTime > 0) {
            this.shakeTime -= dt;
            const offsetX = (Math.random() - 0.5) * 2 * this.shakeIntensity;
            const offsetY = (Math.random() - 0.5) * 2 * this.shakeIntensity;
            this.x += offsetX;
            this.y += offsetY;
        }
    }
}

window.ParticleSystem = ParticleSystem;
window.Camera = Camera;
