export const Utils = {
    randomRange(min, max) {
        return Math.random() * (max - min) + min;
    },
    
    clamp(val, min, max) {
        return Math.min(Math.max(val, min), max);
    },
    
    checkAABBCollision(obj1, obj2) {
        return obj1.x < obj2.x + obj2.width &&
               obj1.x + obj1.width > obj2.x &&
               obj1.y < obj2.y + obj2.height &&
               obj1.y + obj1.height > obj2.y;
    },
    
    getDistance(x1, y1, x2, y2) {
        return Math.hypot(x2 - x1, y2 - y1);
    }
};

/**
 * High performance Object Pool Implementation minimizing real-time garbage collection.
 */
export class ObjectPool {
    constructor(createFn, cleanFn, initialSize = 50) {
        this.createFn = createFn;
        this.cleanFn = cleanFn;
        this.pool = [];
        
        for (let i = 0; i < initialSize; i++) {
            this.pool.push(this.createFn());
        }
    }
    
    acquire(...args) {
        let obj = this.pool.length > 0 ? this.pool.pop() : this.createFn();
        if (this.cleanFn) this.cleanFn(obj, ...args);
        return obj;
    }
    
    release(obj) {
        this.pool.push(obj);
    }
}