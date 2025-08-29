let gameContainer = document.querySelector(".game");
let diffPage = document.querySelector(".ac-difficulty");
let gamePage = document.querySelector(".ac-game");
let diffSelector = document.getElementById("ac-diff-selector");
let startButton = document.getElementById("ac-start");
let sharkText = document.querySelector("#aliencat > div.ac-game > div.shark.animal > .text");
let sharkImage = document.querySelector("#aliencat > div.ac-game > div.shark.animal > img");
let sharkCounterHolder = document.querySelector("#aliencat > div.ac-game > div.shark.animal > span.counter");
let catText = document.querySelector("#aliencat > div.ac-game > div.cat.animal > .text");
let catImage = document.querySelector("#aliencat > div.ac-game > div.cat.animal > img");
let catCounterHolder = document.querySelector("#aliencat > div.ac-game > div.cat.animal > span.counter");
let scoreHolder = document.querySelector("#aliencat > div.ac-game > div.data-holder > span.score");
let eventHolder = document.querySelector("#aliencat > div.ac-game > div.data-holder > span.event");
let scare = document.querySelector("#aliencat > img");
let diffImage = document.querySelector("#aliencat > div.ac-difficulty > img");
let timeHolder = document.querySelector("#aliencat > div.ac-game > div.data-holder > span.time");

/*
- squish (haptikus effektus)
- css hogy ne lógjon ki stb
*/

let running         = false;
let difficulty      = "easy";
let score           = 0;
let threshold       = -1;
let activeEvent     = null;
let eventLength     = 0;
let catCounter      = 0;
let catClickval     = 1;
let sharkCounter    = 0;
let sharkClickval   = 1;
let timerHandler    = null;
let remainingTime   = 0;
let timerStart      = 0;
let intervalHandler = null;

let game = {
    words: {
        shark: ["adj nesquiket!", "cip", "cap", "*cup*"],
        cat: ["zirp", "zopr", "zup","/me nyalakszik"]
    },
    difficultySettings: {
        easy: {
            showCounter: true,
            threshold: 16,
            decisionTime: 7000,
            timerBoost: 350
        },
        normal: {
            showCounter: false,
            threshold: 16,
            decisionTime: 5000,
            timerBoost: 350
        },
        hard: {
            showCounter: false,
            threshold: 12,
            decisionTime: 3000,
            timerBoost: 350
        },
        nightmare: {
            showCounter: false,
            threshold: 12,
            decisionTime: 2000,
            timerBoost: 350
        }
    },
    eventSettings: [
        {
            text: "Dupla cápa",
            sharkClickval: 2,
            eventLength: 15
        },
        {
            text: "Tripla cica",
            catClickval: 3,
            eventLength: 12
        },
        {
            text: "Negatív",
            sharkClickval: -1,
            catClickval: -1,
            eventLength: 15
        }
    ],
    fixedEvents: {
        larry: {
            text: "LARRY",
            sharkClickval: -20,
            catClickval: 0,
            eventLength: 20
        }
    }
}

diffSelector.addEventListener("change", (event) => {
    difficulty = event.currentTarget.value;
    let diff = game.difficultySettings[difficulty];    
    
    showCounter = diff.showCounter;
    threshold = diff.threshold;

    diffImage.src = `/imgs/aliencat/${difficulty}.png`;
});

startButton.addEventListener("click", () => {
    if (!running) {
        startGame();
        gameContainer.classList.add("running");
    }
});

//cápa
sharkImage.addEventListener("mouseover", () => {
    if (!running) return;
    sharkText.innerText = game.words.shark[getRandom(0, game.words.shark.length)];
});

sharkImage.addEventListener("mouseout", () => {
    if (!running) return;
    sharkText.innerText = "...";
    
    compare();
    updateScore(score+1);
    updateSharkCounter(sharkCounter+sharkClickval);
    addTime(game.difficultySettings[difficulty].timerBoost);

    if (eventLength == 0) {
        resetEvent();
        getRandomEvent();
    } else eventLength--;
});

//cica
catImage.addEventListener("mouseover", () => {
    if (!running) return;
    catText.innerText = game.words.cat[getRandom(0, game.words.cat.length)];
});

catImage.addEventListener("mouseout", () => {
    if (!running) return;
    catText.innerText = "...";    
    
    compare();
    updateScore(score+1);
    updateCatCounter(catCounter+catClickval);
    addTime(game.difficultySettings[difficulty].timerBoost);

    if (eventLength == 0) {
        resetEvent();
        getRandomEvent();
    } else eventLength--;
});

function updateScore(newScore) {
    score = newScore;
    scoreHolder.innerText = score;
}

function updateSharkCounter(counter) {
    sharkCounter = counter;
    sharkCounterHolder.innerText = sharkCounter;
}

function updateCatCounter(counter) {
    catCounter = counter;
    catCounterHolder.innerText = catCounter;
}

function updateEvent() {
    if (activeEvent == null) eventHolder.innerText = "";
    else eventHolder.innerText = activeEvent;
}

function getRandom(min, max) {
    return Math.floor(Math.random() * (max - min) + min);
}

function startGame() {
    let config = game.difficultySettings[difficulty];

    threshold = config.threshold;
    if (!config.showCounter) {
        sharkCounterHolder.style.display = "none";
        catCounterHolder.style.display = "none";
    }

    diffPage.style.display = "none";
    gamePage.style.display = "flex";

    resetTimer();

    running = true;
}

function startTimer() {
    timerHandler = setTimeout(() => {
        if (activeEvent == "LARRY") {
            deathScreen("larry");
            return;
        }

        let event = game.fixedEvents.larry;
        activeEvent = event.text;
        eventLength = event.eventLength;
        catClickval = event.catClickval;
        sharkClickval = event.sharkClickval;
        catImage.src = "/imgs/aliencat/larry.png";

        resetTimer();
    }, remainingTime);
}

function resetTimer() {
    if (timerHandler) clearTimeout(timerHandler);
    if (intervalHandler) clearInterval(intervalHandler);

    remainingTime = game.difficultySettings[difficulty].decisionTime;
    timerStart = Date.now();

    startTimer();
    startInterval();
}

function addTime(extra) {
    let elapsed = Date.now() - timerStart;
    if (remainingTime-elapsed+extra > game.difficultySettings[difficulty].decisionTime) {
        remainingTime = game.difficultySettings[difficulty].decisionTime;
    } else remainingTime = remainingTime - elapsed + extra;
    if (remainingTime < 0) remainingTime = 0;

    if (timerHandler) clearTimeout(timerHandler);
    timerStart = Date.now();
    startTimer();
}

function startInterval() {
    intervalHandler = setInterval(() => {
        let elapsed = Date.now() - timerStart;
        let timeLeft = Math.max(0, (remainingTime - elapsed) / 1000);
        timeHolder.innerText = timeLeft.toFixed(1) + "s";
    }, 100);
}

function compare() {
    if (Math.abs(catCounter-sharkCounter)>threshold) {
        deathScreen((catCounter < sharkCounter ? "catcry" : "jumpscare"));
    }
}

function getRandomEvent() {
    let chance = getRandom(0, 10);
    if (chance == 0) {
        let event = game.eventSettings[getRandom(0, game.eventSettings.length)];
        activeEvent = event.text;
        eventLength = event.eventLength;
        if (event.catClickval) catClickval = event.catClickval;
        if (event.sharkClickval) sharkClickval = event.sharkClickval;
        updateEvent();
    }
}

function resetEvent() {
    activeEvent = null;
    eventLength = 0;
    catClickval = 1;
    sharkClickval = 1;
    catImage.src = "/imgs/aliencat/aliencat.png";
    updateEvent();
}

function resetGame() {
    threshold = -1;
    eventLength = 0;
    catClickval = 1;
    sharkClickval = 1;
    activeEvent = null;
    updateScore(0);
    updateEvent();
    updateSharkCounter(0);
    updateCatCounter(0);
    diffPage.style.display = "flex";
    gamePage.style.display = "none";
    catImage.src = "/imgs/aliencat/aliencat.png";
    clearTimeout(timerHandler);
    timerStart = 0;
    remainingTime = 0;
}

function deathScreen(type) {
    running = false;
    gameContainer.classList.remove("running");
    timeHolder.innerText = "";
    
    switch (type) {
        case "catcry":
            catImage.src = "/imgs/aliencat/aliencat_cry.png";
            setTimeout(() => {
                catImage.src = "/imgs/aliencat/aliencat.png";
                resetGame();
            }, 2000); 
            break;
        case "larry":
            scare.style.display = "block";
            scare.src = "/imgs/aliencat/catscare.png";
            setTimeout(() => {
                scare.style.display = "none";
                scare.src = "/imgs/aliencat/forestshark_jumpscare.png";
                resetGame();
            }, 2000);
            break;
        case "jumpscare": 
            scare.style.display = "block";
            setTimeout(() => {
                scare.style.display = "none";
                resetGame();
            }, 2000)
            break;
        default: 
            break;
    }
}