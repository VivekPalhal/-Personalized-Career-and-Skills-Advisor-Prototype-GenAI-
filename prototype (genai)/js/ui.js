export class UIManager {
    constructor(game) {
        this.game = game;
        this.dom = {
            mainMenu: document.getElementById('main-menu'),
            settingsMenu: document.getElementById('settings-menu'),
            achievementsMenu: document.getElementById('achievements-menu'),
            achievementsContainer: document.getElementById('achievements-container'),
            pauseMenu: document.getElementById('pause-menu'),
            gameOverMenu: document.getElementById('game-over-menu'),
            hud: document.getElementById('hud'),
            score: document.getElementById('hud-score'),
            combo: document.getElementById('hud-combo'),
            fps: document.getElementById('hud-fps'),
            weapon: document.getElementById('hud-weapon'),
            healthFill: document.getElementById('hud-health-fill'),
            livesContainer: document.getElementById('hud-lives-container'),
            summaryScore: document.getElementById('summary-score'),
            summaryKills: document.getElementById('summary-kills'),
            summaryAccuracy: document.getElementById('summary-accuracy')
        };
        this.initListeners();
    }

    initListeners() {
        document.getElementById('btn-play').addEventListener('click', () => this.game.startGridSequence());
        document.getElementById('btn-settings').addEventListener('click', () => this.switchScreen('settingsMenu'));
        document.getElementById('btn-settings-back').addEventListener('click', () => this.switchScreen('mainMenu'));
        document.getElementById('btn-resume').addEventListener('click', () => this.game.togglePause());
        document.getElementById('btn-restart').addEventListener('click', () => this.game.bootEngine());
        document.getElementById('btn-gameover-restart').addEventListener('click', () => this.game.bootEngine());
        
        document.getElementById('btn-achievements').addEventListener('click', () => {
            this.renderAchievements();
            this.switchScreen('achievementsMenu');
        });
        document.getElementById('btn-achievements-back').addEventListener('click', () => this.switchScreen('mainMenu'));
    }

    switchScreen(screenKey) {
        Object.keys(this.dom).forEach(key => {
            if (this.dom[key] && this.dom[key].classList.contains('screen-content')) {
                this.dom[key].classList.add('hidden');
            }
        });
        if (this.dom[screenKey]) this.dom[screenKey].classList.remove('hidden');
    }

    renderAchievements() {
        const achs = [
            { id: "first_blood", name: "FIRST BLOOD", desc: "Purge your first alien scout unit." },
            { id: "combo_lord", name: "COMBO MASTER", desc: "Sustain an absolute structural multiplier of x3.0." },
            { id: "boss_slayer", name: "APEX PREY", desc: "Exterminate an Omega mothership capital command cruiser." }
        ];
        const unlocked = this.game.storage.getAchievements();
        this.dom.achievementsContainer.innerHTML = achs.map(a => `
            <div class="achievement-card ${unlocked[a.id] ? 'unlocked' : 'locked'}">
                <h4>${a.name}</h4>
                <p>${a.desc}</p>
                <small>${unlocked[a.id] ? `SECURED: ${unlocked[a.id].unlockedAt}` : 'DATA ENCRYPTED'}</small>
            </div>
        `).join('');
    }

    updateHUD(score, combo, fps, weapon, health, maxHealth, lives) {
        this.dom.score.textContent = String(score).padStart(6, '0');
        this.dom.combo.textContent = `x${combo.toFixed(1)}`;
        this.dom.fps.textContent = Math.round(fps);
        this.dom.weapon.textContent = weapon.toUpperCase();
        
        const pct = Math.max(0, (health / maxHealth) * 100);
        this.dom.healthFill.style.width = `${pct}%`;
        this.dom.livesContainer.innerHTML = "⚡".repeat(Math.max(0, lives));
    }
}