// Different drum part names. Need to be same as div id's in main-page.html
let hiHats = ["hats"];
let snares = ["snares"];
let kicks = ["kicks"];

// Array of drums sounds
// These need to be in the same order as the drumset array
let drumSounds = [new Audio("sounds/HH.mp3"), new Audio("sounds/Snare.mp3"), new Audio("sounds/Kick.mp3")];

// Combines all drumParts into a single set
let drumset = [hiHats, snares, kicks];
let drumNames = ["hats", "snares", "kicks"];

// Whether using 8th or 16th note subdivisions
let subDivision = 8;
let currentBeat = 0;

let intervalVar;

function handleSubdivisionChange()
{
    document.getElementById("subdiv").innerHTML = subDivision + "th Notes";

    if(subDivision === 8){ subDivision = 16;}
    else { subDivision = 8; }
    clearDrums();
}

/**
 *  Takes user input and makes that the new tempo
 */
function handleChangeTempo()
{
    let tempo = document.getElementById("bpmInput").value;

    if (isNaN(tempo) == true || tempo === "") { tempo = 120; }
    else if (tempo < 10) { tempo = 10; }
    else if (tempo > 300) { tempo = 300; }

    let miliseconds;
    
    if(subDivision === 8) { miliseconds = (60000/tempo)/2; }
    else if (subDivision === 16) { miliseconds = (60000/tempo)/4; }
    
    console.log(miliseconds);

    clearInterval(intervalVar);
    currentBeat = 0;
    
    intervalVar = setInterval(playDrums, miliseconds);
}

function handleStop()
{
    console.log("Stopping");
    clearInterval(intervalVar);
    currentBeat = 0;
}

function playDrums()
{
    changeColor(currentBeat);

    for(let drum of drumset)
    {
        if(drum[currentBeat].active == true) 
        { 
            drum[currentBeat].sound.currentTime = 0; 
            drum[currentBeat].sound.play(); 
        }
    }

    currentBeat = ++currentBeat%subDivision;
}

/** function changeColor(currentBeat)
 * 
 *  Creates the red line on screen to give visual feedback for the beat
 *  Maintains the background color of the canvas before the red line passed
 */
function changeColor(currentBeat)
{
    let lastBeat = currentBeat - 1;
    if (lastBeat < 0) { lastBeat = subDivision - 1;}

    for(let drum of drumset)
    {
        let c = document.getElementById(drum[lastBeat].name);

        if(drum[lastBeat].active == true) { c.style.background = "green"; }
        else { c.style.background = "white"; }

        document.getElementById(drum[currentBeat].name).style.background = "red";
    }
}

/** function handleClick(row, col)
 * 
 *  Takes the clicked canvas square and sets it to active or inactive
 *  Reflects this by changing the colour of the canvas
 */
function handleClick(row, col)
{
    let c = document.getElementById(drumset[row][col].name);

    if(drumset[row][col].active == false)
    {
        c.style.background = "green";
        drumset[row][col].active = true;
    }
    else
    {
        c.style.background = "white";
        drumset[row][col].active = false;
    }
}

/** function initDrums()
 * 
 * Initializes drums for adding event listener
 * Made to be scalable if adding smaller drum subdivisions or adding new drum parts
 */
function initDrums()
{
    for(let i = 0; i < drumset.length; ++i)
    {
        for(let k = 0; k < subDivision; ++k)
        {
            document.getElementById(drumNames[i]).innerHTML += `<canvas id = "` + drumNames[i] + "" + k +  `" class = "drumBox"></canvas>\n`;

            drumset[i][k] = { name: drumNames[i] + k, active: false, sound: drumSounds[i] };
        }
    }
}

function clearDrums()
{
    for(let i = 0; i < drumset.length; ++i)
    {
        document.getElementById(drumNames[i]).innerHTML = "";
    }

    hiHats = ["hats"];
    snares = ["snares"];
    kicks = ["kicks"];
    drumset = [hiHats, snares, kicks];

    initDrums();
    addEventListenersForCanvases();
}

function addEventListenersForCanvases()
{
    for(let i = 0; i < drumset.length; ++i)
    {
        for(let k = 0; k < subDivision; ++k)
        {
            document.getElementById(drumset[i][k].name).addEventListener('click', ()=>{ handleClick(i, k) }, false);
        }
    }
}

// Makes sure everything is loaded before adding event listeners
document.addEventListener("DOMContentLoaded", () => {
    
    initDrums();
    addEventListenersForCanvases();
})