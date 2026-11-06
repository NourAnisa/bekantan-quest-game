/**
 * Bekantan Quest - Main Game Loop & State Machine
 * Mengintegrasikan:
 * - Game States (MENU, PLAYING, PAUSED, LEVEL_COMPLETE, GAME_OVER, GAME_WIN)
 * - Input Handling (Keyboard + Virtual Touch Mobile)
 * - LocalStorage High Scores & Star Ratings
 * - Responsive Canvas Sizing
 */

class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');

        this.canvas.width = 800;
        this.canvas.height = 450;

        this.renderer = new Renderer(this.canvas, this.ctx);
        this.camera = new Camera(this.canvas.width, this.canvas.height);
        this.particles = new ParticleSystem();
        this.sound = window.soundSystem;
        this.quiz = new QuizSystem(this);

        this.state = 'MENU'; // 'MENU', 'PLAYING', 'PAUSED', 'LEVEL_COMPLETE', 'GAME_OVER', 'GAME_WIN'
        this.currentLevelIndex = 0;
        this.currentLevel = null;
        this.player = null;

        // Timing & FPS
        this.lastTime = 0;
        this.fps = 60;
        this.frameCount = 0;
        this.fpsTimer = 0;
        this.lastDt = 0.016;

        // Input state
        this.keys = {};
        this.touchInput = { left: false, right: false, jump: false, dash: false };

        // Overall stats
        this.totalScore = 0;
        this.levelStartTime = 0;
        this.levelTime = 0;

        // High score from local storage
        this.highScore = parseInt(localStorage.getItem('bekantan_quest_highscore') || '0', 10);

        this.setupInputs();
        this.setupUI();
        this.updateHUDHighScore();

        window.gameInstance = this;
    }

    setupInputs() {
        // Keyboard Events
        window.addEventListener('keydown', (e) => {
            if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) {
                e.preventDefault();
            }
            this.keys[e.code] = true;

            // Shortcut Actions
            if (this.state === 'PLAYING') {
                if (e.code === 'Space' || e.code === 'KeyW' || e.code === 'ArrowUp' || e.code === 'KeyK') {
                    if (this.player) this.player.pressJump(this.sound, this.particles);
                }
                if (e.code === 'KeyJ' || e.code === 'ShiftLeft' || e.code === 'KeyX') {
                    if (this.player) this.player.pressDash(this.sound, this.particles);
                }
                if (e.code === 'KeyP' || e.code === 'Escape') {
                    this.togglePause();
                }
                if (e.code === 'F1') {
                    e.preventDefault();
                    this.renderer.debugMode = !this.renderer.debugMode;
                }
                if (e.code === 'KeyG') {
                    if (this.player) {
                        this.player.isGodMode = !this.player.isGodMode;
                        this.particles.addPopup(this.player.x, this.player.y - 10, this.player.isGodMode ? 'GOD MODE ON' : 'GOD MODE OFF', '#00E5FF', 14);
                    }
                }
                if (e.code === 'KeyN') {
                    // Cheat skip level untuk demonstrasi dosen di kelas
                    this.onLevelFinished();
                }
            }
        });

        window.addEventListener('keyup', (e) => {
            this.keys[e.code] = false;
            if (this.player && (e.code === 'Space' || e.code === 'KeyW' || e.code === 'ArrowUp' || e.code === 'KeyK')) {
                this.player.cutJump();
            }
        });

        // Virtual Touch Controls Setup
        const bindTouchBtn = (btnId, keyName, onReleaseCut = false) => {
            const el = document.getElementById(btnId);
            if (!el) return;

            const handlePress = (e) => {
                e.preventDefault();
                this.touchInput[keyName] = true;
                if (this.sound) this.sound.init();

                if (this.state === 'PLAYING' && this.player) {
                    if (keyName === 'jump') this.player.pressJump(this.sound, this.particles);
                    if (keyName === 'dash') this.player.pressDash(this.sound, this.particles);
                }
            };

            const handleRelease = (e) => {
                e.preventDefault();
                this.touchInput[keyName] = false;
                if (onReleaseCut && this.player) {
                    this.player.cutJump();
                }
            };

            el.addEventListener('touchstart', handlePress, { passive: false });
            el.addEventListener('touchend', handleRelease, { passive: false });
            el.addEventListener('mousedown', handlePress);
            el.addEventListener('mouseup', handleRelease);
        };

        bindTouchBtn('btnTouchLeft', 'left');
        bindTouchBtn('btnTouchRight', 'right');
        bindTouchBtn('btnTouchJump', 'jump', true);
        bindTouchBtn('btnTouchDash', 'dash');
    }

    setupUI() {
        // Tombol Start Menu
        document.getElementById('btnStartGame').addEventListener('click', () => {
            this.sound.playClick();
            this.sound.startBGM();
            this.startLevel(0);
        });

        // Tombol Restart di Game Over
        document.getElementById('btnRetry').addEventListener('click', () => {
            this.sound.playClick();
            this.startLevel(this.currentLevelIndex);
        });

        // Tombol Lanjut Level di Level Complete
        document.getElementById('btnNextLevel').addEventListener('click', () => {
            this.sound.playClick();
            if (this.currentLevelIndex + 1 < LEVELS_DATA.length) {
                this.startLevel(this.currentLevelIndex + 1);
            } else {
                this.showGameWin();
            }
        });

        // Tombol Main Lagi di Game Win
        document.getElementById('btnPlayAgain').addEventListener('click', () => {
            this.sound.playClick();
            this.startLevel(0);
        });

        // Tombol Mute / Unmute Audio di Header
        const btnMute = document.getElementById('btnMute');
        if (btnMute) {
            btnMute.addEventListener('click', () => {
                const muted = this.sound.toggleMute();
                btnMute.textContent = muted ? '🔇 Suara: Mati' : '🔊 Suara: Aktif';
            });
        }

        // Tombol Toggle Debug Inspector di Header
        const btnDebug = document.getElementById('btnDebug');
        if (btnDebug) {
            btnDebug.addEventListener('click', () => {
                this.renderer.debugMode = !this.renderer.debugMode;
                btnDebug.classList.toggle('active', this.renderer.debugMode);
            });
        }
    }

    startLevel(index) {
        this.currentLevelIndex = index;
        const levelData = LEVELS_DATA[index];
        this.currentLevel = new Level(levelData);

        // Buat Pemain Baru
        this.player = new Player(this.currentLevel.spawnPoint.x, this.currentLevel.spawnPoint.y);
        this.player.score = this.totalScore;

        // Reset partikel dan kamera
        this.particles.clear();
        this.camera.x = this.player.x - this.canvas.width / 2;
        this.camera.y = this.player.y - this.canvas.height / 2;

        this.levelStartTime = performance.now();
        this.state = 'PLAYING';

        this.hideAllModals();
        document.getElementById('hudLevelName').textContent = levelData.name;
        this.updateHUD();
    }

    update(dt) {
        if (this.state !== 'PLAYING') return;

        this.levelTime = (performance.now() - this.levelStartTime) / 1000;
        document.getElementById('hudTimer').textContent = `${Math.floor(this.levelTime)}s`;

        // 1. Process Player Input
        let inputX = 0;
        if (this.keys['ArrowLeft'] || this.keys['KeyA'] || this.touchInput.left) inputX -= 1;
        if (this.keys['ArrowRight'] || this.keys['KeyD'] || this.touchInput.right) inputX += 1;
        this.player.inputX = inputX;

        // 2. Update Player
        this.player.update(dt, this.currentLevel, this.particles, this.sound);

        // Cek jika pemain mati
        if (this.player.health <= 0 || this.player.isDead) {
            this.showGameOver();
            return;
        }

        // 3. Update Enemies & Interaksi Stomp / Tabrakan Kuis Pengetahuan
        const playerBounds = this.player.getBounds();
        for (const enemy of this.currentLevel.enemies) {
            if (enemy.isDead) continue;
            enemy.update(dt, this.currentLevel, this.particles);

            const enemyBounds = enemy.getBounds();
            if (Physics.checkAABB(playerBounds, enemyBounds)) {
                // Apakah pemain menginjak musuh dari atas (Stomp)?
                const isFallingOnTop = (this.player.velocity.y > 0) &&
                    (this.player.y + this.player.height - 10 <= enemy.y + 14);

                if (isFallingOnTop) {
                    enemy.stomp(this.player, this.particles, this.sound);
                } else if (this.player.invulnerableTimer <= 0 && !this.player.isGodMode) {
                    // Terkena tabrakan musuh memicu kuis tantangan IPA / IPS / Sejarah
                    this.state = 'QUIZ';
                    this.quiz.startEnemyQuiz(enemy, (success) => {
                        this.state = 'PLAYING';
                        if (success) {
                            // Jawaban benar: Tangkis serangan & kalahkan musuh!
                            enemy.isDead = true;
                            this.player.score += 150;
                            this.player.invulnerableTimer = 1.2;
                            this.sound.playBounce();
                            this.particles.emitSparkle(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2, '#00E5FF', 16);
                            this.particles.addPopup(this.player.x + this.player.width / 2, this.player.y - 12, 'TANGKISAN SUKSES! +150', '#00E5FF', 15);
                        } else {
                            // Gagal atau waktu habis: Nyawa berkurang akibat serangan musuh
                            this.player.takeDamage(1, 'enemy');
                            this.particles.addPopup(this.player.x + this.player.width / 2, this.player.y - 12, 'SERANGAN MASUK! -1 NYAWA', '#FF5252', 15);
                        }
                        this.updateHUD();
                        if (this.player.health <= 0 || this.player.isDead) {
                            this.showGameOver();
                        }
                    });
                }
            }
        }

        // 4. Update Collectibles (Buah memicu Hitung Matematika 10 Detik)
        for (const item of this.currentLevel.collectibles) {
            if (item.isDead || item.collected) continue;
            item.update(dt);
            if (Physics.checkAABB(playerBounds, item.getBounds())) {
                if (item.subType === 'fruit') {
                    // Termakan buah memicu kuis perkalian & pembagian 10 detik
                    item.collected = true;
                    item.isDead = true;
                    this.state = 'QUIZ';
                    this.quiz.startFruitQuiz((success) => {
                        this.state = 'PLAYING';
                        if (success) {
                            // Jawaban Benar: Buah termakan sempurna & bonus skor
                            this.player.score += 200;
                            this.player.fruits += 1;
                            this.sound.playCollect();
                            this.particles.emitSparkle(item.x + 11, item.y + 11, '#FFCA28', 16);
                            this.particles.addPopup(item.x + 11, item.y - 10, '+200 BENAR! 🍎', '#FFD54F', 15);
                        } else {
                            // Gagal atau waktu habis: buah hilang dan nyawa berkurang 1
                            this.player.takeDamage(1, 'quiz_fail');
                            this.particles.addPopup(this.player.x + this.player.width / 2, this.player.y - 10, 'SALAH! -1 NYAWA 💔', '#FF5252', 15);
                        }
                        this.updateHUD();
                        if (this.player.health <= 0 || this.player.isDead) {
                            this.showGameOver();
                        }
                    });
                } else {
                    item.onCollect(this.player, this.particles, this.sound);
                }
            }
        }

        // 5. Update Moving Platforms
        for (const platform of this.currentLevel.movingPlatforms) {
            platform.update(dt, this.player);
        }

        // 6. Update Goal Shrine
        this.currentLevel.goal.update(dt);
        if (Physics.checkAABB(playerBounds, this.currentLevel.goal.getBounds())) {
            this.onLevelFinished();
        }

        // 7. Update Level & Partikel & Kamera
        this.currentLevel.update(dt);
        this.particles.update(dt);
        this.camera.update(dt, this.player.x, this.player.y, this.currentLevel.worldWidth, this.currentLevel.worldHeight);

        // 8. Update HUD
        this.updateHUD();
    }

    onLevelFinished() {
        this.state = 'LEVEL_COMPLETE';
        this.sound.playLevelComplete();

        // Hitung bonus waktu & total skor
        const timeBonus = Math.max(0, Math.floor(300 - this.levelTime * 5));
        this.player.score += timeBonus;
        this.totalScore = this.player.score;

        if (this.totalScore > this.highScore) {
            this.highScore = this.totalScore;
            localStorage.setItem('bekantan_quest_highscore', this.highScore.toString());
            this.updateHUDHighScore();
        }

        this.particles.emitSparkle(this.currentLevel.goal.x + 20, this.currentLevel.goal.y + 20, '#00E5FF', 24);

        setTimeout(() => {
            if (this.currentLevelIndex + 1 < LEVELS_DATA.length) {
                this.showLevelCompleteModal(timeBonus);
            } else {
                this.showGameWin();
            }
        }, 600);
    }

    updateHUD() {
        // Darah (Hearts)
        const heartsContainer = document.getElementById('hudHearts');
        if (heartsContainer && this.player) {
            let heartsStr = '';
            for (let i = 0; i < this.player.maxHealth; i++) {
                heartsStr += i < this.player.health ? '❤️' : '🖤';
            }
            heartsContainer.textContent = heartsStr;
        }

        // Skor & Buah
        if (this.player) {
            document.getElementById('hudScore').textContent = this.player.score;
            document.getElementById('hudFruits').textContent = `${this.player.fruits} 🍎`;
            document.getElementById('hudDiamonds').textContent = `${this.player.diamonds} 💎`;
        }
    }

    updateHUDHighScore() {
        const el = document.getElementById('hudHighScore');
        if (el) el.textContent = this.highScore;
    }

    togglePause() {
        if (this.state === 'PLAYING') {
            this.state = 'PAUSED';
            document.getElementById('modalPause').classList.remove('hidden');
        } else if (this.state === 'PAUSED') {
            this.state = 'PLAYING';
            document.getElementById('modalPause').classList.add('hidden');
        }
    }

    showGameOver() {
        this.state = 'GAME_OVER';
        document.getElementById('modalGameOver').classList.remove('hidden');
        document.getElementById('finalScoreOver').textContent = this.player.score;
    }

    showLevelCompleteModal(timeBonus) {
        document.getElementById('modalLevelComplete').classList.remove('hidden');
        document.getElementById('completeLevelTitle').textContent = `Misi ${this.currentLevel.name} Selesai!`;
        document.getElementById('completeScore').textContent = this.player.score;
        document.getElementById('completeBonus').textContent = `+${timeBonus} Pts`;
    }

    showGameWin() {
        this.state = 'GAME_WIN';
        document.getElementById('modalGameWin').classList.remove('hidden');
        document.getElementById('winScore').textContent = this.totalScore;
        document.getElementById('winFruits').textContent = this.player.fruits;
        document.getElementById('winDiamonds').textContent = this.player.diamonds;
    }

    hideAllModals() {
        const modals = document.querySelectorAll('.game-modal');
        modals.forEach(m => m.classList.add('hidden'));
        if (this.quiz) {
            clearInterval(this.quiz.timerInterval);
            this.quiz.isActive = false;
        }
    }

    startLoop() {
        const loop = (timestamp) => {
            if (!this.lastTime) this.lastTime = timestamp;
            let dt = (timestamp - this.lastTime) / 1000;
            this.lastTime = timestamp;

            // Batasi dt maksimum untuk mencegah bug tab tidak aktif
            if (dt > 0.05) dt = 0.05;
            this.lastDt = dt;

            // Hitung FPS
            this.frameCount++;
            this.fpsTimer += dt;
            if (this.fpsTimer >= 0.5) {
                this.fps = Math.round(this.frameCount / this.fpsTimer);
                this.frameCount = 0;
                this.fpsTimer = 0;
            }

            // Update & Render
            this.update(dt);
            if (this.currentLevel && this.player) {
                this.renderer.render(this, dt);
            }

            requestAnimationFrame(loop);
        };

        requestAnimationFrame(loop);
    }
}

// Inisialisasi saat window selesai load
window.addEventListener('load', () => {
    new Game().startLoop();
});
