let diffSelector = document.getElementById("ac-diff-selector");
let sharkText = document.querySelector("#aliencat > div.ac-game > div.shark.animal > .text");
let sharkImage = document.querySelector("#aliencat > div.ac-game > div.shark.animal > img");
let sharkCounterHolder = document.querySelector("#aliencat > div.ac-game > div.shark.animal > span.counter");
let catText = document.querySelector("#aliencat > div.ac-game > div.cat.animal > .text");
let catImage = document.querySelector("#aliencat > div.ac-game > div.cat.animal > img");
let catCounterHolder = document.querySelector("#aliencat > div.ac-game > div.cat.animal > span.counter");
let scoreHolder = document.querySelector("#aliencat > div.ac-game > div.data-holder > span.score");
let eventHolder = document.querySelector("#aliencat > div.ac-game > div.data-holder > span.event");
let scare = document.querySelector("#aliencat > img");

/*
- death után difficulty beállításra nyomjon vissza
- be lehessen állítani a difficultyt
- resetelés nem működik?
- squish (haptikus effektus)
- css hogy ne lógjon ki stb
- idő
*/

let difficulty = "easy";
let score = 0;
let threshold = -1;
let activeEvent = null;
let eventLength = 0;
let catCounter = 0;
let catClickval = 1;
let sharkCounter = 0;
let sharkClickval = 1;

let game = {
    words: {
        shark: ["adj nesquiket!", "cip", "cap", "*cup*"],
        cat: ["zirp", "zopr", "zup","/me nyalakszik"]
    },
    difficultySettings: {
        easy: {
            showCounter: true,
            threshold: 16
        },
        normal: {
            showCounter: false,
            threshold: 16
        },
        hard: {
            showCounter: false,
            threshold: 12
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
    ]
}

diffSelector.addEventListener("change", (event) => {
    difficulty = event.currentTarget.value;
    let diff = game.difficultySettings[difficulty];    
    
    showCounter = diff.showCounter;
    threshold = diff.threshold;

    console.log("new diff:", difficulty);
});

//cápa
sharkImage.addEventListener("mouseover", () => {
    sharkText.innerText = game.words.shark[getRandom(0, game.words.shark.length)];
});

sharkImage.addEventListener("mouseout", () => {
    sharkText.innerText = "...";
    
    compare();
    updateScore(score+1);
    updateSharkCounter(sharkCounter+sharkClickval);

    if (eventLength == 0) {
        resetEvent();
        getRandomEvent();
    } else eventLength--;
});

//cica
catImage.addEventListener("mouseover", () => {
    catText.innerText = game.words.cat[getRandom(0, game.words.cat.length)];
});

catImage.addEventListener("mouseout", () => {
    catText.innerText = "...";    
    
    compare();
    updateScore(score+1);
    updateCatCounter(catCounter+catClickval);

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
    if (!game.difficultySettings[difficulty].showCounter) {
        
    }
}

function compare() {
    if (Math.abs(catCounter-sharkCounter)>threshold) {
        deathScreen(catCounter < sharkCounter);
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
    updateEvent();
}

function resetGame() {
    score = 0;
    threshold = -1;
    activeEvent = null;
    eventLength = 0;
    catCounter = 0;
    catClickval = 1;
    sharkCounter = 0;
    sharkClickval = 1;
}

function deathScreen(catcry) {
    resetGame();
    if (catcry) catImage.src = "/imgs/aliencat/aliencat_cry.png";
    else {
        scare.style.display = "block";
        setTimeout(() => {
            scare.style.display = "none";
        }, 2000)
    }
}