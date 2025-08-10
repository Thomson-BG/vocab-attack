document.addEventListener('DOMContentLoaded', () => {
    const gameArea = document.getElementById('game-area');
    const scoreDisplay = document.getElementById('score');
    const wordInput = document.getElementById('word-input');
    const startButton = document.getElementById('start-button');
    const gameOverScreen = document.getElementById('game-over-screen');
    const finalScoreDisplay = document.getElementById('final-score');
    const restartButton = document.getElementById('restart-button');

    let score = 0;
    let words = [];
    let gameInterval;
    let spawnInterval;
    let gameSpeed = 1;
    let spawnRate = 2000;

    const automotiveWords = [
        "accelerator", "air-filter", "alternator", "antifreeze", "axle", "ball-joint", "battery", "belt",
        "brake-caliper", "brake-pad", "brake-rotor", "camshaft", "carburetor", "catalytic-converter", "chassis",
        "clutch", "coil", "combustion", "compression", "connecting-rod", "coolant", "crankshaft", "cv-joint",
        "cylinder", "dash", "differential", "dipstick", "distributor", "drivetrain", "drum-brake", "ecu",
        "exhaust-manifold", "fan-belt", "fender", "filter", "fuel-injector", "fuel-pump", "fuse", "gasket",
        "gearbox", "head-gasket", "headlight", "horsepower", "ignition", "ignition-coil", "intake-manifold",
        "jack", "jumper-cables", "leaf-spring", "lug-nut", "manifold", "muffler", "odometer", "oil-filter",
        "oil-pan", "overheating", "piston", "power-steering", "radiator", "rear-axle", "relay", "rim",
        "rocker-arm", "rotor", "shock-absorber", "spark-plug", "speedometer", "starter", "steering-column",
        "strut", "suspension", "sway-bar", "tachometer", "thermostat", "timing-belt", "torque", "torque-wrench",
        "transmission", "tread", "turbocharger", "turn-signal", "universal-joint", "valve", "valve-cover",
        "v-belt", "viscosity", "water-pump", "wheel-alignment", "wheel-bearing", "windshield", "windshield-wiper",
        "wiring-harness", "yoke", "zerk-fitting", "actuator", "camber", "differential-fluid", "double-wishbone",
        "idle", "knock-sensor"
    ];

    function getRandomWord() {
        return automotiveWords[Math.floor(Math.random() * automotiveWords.length)];
    }

    function createWord() {
        const wordElement = document.createElement('div');
        wordElement.classList.add('word');
        wordElement.textContent = getRandomWord();
        wordElement.style.left = `${Math.random() * (gameArea.offsetWidth - 100)}px`;
        wordElement.style.top = '0px';
        gameArea.appendChild(wordElement);
        words.push({ element: wordElement, y: 0 });
    }

    function updateGame() {
        for (let i = words.length - 1; i >= 0; i--) {
            const word = words[i];
            word.y += gameSpeed;
            word.element.style.top = `${word.y}px`;

            if (word.y > gameArea.offsetHeight) {
                gameOver();
                return;
            }
        }
    }

    function startGame() {
        score = 0;
        gameSpeed = 1;
        spawnRate = 2000;
        scoreDisplay.textContent = score;
        words.forEach(word => word.element.remove());
        words = [];

        wordInput.disabled = false;
        wordInput.focus();
        startButton.style.display = 'none';
        gameOverScreen.style.display = 'none';

        gameInterval = setInterval(updateGame, 1000 / 60);
        spawnInterval = setInterval(createWord, spawnRate);
    }

    function gameOver() {
        clearInterval(gameInterval);
        clearInterval(spawnInterval);
        wordInput.disabled = true;
        finalScoreDisplay.textContent = score;
        gameOverScreen.style.display = 'flex';
    }

    function adjustDifficulty() {
        if (score > 0 && score % 5 === 0) {
            gameSpeed += 0.2;
            if (spawnRate > 500) {
                spawnRate -= 100;
                clearInterval(spawnInterval);
                spawnInterval = setInterval(createWord, spawnRate);
            }
        }
    }

    wordInput.addEventListener('input', () => {
        const typedValue = wordInput.value.trim().toLowerCase();
        if (typedValue) {
            for (let i = words.length - 1; i >= 0; i--) {
                if (words[i].element.textContent.toLowerCase() === typedValue) {
                    words[i].element.remove();
                    words.splice(i, 1);
                    score++;
                    scoreDisplay.textContent = score;
                    wordInput.value = '';
                    adjustDifficulty();
                    break;
                }
            }
        }
    });

    startButton.addEventListener('click', startGame);
    restartButton.addEventListener('click', () => {
        gameOverScreen.style.display = 'none';
        startButton.style.display = 'block';
    });
});
