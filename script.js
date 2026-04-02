const ICONS = [
    'apple', 'banana', 'cherry', 'orange', 'strawberry', 'discount', 'jackpot'
];

/**
 * @type {number} The minimum spin time in seconds
 */
const BASE_SPINNING_DURATION = 2.7;

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

/**
 * Called when the start-button is pressed.
 *
 * @param elem The button itself
 */
function spin(elem) {
    let duration = BASE_SPINNING_DURATION + randomDuration();
    document.getElementById('result-box').innerText = "Waiting..."; // Clear the result box initially


    for (let col of cols) { // set the animation duration for each column
        duration += COLUMN_SPINNING_DURATION + randomDuration();
        col.style.animationDuration = duration + "s";
    }

    // disable the start-button
    elem.setAttribute('disabled', true);

    // set the spinning class so the css animation starts to play
    document.getElementById('container').classList.add('spinning');

    // set the result delayed
    // this would be the right place to request the combination from the server
    window.setTimeout(setResult, BASE_SPINNING_DURATION * 1000 / 2);

    window.setTimeout(function () {
        // after the spinning is done, remove the class and enable the button again
        document.getElementById('container').classList.remove('spinning');
        elem.removeAttribute('disabled');
    }.bind(elem), duration * 1000);
}

/**
 * Sets the result items at the beginning and the end of the columns
 */
function setResult() {
    const jackpotChance = 0.1; // 10% chance for jackpot
    const jackpotIcons = ['jackpot']; // Icons eligible for jackpot
    const isJackpot = Math.random() < jackpotChance; // Determine if jackpot condition is triggered
    const jackpotIcon = jackpotIcons[Math.floor(Math.random() * jackpotIcons.length)]; // Select jackpot icon

    const bigRewardChance = 0.3; // 30% chance for big reward condition
    const bigRewardIcons =  ['discount']; // Icons eligible for big reward
    const isBigReward = Math.random() < bigRewardChance; // Determine if big reward condition is triggered
    const bigRewardIcon = bigRewardIcons[Math.floor(Math.random() * bigRewardIcons.length)]; // Select big reward icon

    const smallRewardChance = 0.1; // 10% chance for small reward condition
    const smallRewardIcons = ICONS.filter(icon => !(bigRewardIcons.includes(icon) || jackpotIcons.includes(icon))); // Icons eligible for small reward
    const isSmallReward = !isBigReward && !isJackpot && (Math.random() < smallRewardChance); // Determine if small reward condition is triggered
    const smallRewardIcon = smallRewardIcons[Math.floor(Math.random() * smallRewardIcons.length)]; // Select small reward icon

    let resultMessage = ""; // Initialize result message

    for (let col of cols) {
        let results;

        if (isBigReward) {
            // Set all columns to the big reward icon
            results = [getRandomIcon(), bigRewardIcon, getRandomIcon()];
            resultMessage = "Big Reward! You got a discount!";
        } else if (isSmallReward) {
            // Set all columns to the small reward icon
            results = [getRandomIcon(), smallRewardIcon, getRandomIcon()];
            resultMessage = "Small Reward! You got a reroll chance!";
        } else if (isJackpot) {
            // Set all columns to the jackpot icon
            results = [jackpotIcon, jackpotIcon, jackpotIcon];
            resultMessage = "Jackpot! free topping!";
        } else {
            // Generate 3 random items
            results = [
                getRandomIcon(),
                getRandomIcon(),
                getRandomIcon()
            ];
            resultMessage = "loss! Good Luck Next time!";
        }

        let icons = col.querySelectorAll('.icon img');
        // Replace the first and last three items of each column with the generated items
        for (let x = 0; x < 3; x++) {
            icons[x].setAttribute('src', 'items/' + results[x] + '.png');
            icons[(icons.length - 3) + x].setAttribute('src', 'items/' + results[x] + '.png');
        }
    }

    // Update the result box with the result message after a delay to match the spinning animation
    
    setTimeout(() => {
        document.getElementById('result-box').innerText = resultMessage;
    }, BASE_SPINNING_DURATION * 1000 + COLUMN_SPINNING_DURATION * cols.length * 1000 - 1000);
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