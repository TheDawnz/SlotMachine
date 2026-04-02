const ICONS = [
    'apple', 'banana', 'cherry', 'orange', 'strawberry', 'discount', 'jackpot'
];

/**
 * @type {number} The minimum spin time in seconds
 */
const BASE_SPINNING_DURATION = 2;

/**
 * @type {number} The additional duration to the base duration for each row (in seconds).
 * It makes the typical effect that the first reel ends, then the second, and so on...
 */
const COLUMN_SPINNING_DURATION = 0.3;


var cols;


window.addEventListener('DOMContentLoaded', function(event) {
    cols = document.querySelectorAll('.col');

    setInitialItems();
});

function setInitialItems() {
    let baseItemAmount = 40;

    for (let i = 0; i < cols.length; ++i) {
        let col = cols[i];
        let amountOfItems = baseItemAmount + (i * 3); // Increment the amount for each column
        let elms = '';
        let firstThreeElms = '';

        for (let x = 0; x < amountOfItems; x++) {
            let icon = getRandomIcon();
            let item = '<div class="icon" data-item="' + icon + '"><img src="items/' + icon + '.png"></div>';
            elms += item;

            if (x < 3) firstThreeElms += item; // Backup the first three items because the last three must be the same
        }
        col.innerHTML = elms + firstThreeElms;
    }
}

// Add sound effects
const spinSound = new Audio('audio/spin.mp3');
const smallRewardSound = new Audio('audio/win1.mp3');
const jackpotSound = new Audio('audio/jackpot.mp3');

/**
 * Called when the start-button is pressed.
 *
 * @param elem The button itself
 */
function spin(elem) {
    doSpin(elem, false);
}

var spinSoundTimer = null;

function doSpin(elem, isRespin) {
    let duration = BASE_SPINNING_DURATION;

    let resultBox = document.getElementById('result-box');
    resultBox.innerText = isRespin ? "WAIT... ONE MORE TIME!" : "SPINNING...";
    resultBox.className = 'result-text';

    // Remove any previous celebration
    document.querySelector('.machine').classList.remove('celebrating');

    // Animate the lever — pull down, then release back up
    let lever = document.getElementById('lever');
    lever.classList.add('pulled');
    setTimeout(() => {
        lever.classList.remove('pulled');
    }, 600);

    for (let col of cols) {
        duration += COLUMN_SPINNING_DURATION;
        col.style.animationDuration = duration + "s";
    }

    // Clear any previous sound timer and restart the spin sound
    if (spinSoundTimer) clearTimeout(spinSoundTimer);
    spinSound.pause();
    spinSound.currentTime = 2.2;
    spinSound.play();

    spinSoundTimer = setTimeout(() => {
        spinSound.pause();
        spinSound.currentTime = 0;
        spinSoundTimer = null;
    }, duration * 1000);

    elem.setAttribute('disabled', true);

    document.getElementById('container').classList.add('spinning');

    window.setTimeout(function() { setResult(isRespin); }, BASE_SPINNING_DURATION * 1000 / 2);

    if (!isRespin) {
        // Troll: right when the last column is almost stopped, yank it back
        window.setTimeout(function () {
            document.getElementById('container').classList.remove('spinning');
            setInitialItems();
            void cols[0].offsetWidth;
            doSpin(elem, true);
        }, (duration * 1000) - 500);
    } else {
        window.setTimeout(function () {
            document.getElementById('container').classList.remove('spinning');
            elem.removeAttribute('disabled');
        }.bind(elem), duration * 1000);
    }
}

/**
 * Sets the result items at the beginning and the end of the columns
 */
function setResult(showResult) {
    const randomNumber = Math.random(); // Generate a random number between 0 and 1

    const jackpotChance = 0.5; // 10% chance for jackpot
    const jackpotIcons = ['jackpot']; // Icons eligible for jackpot
    const isJackpot = randomNumber < jackpotChance; // Determine if jackpot condition is triggered
    const jackpotIcon = jackpotIcons[Math.floor(Math.random() * jackpotIcons.length)]; // Select jackpot icon

    const bigRewardChance = 0.3; // 30% chance for big reward condition
    const bigRewardIcons =  ['discount']; // Icons eligible for big reward
    const isBigReward = randomNumber < bigRewardChance; // Determine if big reward condition is triggered
    const bigRewardIcon = bigRewardIcons[Math.floor(Math.random() * bigRewardIcons.length)]; // Select big reward icon

    const smallRewardChance = 0.4; // 10% chance for small reward condition
    const smallRewardIcons = ICONS.filter(icon => !(bigRewardIcons.includes(icon) || jackpotIcons.includes(icon))); // Icons eligible for small reward
    const isSmallReward = randomNumber < smallRewardChance; // Determine if small reward condition is triggered
    const smallRewardIcon = smallRewardIcons[Math.floor(Math.random() * smallRewardIcons.length)]; // Select small reward icon

    let resultMessage = ""; // Initialize result message
    let resultClass = "";

    for (let col of cols) {
        let results;

        if (isBigReward) {
            // Set all columns to the big reward icon
            results = [getRandomIcon(), bigRewardIcon, getRandomIcon()];
            resultMessage = "BIG REWARD! YOU GOT A DISCOUNT!";
            resultClass = "win";
        } else if (isSmallReward) {
            // Set all columns to the small reward icon
            results = [getRandomIcon(), smallRewardIcon, getRandomIcon()];
            resultMessage = "SMALL REWARD! REROLL CHANCE!";
            resultClass = "win";
        } else if (isJackpot) {
            // Set all columns to the jackpot icon
            results = [jackpotIcon, jackpotIcon, jackpotIcon];
            resultMessage = "JACKPOT! FREE TOPPING!";
            resultClass = "jackpot";

        } else {
            // Generate 3 random items
            results = [
                getRandomIcon(),
                getRandomIcon(),
                getRandomIcon()
            ];
            resultMessage = "NO LUCK! TRY AGAIN!";
            resultClass = "loss";
        }

        let icons = col.querySelectorAll('.icon img');
        // Replace the first and last three items of each column with the generated items
        for (let x = 0; x < 3; x++) {
            icons[x].setAttribute('src', 'items/' + results[x] + '.png');
            icons[(icons.length - 3) + x].setAttribute('src', 'items/' + results[x] + '.png');
        }
    }

    // Only show result on the respin (second spin)
    if (showResult) {
        setTimeout(() => {
            let resultBox = document.getElementById('result-box');
            resultBox.innerText = resultMessage;
            resultBox.className = 'result-text ' + resultClass;

            // Flash the cabinet and launch confetti on wins
            if (resultClass === 'jackpot' || resultClass === 'win') {
                document.querySelector('.machine').classList.add('celebrating');
                launchConfetti(resultClass === 'jackpot');
            }

            // Play the appropriate sound effect based on the result
            if (isBigReward) {
                smallRewardSound.play();
            } else if (isSmallReward) {
                smallRewardSound.play();
            } else if (isJackpot) {
                jackpotSound.play();
            }
        }, BASE_SPINNING_DURATION * 1000 + COLUMN_SPINNING_DURATION * cols.length * 1000 - 500);
    }
}

const ICON_WEIGHTS = {
    'apple': 20,       // 20% chance
    'banana': 20,      // 20% chance
    'cherry': 15,      // 15% chance
    'orange': 15,      // 15% chance
    'strawberry': 10,  // 10% chance
    'discount': 10,     // 10% chance
    'jackpot': 10       // 10% chance
};

function getRandomIcon() {
    const weightedIcons = [];

    // Populate the weightedIcons array based on weights
    for (const [icon, weight] of Object.entries(ICON_WEIGHTS)) {
        for (let i = 0; i < weight; i++) {
            weightedIcons.push(icon);
        }
    }

    // Select a random icon from the weighted array
    return weightedIcons[Math.floor(Math.random() * weightedIcons.length)];
}

/**
 * @returns {number} 0.00 to 0.09 inclusive
 */
function randomDuration() {
    return Math.floor(Math.random() * 10) / 100;
}

/* ========================================
   Confetti System
   ======================================== */

const confettiCanvas = document.getElementById('confetti-canvas');
const confettiCtx = confettiCanvas.getContext('2d');
let confettiPieces = [];
let confettiAnimId = null;

const CONFETTI_COLORS = [
    '#f5c518', '#d4213d', '#ff6b35', '#00c9a7',
    '#845ec2', '#ff61a6', '#ffc75f', '#00d2fc',
    '#ff3b3b', '#4dff4d', '#fff', '#ff9671'
];

function resizeConfettiCanvas() {
    confettiCanvas.width = window.innerWidth;
    confettiCanvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeConfettiCanvas);
resizeConfettiCanvas();

function createConfettiPiece(x, y, dirX) {
    return {
        type: 'confetti',
        x: x,
        y: y,
        w: Math.random() * 10 + 5,
        h: Math.random() * 6 + 3,
        color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
        vx: dirX * (Math.random() * 6 + 2),
        vy: -(Math.random() * 10 + 4),
        gravity: 0.15 + Math.random() * 0.1,
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 12,
        opacity: 1,
        decay: 0.003 + Math.random() * 0.004
    };
}

function createCoinPiece(x, y, dirX) {
    let size = Math.random() * 16 + 14;
    return {
        type: 'coin',
        x: x,
        y: y,
        size: size,
        vx: dirX * (Math.random() * 7 + 3),
        vy: -(Math.random() * 12 + 5),
        gravity: 0.18 + Math.random() * 0.1,
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 15,
        squash: Math.random(),
        squashSpeed: 0.05 + Math.random() * 0.05,
        opacity: 1,
        decay: 0.002 + Math.random() * 0.003
    };
}

function drawCoin(ctx, p) {
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.globalAlpha = p.opacity;

    // Simulate 3D spin by squashing the width
    let scaleX = Math.abs(Math.sin(p.squash));
    if (scaleX < 0.15) scaleX = 0.15;
    ctx.scale(scaleX, 1);

    let r = p.size / 2;

    // Outer ring (gold edge)
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.fillStyle = '#c9a200';
    ctx.fill();

    // Inner face
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.85, 0, Math.PI * 2);
    ctx.fillStyle = '#f5c518';
    ctx.fill();

    // Shine highlight
    ctx.beginPath();
    ctx.arc(-r * 0.2, -r * 0.2, r * 0.35, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255, 255, 220, 0.5)';
    ctx.fill();

    // Dollar sign
    ctx.fillStyle = '#8b6914';
    ctx.font = 'bold ' + Math.round(r * 1.1) + 'px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('$', 0, 1);

    ctx.restore();
}

let blinkTimer = null;

function startBlinkingBackground() {
    document.body.classList.add('jackpot-blink');
    if (blinkTimer) clearTimeout(blinkTimer);
    blinkTimer = setTimeout(() => {
        document.body.classList.remove('jackpot-blink');
        blinkTimer = null;
    }, 4000);
}

function launchConfetti(isJackpot) {
    let count = isJackpot ? 120 : 80;

    let machine = document.querySelector('.machine');
    let rect = machine.getBoundingClientRect();
    let leftX = rect.left;
    let rightX = rect.right;
    let centerY = rect.top + rect.height * 0.4;

    if (isJackpot) {
        // Launch coins for jackpot
        for (let i = 0; i < count; i++) {
            confettiPieces.push(createCoinPiece(leftX, centerY + (Math.random() - 0.5) * 100, -1));
            confettiPieces.push(createCoinPiece(rightX, centerY + (Math.random() - 0.5) * 100, 1));
        }
        startBlinkingBackground();
    } else {
        // Launch confetti for other wins
        for (let i = 0; i < count; i++) {
            confettiPieces.push(createConfettiPiece(leftX, centerY + (Math.random() - 0.5) * 100, -1));
            confettiPieces.push(createConfettiPiece(rightX, centerY + (Math.random() - 0.5) * 100, 1));
        }
    }

    if (!confettiAnimId) {
        animateConfetti();
    }
}

function animateConfetti() {
    confettiCtx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);

    for (let i = confettiPieces.length - 1; i >= 0; i--) {
        let p = confettiPieces[i];

        p.x += p.vx;
        p.vy += p.gravity;
        p.y += p.vy;
        p.rotation += p.rotationSpeed;
        p.opacity -= p.decay;

        if (p.opacity <= 0 || p.y > confettiCanvas.height + 20) {
            confettiPieces.splice(i, 1);
            continue;
        }

        if (p.type === 'coin') {
            p.squash += p.squashSpeed;
            drawCoin(confettiCtx, p);
        } else {
            confettiCtx.save();
            confettiCtx.translate(p.x, p.y);
            confettiCtx.rotate((p.rotation * Math.PI) / 180);
            confettiCtx.globalAlpha = p.opacity;
            confettiCtx.fillStyle = p.color;
            confettiCtx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
            confettiCtx.restore();
        }
    }

    if (confettiPieces.length > 0) {
        confettiAnimId = requestAnimationFrame(animateConfetti);
    } else {
        confettiAnimId = null;
        confettiCtx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
    }
}
