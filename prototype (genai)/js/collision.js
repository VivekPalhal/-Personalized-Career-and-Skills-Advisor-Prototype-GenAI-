import { Utils } from './utils.js';

export class CollisionSystem {
    static resolve(game) {
        const player = game.player;
        const bullets = game.bullets;
        const enemies = game.enemies;
        const powerups = game.powerups;
        const particles = game.particlePool;

        // Process Bullets Multi-Matrix Engine Intersections
        for (let b of bullets) {
            if (!b.active) continue;

            // Player lasers against Alien vectors
            if (!b.isEnemy) {
                for (let e of enemies) {
                    if (!e.active) continue;
                    if (Utils.checkAABBCollision(b, e)) {
                        b.active = false;
                        e.health -= b.damage;
                        game.scoreMetrics.accuracyHits++;
                        
                        game.spawnExplosionEffect(e.x + e.width/2, e.y + e.height/2, e.color);
                        
                        if (e.health <= 0) {
                            e.active = false;
                            game.score += Math.floor(e.scoreValue * game.comboMultiplier);
                            game.scoreMetrics.kills++;
                            game.updateCombo(0.2);
                            game.rollPowerUpChance(e.x, e.y);
                        }
                        break;
                    }
                }

                // Player vs Boss tracking matrix check
                if (game.boss && game.boss.active && game.boss.state !== 'entering' && Utils.checkAABBCollision(b, game.boss)) {
                    b.active = false;
                    game.boss.health -= b.damage;
                    game.spawnExplosionEffect(b.x, b.y, '#ffffff');
                    if(game.boss.health <= 0) {
                        game.boss.active = false;
                        game.score += 5000;
                        game.spawnExplosionEffect(game.boss.x + game.boss.width/2, game.boss.y + game.boss.height/2, '#7f00ff');
                        game.triggerVictory();
                    }
                }
            } else {
                // Enemy standard ordinance vs Player hull matrices
                if (Utils.checkAABBCollision(b, player)) {
                    b.active = false;
                    player.damage(b.damage, game.soundSystem);
                    game.resetCombo();
                }
            }
        }

        // Power-up extraction hook matrix pass
        for (let p of powerups) {
            if (!p.active) continue;
            if (Utils.checkAABBCollision(p, player)) {
                p.active = false;
                game.soundSystem.playPowerup();
                if (p.type === 'shield') player.health = Math.min(player.health + 35, player.maxHealth);
                if (p.type === 'weapon') player.upgradeWeapon();
            }
        }
    }
}