export class InputHandler {
    constructor() {
        this.keys = {};
        this.touch = { active: false, startX: 0, startY: 0, moveX: 0, moveY: 0 };
        
        window.addEventListener('keydown', (e) => {
            this.keys[e.code] = true;
        });
        
        window.addEventListener('keyup', (e) => {
            this.keys[e.code] = false;
        });

        this.initTouchControls();
    }

    isPressed(code) {
        return !!this.keys[code];
    }

    initTouchControls() {
        const zone = document.getElementById('joystick-zone');
        if(!zone) return;

        zone.addEventListener('touchstart', (e) => {
            this.touch.active = true;
            this.touch.startX = e.touches[0].clientX;
            this.touch.startY = e.touches[0].clientY;
        });

        zone.addEventListener('touchmove', (e) => {
            if(!this.touch.active) return;
            this.touch.moveX = e.touches[0].clientX - this.touch.startX;
            this.touch.moveY = e.touches[0].clientY - this.touch.startY;
        });

        zone.addEventListener('touchend', () => {
            this.touch.active = false;
            this.touch.moveX = 0;
            this.touch.moveY = 0;
        });

        const fireBtn = document.getElementById('btn-mobile-fire');
        if(fireBtn) {
            fireBtn.addEventListener('touchstart', () => { this.keys['Space'] = true; });
            fireBtn.addEventListener('touchend', () => { this.keys['Space'] = false; });
        }
    }
}