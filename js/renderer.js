/**
 * Bekantan Quest - Canvas 2D Procedural Pixel-Art Renderer
 * Mengimplementasikan:
 * - Parallax Multi-Layer Background (Lahan Basah & Pegunungan Meratus)
 * - Prosedural Pixel-Art Sprite Karakter Bekantan (Hidung khas, ekor, & animasi)
 * - Rendering Tilemap, Duri, Jamur Pemantul, dan Platform Rakit Kayu
 * - Debug Mode Inspector (F1: Hitbox AABB, FPS, State FSM, Vektor Kecepatan)
 */

class Renderer {
    constructor(canvas, ctx) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.debugMode = false;
        this.cloudOffset = 0;
        this.waterWaveTimer = 0;
    }

    render(game, dt) {
        const ctx = this.ctx;
        const camera = game.camera;
        const level = game.currentLevel;
        const player = game.player;

        this.cloudOffset += dt * 8;
        this.waterWaveTimer += dt * 4;

        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // 1. Gambar Parallax Background
        this.drawParallaxBackground(ctx, camera, level.theme);

        // 2. Gambar Tilemap
        this.drawTilemap(ctx, camera, level);

        // 3. Gambar Moving Platforms
        for (const platform of level.movingPlatforms) {
            this.drawMovingPlatform(ctx, camera, platform);
        }

        // 4. Gambar Goal Shrine
        this.drawGoalShrine(ctx, camera, level.goal);

        // 5. Gambar Collectibles
        for (const item of level.collectibles) {
            if (!item.isDead) {
                this.drawCollectible(ctx, camera, item);
            }
        }

        // 6. Gambar Enemies
        for (const enemy of level.enemies) {
            if (!enemy.isDead) {
                this.drawEnemy(ctx, camera, enemy);
            }
        }

        // 7. Gambar Pemain (Bekantan)
        this.drawPlayer(ctx, camera, player);

        // 8. Gambar Partikel & Popup Skor
        game.particles.draw(ctx, camera);

        // 9. Overlay Debug Mode jika diaktifkan (F1)
        if (this.debugMode) {
            this.drawDebugOverlay(ctx, camera, game);
        }
    }

    drawParallaxBackground(ctx, camera, theme) {
        const w = this.canvas.width;
        const h = this.canvas.height;

        // Gradient Langit Senja Lahan Basah Tropis
        const skyGrad = ctx.createLinearGradient(0, 0, 0, h);
        if (theme === 'mangrove') {
            skyGrad.addColorStop(0, '#3A1C71');
            skyGrad.addColorStop(0.5, '#D76D77');
            skyGrad.addColorStop(1, '#FFAF7B');
        } else if (theme === 'river') {
            skyGrad.addColorStop(0, '#1A2980');
            skyGrad.addColorStop(0.6, '#26D0CE');
            skyGrad.addColorStop(1, '#E0F7FA');
        } else {
            skyGrad.addColorStop(0, '#2C3E50');
            skyGrad.addColorStop(0.5, '#4CA1AF');
            skyGrad.addColorStop(1, '#C4E0E5');
        }
        ctx.fillStyle = skyGrad;
        ctx.fillRect(0, 0, w, h);

        // Awan Mengambang (Parallax Layer 1: Kecepatan 0.1x)
        ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
        for (let i = 0; i < 6; i++) {
            const cloudX = ((i * 180 + this.cloudOffset - camera.x * 0.1) % (w + 200)) - 100;
            const cloudY = 30 + (i % 3) * 28;
            this.drawCloud(ctx, cloudX, cloudY, 60 + (i % 2) * 20);
        }

        // Pegunungan Meratus Jauh (Parallax Layer 2: Kecepatan 0.2x)
        ctx.fillStyle = theme === 'mangrove' ? 'rgba(74, 35, 90, 0.45)' : 'rgba(26, 82, 118, 0.45)';
        ctx.beginPath();
        ctx.moveTo(0, h);
        const mountainOffset = (camera.x * 0.2) % 300;
        for (let x = -300; x < w + 300; x += 150) {
            const px = x - mountainOffset;
            ctx.lineTo(px, h - 140 - Math.sin((x + 100) * 0.015) * 60);
            ctx.lineTo(px + 75, h - 70);
        }
        ctx.lineTo(w, h);
        ctx.closePath();
        ctx.fill();

        // Kanopi Pohon Mangrove Dekat (Parallax Layer 3: Kecepatan 0.4x)
        ctx.fillStyle = theme === 'mangrove' ? 'rgba(30, 77, 43, 0.55)' : 'rgba(20, 60, 50, 0.55)';
        ctx.beginPath();
        ctx.moveTo(0, h);
        const treeOffset = (camera.x * 0.4) % 120;
        for (let x = -120; x < w + 120; x += 60) {
            const px = x - treeOffset;
            ctx.arc(px + 30, h - 45, 45, Math.PI, 0, false);
        }
        ctx.lineTo(w, h);
        ctx.closePath();
        ctx.fill();
    }

    drawCloud(ctx, x, y, size) {
        ctx.beginPath();
        ctx.arc(x, y, size * 0.3, 0, Math.PI * 2);
        ctx.arc(x + size * 0.25, y - size * 0.15, size * 0.35, 0, Math.PI * 2);
        ctx.arc(x + size * 0.55, y, size * 0.28, 0, Math.PI * 2);
        ctx.fill();
    }

    drawTilemap(ctx, camera, level) {
        const ts = level.tileSize;
        const startCol = Math.max(0, Math.floor(camera.x / ts));
        const endCol = Math.min(level.cols - 1, Math.ceil((camera.x + this.canvas.width) / ts));
        const startRow = Math.max(0, Math.floor(camera.y / ts));
        const endRow = Math.min(level.rows - 1, Math.ceil((camera.y + this.canvas.height) / ts));

        for (let r = startRow; r <= endRow; r++) {
            for (let c = startCol; c <= endCol; c++) {
                const tile = level.getTile(c, r);
                const sx = c * ts - camera.x;
                const sy = r * ts - camera.y;

                if (tile === 1) {
                    // Solid ground / stone / tree bark
                    ctx.fillStyle = '#4E342E'; // Tanah coklat
                    ctx.fillRect(sx, sy, ts, ts);

                    // Rumput hijau di bagian atas tile jika atasnya udara
                    const tileAbove = level.getTile(c, r - 1);
                    if (tileAbove === 0 || tileAbove === 2) {
                        ctx.fillStyle = '#4CAF50';
                        ctx.fillRect(sx, sy, ts, 6);
                        // Aksen helai rumput
                        ctx.fillStyle = '#81C784';
                        ctx.fillRect(sx + 4, sy + 6, 4, 3);
                        ctx.fillRect(sx + 16, sy + 6, 5, 4);
                        ctx.fillRect(sx + 24, sy + 6, 3, 3);
                    } else {
                        // Tekstur bintik batu di dalam tanah
                        ctx.fillStyle = '#3E2723';
                        ctx.fillRect(sx + 6, sy + 8, 4, 4);
                        ctx.fillRect(sx + 20, sy + 18, 5, 4);
                    }
                    ctx.strokeStyle = '#271915';
                    ctx.lineWidth = 1;
                    ctx.strokeRect(sx, sy, ts, ts);
                } else if (tile === 2) {
                    // One-way platform kayu (Dahan ulin / rakit gantung)
                    ctx.fillStyle = '#8D6E63';
                    ctx.fillRect(sx, sy, ts, 8);
                    ctx.fillStyle = '#D7CCC8';
                    ctx.fillRect(sx, sy, ts, 2);
                    // Baut / Pengait ulin
                    ctx.fillStyle = '#3E2723';
                    ctx.fillRect(sx + 3, sy + 2, 3, 4);
                    ctx.fillRect(sx + ts - 6, sy + 2, 3, 4);
                } else if (tile === 3) {
                    // Spring Mushroom (Jamur Pemantul Ajaib)
                    const isBouncing = level.springs[`${c},${r}`] > 0;
                    const squish = isBouncing ? 0.6 : 1.0;

                    // Batang jamur
                    ctx.fillStyle = '#FFF8E1';
                    ctx.fillRect(sx + 11, sy + 14 * squish, 10, 18);

                    // Topi jamur merah berbintik putih
                    ctx.fillStyle = '#E53935';
                    ctx.beginPath();
                    ctx.ellipse(sx + 16, sy + 12 * squish, 14, 10 * squish, 0, 0, Math.PI * 2);
                    ctx.fill();

                    // Bintik putih
                    ctx.fillStyle = '#FFFFFF';
                    ctx.beginPath();
                    ctx.arc(sx + 16, sy + 8 * squish, 3, 0, Math.PI * 2);
                    ctx.arc(sx + 10, sy + 12 * squish, 2, 0, Math.PI * 2);
                    ctx.arc(sx + 22, sy + 12 * squish, 2, 0, Math.PI * 2);
                    ctx.fill();
                } else if (tile === 4) {
                    // Duri / Jebakan Rotan Tajam
                    ctx.fillStyle = '#B71C1C';
                    ctx.beginPath();
                    ctx.moveTo(sx, sy + ts);
                    ctx.lineTo(sx + 8, sy + 6);
                    ctx.lineTo(sx + 16, sy + ts);
                    ctx.lineTo(sx + 24, sy + 6);
                    ctx.lineTo(sx + ts, sy + ts);
                    ctx.closePath();
                    ctx.fill();
                    ctx.strokeStyle = '#FF5252';
                    ctx.stroke();
                }
            }
        }
    }

    drawMovingPlatform(ctx, camera, p) {
        const sx = p.x - camera.x;
        const sy = p.y - camera.y;

        // Rakit Kayu Batang Pohon
        ctx.fillStyle = '#6D4C41';
        ctx.fillRect(sx, sy, p.width, p.height);

        // Garis kayu
        ctx.fillStyle = '#8D6E63';
        ctx.fillRect(sx + 2, sy + 2, p.width - 4, 3);
        ctx.fillStyle = '#4E342E';
        ctx.fillRect(sx, sy + p.height - 3, p.width, 3);

        // Tali pengikat rakit
        ctx.fillStyle = '#FFB300';
        ctx.fillRect(sx + 8, sy, 4, p.height);
        ctx.fillRect(sx + p.width - 12, sy, 4, p.height);

        ctx.strokeStyle = '#271915';
        ctx.lineWidth = 1;
        ctx.strokeRect(sx, sy, p.width, p.height);
    }

    drawGoalShrine(ctx, camera, goal) {
        const sx = goal.x - camera.x;
        const sy = goal.y - camera.y;

        // Tiang Gapura Tradisional
        ctx.fillStyle = '#5D4037';
        ctx.fillRect(sx + 2, sy + 12, 8, goal.height - 12);
        ctx.fillRect(sx + goal.width - 10, sy + 12, 8, goal.height - 12);

        // Atap Lumbung / Gapura Banjar
        ctx.fillStyle = '#E65100';
        ctx.beginPath();
        ctx.moveTo(sx - 4, sy + 12);
        ctx.lineTo(sx + goal.width / 2, sy);
        ctx.lineTo(sx + goal.width + 4, sy + 12);
        ctx.closePath();
        ctx.fill();

        // Permata Intan Bersinar di Tengah
        const glow = Math.sin(goal.glowTimer) * 0.3 + 0.7;
        ctx.fillStyle = `rgba(0, 229, 255, ${glow})`;
        ctx.beginPath();
        ctx.arc(sx + goal.width / 2, sy + 24, 7, 0, Math.PI * 2);
        ctx.fill();

        // Banner 'FINISH'
        ctx.font = 'bold 9px monospace';
        ctx.fillStyle = '#FFFFFF';
        ctx.textAlign = 'center';
        ctx.fillText('FINISH', sx + goal.width / 2, sy + 44);
    }

    drawCollectible(ctx, camera, item) {
        const sx = item.x - camera.x;
        const sy = item.y - camera.y;

        if (item.subType === 'fruit') {
            // Buah Rambai Mangrove Khas Kalimantan (Bulat kuning keemasan berdaun)
            ctx.fillStyle = '#FFA000';
            ctx.beginPath();
            ctx.arc(sx + 11, sy + 12, 8, 0, Math.PI * 2);
            ctx.fill();

            // Kilau buah
            ctx.fillStyle = '#FFD54F';
            ctx.beginPath();
            ctx.arc(sx + 9, sy + 9, 3, 0, Math.PI * 2);
            ctx.fill();

            // Tangkai & Daun Hijau
            ctx.strokeStyle = '#5D4037';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(sx + 11, sy + 4);
            ctx.lineTo(sx + 11, sy);
            ctx.stroke();

            ctx.fillStyle = '#4CAF50';
            ctx.beginPath();
            ctx.ellipse(sx + 15, sy + 2, 4, 2, Math.PI / 4, 0, Math.PI * 2);
            ctx.fill();
        } else if (item.subType === 'diamond') {
            // Intan Martapura (Berlian Biru Cyan Berkilau)
            ctx.fillStyle = '#00E5FF';
            ctx.beginPath();
            ctx.moveTo(sx + 11, sy + 2);
            ctx.lineTo(sx + 19, sy + 9);
            ctx.lineTo(sx + 11, sy + 20);
            ctx.lineTo(sx + 3, sy + 9);
            ctx.closePath();
            ctx.fill();

            // Facet kilau
            ctx.fillStyle = '#E0F7FA';
            ctx.beginPath();
            ctx.moveTo(sx + 11, sy + 2);
            ctx.lineTo(sx + 15, sy + 9);
            ctx.lineTo(sx + 11, sy + 15);
            ctx.lineTo(sx + 7, sy + 9);
            ctx.closePath();
            ctx.fill();
        } else if (item.subType === 'heart') {
            // Hati Pemulih Darah Merah
            ctx.fillStyle = '#FF1744';
            ctx.beginPath();
            ctx.arc(sx + 7, sy + 8, 5, 0, Math.PI * 2);
            ctx.arc(sx + 15, sy + 8, 5, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.moveTo(sx + 2, sy + 9);
            ctx.lineTo(sx + 11, sy + 19);
            ctx.lineTo(sx + 20, sy + 9);
            ctx.closePath();
            ctx.fill();
        }
    }

    drawEnemy(ctx, camera, enemy) {
        const sx = enemy.x - camera.x;
        const sy = enemy.y - camera.y;

        if (enemy.subType === 'crab') {
            // Kroco Kepiting Rawa
            ctx.fillStyle = '#E64A19';
            // Badan
            ctx.beginPath();
            ctx.ellipse(sx + 14, sy + 15, 12, 8, 0, 0, Math.PI * 2);
            ctx.fill();

            // Mata
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(sx + 8, sy + 5, 4, 5);
            ctx.fillRect(sx + 16, sy + 5, 4, 5);
            ctx.fillStyle = '#000000';
            ctx.fillRect(sx + 9, sy + 7, 2, 3);
            ctx.fillRect(sx + 17, sy + 7, 2, 3);

            // Capit Kiri & Kanan
            ctx.fillStyle = '#D84315';
            ctx.beginPath();
            ctx.arc(sx + 2, sy + 10, 4, 0, Math.PI * 2);
            ctx.arc(sx + 26, sy + 10, 4, 0, Math.PI * 2);
            ctx.fill();
        } else if (enemy.subType === 'drone') {
            // Drone Pemburu Mengapung
            ctx.fillStyle = '#37474F';
            ctx.fillRect(sx + 4, sy + 6, 20, 14);

            // Baling-baling berputar
            ctx.fillStyle = '#90A4AE';
            const propW = (Math.floor(Date.now() / 40) % 2 === 0) ? 26 : 8;
            ctx.fillRect(sx + 14 - propW / 2, sy + 2, propW, 3);

            // Lampu Sensor Merah Menatap Pemain
            ctx.fillStyle = '#FF1744';
            ctx.beginPath();
            ctx.arc(sx + 14, sy + 13, 4, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    drawPlayer(ctx, camera, p) {
        if (p.health <= 0) return;

        // Efek kedip transparan saat kebal terkena hit
        if (p.invulnerableTimer > 0 && Math.floor(p.invulnerableTimer * 16) % 2 === 0) {
            return;
        }

        const sx = p.x - camera.x;
        const sy = p.y - camera.y;

        ctx.save();

        // Flip horizontal jika menghadap kiri
        if (p.facing === -1) {
            ctx.translate(sx + p.width, sy);
            ctx.scale(-1, 1);
        } else {
            ctx.translate(sx, sy);
        }

        const runCycle = Math.sin(p.animTimer * 16);
        const legOffset = p.state === 'RUN' ? runCycle * 5 : 0;

        // 1. Ekor Panjang Khas Bekantan (Warna krem keputihan di ujung)
        ctx.strokeStyle = '#D7CCC8';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(4, 26);
        const tailWag = Math.sin(p.animTimer * 10) * 6;
        ctx.quadraticCurveTo(-6, 20 + tailWag, -10, 10 + tailWag);
        ctx.stroke();

        // 2. Kaki Belakang & Depan
        ctx.fillStyle = '#8D6E63';
        ctx.fillRect(8 - legOffset, 28, 5, 10);
        ctx.fillRect(17 + legOffset, 28, 5, 10);

        // 3. Badan Berbulu Cokelat Kemerahan (Khas Bekantan Kalimantan)
        ctx.fillStyle = '#BF360C';
        ctx.beginPath();
        ctx.ellipse(14, 22, 10, 11, 0, 0, Math.PI * 2);
        ctx.fill();

        // Perut Buncit Warna Krem Terang
        ctx.fillStyle = '#FFE0B2';
        ctx.beginPath();
        ctx.ellipse(16, 23, 6, 8, 0, 0, Math.PI * 2);
        ctx.fill();

        // 4. Kepala Bekantan
        ctx.fillStyle = '#BF360C';
        ctx.beginPath();
        ctx.arc(14, 10, 8, 0, Math.PI * 2);
        ctx.fill();

        // Rambut Mahkota Khas
        ctx.fillStyle = '#E64A19';
        ctx.beginPath();
        ctx.moveTo(8, 4);
        ctx.lineTo(14, 1);
        ctx.lineTo(20, 4);
        ctx.closePath();
        ctx.fill();

        // 5. HIDUNG BESAR MENGGANTUNG IKONIK BEKANTAN
        ctx.fillStyle = '#FF8A65';
        ctx.beginPath();
        // Hidung panjang menggantung ke depan bawah
        ctx.ellipse(23, 13, 6, 4, Math.PI / 8, 0, Math.PI * 2);
        ctx.fill();

        // 6. Mata Bersemangat
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(17, 7, 4, 4);
        ctx.fillStyle = '#000000';
        ctx.fillRect(19, 8, 2, 2);

        // 7. Efek Visual Khusus Saat Dash
        if (p.isDashing) {
            ctx.fillStyle = 'rgba(0, 229, 255, 0.45)';
            ctx.fillRect(-6, 0, 8, p.height);
        }

        ctx.restore();
    }

    drawDebugOverlay(ctx, camera, game) {
        const p = game.player;
        const level = game.currentLevel;

        // Kotak AABB Pemain (Merah)
        ctx.strokeStyle = '#FF1744';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(p.x - camera.x, p.y - camera.y, p.width, p.height);

        // Kotak AABB Musuh (Kuning)
        ctx.strokeStyle = '#FFEA00';
        for (const e of level.enemies) {
            if (!e.isDead) {
                ctx.strokeRect(e.x - camera.x, e.y - camera.y, e.width, e.height);
            }
        }

        // Kotak AABB Kolektibel (Hijau)
        ctx.strokeStyle = '#00E676';
        for (const c of level.collectibles) {
            if (!c.isDead) {
                ctx.strokeRect(c.x - camera.x, c.y - camera.y, c.width, c.height);
            }
        }

        // Panel HUD Debug Inspector (Atas Kiri)
        ctx.fillStyle = 'rgba(0, 0, 0, 0.82)';
        ctx.fillRect(10, 60, 240, 135);
        ctx.strokeStyle = '#00E5FF';
        ctx.strokeRect(10, 60, 240, 135);

        ctx.font = '11px monospace';
        ctx.fillStyle = '#00E5FF';
        ctx.textAlign = 'left';
        ctx.fillText('🛠️ GAME DEV INSPECTOR (STI7356)', 18, 78);
        ctx.fillStyle = '#FFFFFF';
        ctx.fillText(`FPS: ${game.fps} | dt: ${game.lastDt.toFixed(4)}s`, 18, 96);
        ctx.fillText(`State: [${p.state}] | Ground: ${p.isGrounded}`, 18, 114);
        ctx.fillText(`Vel X: ${p.velocity.x.toFixed(1)} | Vel Y: ${p.velocity.y.toFixed(1)}`, 18, 132);
        ctx.fillText(`Coyote: ${Math.max(0, p.coyoteTimer).toFixed(2)}s | DashCD: ${Math.max(0, p.dashCooldown).toFixed(2)}s`, 18, 150);
        ctx.fillText(`Posisi X: ${Math.round(p.x)}, Y: ${Math.round(p.y)}`, 18, 168);
        ctx.fillStyle = p.isGodMode ? '#76FF03' : '#B0BEC5';
        ctx.fillText(`GodMode (G): ${p.isGodMode ? 'ON' : 'OFF'}`, 18, 186);
    }
}

window.Renderer = Renderer;
