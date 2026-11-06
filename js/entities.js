/**
 * Bekantan Quest - Game Entities System
 * Mengimplementasikan:
 * - Base Entity
 * - Player (Bekantan) dengan Finite State Machine, Coyote Time, Dash & Stomp
 * - Collectibles: Buah Rambai, Intan Martapura, Healing Potion/Heart
 * - Enemies: Kroco Kepiting Rawa, Drone Pemburu, Buaya Muara
 * - Moving Platforms (Rakit Sungai Barito)
 * - Goal Shrine (Gerbang Konservasi)
 */

class Entity {
    constructor(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.velocity = new Vector2(0, 0);
        this.isDynamic = true;
        this.isDead = false;
        this.type = 'entity';
    }

    getBounds() {
        return {
            x: this.x,
            y: this.y,
            width: this.width,
            height: this.height
        };
    }
}

class Player extends Entity {
    constructor(x, y) {
        super(x, y, 28, 38);
        this.type = 'player';

        // Stats
        this.maxHealth = 3;
        this.health = 3;
        this.score = 0;
        this.fruits = 0;
        this.diamonds = 0;
        this.isGodMode = false;

        // Kinematics
        this.moveSpeed = 220;
        this.jumpSpeed = 480;
        this.doubleJumpSpeed = 430;
        this.dashSpeed = 520;
        this.facing = 1; // 1 = kanan, -1 = kiri

        // Finite State Machine (FSM)
        this.state = 'IDLE'; // 'IDLE', 'RUN', 'JUMP', 'FALL', 'DASH', 'HURT'

        // Jump & Mobility Mechanics
        this.isGrounded = false;
        this.canDoubleJump = false;
        this.coyoteTimer = 0;
        this.maxCoyoteTime = 0.12;
        this.jumpBufferTimer = 0;
        this.maxJumpBuffer = 0.12;

        // Dash Mechanic
        this.isDashing = false;
        this.dashDuration = 0.18;
        this.dashTimer = 0;
        this.dashCooldown = 0;
        this.maxDashCooldown = 0.65;
        this.canDash = true;

        // Invulnerability after hurt
        this.invulnerableTimer = 0;
        this.maxInvulnerable = 1.2;

        // Animation timers
        this.animTimer = 0;
        this.animFrame = 0;
        this.inputX = 0;
    }

    update(dt, level, particles, sound) {
        if (this.health <= 0) {
            this.state = 'DEAD';
            return;
        }

        this.animTimer += dt;

        // Timers update
        if (this.invulnerableTimer > 0) this.invulnerableTimer -= dt;
        if (this.dashCooldown > 0) this.dashCooldown -= dt;

        // Coyote Time
        if (this.isGrounded) {
            this.coyoteTimer = this.maxCoyoteTime;
            this.canDoubleJump = true;
            this.canDash = true;
        } else {
            this.coyoteTimer -= dt;
        }

        // Jump Buffer
        if (this.jumpBufferTimer > 0) {
            this.jumpBufferTimer -= dt;
            if (this.coyoteTimer > 0) {
                this.executeJump(sound, particles, false);
            }
        }

        // Dash Handling
        if (this.isDashing) {
            this.dashTimer -= dt;
            this.velocity.x = this.facing * this.dashSpeed;
            this.velocity.y = 0;
            this.state = 'DASH';

            particles.emitSparkle(this.x + this.width / 2, this.y + this.height / 2, '#4DD0E1', 2);

            if (this.dashTimer <= 0) {
                this.isDashing = false;
                this.velocity.x = this.facing * this.moveSpeed * 0.5;
            }
            Physics.updateEntity(this, level, dt);
            return;
        }

        // Horizontal Movement
        if (Math.abs(this.inputX) > 0.1) {
            this.facing = this.inputX > 0 ? 1 : -1;
            this.velocity.x = this.inputX * this.moveSpeed;

            // Efek debu saat lari di tanah
            if (this.isGrounded && Math.random() < 0.25) {
                particles.emitDust(this.x + (this.facing > 0 ? 4 : this.width - 4), this.y + this.height, 2);
            }
        }

        // Update Physics (Gravitasi & Tilemap Collisions)
        const wasGrounded = this.isGrounded;
        Physics.updateEntity(this, level, dt);

        // Feedback debu saat baru mendarat (Land impact)
        if (!wasGrounded && this.isGrounded) {
            particles.emitDust(this.x + this.width / 2, this.y + this.height, 6);
        }

        // Tentukan State Animasi
        if (this.invulnerableTimer > 0.8) {
            this.state = 'HURT';
        } else if (!this.isGrounded) {
            this.state = this.velocity.y < 0 ? 'JUMP' : 'FALL';
        } else if (Math.abs(this.velocity.x) > 20) {
            this.state = 'RUN';
        } else {
            this.state = 'IDLE';
        }
    }

    pressJump(sound, particles) {
        this.jumpBufferTimer = this.maxJumpBuffer;
        if (this.coyoteTimer > 0) {
            this.executeJump(sound, particles, false);
        } else if (this.canDoubleJump) {
            this.executeJump(sound, particles, true);
        }
    }

    executeJump(sound, particles, isDouble) {
        this.jumpBufferTimer = 0;
        this.coyoteTimer = 0;

        if (isDouble) {
            this.canDoubleJump = false;
            this.velocity.y = -this.doubleJumpSpeed;
            if (sound) sound.playDoubleJump();
            particles.emitSparkle(this.x + this.width / 2, this.y + this.height, '#FFCA28', 8);
        } else {
            this.velocity.y = -this.jumpSpeed;
            if (sound) sound.playJump();
            particles.emitDust(this.x + this.width / 2, this.y + this.height, 6);
        }
    }

    cutJump() {
        // Variable jump height: lompat lebih pendek jika tombol dilepas lebih awal
        if (this.velocity.y < -150) {
            this.velocity.y = -150;
        }
    }

    pressDash(sound, particles) {
        if (!this.canDash || this.dashCooldown > 0 || this.isDashing) return;

        this.isDashing = true;
        this.dashTimer = this.dashDuration;
        this.dashCooldown = this.maxDashCooldown;
        this.canDash = false;

        if (sound) sound.playDash();
        particles.emitSparkle(this.x + this.width / 2, this.y + this.height / 2, '#00E5FF', 12);
    }

    takeDamage(amount, source = 'hazard') {
        if (this.isGodMode) return;
        if (this.invulnerableTimer > 0) return;

        this.health -= amount;
        this.invulnerableTimer = this.maxInvulnerable;
        this.velocity.y = -260;
        this.velocity.x = -this.facing * 160;

        if (window.soundSystem) window.soundSystem.playHurt();
        if (window.gameInstance && window.gameInstance.camera) {
            window.gameInstance.camera.shake(8, 0.3);
        }
        if (window.gameInstance && window.gameInstance.particles) {
            window.gameInstance.particles.addPopup(this.x + this.width / 2, this.y - 10, '-1 DARAH', '#FF5252', 16);
        }

        if (this.health <= 0) {
            this.health = 0;
            this.isDead = true;
            if (window.soundSystem) window.soundSystem.playGameOver();
        }
    }

    heal(amount) {
        this.health = Math.min(this.maxHealth, this.health + amount);
        if (window.gameInstance && window.gameInstance.particles) {
            window.gameInstance.particles.addPopup(this.x + this.width / 2, this.y - 10, '+1 DARAH', '#69F0AE', 16);
            window.gameInstance.particles.emitSparkle(this.x + this.width / 2, this.y + this.height / 2, '#69F0AE', 10);
        }
    }
}

class Collectible extends Entity {
    constructor(x, y, subType = 'fruit') {
        super(x, y, 22, 22);
        this.subType = subType; // 'fruit', 'diamond', 'heart'
        this.isDynamic = false;
        this.startY = y;
        this.floatOffset = Math.random() * Math.PI * 2;
        this.collected = false;
    }

    update(dt) {
        this.floatOffset += dt * 3.5;
        this.y = this.startY + Math.sin(this.floatOffset) * 5;
    }

    getBounds() {
        return {
            x: this.x - 4,
            y: this.y - 8,
            width: this.width + 8,
            height: this.height + 14
        };
    }

    onCollect(player, particles, sound) {
        if (this.collected) return;
        this.collected = true;
        this.isDead = true;

        if (this.subType === 'fruit') {
            player.score += 100;
            player.fruits += 1;
            sound.playCollect();
            particles.emitSparkle(this.x + 11, this.y + 11, '#FFCA28', 8);
            particles.addPopup(this.x + 11, this.y, '+100', '#FFD54F', 14);
        } else if (this.subType === 'diamond') {
            player.score += 500;
            player.diamonds += 1;
            sound.playDiamond();
            particles.emitSparkle(this.x + 11, this.y + 11, '#40C4FF', 14);
            particles.addPopup(this.x + 11, this.y, '+500 INTAN', '#00E5FF', 16);
        } else if (this.subType === 'heart') {
            player.heal(1);
            sound.playCollect();
            particles.emitSparkle(this.x + 11, this.y + 11, '#FF5252', 12);
        }
    }
}

class Enemy extends Entity {
    constructor(x, y, subType = 'crab', minX = 0, maxX = 100) {
        super(x, y, 28, 26);
        this.subType = subType; // 'crab', 'drone'
        this.minX = minX;
        this.maxX = maxX;
        this.speed = subType === 'drone' ? 80 : 60;
        this.direction = 1;
        this.isDynamic = subType === 'crab';
        this.startY = y;
        this.sineTimer = Math.random() * 5;
    }

    update(dt, level, particles) {
        if (this.isDead) return;

        if (this.subType === 'crab') {
            this.velocity.x = this.direction * this.speed;
            Physics.updateEntity(this, level, dt);

            // Balik arah jika menabrak dinding atau batas patroli
            if (this.x <= this.minX) {
                this.x = this.minX;
                this.direction = 1;
            } else if (this.x + this.width >= this.maxX) {
                this.x = this.maxX - this.width;
                this.direction = -1;
            }
        } else if (this.subType === 'drone') {
            // Drone melayang berbentuk sinusoidal
            this.x += this.direction * this.speed * dt;
            this.sineTimer += dt * 3.5;
            this.y = this.startY + Math.sin(this.sineTimer) * 22;

            if (this.x <= this.minX) {
                this.direction = 1;
            } else if (this.x >= this.maxX) {
                this.direction = -1;
            }
        }
    }

    stomp(player, particles, sound) {
        this.isDead = true;
        player.velocity.y = -380; // Pantulkan pemain ke atas
        player.score += 250;
        sound.playBounce();
        particles.emitSparkle(this.x + this.width / 2, this.y + this.height / 2, '#FF9800', 12);
        particles.addPopup(this.x + this.width / 2, this.y, '+250 KALAH!', '#FF9100', 15);
    }
}

class MovingPlatform extends Entity {
    constructor(x, y, width = 64, height = 18, moveX = 120, moveY = 0, speed = 40) {
        super(x, y, width, height);
        this.isDynamic = false;
        this.startX = x;
        this.startY = y;
        this.moveX = moveX;
        this.moveY = moveY;
        this.speed = speed;
        this.progress = 0;
        this.direction = 1;
        this.prevX = x;
        this.prevY = y;
    }

    update(dt, player) {
        this.prevX = this.x;
        this.prevY = this.y;

        this.progress += (this.speed / Math.max(1, Math.hypot(this.moveX, this.moveY))) * dt * this.direction;
        if (this.progress >= 1) {
            this.progress = 1;
            this.direction = -1;
        } else if (this.progress <= 0) {
            this.progress = 0;
            this.direction = 1;
        }

        this.x = this.startX + this.moveX * this.progress;
        this.y = this.startY + this.moveY * this.progress;

        const deltaX = this.x - this.prevX;
        const deltaY = this.y - this.prevY;

        // Bawa pemain jika sedang berdiri di atas platform
        if (
            player.x + player.width > this.x &&
            player.x < this.x + this.width &&
            Math.abs((player.y + player.height) - this.y) < 6 &&
            player.velocity.y >= 0
        ) {
            player.x += deltaX;
            player.y = this.y - player.height;
            player.velocity.y = 0;
            player.isGrounded = true;
        }
    }
}

class GoalShrine extends Entity {
    constructor(x, y) {
        super(x, y, 40, 52);
        this.isDynamic = false;
        this.reached = false;
        this.glowTimer = 0;
    }

    update(dt) {
        this.glowTimer += dt * 4;
    }
}

window.Player = Player;
window.Collectible = Collectible;
window.Enemy = Enemy;
window.MovingPlatform = MovingPlatform;
window.GoalShrine = GoalShrine;
