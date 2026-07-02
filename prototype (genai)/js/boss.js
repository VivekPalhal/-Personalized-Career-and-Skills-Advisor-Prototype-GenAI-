import { Utils } from './utils.js';

export class PowerUp {
    constructor() {
        this.x = 0;
        this.y = 0;
        this.width = 20;
        this.height = 20;
        this.type = 'shield'; // shield, weapon, repair
        this.speedY = 150;
        this.active = false;
        this.color = '#fffb00';
    }

    init(x, y, type) {
        this.x = x;
        this.y = y;
        this.type = type;
        this.active = true;
        
        if (type === 'shield') this.color = '#00f0ff';
        else if (type === 'weapon') this.color = '#ff007f';
        else this.color = '#39ff14';
    }

    update(dt) {
        this.y += this.speedY * dt;
        if (this.y > 1200) this.active = false;
    }

    draw(ctx) {
        ctx.fillStyle = this.color;
        ctx.shadowBlur = 12;
        ctx.shadowColor = this.color;
        
        ctx.beginPath();
        ctx.arc(this.x + this.width/2, this.y + this.height/2, this.width/2, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.shadowBlur = 0;
    }
}