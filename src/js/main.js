import {
    allMaps,
} from './maps.js';

import {
    Levels,
} from './levels.js';

import {
    instructionAndLevelMenu,
    GameBoard,
} from './canvas.js';

import { Game } from './game.js';

const startGameButton = document.getElementById("btn-start");
const selectLevelMenu = document.getElementById("level-select");

let mMediaQueryControl = window.matchMedia('(max-width: 1024px)');
let sMediaQueryControl = window.matchMedia('(max-width: 411px)');
const mobileControls = document.querySelector(".mobile-controls");
const mobileLeftControl = document.querySelector("#left");
const mobileRightControl = document.querySelector("#right");
const mobileUpControl = document.querySelector("#up");
const mobileDownControl = document.querySelector("#down");
const mobileUndoControl = document.querySelector("#undo");
const mobileRetryControl = document.querySelector("#retry");

const canvas = document.querySelector("canvas");

const levels = new Levels(allMaps());
const game = new Game(levels);
let board;
let levelNumber;
let direction = 0;

if (localStorage.length > 0) {
    startGameButton.textContent = 'CONTINUE';
}

startGameButton.addEventListener('click', onClickStart);

function onClickStart() {
    document.getElementById('manifesto').style.display = "none";
    startGameButton.style.display = "none";
    instructionAndLevelMenu.classList.remove("hidden");

    if (mMediaQueryControl.matches) {
        mobileControls.classList.remove("hidden");
    }
    
    const numberOfLevels = allMaps().length;
    let n = 2;
    while (n <= numberOfLevels) {
        const levelOption = selectLevelMenu.appendChild(document.createElement("option"));
        levelOption.setAttribute("value", n);
        levelOption.textContent = n;
        n++;
    }

    if (localStorage.length > 0) {
        for (let i = 0; i < localStorage.length; i++) {
            const level = localStorage.key(i);
            const numOfMoves = localStorage.getItem(level);
            document.querySelector(`option[value = "${level}"]`).textContent = `${level} : solved | ${numOfMoves} moves`;
        }

        const highestLevel = parseInt(Object.keys(localStorage).sort((a, b) => parseInt(b) - parseInt(a))[0]);
        canvas.classList.remove("hidden");

        if (highestLevel === 60) {
            return;
        }
        
        game.chooseLevel(highestLevel + 1);
        selectLevelMenu.selectedIndex = game.currentLevelNum;
        board.renderMap(game.getCurrentMap(), 0);
    } 
}

const tileMapImg = new Image();
tileMapImg.onload = () => {
    board = new GameBoard(canvas, tileMapImg);
};
tileMapImg.src = "src/img/tilesheet.png";


selectLevelMenu.addEventListener('change', onSelectLevel);
let epicWinDisco;
let epicWinPeaBounce;

function onSelectLevel() {
    cancelAnimationFrame(epicWinDisco);
    clearInterval(epicWinPeaBounce);
    document.body.style.backgroundColor = "#0a0a0a";
    document.body.style.color = "whitesmoke";

    const index = selectLevelMenu.selectedIndex;
    levelNumber = index;

    canvas.classList.remove("hidden");
    game.chooseLevel(index);

    board.renderMap(game.getCurrentMap(), 0);

    selectLevelMenu.blur();
}

function onPlayerMove(direction) {
    board.renderMap(game.getCurrentMap(), direction);
    if (game.checkIfWin()) {
        setTimeout(function() {
            onWin();
        }, 200) ;
    }
}

window.addEventListener('keydown', event => {
    if (game.checkIfWin()) {
        return;
    }

    switch (event.key) {
        case 'ArrowUp':
            game.moveUp();
            direction = 1;
            break;
        case 'ArrowDown':
            game.moveDown();
            direction = 2;
            break;
        case 'ArrowLeft':
            game.moveLeft();
            direction = 3;
            break;
        case 'ArrowRight':
            game.moveRight();
            direction = 4;
            break;
        case 'z':
            game.unDo();
            direction = 0;
            break;
        case ' ':
            game.reset();
            direction = 0;
            break;
        case 'w':
            game.cheat();
            break;
    }
    onPlayerMove(direction);
});

document.querySelectorAll(".mobile-control").forEach(el => el.addEventListener('click', event => {
    const target = event.target;

    if (game.checkIfWin()) {
        return;
    }

    switch (target) {
        case mobileLeftControl:
            mobileLeftControl.classList.toggle("clicked");
            game.moveLeft();
            direction = 3;
            setTimeout(() => mobileLeftControl.classList.toggle("clicked"), 50);
            break;
        case mobileRightControl:
            mobileRightControl.classList.toggle("clicked");
            game.moveRight();
            direction = 4;
            setTimeout(() => mobileRightControl.classList.toggle("clicked"), 50);
            break;
        case mobileUpControl:
            mobileUpControl.classList.toggle("clicked");
            game.moveUp();
            direction = 1;
            setTimeout(() => mobileUpControl.classList.toggle("clicked"), 50);
            break;
        case mobileDownControl:
            mobileDownControl.classList.toggle("clicked");
            game.moveDown();
            direction = 2;
            setTimeout(() => mobileDownControl.classList.toggle("clicked"), 50);
            break;
        case mobileUndoControl:
            mobileUndoControl.classList.toggle("clicked");
            game.unDo();
            direction = 0;
            setTimeout(() => mobileUndoControl.classList.toggle("clicked"), 50);
            break;
        case mobileRetryControl:
            mobileRetryControl.classList.toggle("clicked");
            game.reset();
            direction = 0;
            setTimeout(() => mobileRetryControl.classList.toggle("clicked"), 50);
            break;
    }
    onPlayerMove(direction);
}));

const winSound = new Audio("src/audio/win.mp3");
const epicWinSound = new Audio("src/audio/epicwin.mp3");
const onWinPopUp = document.querySelector('#onwin-popup');
const nextBtn = document.querySelector('#next-level');

function onWin() {
    const currentLevel = game.currentLevelNum;
    const numOfMoves = game.history.length - 1;

    if (currentLevel === 60) {
        onEpicWin();
    } else {
        winSound.play();
        document.body.style.backgroundColor = "Whitesmoke";
        document.body.style.color = "#0a0a0a";
        onWinPopUp.classList.remove('hidden');
    }  

    if (!localStorage.getItem(game.currentLevelNum)) {
        document.querySelector(`option[value = "${currentLevel}"]`).textContent += ` : solved | ${numOfMoves} moves`;
        localStorage.setItem(currentLevel, numOfMoves);
    }
}

nextBtn.addEventListener('click', onClickNext);

function onClickNext() {
    game.chooseNextLevel();
    document.body.style.backgroundColor = "#0a0a0a";
    document.body.style.color = "Whitesmoke";

    onWinPopUp.classList.add('hidden');
    selectLevelMenu.selectedIndex = game.currentLevelNum;
    board.renderMap(game.getCurrentMap(), 0);  
}

const backgroundColor = {
    red: Math.floor(Math.random() * 255),
    green: Math.floor(Math.random() * 255),
    blue: Math.floor(Math.random() * 255),
    rgb: function() {
        return `rgb(${this.red}, ${this.green}, ${this.blue})`;
    }
};

let pea;
const gravity = 0.2;

function onEpicWin() {
    updateBackground();
    epicWinSound.play();
    
    if (sMediaQueryControl.matches) {
        console.log(sMediaQueryControl);
        return;
    }

    pea = board.getPeaRef(game.getCurrentMap());

    setTimeout(() => {
        board.drawEpicWin(game.getCurrentMap());
        board.drawPeaOnEpicWin(pea);
        epicWinPeaBounce = setInterval(() => board.updatePeaOnEpicWin(pea, gravity), 80);
    }, 400);  
}

function updateBackground() {
    backgroundColor.red = (backgroundColor.red + 1) % 255;
    backgroundColor.blue = (backgroundColor.blue + 1) % 255;
    backgroundColor.green = (backgroundColor.green + 1) % 255;

    document.body.style.backgroundColor = backgroundColor.rgb();

    epicWinDisco = requestAnimationFrame(updateBackground);
}