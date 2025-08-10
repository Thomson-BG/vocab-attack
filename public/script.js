document.addEventListener('DOMContentLoaded', () => {
    // This is a placeholder data structure.
    // The coordinates are based on a 900x600 diagram area
    // and will need to be updated when a real diagram is chosen.
    // DOM Elements
    const gameContainer = document.getElementById('game-container');
    const uiBar = document.getElementById('ui-bar');
    const currentWordDisplay = document.getElementById('current-word');
    const scoreDisplay = document.getElementById('score');
    const timerDisplay = document.getElementById('timer');
    const gameBoard = document.getElementById('game-board');
    const diagramPlaceholder = document.getElementById('diagram-placeholder');
    const startScreen = document.getElementById('start-screen');
    const gameOverScreen = document.getElementById('game-over-screen');
    const startButton = document.getElementById('start-button');
    const restartButton = document.getElementById('restart-button');
    const finalScoreDisplay = document.getElementById('final-score');

    // Game State
    let score = 0;
    let timer = 60;
    let timerInterval = null;
    let currentPart = null;
    let remainingParts = [];

    const PART_DATA = [
        { name: 'Radiator',       x: 50,  y: 200, width: 100, height: 250 },
        { name: 'Battery',        x: 700, y: 50,  width: 150, height: 120 },
        { name: 'Alternator',     x: 200, y: 400, width: 100, height: 80  },
        { name: 'Oil Filter',     x: 350, y: 500, width: 70,  height: 70  },
        { name: 'Spark Plugs',    x: 250, y: 150, width: 200, height: 50  },
        { name: 'Exhaust Manifold', x: 250, y: 250, width: 250, height: 100 }
    ];

    function selectNextPart() {
        if (remainingParts.length === 0) {
            // All parts found, end game or level
            gameOver(); // For now, just end the game
            return;
        }

        const partIndex = Math.floor(Math.random() * remainingParts.length);
        currentPart = remainingParts[partIndex];
        remainingParts.splice(partIndex, 1); // Remove from list of remaining parts

        currentWordDisplay.textContent = currentPart.name;
    }

    function renderHotspotsForDebug() {
        diagramPlaceholder.querySelectorAll('.hotspot').forEach(el => el.remove());
        PART_DATA.forEach(part => {
            const hotspotEl = document.createElement('div');
            hotspotEl.classList.add('hotspot');
            hotspotEl.style.left = `${part.x}px`;
            hotspotEl.style.top = `${part.y}px`;
            hotspotEl.style.width = `${part.width}px`;
            hotspotEl.style.height = `${part.height}px`;
            diagramPlaceholder.appendChild(hotspotEl);
        });
    }

    function startGame() {
        startScreen.style.display = 'none';
        gameOverScreen.style.display = 'none';
        gameContainer.style.display = 'flex';

        score = 0;
        timer = 60;
        scoreDisplay.textContent = score;
        timerDisplay.textContent = timer;
        remainingParts = [...PART_DATA];

        renderHotspotsForDebug(); // For development/setup
        selectNextPart();

        timerInterval = setInterval(() => {
            timer--;
            timerDisplay.textContent = timer;
            if (timer <= 0) {
                gameOver();
            }
        }, 1000);
    }

    function handleCorrectGuess(clickX, clickY) {
        score += 10; // 10 points for a correct guess
        scoreDisplay.textContent = score;
        showFeedback(true, clickX, clickY);
        selectNextPart();
    }

    function handleIncorrectGuess(clickX, clickY) {
        timer -= 5; // 5 second penalty
        if (timer < 0) timer = 0;
        timerDisplay.textContent = timer;
        showFeedback(false, clickX, clickY);
    }

    function showFeedback(isCorrect, x, y) {
        const feedbackElement = document.createElement('div');
        feedbackElement.classList.add('feedback-indicator');
        feedbackElement.textContent = isCorrect ? '✔️' : '❌';
        feedbackElement.style.left = `${x}px`;
        feedbackElement.style.top = `${y}px`;
        feedbackElement.style.color = isCorrect ? 'green' : 'red';

        gameBoard.appendChild(feedbackElement);

        feedbackElement.addEventListener('animationend', () => {
            feedbackElement.remove();
        });
    }

    diagramPlaceholder.addEventListener('click', (e) => {
        if (!currentPart) return;

        // Get click coordinates relative to the placeholder
        const rect = diagramPlaceholder.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const { x: partX, y: partY, width, height } = currentPart;

        if (x >= partX && x <= partX + width && y >= partY && y <= partY + height) {
            handleCorrectGuess(x, y);
        } else {
            handleIncorrectGuess(x, y);
        }
    });

    function gameOver() {
        clearInterval(timerInterval);
        gameContainer.style.display = 'none';
        gameOverScreen.style.display = 'block';
        finalScoreDisplay.textContent = score;
    }

    startButton.addEventListener('click', startGame);
    restartButton.addEventListener('click', startGame);
});
