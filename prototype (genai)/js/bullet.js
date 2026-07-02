export class Bullet {
    constructor() {
        this.x = 0;
        this.y = 0;
        this.width = 4;
        this.height = 15;
        this.speedY = 0;
        this.isEnemy = false;
        this.damage = 1;
        this.color = '#00f0ff';
        this.active = false;
    }

    init(x, y, speedY, isEnemy, damage, color) {
        this.x = x;
        this.y = y;
        this.speedY = speedY;
        this.isEnemy = isEnemy;
        this.damage = damage;
        this.color = color;
        this.active = true;
    }

    update(dt) {
        this.y += this.speedY * dt;
        if (this.y < -50 || this.y > 2000) {
            this.active = false;
        }
    }

    draw(ctx) {
        ctx.fillStyle = this.color;
        ctx.shadowBlur = 10;
        ctx.shadowColor = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
        ctx.shadowBlur = 0; // reset
    }
}