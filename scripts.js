const DEFAULT_GRID_SIZE = 32;
const DEFAULT_MULTI_COLOUR = false;
const DEFAULT_CTRL_PRESS_LISTEN = false;
const DEFAULT_GRID = false;
const DEFAULT_RANDOM_COLOUR_MODE = true; // change will break randomColourMode init
const DEFAULT_BOX_COLOUR_ON_HOVER = "#00b4d8";
const SUCCESSIVE_COLOUR_DARKEN_FACTOR = 0.9;
const MAX_GRID_SIZE = 100;
const MAX_PX_PER_BOX = 30; // in px
const SAFETY_MARGIN = 30;
const MOBILE_SIZE_REDUCTION_FACTOR = 0.75;
const MOBILE_SIZE_REDUCTION_THRESHOLD = 32;

const sketchPad = document.querySelector(".sketchpad");
const sizeChangeForm = document.querySelector("#sizeChangeForm");
const sizeInput = document.querySelector("#inputSize");
const gridToggle = document.querySelector("#toggleGrid");
const randomColourToggle = document.querySelector("#toggleRandomColour");
const nonRandomMode = document.querySelector("#nonRandomModeContainer");
const colourPickerInput = document.querySelector("#colourPicker");
const multiColorToggle = document.querySelector("#multiColourSwitch");
const resetButton = document.querySelector("#resetGrid");
const ctrlToggle = document.querySelector("#ctrlOnlySwitch");
const exportAsImageButton = document.querySelector("#exportAsImage");
const clearStorageButton = document.querySelector("#clearStorage");

function makeGrid(size) {
  Array.from(sketchPad.children).forEach((element) => element.remove());

  // check if device is desktop or mobile and set box size accordingly
  let dimension;
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
        if (ctrlPressListen) {
          if (ctrlPressed)
            box.style.background = getColour(box.style.background);
        } else {
          // normal operation mode: draw only if mouse within
          // easter egg: stop drawing if Ctrl pressed
          if (sketchPadInFocus && sketchPadIsClicked && !ctrlPressed)
            box.style.background = getColour(box.style.background);
        }
      });

      box.addEventListener("click", () => {
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

function getCurrentTimestamp() {
  const date = new Date();
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}_${date
    .toTimeString()
    .split(" ")[0]
    .toString()
    .replace(/:/g, "-")}`;
}

function getRandom(max) {
  return Math.floor(Math.random() * max);
}

function isTrue(value) {
  return value === "true";
}

function screenshot(element) {
  html2canvas(element).then((canvas) => {
    const sketchFileName = `Etch-A-Sketch_${getCurrentTimestamp()}.png`;
    saveFile(sketchFileName, canvas.toDataURL());
  });
}

exportAsImageButton.addEventListener("click", () => screenshot(sketchPad));

// localStorage wrappers
function readLs(key) {
  const localStorageTemp = localStorage.getItem(key);
  if (localStorageTemp !== null) return localStorageTemp;
  else return false;
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
sketchPad.addEventListener("mouseup", () => (sketchPadIsClicked = false));

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

// listen for control key checkbox change
let ctrlPressListen = readLs("ctrlOnlySwitch")
  ? isTrue(readLs("ctrlOnlySwitch"))
  : DEFAULT_CTRL_PRESS_LISTEN;
ctrlToggle.checked = ctrlPressListen;

ctrlToggle.addEventListener("change", () => {
  writeLs("ctrlOnlySwitch", ctrlToggle.checked);
  if (ctrlToggle.checked) ctrlPressListen = true;
  else ctrlPressListen = false;
});

// listen for control key press
let ctrlPressed = false;
document.addEventListener("keydown", (event) => {
  if (event.key == "Control") ctrlPressed = true;
});
document.addEventListener("keyup", (event) => {
  if (event.key == "Control") ctrlPressed = false;
});
sketchPad.addEventListener("mouseleave", () => {
  ctrlPressed = false;
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
let multiColorEnabled = readLs("multiColor")
  ? isTrue(readLs("multiColor"))
  : DEFAULT_MULTI_COLOUR;
multiColorToggle.checked = multiColorEnabled;

multiColorToggle.addEventListener("click", () => {
  writeLs("multiColor", multiColorToggle.checked);
  resetGrid();
});

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
    writeLs("multiColor", multiColorToggle.checked);
    multiColorEnabled = multiColorToggle.checked;
    if (!multiColorEnabled) resetGrid();
    boxColourHover = colour;
  },
});

// initialize grid at page load
makeGrid(optimizeSize(sizeUser));
