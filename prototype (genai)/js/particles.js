import { Utils } from './utils.js';

export class Particle {
    constructor() {
        this.x = 0;
        this.y = 0;
        this.vx = 0;
        this.vy = 0;
        this.color = '#fff';
        this.life = 0;
        this.maxLife = 0;
        this.size = 2;
        this.active = false;
    }

    init(x, y, color, maxLife, size) {
        this.x = x;
        this.y = y;
        this.color = color;
        this.maxLife = maxLife;
        this.life = maxLife;
        this.size = size;
        this.vx = Utils.randomRange(-120, 120);
        this.vy = Utils.randomRange(-120, 120);
        this.active = true;
    }

    update(dt) {
        this.x += this.vx * dt;
        this.y += this.vy * dt;
        this.life -= dt;
        if (this.life <= 0) this.active = false;
    }

    draw(ctx) {
        let alpha = Utils.clamp(this.life / this.maxLife, 0, 1);
        ctx.fillStyle = this.color;
        ctx.globalAlpha = alpha;
        ctx.fillRect(this.x, this.y, this.size, this.size);
        ctx.globalAlpha = 1.0;
    }
}