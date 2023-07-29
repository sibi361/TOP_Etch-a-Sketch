const DEFAULT_GRID_SIZE = 32;
const DEFAULT_CTRL_PRESS_LISTEN = false;
const DEFAULT_GRID = false;
const DEFAULT_RANDOM_COLOUR_MODE = true; // change will break randomColourMode init
const DEFAULT_BOX_COLOUR_ON_HOVER = "#00b4d8";
const SUCCESSIVE_COLOUR_DARKEN_FACTOR = 0.9;
const MAX_GRID_SIZE = 100;
const MAX_PX_PER_BOX = 30; // in px
const SAFETY_MARGIN = 50;
const MOBILE_SIZE_REDUCTION_FACTOR = 0.75;
const MOBILE_SIZE_REDUCTION_THRESHOLD = 32;

const container = document.querySelector(".container");
const sketchPad = document.querySelector(".sketchpad");
const sizeChangeForm = document.querySelector("#sizeChangeForm");
const sizeInput = document.querySelector("#inputSize");
const gridToggle = document.querySelector("#toggleGrid");
const randomColourToggle = document.querySelector("#toggleRandomColour");
const nonRandomMode = document.querySelector("#nonRandomModeContainer");
const colourPickerInput = document.querySelector("#colourPicker");
const resetButton = document.querySelector("#resetGrid");
const exportAsImageButton = document.querySelector("#exportAsImage");
const clearStorageButton = document.querySelector("#clearStorage");
const screenshotContainer = document.querySelector("#screenshotImageContainer");

let dimension;
function makeGrid(size) {
    Array.from(sketchPad.children).forEach((element) => element.remove());

    // check if device is desktop or mobile and set box size accordingly
    if (deviceIsMobile) dimension = window.innerWidth - SAFETY_MARGIN;
    else dimension = window.innerHeight - SAFETY_MARGIN;
    let sizePerBox = dimension / size;
    sizePerBox = sizePerBox > MAX_PX_PER_BOX ? MAX_PX_PER_BOX : sizePerBox;
    sketchPad.style.height = `${size * sizePerBox}px`;

    for (let i = 0; i < size; i++) {
        let row = document.createElement("div");
        row.classList.add("row");
        row.style.height = `${sizePerBox}px`;
        if (!showGrid) row.classList.add("no-border");

        for (let j = 0; j < size; j++) {
            let box = document.createElement("div");
            box.classList.add("box");
            box.style.width = `${sizePerBox}px`;
            if (!showGrid) box.classList.add("no-border");

            box.addEventListener("mouseover", () => {
                // draw only if mouse is being left clicked
                // OR the Control key is being pressed
                if ((sketchPadInFocus && sketchPadIsClicked) || ctrlIsPressed)
                    box.style.background = getColour(box.style.background);
            });

            box.addEventListener("mousedown", () => {
                box.style.background = getColour(box.style.background);
            });

            row.append(box);
        }
        sketchPad.append(row);
    }
}

function getColour(rgbString = null) {
    if (!randomColourMode) return boxColourHover;
    if (rgbString === null || rgbString == "")
        return `rgb(${getRandom(255)}, ${getRandom(255)}, ${getRandom(255)})`;
    else {
        // get individual values, blacken them by 10%, return rgb(r,g,b) string
        rgbString = rgbString.replace("rgb(", "").replace(")", "").split(",");
        rgbString = rgbString.map(
            (element) => Number(element) * SUCCESSIVE_COLOUR_DARKEN_FACTOR
        );
        return `rgb(${rgbString[0]}, ${rgbString[1]}, ${rgbString[2]})`;
    }
}

function setGrid() {
    sketchPad
        .querySelectorAll("div")
        .forEach((element) => element.classList.remove("no-border"));
}

function hideGrid() {
    sketchPad
        .querySelectorAll("div")
        .forEach((element) => element.classList.add("no-border"));
}

function sizeError(feedback) {
    sizeUser = DEFAULT_GRID_SIZE;
    alert(feedback);
    sizeInput.value = sizeUser;
}

// reduce size on mobile devices for better UX
function optimizeSize(size) {
    if (deviceIsMobile) {
        if (size > MOBILE_SIZE_REDUCTION_THRESHOLD)
            return Math.floor(size * MOBILE_SIZE_REDUCTION_FACTOR);
    }
    return size;
}

function getRandom(max) {
    return Math.floor(Math.random() * max);
}

function isTrue(value) {
    return value === "true";
}

// save data to file
function saveFile(fileName, fileData) {
    const _ = document.createElement("a");
    _.style = "display: none";
    _.href = fileData;
    _.download = fileName;
    document.body.appendChild(_);
    _.click();
    _.remove();
}

// Formats current time if Date() object not provided
function getTimestamp(date = new Date()) {
    return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}_${date
        .toTimeString()
        .split(" ")[0]
        .toString()
        .replace(/:/g, "-")}`;
}

// https://stackoverflow.com/a/74003656
function isIOS() {
    let platform = navigator?.userAgent || navigator?.platform || "unknown";
    return /iPhone|iPod|iPad/.test(platform);
}

function screenshot(element) {
    html2canvas(element).then((canvas) => {
        const canvas_data = canvas.toDataURL();
        const tempMessage = document.createElement("p");
        screenshotContainer.innerHTML = "";

        if (!isIOS()) {
            const sketchFileName = `Etch-A-Sketch_${getTimestamp()}.png`;
            saveFile(sketchFileName, canvas.toDataURL());
            tempMessage.textContent =
                'Sketch successfully exported to your default "Downloads" folder.';
            screenshotContainer.append(tempMessage);
        } else {
            try {
                document.querySelector("#tempScreenshotImage").remove();
            } catch {}

            // saveFile() doesn't work on IOS so user has to manually click
            // and hold the generated image to save
            const _ = document.createElement("img");
            _.id = "tempScreenshotImage";
            _.src = canvas_data;
            _.width = dimension;
            _.style.border = "2px solid blue";

            tempMessage.textContent =
                "Press and hold the following image to save it:";
            screenshotContainer.append(tempMessage, _);
        }
    });
}

exportAsImageButton.addEventListener("click", () => screenshot(sketchPad));

// localStorage wrappers
function readLs(key) {
    return localStorage.getItem(key) ?? false;
}

function writeLs(key, value) {
    localStorage.setItem(key, value);
}

function clearLs() {
    localStorage.clear();
}

// Reset settings to default
function resetAllSettings() {
    clearLs();
    window.location.reload();
}

clearStorageButton.addEventListener("click", resetAllSettings);

// reset the grid: set all boxes to white
function resetGrid() {
    if (sizeUser == undefined) {
        sizeUser = DEFAULT_GRID_SIZE;
    }
    makeGrid(sizeUser);
}

resetButton.addEventListener("click", () => resetGrid());
document.addEventListener("keydown", (event) => {
    if (event.key == "r" || event.key == "R") resetGrid();
});

// essential listeners related to drawing
let sketchPadInFocus = false;
sketchPad.addEventListener("mouseenter", () => (sketchPadInFocus = true));
sketchPad.addEventListener("mouseleave", () => (sketchPadInFocus = false));

let sketchPadIsClicked = false;
sketchPad.addEventListener("mousedown", () => (sketchPadIsClicked = true));
// If the below event listener were attached to sketchPad instead of the container,
// releasing the mouse left-click AFTER dragging the mouse out of the sketchPad
// would cause sketchPadIsClicked to continue to stay true. This would lead to
// drawing just by hovering, when the mouse re-enters the sketchPad.
container.addEventListener("mouseup", () => (sketchPadIsClicked = false));

// listen for control key press
let ctrlIsPressed = false;
document.addEventListener("keydown", (event) => {
    if (event.key == "Control") ctrlIsPressed = true;
});
document.addEventListener("keyup", (event) => {
    if (event.key == "Control") ctrlIsPressed = false;
});

// mobile device detection
let deviceIsMobile = false;
if (window.innerHeight > window.innerWidth) deviceIsMobile = true;

// set initial size of boxes
let sizeUser = readLs("sizeUser") ? readLs("sizeUser") : DEFAULT_GRID_SIZE;
sizeInput.value = sizeUser;

// modify grid size based on user input
sizeChangeForm.addEventListener("submit", (event) => {
    event.preventDefault();
    sizeUser = sizeInput.value.replace(/ /g, "");
    // isNaN(input) returns true if input is NOT a Number
    if (sizeUser == "" || isNaN(sizeUser) || sizeUser < 1)
        sizeError(
            "Please enter a valid size. For example, to obtain a 16 by 16 grid, enter 16"
        );
    else if (sizeUser > MAX_GRID_SIZE)
        sizeError(`Please enter a smaller size, maximum is ${MAX_GRID_SIZE}.`);
    else {
        writeLs("sizeUser", sizeUser);
        makeGrid(optimizeSize(sizeUser));
    }
});

// set initial grid lines state
let showGrid = readLs("showGrid") ? isTrue(readLs("showGrid")) : DEFAULT_GRID;
gridToggle.checked = showGrid;

// listen for grid toggle
gridToggle.addEventListener("change", () => {
    showGrid = gridToggle.checked;
    writeLs("showGrid", showGrid);
    if (showGrid) setGrid();
    else hideGrid();
});

// box colour on hover
let boxColourHover = readLs("boxColor")
    ? readLs("boxColor")
    : DEFAULT_BOX_COLOUR_ON_HOVER;
colourPickerInput.value = boxColourHover;

// random box colour mode
let randomColourMode = readLs("randomColor")
    ? isTrue(readLs("randomColor"))
    : DEFAULT_RANDOM_COLOUR_MODE;
randomColourToggle.checked = randomColourMode;

// Hide colour picker if random colour mode is enabled
if (randomColourMode) nonRandomMode.style = "display:none;";
else nonRandomMode.style = "";

randomColourToggle.addEventListener("change", () => {
    writeLs("randomColor", randomColourToggle.checked);
    if (randomColourToggle.checked) randomColourMode = true;
    else randomColourMode = false;

    if (randomColourMode) nonRandomMode.style = "display:none;";
    else nonRandomMode.style = "";
});

// colour picker stuff
Coloris({
    alpha: false,
    swatches: [
        "#2a9d8f",
        "#e9c46a",
        "rgb(244,162,97)",
        "#d62828",
        "#0096c7",
        "#00b4d880",
    ],
    onChange: (colour) => {
        writeLs("boxColor", colour);
        boxColourHover = colour;
    },
});

// initialize grid at page load
makeGrid(optimizeSize(sizeUser));
