
import { Utils } from './utils.js';

export class PlayerShip {
    constructor(canvasWidth, canvasHeight) {
        this.canvasWidth = canvasWidth;
        this.canvasHeight = canvasHeight;
        this.width = 44;
        this.height = 40;
        this.x = canvasWidth / 2 - this.width / 2;
        this.y = canvasHeight - 80;
        
        this.vx = 0;
        this.speed = 450; 
        this.friction = 0.85;
        
        this.maxHealth = 100;
        this.health = 100;
        this.lives = 3;
        
        this.weaponLevel = 1;
        this.weaponType = 'laser';
        this.fireCooldown = 0;
        this.fireRate = 0.25; // seconds balance
        
        this.invulnerableTime = 0;
        this.blinkTimer = 0;
        this.visible = true;
    }

    damage(amount, soundSystem) {
        if (this.invulnerableTime > 0) return;
        this.health -= amount;
        this.invulnerableTime = 1.5; // 1.5 seconds default invulnerability frame
        soundSystem.playExplosion();
        if (this.health <= 0) {
            this.lives--;
            if (this.lives > 0) {
                this.health = this.maxHealth;
            }
        }
    }

    upgradeWeapon() {
        this.weaponLevel = Math.min(this.weaponLevel + 1, 3);
    }

    update(dt, input) {
        // Horizontal Movement Processing
        let dir = 0;
        if (input.isPressed('ArrowLeft') || input.isPressed('KeyA')) dir = -1;
        if (input.isPressed('ArrowRight') || input.isPressed('KeyD')) dir = 1;
        
        if (input.touch.active) {
            dir = Utils.clamp(input.touch.moveX / 50, -1, 1);
        }

        this.vx += dir * this.speed * dt;
        this.vx *= Math.pow(this.friction, dt * 60);
        this.x += this.vx * dt;
        
        this.x = Utils.clamp(this.x, 0, this.canvasWidth - this.width);

        if (this.fireCooldown > 0) this.fireCooldown -= dt;
        if (this.invulnerableTime > 0) {
            this.invulnerableTime -= dt;
            this.blinkTimer += dt;
            if (this.blinkTimer >= 0.1) {
                this.visible = !this.visible;
                this.blinkTimer = 0;
            }
        } else {
            this.visible = true;
        }
    }

    draw(ctx) {
        if (!this.visible) return;

        ctx.save();
        ctx.translate(this.x + this.width / 2, this.y + this.height / 2);
        
        // Banking mesh visual skewing
        let roll = Utils.clamp(this.vx / 30, -0.3, 0.3);
        ctx.rotate(roll);

        // Cyber Vector Engine Glow
        ctx.fillStyle = '#ff007f';
        ctx.shadowBlur = 15;
        ctx.shadowColor = '#ff007f';
        ctx.fillRect(-6, this.height/2 - 4, 12, 6);

        // Core Hull Design Canvas Vector Math
        ctx.fillStyle = '#00f0ff';
        ctx.shadowColor = '#00f0ff';
        ctx.beginPath();
        ctx.moveTo(0, -this.height / 2);
        ctx.lineTo(this.width / 2, this.height / 2);
        ctx.lineTo(-this.width / 2, this.height / 2);
        ctx.closePath();
        ctx.fill();

        ctx.restore();
    }
}