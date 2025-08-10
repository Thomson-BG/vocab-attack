document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Elements ---
    const loadingScreen = document.getElementById('loading-screen');
    const startScreen = document.getElementById('start-screen');
    const gameContainer = document.getElementById('game-container');
    const garageView = document.getElementById('garage-view');
    const diagnosisView = document.getElementById('diagnosis-view');
    const engineBayView = document.getElementById('engine-bay-view');
    const endDayScreen = document.getElementById('end-day-screen');
    const startButton = document.getElementById('start-button');
    const nextDayButton = document.getElementById('next-day-button');
    const startRepairButton = document.getElementById('start-repair-button');
    const car = document.getElementById('car');
    const problemDescription = document.getElementById('problem-description');
    const quizContainer = document.getElementById('quiz-container');
    const partsToolbox = document.getElementById('parts-toolbox');
    const moneyDisplay = document.getElementById('money');
    const timerDisplay = document.getElementById('timer');
    const earningsDisplay = document.getElementById('earnings');
    const totalMoneyDisplay = document.getElementById('total-money');

    // --- Game State ---
    let money = 0;
    let timer = 120;
    let timerInterval = null;
    let currentProblem = null;

    // --- Game Data ---
    // In a real game, this would be much larger and more complex.
    const PART_DATA = [
        {
            id: 'radiator',
            name: 'Radiator',
            sprite: 'assets/parts/radiator.svg',
            problem: 'The car is overheating!',
            quiz: {
                question: 'Which part is essential for cooling the engine?',
                options: ['Battery', 'Radiator', 'Oil Filter'],
                answer: 'Radiator'
            }
        },
        {
            id: 'battery',
            name: 'Battery',
            sprite: 'assets/parts/battery.svg',
            problem: 'The car won\'t start and the lights are dim.',
            quiz: {
                question: 'What provides the initial electrical power to start the car?',
                options: ['Alternator', 'Spark Plug', 'Battery'],
                answer: 'Battery'
            }
        },
        {
            id: 'oil_filter',
            name: 'Oil Filter',
            sprite: 'assets/parts/oil_filter.svg',
            problem: 'The engine is running rough and the oil pressure light is on.',
            quiz: {
                question: 'Which part is responsible for cleaning the engine oil?',
                options: ['Oil Filter', 'Air Filter', 'Fuel Filter'],
                answer: 'Oil Filter'
            }
        }
    ];

    // --- Main Game Logic ---
    function init() {
        moneyDisplay.textContent = money;
        loadingScreen.style.display = 'none';
        startScreen.style.display = 'block';
        startButton.addEventListener('click', startDay);
        nextDayButton.addEventListener('click', startDay);
        startRepairButton.addEventListener('click', startRepair);
    }

    function startDay() {
        // Reset UI
        endDayScreen.style.display = 'none';
        startScreen.style.display = 'none';
        gameContainer.style.display = 'block';
        garageView.style.display = 'block';
        engineBayView.style.display = 'none';
        diagnosisView.style.display = 'block'; // Show diagnosis modal

        // Reset timer
        timer = 120;
        timerDisplay.textContent = timer;
        if(timerInterval) clearInterval(timerInterval);
        timerInterval = setInterval(() => {
            timer--;
            timerDisplay.textContent = timer;
            if (timer <= 0) {
                endDay();
            }
        }, 1000);

        // Select a random problem
        currentProblem = PART_DATA[Math.floor(Math.random() * PART_DATA.length)];
        startDiagnosis();
    }

    function startDiagnosis() {
        problemDescription.textContent = currentProblem.problem;
        quizContainer.innerHTML = ''; // Clear previous quiz
        startRepairButton.style.display = 'none';

        const { question, options, answer } = currentProblem.quiz;
        const questionEl = document.createElement('p');
        questionEl.textContent = question;
        quizContainer.appendChild(questionEl);

        options.forEach(option => {
            const button = document.createElement('button');
            button.textContent = option;
            button.onclick = () => {
                // Disable all buttons after one is clicked
                quizContainer.querySelectorAll('button').forEach(btn => btn.disabled = true);
                if (option === answer) {
                    questionEl.textContent = 'Correct Diagnosis!';
                    startRepairButton.style.display = 'block';
                } else {
                    questionEl.textContent = 'Wrong Diagnosis! Try again tomorrow.';
                    // In a real game, you might add a penalty here
                }
            };
            quizContainer.appendChild(button);
        });
    }

    function startRepair() {
        diagnosisView.style.display = 'none';
        garageView.style.display = 'none';
        engineBayView.style.display = 'block';

        // Populate toolbox
        partsToolbox.innerHTML = '<h3>Toolbox</h3>'; // Clear and add header
        PART_DATA.forEach(part => {
            const partImg = document.createElement('img');
            partImg.src = part.sprite;
            partImg.id = `part-${part.id}`;
            partImg.classList.add('part-sprite');
            partImg.draggable = true;
            partImg.addEventListener('dragstart', (e) => {
                e.dataTransfer.setData('text/plain', part.id);
            });
            partsToolbox.appendChild(partImg);
        });
    }

    engineBayView.addEventListener('dragover', (e) => {
        e.preventDefault(); // Allow drop
    });

    engineBayView.addEventListener('drop', (e) => {
        e.preventDefault();
        const droppedPartId = e.dataTransfer.getData('text/plain');
        if (droppedPartId === currentProblem.id) {
            // Correct part dropped!
            money += 100;
            moneyDisplay.textContent = money;
            alert('Repair Successful! You earned $100.');
            endDay();
        } else {
            // Wrong part
            alert('Wrong part! Try again.');
        }
    });

    function endDay() {
        clearInterval(timerInterval);
        // In this simple version, earnings are just the total money accumulated this day.
        // A more complex version would track starting money.
        const earnings = money - (parseInt(totalMoneyDisplay.textContent) || 0);
        earningsDisplay.textContent = earnings;
        totalMoneyDisplay.textContent = money;

        gameContainer.style.display = 'none';
        endDayScreen.style.display = 'block';
    }

    // Call init function to start the game flow
    init();
});
