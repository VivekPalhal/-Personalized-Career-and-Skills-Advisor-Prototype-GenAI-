import { BackgroundManager } from './background.js';
import { PlayerShip } from './player.js';
import { Enemy } from './enemy.js';
import { BossShip } from './boss.js';
import { Bullet } from './bullet.js';
import { Particle, ObjectPool } from './utils.js'; // Handled via specific components
import { CollisionSystem } from './collision.js';
import { PowerUp } from './powerups.js';
import { InputHandler } from './input.js';
import { UIManager } from './ui.js';
import { SoundSystem } from './sound.js';
import { StorageSystem } from './storage.js';
import { Bullet as CoreBullet } from './bullet.js';
import { Particle as CoreParticle } from './particles.js';
import { Utils } from './utils.js';

export class GameEngine {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.resizeCanvas();
        
        this.storage = new StorageSystem();
        this.soundSystem = new SoundSystem(this.storage);
        this.input = new InputHandler();
        this.ui = new UIManager(this);
        this.bg = new BackgroundManager(this.canvas);
        
        this.bulletPool = new ObjectPool(() => new CoreBullet(), (b, x, y, sy, isE, dmg, col) => b.init(x, y, sy, isE, dmg, col));
        this.particlePool = new ObjectPool(() => new CoreParticle(), (p, x, y, col, l, s) => p.init(x, y, col, l, s));
        this.powerupPool = new ObjectPool(() => new PowerUp(), (p, x, y, t) => p.init(x, y, t));

        this.gameState = 'MENU'; // MENU, PLAYING, PAUSED, GAMEOVER
        this.lastTime = 0;
        this.fps = 60;
        
        window.addEventListener('resize', () => this.resizeCanvas());
        window.addEventListener('keydown', (e) => {
            if (e.code === 'Escape' && this.gameState === 'PLAYING') this.togglePause();
        });
    }

    resizeCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    bootEngine() {
        this.player = new PlayerShip(this.canvas.width, this.canvas.height);
        this.bullets = [];
        this.enemies = [];
        this.powerups = [];
        this.particles = [];
        this.boss = null;
        
        this.score = 0;
        this.comboMultiplier = 1.0;
        this.comboTimer = 0;
        this.wave = 1;
        
        this.scoreMetrics = { kills: 0, accuracyShots: 0, accuracyHits: 0 };
        
        this.waveSpeed = 40;
        this.horizontalDirection = 1;
        this.spawnWaveFormation();
        
        this.ui.switchScreen('hud');
        document.getElementById('hud').classList.remove('hidden');
        this.gameState = 'PLAYING';
    }

    startGridSequence() {
        this.bootEngine();
    }

    spawnWaveFormation() {
        const rows = 4;
        const cols = 8;
        const spacingX = 65;
        const spacingY = 50;
        const startX = (this.canvas.width - (cols * spacingX)) / 2;
        
        for (let r = 0; r < rows; r++) {
            let type = 'basic';
            if (r === 0) type = 'heavy';
            else if (r === 1) type = 'fast';

            for (let c = 0; c < cols; c++) {
                this.enemies.push(new Enemy(startX + c * spacingX, 100 + r * spacingY, type, r));
            }
        }
    }

    updateCombo(amt) {
        this.comboMultiplier += amt;
        this.comboTimer = 3.0; // 3.0 second falloff window
        if(this.comboMultiplier >= 3.0) this.storage.unlockAchievement('combo_lord');
    }

    resetCombo() {
        this.comboMultiplier = 1.0;
        this.comboTimer = 0;
    }

    togglePause() {
        if (this.gameState === 'PLAYING') {
            this.gameState = 'PAUSED';
            this.ui.switchScreen('pauseMenu');
        } else if (this.gameState === 'PAUSED') {
            this.gameState = 'PLAYING';
            this.ui.switchScreen('hud');
        }
    }

    rollPowerUpChance(x, y) {
        if (Math.random() < 0.20) { // 20% drops allocation metric
            const types = ['shield', 'weapon'];
            const chosen = types[Math.floor(Math.random() * types.length)];
            this.powerups.push(this.powerupPool.acquire(x, y, chosen));
        }
    }

    spawnExplosionEffect(x, y, color) {
        for (let i = 0; i < 15; i++) {
            this.particles.push(this.particlePool.acquire(x, y, color, Utils.randomRange(0.4, 0.8), Utils.randomRange(2, 4)));
        }
    }

    firePlayerWeapon() {
        if (this.player.fireCooldown <= 0) {
            this.soundSystem.playLaser();
            this.scoreMetrics.accuracyShots++;
            
            if (this.player.weaponLevel === 1) {
                this.bullets.push(this.bulletPool.acquire(this.player.x + this.player.width / 2 - 2, this.player.y, -600, false, 1, '#00f0ff'));
            } else if (this.player.weaponLevel >= 2) { // Dual expansion spread emitters
                this.bullets.push(this.bulletPool.acquire(this.player.x + 4, this.player.y, -650, false, 1, '#00f0ff'));
                this.bullets.push(this.bulletPool.acquire(this.player.x + this.player.width - 8, this.player.y, -650, false, 1, '#00f0ff'));
            }
            this.player.fireCooldown = this.player.fireRate;
        }
    }

    triggerVictory() {
        this.wave++;
        this.waveSpeed += 20;
        if(this.wave === 2) {
            this.boss = new BossShip(this.canvas.width);
            this.soundSystem.playBossWarning();
        } else {
            this.spawnWaveFormation();
        }
    }

    run(timestamp) {
        if (!this.lastTime) this.lastTime = timestamp;
        let dt = (timestamp - this.lastTime) / 1000;
        this.lastTime = timestamp;

        // Caps spike deltas to prevent frame-skipping glitches
        if (dt > 0.1) dt = 0.1;
        this.fps = 1 / dt;

        this.update(dt);
        this.render();

        requestAnimationFrame((t) => this.run(t));
    }

    update(dt) {
        this.bg.update(dt);
        if (this.gameState !== 'PLAYING') return;

        // Combo falloff ticker processing
        if (this.comboTimer > 0) {
            this.comboTimer -= dt;
            if (this.comboTimer <= 0) this.resetCombo();
        }

        this.player.update(dt, this.input);
        if (this.input.isPressed('Space')) {
            this.firePlayerWeapon();
        }

        // Alien Grid AI Logic pass execution loop
        let shiftDown = false;
        let activeEnemiesCount = 0;
        
        for (let e of this.enemies) {
            if (!e.active) continue;
            activeEnemiesCount++;
            e.update(dt);
            
            // Boundary detection logic array frame check
            e.x += this.waveSpeed * this.horizontalDirection * dt;
            if (e.x <= 15 || e.x >= this.canvas.width - e.width - 15) {
                shiftDown = true;
            }

            // Casual automatic enemy attack script execution
            if (Math.random() < 0.0006) {
                this.bullets.push(this.bulletPool.acquire(e.x + e.width/2, e.y + e.height, 350, true, 1, e.color));
                this.soundSystem.playEnemyLaser();
            }

            // Lose condition grid bottom breached
            if (e.y >= this.player.y - 20) {
                this.player.lives = 0;
            }
        }

        if (shiftDown) {
            this.horizontalDirection *= -1;
            for (let e of this.enemies) {
                if (e.active) e.y += 25;
            }
        }

        if (activeEnemiesCount === 0 && !this.boss) {
            this.triggerVictory();
        }

        // Active Boss Loop
        if (this.boss && this.boss.active) {
            this.boss.update(dt, this.player.x);
            if (Math.random() < 0.02) {
                this.bullets.push(this.bulletPool.acquire(this.boss.x + this.boss.width/2, this.boss.y + this.boss.height, 450, true, 2, '#ff007f'));
            }
        }

        // Dynamic Entity arrays updates
        this.bullets.forEach(b => { if (b.active) b.update(dt); });
        this.powerups.forEach(p => { if (p.active) p.update(dt); });
        this.particles.forEach(p => { if (p.active) p.update(dt); });

        CollisionSystem.resolve(this);

        // Filter and garbage retention optimization cleanup loop passing
        this.bullets = this.bullets.filter(b => { if(!b.active) this.bulletPool.release(b); return b.active; });
        this.powerups = this.powerups.filter(p => { if(!p.active) this.powerupPool.release(p); return p.active; });
        this.particles = this.particles.filter(p => { if(!p.active) this.particlePool.release(p); return p.active; });

        // Player Death/Gameover checking routing evaluation
        if (this.player.lives <= 0) {
            this.gameState = 'GAMEOVER';
            const acc = this.scoreMetrics.accuracyShots > 0 ? Math.round((this.scoreMetrics.accuracyHits / this.scoreMetrics.accuracyShots) * 100) : 0;
            this.ui.dom.summaryScore.textContent = this.score;
            this.ui.dom.summaryKills.textContent = this.scoreMetrics.kills;
            this.ui.dom.summaryAccuracy.textContent = `${acc}%`;
            
            this.storage.saveHighScore(this.score, this.scoreMetrics);
            if(this.scoreMetrics.kills >= 1) this.storage.unlockAchievement('first_blood');
            
            this.ui.switchScreen('gameOverMenu');
            document.getElementById('hud').classList.add('hidden');
        }

        this.ui.updateHUD(this.score, this.comboMultiplier, this.fps, this.player.weaponType, this.player.health, this.player.maxHealth, this.player.lives);
    }

    render() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.bg.draw(this.ctx);
        
        if (this.gameState === 'MENU') return;

        this.player.draw(this.ctx);
        this.enemies.forEach(e => { if (e.active) e.draw(this.ctx); });
        if (this.boss && this.boss.active) this.boss.draw(this.ctx);
        this.bullets.forEach(b => b.draw(this.ctx));
        this.powerups.forEach(p => p.draw(this.ctx));
        this.particles.forEach(p => p.draw(this.ctx));
    }
}