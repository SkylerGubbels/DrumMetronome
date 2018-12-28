// Different drum part names. Need to be same as div id's in main-page.html
let hiHats = ["hats"];
let snares = ["snares"];
let kicks = ["kicks"];

// Array of drums sounds
// These need to be in the same order as the drumset array
let drumSounds = [new Audio("sounds/HH.mp3"), new Audio("sounds/Snare.mp3"), new Audio("sounds/Kick.mp3")];
let volumeSlider;
let volume = 0.8;

// Combines all drumParts into a single set
let drumset = [hiHats, snares, kicks];
let drumNames = ["hats", "snares", "kicks"];

// Whether using 8th or 16th note subdivisions
let subDivision = 8;
let currentBeat = 0;

let intervalVar;

function handleVolumeChange(){ volume = volumeSlider.value/100;}

/** function standardBeat()
 * 
 *  in: bool is16notes
 *      This boolean denotes whether user wants a standard beat
 *      with 8th or 16th note hihats
 * 
 *  Purpose: Quickly creates a standard beat for the user
 */
function standardBeat(is16notes)
{
    let beatMultiplier = 1;
    if (is16notes === true) { beatMultiplier = 2; }

    if (subDivision === 16 && is16notes === false) { handleSubdivisionChange(); }
    else if (subDivision === 8 && is16notes === true) { handleSubdivisionChange(); }
    else { handleClear(); }

    for(let i = 0; i < drumset.length; ++i)
    {
        for(let k = 0; k < drumset[0].length; ++k)
        {
            if(i === 0) { handleClick(i, k); }
            else if(i === 1 && (k === 2 * beatMultiplier || k === 6 * beatMultiplier)) { handleClick(i, k); }
            else if (i === 2 && (k === 0 || k === 4 * beatMultiplier)) { handleClick(i, k); }
        }
    }
}

function handleSubmit()
{
    handleClear();

    let selection = document.getElementById("menuSelect").value;
    switch(selection)
    {
        case "standard": standardBeat(false); break;
        case "16stan": standardBeat(true); break;
    }
}

function handleClear() { clearDrums(); handleStop(); }

function handleSubdivisionChange()
{
    document.getElementById("subdiv").innerHTML = subDivision + "th Notes";

    if(subDivision === 8){ subDivision = 16;}
    else { subDivision = 8; }
    handleClear();
}

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

/** function playDrums()
 * 
 *  Purpose: This checks every canvas for that specific beat and if
 *           that specific drum is active it plays the sound
 * 
 *  Note: Need to reset sound.currentTime = 0. Otherwise the sound doesn't play
 *        every beat at faster tempos
 *  
 */
function playDrums()
{
    changeColor(currentBeat);

    for(let drum of drumset)
    {
        if(drum[currentBeat].active == true) 
        { 
            drum[currentBeat].sound.currentTime = 0; 
            drum[currentBeat].sound.volume = volume; 
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
    //createNumberCanvas();

    for(let i = 0; i < drumset.length; ++i)
    {
        for(let k = 0; k < subDivision; ++k)
        {
            document.getElementById(drumNames[i]).innerHTML += `<canvas id = "` + drumNames[i] + "" + k +  `" class = "drumBox"></canvas>\n`;

            drumset[i][k] = { name: drumNames[i] + k, active: false, sound: drumSounds[i] };
        }
    }
}

/** 
 * TODO: Add this when working on CSS and layout
 */
function createNumberCanvas()
{
    document.getElementById("numbers").innerHTML = `<p>`

    for(let k = 0; k < subDivision; ++k)
        {
            document.getElementById("numbers").innerHTML += "&"
        }

    document.getElementById("numbers").innerHTML += `</p>`
}

/** function clearDrums()
 * 
 *  Purpose: Deletes all the canvases and redraws the empty canvases
 *           Used when clearing or changing the subdivision
 */
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

/** function addEventListenerForCanvas() 
 * 
 *  Purpose: Adds the EventListeners on all of the canvases 
 * */
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
    
    volumeSlider = document.getElementById("volume");
    volumeSlider.oninput = ()=> { handleVolumeChange() };
    initDrums();
    addEventListenersForCanvases();
})