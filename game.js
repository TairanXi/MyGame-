const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const restartButton = document.getElementById('restartButton');

const WIDTH = canvas.width;
const HEIGHT = canvas.height;

// Game settings
const PLAYER_WIDTH = 50;
const PLAYER_HEIGHT = 50;
const PLAYER_SPEED = 5;
const JUMP_HEIGHT = 15;
const GRAVITY = 0.7;
const PUNCH_DAMAGE = 10;
const PUNCH_RANGE = 60;
const MAX_HEALTH = 100;

// Player class
class Player {
    constructor(x, y, color, controls) {
        this.x = x;
        this.y = y;
        this.width = PLAYER_WIDTH;
        this.height = PLAYER_HEIGHT;
        this.color = color;
        this.speed = PLAYER_SPEED;
        this.jumpVelocity = 0;
        this.onGround = false;
        this.isPunching = false;
        this.health = MAX_HEALTH;
        this.controls = controls;
    }

    draw() {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
        // Health bar
        ctx.fillStyle = 'red';
        ctx.fillRect(this.x, this.y - 10, PLAYER_WIDTH, 5);
        ctx.fillStyle = 'green';
        ctx.fillRect(this.x, this.y - 10, PLAYER_WIDTH * (this.health / MAX_HEALTH), 5);
    }

    move(keys) {
        if (keys[this.controls.left]) this.x -= this.speed;
        if (keys[this.controls.right]) this.x += this.speed;
        if (keys[this.controls.jump] && this.onGround) {
            this.jumpVelocity = -JUMP_HEIGHT;
            this.onGround = false;
        }
    }

    updatePosition() {
        this.y += this.jumpVelocity;
        this.jumpVelocity += GRAVITY;

        if (this.y + this.height > HEIGHT) {
            this.y = HEIGHT - this.height;
            this.jumpVelocity = 0;
            this.onGround = true;
        }
    }

    punch(keys) {
        if (keys[this.controls.punch]) this.isPunching = true;
        else this.isPunching = false;
    }

    takeDamage(amount) {
        this.health -= amount;
        if (this.health < 0) this.health = 0;
    }

    isInRange(opponent) {
        return (
            this.isPunching &&
            Math.abs(this.x - opponent.x) < PUNCH_RANGE &&
            Math.abs(this.y - opponent.y) < PLAYER_HEIGHT
        );
    }
}

// Initialize players
const player1 = new Player(100, HEIGHT - PLAYER_HEIGHT, 'black', {
    left: 'a',
    right: 'd',
    jump: 'w',
    punch: 'f'
});
const player2 = new Player(WIDTH - 150, HEIGHT - PLAYER_HEIGHT, 'red', {
    left: 'ArrowLeft',
    right: 'ArrowRight',
    jump: 'ArrowUp',
    punch: 'Enter'
});

const keys = {};

// Event listeners for keyboard input
window.addEventListener('keydown', (e) => keys[e.key] = true);
window.addEventListener('keyup', (e) => keys[e.key] = false);

// Game loop
function gameLoop() {
    ctx.clearRect(0, 0, WIDTH, HEIGHT);

    // Update players
    player1.move(keys);
    player1.updatePosition();
    player1.punch(keys);
    
    player2.move(keys);
    player2.updatePosition();
    player2.punch(keys);

    // Check for punches and apply damage
    if (player1.isInRange(player2)) player2.takeDamage(PUNCH_DAMAGE);
    if (player2.isInRange(player1)) player1.takeDamage(PUNCH_DAMAGE);

    // Draw players
    player1.draw();
    player2.draw();

    // Display win message if a player runs out of health
    if (player1.health <= 0 || player2.health <= 0) {
        ctx.fillStyle = 'black';
        ctx.font = '30px Arial';
        const message = player1.health <= 0 ? "Player 2 Wins!" : "Player 1 Wins!";
        ctx.fillText(message, WIDTH / 2 - 100, HEIGHT / 2);

        // Show restart button
        restartButton.style.display = 'block';
    } else {
        requestAnimationFrame(gameLoop);
    }
}

// Restart game function
function restartGame() {
    // Reset players' positions and health
    player1.x = 100;
    player1.y = HEIGHT - PLAYER_HEIGHT;
    player1.health = MAX_HEALTH;
    
    player2.x = WIDTH - 150;
    player2.y = HEIGHT - PLAYER_HEIGHT;
    player2.health = MAX_HEALTH;

    // Hide restart button and start the game loop
    restartButton.style.display = 'none';
    gameLoop();
}

// Start game
gameLoop();
