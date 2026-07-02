export class Enemy {
    constructor(x, y, type, row) {
        this.x = x;
        this.y = y;
        this.type = type; // basic, fast, heavy, kamikaze
        this.row = row;
        this.active = true;
        this.animTimer = Math.random() * Math.PI;

        this.initStats();
    }

    initStats() {
        switch (this.type) {
            case 'fast':
                this.width = 30; this.height = 25; this.health = 1; this.scoreValue = 150; this.color = '#fffb00';
                break;
            case 'heavy':
                this.width = 45; this.height = 35; this.health = 3; this.scoreValue = 300; this.color = '#ff007f';
                break;
            case 'basic':
            default:
                this.width = 35; this.height = 28; this.health = 2; this.scoreValue = 100; this.color = '#39ff14';
                break;
        }
    }

    update(dt, waveSpeed, horizontalDirection) {
        this.animTimer += dt * 4;
    }

    draw(ctx) {
        ctx.fillStyle = this.color;
        ctx.shadowBlur = 8;
        ctx.shadowColor = this.color;
        
        let hoverOffset = Math.sin(this.animTimer) * 2;
        
        ctx.fillRect(this.x, this.y + hoverOffset, this.width, this.height);
        
        // Cybernetic Eye slit draw
        ctx.fillStyle = '#000000';
        ctx.fillRect(this.x + 6, this.y + hoverOffset + 6, this.width - 12, 4);
        ctx.shadowBlur = 0;
    }
}