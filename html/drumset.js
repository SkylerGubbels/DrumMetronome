// Different drum part names. Need to be same as div id's in main-page.html
let hiHats = ["hats"];
let snares = ["snares"];
let kicks = ["kicks"];
let crash = ["crash"];

// Array of drums sounds
// These need to be in the same order as the drumset array
let drumSounds = [new Audio("sounds/HH.wav"), new Audio("sounds/Snare.wav"), new Audio("sounds/Kick.wav"), new Audio("sounds/Crash.wav")];
let volumeSlider;
let volume = 0.8;

// Combines all drumParts into a single set
let drumset = [hiHats, snares, kicks, crash];
let drumNames = ["hats", "snares", "kicks", "crash"];

// Whether using 8th or 16th note subdivisions
let subDivision = 8;
let currentBeat = 0;

let intervalVar;

/** function saveBeat()
 * 
 *  Purpose: Takes the current beat and saves it under the name
 *           entered
 */
function saveBeat()
{
    let drumSave = {};
    drumSave.beat = "";
    drumSave.subdivision = subDivision;

    drumSave.name = document.getElementById("beatName").value;
    document.getElementById("beatName").value = "";

    for(let i = 0; i < drumset.length; ++i)
    {
        for(let k = 0; k < subDivision; ++k)
        {
            if(drumset[i][k].active){drumSave.beat += "1";}
            else{drumSave.beat += "0";}
        }

        drumSave.beat += "\n";
    }

    console.log(drumSave.name)
    document.getElementById("menuSelect").innerHTML += `<option value="`+drumSave.name+`">`+drumSave.name+`</option>`

    let drumJSON = JSON.stringify(drumSave);

    $.post("userText", drumJSON, function(data, status){
        console.log(status);
    });

}

/** function changeCymbal() 
 * 
 *  Purpose: changes the sound of the cymbals
 *           based on user radio button selection
 */
function changeCymbal()
{
    let newSound;

    let radios = document.getElementsByName("cymbalType");
    for(let sounds of radios){
        if(sounds.checked) {
            newSound = new Audio("sounds/"+sounds.value+".wav");
        }
    }

    newSound.play();

    drumSounds[0] = newSound;
    
    for(let i = 0; i < subDivision; ++i)
    {
        drumset[0][i].sound = newSound;
    }
}

function handleSubmit()
{
    handleClear();

    let selection = {};
    selection.request = document.getElementById("menuSelect").value;
    
    $.post("userText", JSON.stringify(selection), function(data, status){
        
        let returnedBeat = JSON.parse(data);
        if(returnedBeat.subdivision !== subDivision) { handleSubdivisionChange(); }

        createBeat(returnedBeat.beat);

    })
}

/** function createBeat(beat)
 * 
 *  in: beat: The string of 1's and 0's returned from server
 *            representing active and inactive drums
 * 
 *  Purpose: Takes the string returned from the server
 *           and activates the relevant drumbeats
 */
function createBeat(beat)
{
    let counter = 0;

    for(let i = 0; i < drumset.length; ++i)
    {
        for(let k = 0; k < subDivision; ++k)
        {
            if(beat.charAt(counter) == "\n") { ++counter; }
            if(beat.charAt(counter) === "1") { handleClick(i, k); }
            ++counter;
        }
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
            drum[currentBeat].sound.volume = volumeSlider.value/100; 
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
    crash = ["crash"];
    drumset = [hiHats, snares, kicks, crash];

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

/** function getBeatNames()
 *  
 *  Purpose: called by addEventListener
 *           Gets names of all saved drumbeats for dropdown menu
 */
function getBeatNames()
{
    let reqObj = {};
    reqObj.names = "getNames";

    $.post("userText", JSON.stringify(reqObj), function(data, status){
    
    for (let option of (JSON.parse(data)).names)
    {
        document.getElementById("menuSelect").innerHTML += `<option value="`+option+`">`+option+`</option>`
    }
    })
}

// Makes sure everything is loaded before adding event listeners
document.addEventListener("DOMContentLoaded", () => {
    
    volumeSlider = document.getElementById("volume");
    initDrums();
    addEventListenersForCanvases();
    getBeatNames();
})