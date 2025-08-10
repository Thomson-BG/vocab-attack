document.addEventListener('DOMContentLoaded', () => {
    // Audio setup
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();

    function playSound(type) {
        if (!audioContext) return;
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        switch (type) {
            case 'correct':
                oscillator.type = 'sine';
                oscillator.frequency.setValueAtTime(600, audioContext.currentTime);
                gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + 0.2);
                break;
            case 'gameOver':
                oscillator.type = 'sawtooth';
                oscillator.frequency.setValueAtTime(200, audioContext.currentTime);
                oscillator.frequency.exponentialRampToValueAtTime(100, audioContext.currentTime + 0.5);
                gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + 0.5);
                break;
            case 'start':
                 // A simple arpeggio
                const startTime = audioContext.currentTime;
                oscillator.type = 'triangle';
                gainNode.gain.setValueAtTime(0.1, startTime);
                oscillator.frequency.setValueAtTime(261.63, startTime); // C4
                oscillator.frequency.setValueAtTime(329.63, startTime + 0.1); // E4
                oscillator.frequency.setValueAtTime(392.00, startTime + 0.2); // G4
                gainNode.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.3);
                break;
        }

        oscillator.start();
        oscillator.stop(audioContext.currentTime + 0.5);
    }

    const gameArea = document.getElementById('game-area');
    const scoreDisplay = document.getElementById('score');
    const highScoreDisplay = document.getElementById('high-score');
    const levelDisplay = document.getElementById('level');
    const levelUpNotification = document.getElementById('level-up-notification');
    const wordInput = document.getElementById('word-input');
    const startButton = document.getElementById('start-button');
    const gameOverScreen = document.getElementById('game-over-screen');
    const finalScoreDisplay = document.getElementById('final-score');
    const restartButton = document.getElementById('restart-button');

    let score = 0;
    let highScore = localStorage.getItem('vocabAttackHighScore') || 0;
    let level = 1;
    const levelThresholds = [0, 10, 25, 45, 70, 100, 150, 200, 300, 400, 500]; // Score needed for next level
    let words = [];
    let gameInterval;
    let spawnInterval;
    let gameSpeed = 1;
    let spawnRate = 2000;

    function updateHighScoreDisplay() {
        highScoreDisplay.textContent = highScore;
    }

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
        playSound('start');
        score = 0;
        level = 1;
        gameSpeed = 1;
        spawnRate = 2000;

        scoreDisplay.textContent = score;
        levelDisplay.textContent = level;
        words.forEach(word => word.element.remove());
        words = [];

        wordInput.disabled = false;
        wordInput.focus();
        startButton.style.display = 'none';
        gameOverScreen.style.display = 'none';

        if (gameInterval) clearInterval(gameInterval);
        if (spawnInterval) clearInterval(spawnInterval);
        gameInterval = setInterval(updateGame, 1000 / 60);
        spawnInterval = setInterval(createWord, spawnRate);
    }

    function gameOver() {
        playSound('gameOver');
        clearInterval(gameInterval);
        clearInterval(spawnInterval);
        wordInput.disabled = true;

        if (score > highScore) {
            highScore = score;
            localStorage.setItem('vocabAttackHighScore', highScore);
            updateHighScoreDisplay();
        }

        finalScoreDisplay.textContent = score;
        gameOverScreen.style.display = 'flex';
    }

    function checkLevelUp() {
        if (level < levelThresholds.length && score >= levelThresholds[level]) {
            level++;
            levelDisplay.textContent = level;

            gameSpeed += 0.3;
            if (spawnRate > 600) {
                spawnRate -= 150;
                clearInterval(spawnInterval);
                spawnInterval = setInterval(createWord, spawnRate);
            }

            levelUpNotification.classList.add('level-up-animate');
            levelUpNotification.addEventListener('animationend', () => {
                levelUpNotification.classList.remove('level-up-animate');
            }, { once: true });
        }
    }

    updateHighScoreDisplay();

    wordInput.addEventListener('input', () => {
        const typedValue = wordInput.value.trim().toLowerCase();
        if (typedValue) {
            for (let i = words.length - 1; i >= 0; i--) {
                if (words[i].element.textContent.toLowerCase() === typedValue) {
                    playSound('correct');

                    const wordObject = words[i];
                    wordObject.element.classList.add('cleared');
                    wordObject.element.addEventListener('animationend', () => {
                        wordObject.element.remove();
                    });

                    words.splice(i, 1);
                    score++;
                    scoreDisplay.textContent = score;
                    wordInput.value = '';
                    checkLevelUp();
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
