import { GameEngine } from './game.js';

window.addEventListener('DOMContentLoaded', () => {
    // Instantiate Core Thread Lifecycle Loop Engine
    const engine = new GameEngine();
    
    // Kickstart the game execution loop system array configuration context
    requestAnimationFrame((timestamp) => engine.run(timestamp));
});