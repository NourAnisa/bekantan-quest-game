/**
 * Bekantan Quest - 2D Physics Engine & Collision Detection
 * Mengimplementasikan:
 * - AABB (Axis-Aligned Bounding Box) Box-Box & Box-Tile Collision
 * - Coyote Time & Jump Buffer untuk Game Feel responsif
 * - Variable Jump Height (Jump Cut)
 * - One-Way Platforms & Bouncing Springs
 */

class Vector2 {
    constructor(x = 0, y = 0) {
        this.x = x;
        this.y = y;
    }

    set(x, y) {
        this.x = x;
        this.y = y;
        return this;
    }

    add(v) {
        this.x += v.x;
        this.y += v.y;
        return this;
    }

    multiply(scalar) {
        this.x *= scalar;
        this.y *= scalar;
        return this;
    }

    clone() {
        return new Vector2(this.x, this.y);
    }
}

class Physics {
    static checkAABB(rect1, rect2) {
        return (
            rect1.x < rect2.x + rect2.width &&
            rect1.x + rect1.width > rect2.x &&
            rect1.y < rect2.y + rect2.height &&
            rect1.y + rect1.height > rect2.y
        );
    }

    /**
     * Resolves collision between an entity and a tilemap
     * @param {Entity} entity
     * @param {Level} level
     * @param {number} dt Delta time in seconds
     */
    static updateEntity(entity, level, dt) {
        if (!entity.isDynamic) return;

        // Terapkan gravitasi jika tidak sedang dash
        if (!entity.isDashing) {
            entity.velocity.y += level.gravity * dt;
            if (entity.velocity.y > level.terminalVelocity) {
                entity.velocity.y = level.terminalVelocity;
            }
        }

        // Terapkan friksi horizontal di tanah
        if (entity.isGrounded && Math.abs(entity.inputX) < 0.1 && !entity.isDashing) {
            entity.velocity.x *= Math.pow(level.friction, dt * 60);
            if (Math.abs(entity.velocity.x) < 5) entity.velocity.x = 0;
        }

        // Simpan posisi sebelum bergerak untuk deteksi arah
        const oldX = entity.x;
        const oldY = entity.y;

        // 1. Gerak Horizontal
        entity.x += entity.velocity.x * dt;
        Physics.resolveTileCollisionsX(entity, level, oldX);

        // 2. Gerak Vertikal
        entity.y += entity.velocity.y * dt;
        entity.isGrounded = false;
        Physics.resolveTileCollisionsY(entity, level, oldY);

        // Batasi di dalam dunia
        if (entity.x < 0) {
            entity.x = 0;
            entity.velocity.x = 0;
        } else if (entity.x + entity.width > level.worldWidth) {
            entity.x = level.worldWidth - entity.width;
            entity.velocity.x = 0;
        }

        // Jatuh ke jurang bawah
        if (entity.y > level.worldHeight + 100) {
            entity.takeDamage(999, 'pit');
        }
    }

    static resolveTileCollisionsX(entity, level, oldX) {
        const tileSize = level.tileSize;
        const startCol = Math.floor(entity.x / tileSize);
        const endCol = Math.floor((entity.x + entity.width) / tileSize);
        const startRow = Math.floor(entity.y / tileSize);
        const endRow = Math.floor((entity.y + entity.height - 1) / tileSize);

        for (let r = startRow; r <= endRow; r++) {
            for (let c = startCol; c <= endCol; c++) {
                const tile = level.getTile(c, r);
                if (tile === 1) { // Solid Wall / Ground
                    const tileX = c * tileSize;
                    if (entity.velocity.x > 0) {
                        // Nabrak ke kanan
                        entity.x = tileX - entity.width;
                        entity.velocity.x = 0;
                        entity.isTouchingWall = 1; // Wall di kanan
                    } else if (entity.velocity.x < 0) {
                        // Nabrak ke kiri
                        entity.x = tileX + tileSize;
                        entity.velocity.x = 0;
                        entity.isTouchingWall = -1; // Wall di kiri
                    }
                }
            }
        }
    }

    static resolveTileCollisionsY(entity, level, oldY) {
        const tileSize = level.tileSize;
        const startCol = Math.floor(entity.x / tileSize);
        const endCol = Math.floor((entity.x + entity.width - 1) / tileSize);
        const startRow = Math.floor(entity.y / tileSize);
        const endRow = Math.floor((entity.y + entity.height) / tileSize);

        for (let r = startRow; r <= endRow; r++) {
            for (let c = startCol; c <= endCol; c++) {
                const tile = level.getTile(c, r);
                const tileY = r * tileSize;

                if (tile === 1) { // Solid ground / ceiling
                    if (entity.velocity.y > 0) {
                        // Mendarat di lantai
                        entity.y = tileY - entity.height;
                        entity.velocity.y = 0;
                        entity.isGrounded = true;
                    } else if (entity.velocity.y < 0) {
                        // Sundul atap
                        entity.y = tileY + tileSize;
                        entity.velocity.y = 0;
                    }
                } else if (tile === 2) { // One-way platform (dapat dilewati dari bawah)
                    if (entity.velocity.y > 0 && oldY + entity.height <= tileY + 6) {
                        entity.y = tileY - entity.height;
                        entity.velocity.y = 0;
                        entity.isGrounded = true;
                    }
                } else if (tile === 3) { // Spring / Trampoline Mushroom
                    if (entity.velocity.y > 0 && oldY + entity.height <= tileY + 12) {
                        entity.y = tileY - entity.height;
                        entity.velocity.y = -620; // Super bounce!
                        if (window.soundSystem) window.soundSystem.playBounce();
                        if (level.onSpringTrigger) level.onSpringTrigger(c, r);
                    }
                } else if (tile === 4) { // Duri / Hazard
                    if (entity.takeDamage) {
                        entity.takeDamage(1, 'spike');
                    }
                }
            }
        }
    }
}

window.Vector2 = Vector2;
window.Physics = Physics;
