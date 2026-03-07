// Module aliases
const Engine = Matter.Engine,
    Render = Matter.Render,
    Runner = Matter.Runner,
    Bodies = Matter.Bodies,
    Composite = Matter.Composite,
    Events = Matter.Events,
    Body = Matter.Body,
    Vector = Matter.Vector;

let engine;
let render;
let runner;
let choices = [];
let choiceColors = [];
let choiceBalls = [];
let gameIntervals = [];

// DOM Elements
const uiContainer = document.getElementById('ui-container');
const gameContainer = document.getElementById('game-container');
const canvasContainer = document.getElementById('canvas-container');
const choicesInput = document.getElementById('choices-input');
const backBtn = document.getElementById('back-btn');
const winnerDisplay = document.getElementById('winner-display');
const winnerName = document.getElementById('winner-name');
const resetBtn = document.getElementById('reset-btn');

// Colors matching Tempo and some additional complementary ones
const colors = [
    '#8b5a83', '#7c9885', '#d4a574', '#c85a5a', '#6b8cae',
    '#e1b16a', '#a37c82', '#698F3F', '#4A5759', '#D972FF',
    '#FF9F1C', '#2EC4B6', '#E71D36', '#011627', '#F15BB5'
];

document.querySelectorAll('.mode-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const text = choicesInput.value.trim();
        if (!text) {
            alert('Please enter at least one choice!');
            return;
        }
        choices = text.split('\n').map(c => c.trim()).filter(c => c.length > 0);
        if (choices.length < 2) {
            alert('Please enter at least two choices to make a decision!');
            return;
        }

        // Assign colors dynamically
        choiceColors = choices.map((_, i) => colors[i % colors.length]);

        const mode = btn.dataset.mode;
        startGame(mode);
    });
});

backBtn.addEventListener('click', showMainUI);
resetBtn.addEventListener('click', showMainUI);

function showMainUI() {
    stopGame();
    uiContainer.classList.remove('hidden');
    gameContainer.classList.add('hidden');
    winnerDisplay.classList.add('hidden');
    document.querySelectorAll('.choice-label').forEach(el => el.remove());
}

function startGame(mode) {
    uiContainer.classList.add('hidden');
    gameContainer.classList.remove('hidden');
    winnerDisplay.classList.add('hidden');

    // Clear previous canvas and state
    canvasContainer.innerHTML = '';
    document.querySelectorAll('.choice-label').forEach(el => el.remove());
    gameIntervals.forEach(clearInterval);
    gameIntervals = [];

    engine = Engine.create();

    // Adjust gravity for some modes
    if (mode === 'royale') {
        engine.gravity.y = 0;
    } else {
        engine.gravity.y = 1;
    }

    render = Render.create({
        element: canvasContainer,
        engine: engine,
        options: {
            width: window.innerWidth,
            height: window.innerHeight,
            wireframes: false,
            background: '#fffef3',
            pixelRatio: window.devicePixelRatio
        }
    });

    runner = Runner.create();

    choiceBalls = [];

    if (mode === 'plinko') {
        setupPlinko();
    } else if (mode === 'jump') {
        setupJump();
    } else if (mode === 'royale') {
        setupRoyale();
    }

    Render.run(render);
    Runner.run(runner, engine);

    // Track balls to update tooltips in screen-space
    Events.on(render, 'afterRender', () => {
        choiceBalls.forEach(obj => {
            if (!obj.active) return;
            // Get position directly from the physics body
            const x = obj.ball.position.x;
            const y = obj.ball.position.y;

            // Note: If using Render.lookAt for panning, coordinate transform occurs. 
            // In these modes, the camera remains still, so physics coordinates = screen coordinates.
            obj.labelEl.style.left = `${x}px`;
            obj.labelEl.style.top = `${y - 20}px`;
        });
    });
}

function stopGame() {
    gameIntervals.forEach(clearInterval);
    gameIntervals = [];

    if (render) {
        Render.stop(render);
        canvasContainer.innerHTML = '';
    }
    if (runner) {
        Runner.stop(runner);
    }
    if (engine) {
        Engine.clear(engine);
    }
}

function showWinner(name, color) {
    winnerName.textContent = name;
    winnerName.style.color = color;
    winnerDisplay.classList.remove('hidden');
}

function createBallWithLabel(x, y, radius, index, options = {}) {
    const ball = Bodies.circle(x, y, radius, {
        restitution: 0.8,
        friction: 0.005,
        render: { fillStyle: choiceColors[index] },
        label: `ball_${index}`,
        ...options
    });

    const labelEl = document.createElement('div');
    labelEl.className = 'choice-label';
    labelEl.textContent = choices[index];
    labelEl.style.color = choiceColors[index];
    // Slightly offset based on string length to center it properly
    labelEl.style.transform = "translate(-50%, -100%)";
    document.getElementById('game-container').appendChild(labelEl);

    const ballObj = { ball, labelEl, index, active: true };
    choiceBalls.push(ballObj);
    return ball;
}

// ==========================================
// GAME MODES
// ==========================================

// 1. PLINKO DROP
function setupPlinko() {
    const width = window.innerWidth;
    const height = window.innerHeight;

    // Boundaries
    const ground = Bodies.rectangle(width / 2, height + 50, width, 100, { isStatic: true });
    const leftWall = Bodies.rectangle(-25, height / 2, 50, height * 2, { isStatic: true });
    const rightWall = Bodies.rectangle(width + 25, height / 2, 50, height * 2, { isStatic: true });

    Composite.add(engine.world, [ground, leftWall, rightWall]);

    // Construct Pegs Pyramid/Grid
    const cols = Math.floor(width / 60);
    const rows = Math.floor(height * 0.6 / 60);
    const spacingX = width / cols;
    const spacingY = (height * 0.6) / rows;
    const startY = height * 0.25;

    const pegs = [];
    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols + 1; col++) {
            let x = col * spacingX;
            if (row % 2 === 1) x += spacingX / 2;

            const peg = Bodies.circle(x, startY + row * spacingY, 8, {
                isStatic: true,
                render: { fillStyle: '#e8e6e0' },
                restitution: 0.6
            });
            pegs.push(peg);
        }
    }
    Composite.add(engine.world, pegs);

    // Finish line sensor at the bottom
    const finishLine = Bodies.rectangle(width / 2, height - 30, width, 60, {
        isStatic: true,
        isSensor: true,
        render: { fillStyle: '#e0f0e5' },
        label: 'finish'
    });
    Composite.add(engine.world, finishLine);

    // Funnel at the top to direct balls into center
    const funnelLeft = Bodies.rectangle(width / 2 - 250, height * 0.1, 400, 20, {
        isStatic: true, angle: Math.PI / 7, render: { fillStyle: '#e8e6e0' }
    });
    const funnelRight = Bodies.rectangle(width / 2 + 250, height * 0.1, 400, 20, {
        isStatic: true, angle: -Math.PI / 7, render: { fillStyle: '#e8e6e0' }
    });
    Composite.add(engine.world, [funnelLeft, funnelRight]);

    // Add balls iteratively, randomized drop order
    const balls = [];
    const dropIndices = Array.from({ length: choices.length }, (_, i) => i).sort(() => Math.random() - 0.5);

    choices.forEach((choice, i) => {
        const dropIndex = dropIndices.indexOf(i);
        // slight horizontal variation to prevent stacking
        const x = width / 2 + (Math.random() - 0.5) * 60;
        const y = -50 - (dropIndex * 70);
        const radius = Math.max(15, 25 - choices.length * 0.5); // resize slightly if many choices

        const ball = createBallWithLabel(x, y, radius, i, {
            restitution: 0.5,
            friction: 0.001,
            density: 0.05
        });
        balls.push(ball);
    });
    Composite.add(engine.world, balls);

    let winnerDeclared = false;
    Events.on(engine, 'collisionStart', (event) => {
        if (winnerDeclared) return;
        event.pairs.forEach((pair) => {
            const bodyA = pair.bodyA;
            const bodyB = pair.bodyB;

            let ball;
            // Check for finish line crossing
            if (bodyA.label === 'finish' && bodyB.label.startsWith('ball_')) {
                ball = bodyB;
            } else if (bodyB.label === 'finish' && bodyA.label.startsWith('ball_')) {
                ball = bodyA;
            }

            if (ball) {
                winnerDeclared = true;
                const index = parseInt(ball.label.split('_')[1]);
                showWinner(choices[index], choiceColors[index]);
                engine.timing.timeScale = 0.2; // slow motion dramatically
            }
        });
    });
}

// 2. LONG JUMP
function setupJump() {
    const width = window.innerWidth;
    const height = window.innerHeight;

    const startX = 50;

    // Scale slope dynamically so it fits in screen
    const rampW = width * 0.3;
    const rampH = 20;
    // Slope angled down
    const ramp = Bodies.rectangle(startX + rampW / 2, height * 0.4, rampW, rampH, {
        isStatic: true,
        angle: Math.PI / 6,
        render: { fillStyle: '#e8e6e0' },
        friction: 0.001
    });

    // The kicker at the bottom of the ramp
    const kickerX = startX + rampW * 0.95;
    const kickerY = height * 0.4 + (rampW / 2) * Math.sin(Math.PI / 6) + 20;
    const kicker = Bodies.rectangle(kickerX + 60, kickerY + 10, 150, rampH, {
        isStatic: true,
        angle: -Math.PI / 8,
        render: { fillStyle: '#e8e6e0' },
        friction: 0.001
    });

    // Landing floor spanning the rest of screen
    const floor = Bodies.rectangle(width / 2, height - 20, width, 40, {
        isStatic: true,
        render: { fillStyle: '#e8e6e0' },
        friction: 0.08 // Noticeable friction to stop jump
    });

    Composite.add(engine.world, [ramp, kicker, floor]);

    // Visual markers on floor
    const markers = [];
    for (let i = 0; i < 10; i++) {
        markers.push(Bodies.rectangle(width * 0.4 + (i * width * 0.06), height - 40, 4, 40, {
            isStatic: true,
            isSensor: true,
            render: { fillStyle: '#f0e6ed' }
        }));
    }
    Composite.add(engine.world, markers);

    const balls = [];
    choices.forEach((choice, i) => {
        // Drop them directly onto the top of the ramp queued up
        const x = startX + 20 + (Math.random() * 40);
        const y = height * 0.1 - (i * 50);
        const randRestitution = 0.4 + Math.random() * 0.2; // random bounciness slightly influences distance

        const ball = createBallWithLabel(x, y, 18, i, {
            restitution: randRestitution,
            friction: 0.001,
            density: 0.05
        });
        balls.push(ball);
    });
    Composite.add(engine.world, balls);

    // Stop detection
    const checkInterval = setInterval(() => {
        let allStopped = true;
        let anyLanded = false;

        balls.forEach(ball => {
            if (ball.position.y > height) return; // Fell off
            if (ball.position.x > width * 0.3) anyLanded = true;
            if (Matter.Vector.magnitude(ball.velocity) > 0.3 && ball.position.y < height - 50) {
                allStopped = false; // still moving above floor
            }
            if (Matter.Vector.magnitude(ball.velocity) > 0.05 && ball.position.y > height - 60) {
                allStopped = false; // sliding on floor
            }
        });

        if (allStopped && anyLanded) {
            clearInterval(checkInterval);

            let farthestX = -1;
            let winnerIndex = -1;

            balls.forEach(ball => {
                if (ball.position.x > farthestX) {
                    farthestX = ball.position.x;
                    winnerIndex = parseInt(ball.label.split('_')[1]);
                }
            });

            if (winnerIndex >= 0) {
                showWinner(choices[winnerIndex], choiceColors[winnerIndex]);
                // Highlight winning ball
                const winningBall = choiceBalls.find(b => b.index === winnerIndex);
                if (winningBall) {
                    winningBall.ball.render.lineWidth = 5;
                    winningBall.ball.render.strokeStyle = '#2d2d2d';
                }
            }
        }
    }, 1500);
    gameIntervals.push(checkInterval);
}

// 3. BATTLE ROYALE
function setupRoyale() {
    const width = window.innerWidth;
    const height = window.innerHeight;

    // Bounds keeping them enclosed entirely
    const thickness = 50;
    const ground = Bodies.rectangle(width / 2, height + thickness / 2, width, thickness, { isStatic: true, render: { fillStyle: '#e8e6e0' } });
    const ceiling = Bodies.rectangle(width / 2, -thickness / 2, width, thickness, { isStatic: true, render: { fillStyle: '#e8e6e0' } });
    const leftWall = Bodies.rectangle(-thickness / 2, height / 2, thickness, height, { isStatic: true, render: { fillStyle: '#e8e6e0' } });
    const rightWall = Bodies.rectangle(width + thickness / 2, height / 2, thickness, height, { isStatic: true, render: { fillStyle: '#e8e6e0' } });
    Composite.add(engine.world, [ground, ceiling, leftWall, rightWall]);

    // Hazard - A deadly red orb that moves smoothly
    const hazard = Bodies.circle(width / 2, height / 2, Math.max(40, width * 0.04), {
        isStatic: true,
        isSensor: true,
        label: 'hazard',
        render: { fillStyle: 'rgba(200, 90, 90, 0.4)' } // translucent error color
    });
    // Add an inner solid core to hazard to make it visible
    const hazardCore = Bodies.circle(width / 2, height / 2, Math.max(20, width * 0.02), {
        isStatic: true,
        isSensor: true,
        render: { fillStyle: '#c85a5a' }
    });
    Composite.add(engine.world, [hazard, hazardCore]);

    // Orbital movement for hazard
    let angle = 0;
    let radiusFactor = width * 0.25;
    let targetRadiusFactor = radiusFactor;
    Events.on(engine, 'beforeUpdate', () => {
        angle += 0.015;

        // Smoothly interpolate radius to avoid movement glitches
        radiusFactor += (targetRadiusFactor - radiusFactor) * 0.02;

        // Lissajous figure movement for pseudo-random but smooth coverage
        const hx = width / 2 + Math.sin(angle * 1.3) * radiusFactor;
        const hy = height / 2 + Math.cos(angle * 1.7) * (height * 0.3);

        Body.setPosition(hazard, { x: hx, y: hy });
        Body.setPosition(hazardCore, { x: hx, y: hy });

        // Continuously increase the physical size of the hazard over time
        const growRate = 1.0005; // 0.05% per frame (~3% per second)
        Body.scale(hazard, growRate, growRate);
        Body.scale(hazardCore, growRate, growRate);

        // Dynamic resizing for extra intensity as game goes on
        if (Math.random() < 0.01) {
            targetRadiusFactor = width * 0.15 + Math.random() * (width * 0.2);
        }
    });

    const balls = [];
    choices.forEach((choice, i) => {
        const x = width / 2 + (Math.random() - 0.5) * (width * 0.6);
        const y = height / 2 + (Math.random() - 0.5) * (height * 0.6);
        const ball = createBallWithLabel(x, y, 22, i, {
            restitution: 1, // bouncy
            friction: 0,
            frictionAir: 0.001,
            density: 0.01
        });

        Body.setVelocity(ball, {
            x: (Math.random() - 0.5) * 15,
            y: (Math.random() - 0.5) * 15
        });

        balls.push(ball);
    });
    Composite.add(engine.world, balls);

    let activeBallsCount = balls.length;
    let winnerDeclared = false;

    // Elimination collision detection
    Events.on(engine, 'collisionStart', (event) => {
        if (winnerDeclared) return;
        event.pairs.forEach((pair) => {
            let ball;
            // Only outer hazard eliminates
            if (pair.bodyA.label === 'hazard' && pair.bodyB.label && pair.bodyB.label.startsWith('ball_')) {
                ball = pair.bodyB;
            } else if (pair.bodyB.label === 'hazard' && pair.bodyA.label && pair.bodyA.label.startsWith('ball_')) {
                ball = pair.bodyA;
            }

            if (ball && !ball.isRemoved) {
                ball.isRemoved = true;

                // Visual pop effect
                const idx = choiceBalls.findIndex(b => b.ball === ball);
                if (idx > -1) {
                    const obj = choiceBalls[idx];
                    obj.active = false;
                    obj.labelEl.style.transition = 'all 0.3s ease';
                    obj.labelEl.style.transform = 'translate(-50%, -100%) scale(0.1)';
                    obj.labelEl.style.opacity = '0';
                    setTimeout(() => obj.labelEl.remove(), 300);
                }

                Composite.remove(engine.world, ball);
                activeBallsCount--;

                if (activeBallsCount === 1) {
                    winnerDeclared = true;
                    // Find remaining
                    const winnerObj = choiceBalls.find(b => b.active);
                    if (winnerObj) {
                        showWinner(choices[winnerObj.index], choiceColors[winnerObj.index]);
                        engine.timing.timeScale = 0.2; // slowmo
                    }
                }
            }
        });
    });

    // Chaos Engine: push balls slightly off course
    const chaosInterval = setInterval(() => {
        if (winnerDeclared) { clearInterval(chaosInterval); return; }
        balls.forEach(ball => {
            if (!ball.isRemoved) {
                const speed = Matter.Vector.magnitude(ball.velocity);
                if (speed < 5) { // Prevent them from stalling
                    Body.applyForce(ball, ball.position, {
                        x: (Math.random() - 0.5) * 0.005,
                        y: (Math.random() - 0.5) * 0.005
                    });
                }
            }
        });
    }, 500);
    gameIntervals.push(chaosInterval);
}
