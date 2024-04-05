var updateScoreInterval; 
var scoreTimeout; 
var character = document.getElementById('character');
var scoreDisplay = document.getElementById('score'); 
var gravity = 0.08;
var jumpStrength = 1;
var gameInterval, createPipeInterval, movePipesInterval, updateScoreInterval;
var gameActive = false;
var gameEnded = false;
var characterY = 50;
var velocity = 0;
var score = 0; 

var pipes = [];
var pipeSpeed = 2;

function createPipe() {
    if (!gameActive) return;

    const gameAreaHeightPx = 600;
    const gapSizePx = 180;
    const movingLinesHeightPx = 60;
    const totalPipesSpacePx = gameAreaHeightPx - gapSizePx - movingLinesHeightPx;
    const topPipePercentage = Math.random() * 0.8 + 0.1;
    const topPipeHeightPx = totalPipesSpacePx * topPipePercentage;
    const bottomPipeHeightPx = totalPipesSpacePx - topPipeHeightPx;

    var topPipe = document.createElement('img');
    topPipe.src = '/static/pipe2.png';
    topPipe.style.position = 'absolute';
    topPipe.style.top = '0';
    topPipe.style.left = '1200px';
    topPipe.style.width = '80px';
    topPipe.style.height = `${topPipeHeightPx}px`;
    topPipe.style.userSelect = "none";
    document.getElementById('gameArea').appendChild(topPipe);

    var bottomPipe = document.createElement('img');
    bottomPipe.src = '/static/pipe.png';
    bottomPipe.style.position = 'absolute';
    bottomPipe.style.bottom = `${movingLinesHeightPx}px`;
    bottomPipe.style.left = '1200px';
    bottomPipe.style.width = '80px';
    bottomPipe.style.height = `${bottomPipeHeightPx}px`;
    bottomPipe.style.userSelect = "none";
    document.getElementById('gameArea').appendChild(bottomPipe);

    pipes.push({ top: topPipe, bottom: bottomPipe });
    setTimeout(() => {
        topPipe.remove();
        bottomPipe.remove();
        pipes = pipes.filter(p => p.top !== topPipe && p.bottom !== bottomPipe);
    }, 15000);
}

function movePipes() {
    if (!gameActive) return;

    pipes.forEach(pair => {
        var currentPosition = parseInt(pair.top.style.left, 10);
        pair.top.style.left = `${currentPosition - pipeSpeed}px`;
        pair.bottom.style.left = `${currentPosition - pipeSpeed}px`;
    });
}

function checkCollision() {
    var characterRect = character.getBoundingClientRect();
    for (let pipePair of pipes) {
        var topPipeRect = pipePair.top.getBoundingClientRect();
        var bottomPipeRect = pipePair.bottom.getBoundingClientRect();
        if (rectOverlap(characterRect, topPipeRect) || rectOverlap(characterRect, bottomPipeRect)) {
            endGame();
            return;
        }
    }
}

function rectOverlap(rectA, rectB) {
    return !(rectA.right < rectB.left || 
             rectA.left > rectB.right || 
             rectA.bottom < rectB.top || 
             rectA.top > rectB.bottom);
}

function gameLogic() {
    if (!gameActive) return;

    characterY += velocity;
    velocity += gravity;

    if (characterY >= 80 || characterY <= 0) {
        endGame();
    } else {
        checkCollision();
    }

    character.style.top = characterY + '%';
}

function startScoreTimer() {
    clearTimeout(scoreTimeout);
    clearInterval(updateScoreInterval);

    var initialPipeDelay = 11500; 
    scoreTimeout = setTimeout(function() {
        updateScoreInterval = setInterval(updateScore, 2500); 
    }, initialPipeDelay);
}

function startGame() {
    if (gameActive || gameEnded) return;

    gameActive = true;
    gameEnded = false;
    score = 0;
    scoreDisplay.innerText = score;
    document.getElementById('movingLines').style.animation = 'moveLines 10s linear infinite';

    gameInterval = setInterval(gameLogic, 20);
    createPipeInterval = setInterval(createPipe, 2500);
    movePipesInterval = setInterval(movePipes, 20);
    startScoreTimer();
}

function updateScore() {
    if (!gameActive) return; 
    score += 1;
    scoreDisplay.innerText = score;
    document.getElementById('scoreSound').play(); 
}

function endGame() {
    if (!gameEnded) {
        gameActive = false;
        gameEnded = true;

        clearInterval(gameInterval);
        clearInterval(createPipeInterval);
        clearInterval(movePipesInterval);
        clearTimeout(scoreTimeout); 
        clearInterval(updateScoreInterval); 

        document.getElementById('gameOverSound').play();
        document.getElementById('finalScore').innerText = score;
        document.getElementById('gameOverScreen').style.display = 'block'; 
        document.getElementById('gameArea').style.pointerEvents = 'none';
        document.getElementById('movingLines').style.animationPlayState = 'paused';
    }
}

document.getElementById('restartButton').addEventListener('click', function() {
    document.getElementById('gameOverScreen').style.display = 'none';
    document.getElementById('gameArea').style.pointerEvents = 'auto';
    pipes.forEach(pipe => { pipe.top.remove(); pipe.bottom.remove(); });
    pipes = [];
    score = 0;
    scoreDisplay.innerText = '0';
    characterY = 50;
    velocity = 0;
    character.style.top = '50%'; 

    gameActive = false; 
    gameEnded = false;
    document.getElementById('movingLines').style.animation = 'none';
});

function jump() {
    if (gameActive && !gameEnded) {
        velocity = -jumpStrength;
        var tapSound = document.getElementById('tapSound');
        tapSound.currentTime = 0;
        tapSound.play(); 
    }
}

function gameControl() {
    if (!gameActive && !gameEnded) {
        startGame();
    } else {
        jump();
    }
}

document.getElementById('gameArea').addEventListener('click', gameControl);
