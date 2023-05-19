const DEFAULT_GRID_SIZE = 32;
const DEFAULT_MULTI_COLOUR = false;
const DEFAULT_CTRL_PRESS_LISTEN = false;
const DEFAULT_GRID = false;
const DEFAULT_BOX_COLOUR_ON_HOVER = "#00b4d8";
const MAX_GRID_SIZE = 100;
const MAX_PX_PER_BOX = 30; // in px
const SAFETY_MARGIN = 30;
const MOBILE_SIZE_REDUCTION_FACTOR = 0.75;
const MOBILE_SIZE_REDUCTION_THRESHOLD = 32;

const sketchpad = document.querySelector(".sketchpad");
const sizeChangeForm = document.querySelector("#sizeChangeForm");
const sizeInput = document.querySelector("#inputSize");
const gridToggle = document.querySelector("#toggleGrid");
const colourPicker = document.querySelector("#colourPicker");
const multiColor = document.querySelector("#multiColourSwitch");
const resetButton = document.querySelector("#resetGrid");
const ctrlCheckbox = document.querySelector("#ctrlOnlySwitch");
const exportAsImageButton = document.querySelector("#exportAsImage");

function makeGrid(size) {
  Array.from(sketchpad.children).forEach((element) => element.remove());

  // check if device is desktop or mobile and set box size accordingly
  let dimension;
  if (deviceIsMobile) dimension = window.innerWidth - SAFETY_MARGIN;
  else dimension = window.innerHeight - SAFETY_MARGIN;
  let sizePerBox = dimension / size;
  sizePerBox = sizePerBox > MAX_PX_PER_BOX ? MAX_PX_PER_BOX : sizePerBox;
  sketchpad.style.height = `${size * sizePerBox}px`;

  for (let i = 0; i < size; i++) {
    let row = document.createElement("div");
    row.classList.add("row");
    row.style.height = `${sizePerBox}px`;

    for (let j = 0; j < size; j++) {
      let box = document.createElement("div");
      box.classList.add("box");
      box.style.width = `${sizePerBox}px`;

      box.addEventListener("mouseover", () => {
        if (ctrlPressListen) {
          if (ctrlPressed) box.style.background = boxColourHover;
        } else {
          if (!ctrlPressed && sketchpadInFocus && sketchpadIsClicked)
            box.style.background = boxColourHover;
        }
      });

      box.addEventListener("click", () => {
        box.style.background = boxColourHover;
      });

      row.append(box);
    }
    sketchpad.append(row);
  }
  if (!showGrid) hideGrid();
}

function setGrid() {
  sketchpad
    .querySelectorAll("div")
    .forEach((element) => element.classList.remove("no-border"));
}

function hideGrid() {
  sketchpad
    .querySelectorAll("div")
    .forEach((element) => element.classList.add("no-border"));
}

function sizeError(feedback) {
  sizeUser = DEFAULT_GRID_SIZE;
  alert(feedback);
  sizeInput.value = "";
}

// reduce size on mobile devices for better UX
function optimiseSize(size) {
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

function isTrue(value) {
  return value === "true";
}

function screenshot(element) {
  html2canvas(element).then((canvas) => {
    const sketchFileName = `Etch-A-Sketch_${getCurrentTimestamp()}.png`;
    saveFile(sketchFileName, canvas.toDataURL());
  });
}

exportAsImageButton.addEventListener("click", () => screenshot(sketchpad));

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
let sketchpadInFocus = false;
sketchpad.addEventListener("mouseenter", () => (sketchpadInFocus = true));
sketchpad.addEventListener("mouseleave", () => (sketchpadInFocus = false));

let sketchpadIsClicked = false;
sketchpad.addEventListener("mousedown", () => (sketchpadIsClicked = true));
sketchpad.addEventListener("mouseup", () => (sketchpadIsClicked = false));

// mobile device detection
let deviceIsMobile = false;
if (window.innerHeight > window.innerWidth) deviceIsMobile = true;

// set initial size of boxes
let sizeUser;
const localStorageSizeUser = localStorage.getItem("sizeUser");
if (localStorageSizeUser !== null) sizeUser = localStorageSizeUser;
else sizeUser = DEFAULT_GRID_SIZE;
sizeInput.value = sizeUser;

// modify grid size based on user input
sizeChangeForm.addEventListener("submit", (event) => {
  event.preventDefault();
  sizeUser = sizeInput.value.replace(/ /g, "");
  if (sizeUser == "" || isNaN(sizeUser) || sizeUser < 1)
    sizeError(
      "Please enter a valid size. For example, to obtain a 32 by 32 grid, enter 32"
    );
  else if (sizeUser > MAX_GRID_SIZE)
    sizeError(`Please enter a smaller size, maximum is ${MAX_GRID_SIZE}.`);
  else {
    localStorage.setItem("sizeUser", sizeUser);
    makeGrid(optimiseSize(sizeUser));
  }
});

// set initial grid lines state
let showGrid;
const localStorageGrid = localStorage.getItem("grid");
if (localStorageGrid !== null) showGrid = isTrue(localStorageGrid);
else showGrid = DEFAULT_GRID;
gridToggle.checked = showGrid;

// listen for grid toggle
gridToggle.addEventListener("click", () => {
  showGrid = gridToggle.checked;
  localStorage.setItem("grid", showGrid);
  if (showGrid) setGrid();
  else hideGrid();
});

// listen for control key checkbox change
const localStorageCtrlPressListen = localStorage.getItem("ctrlOnlySwitch");
if (localStorageCtrlPressListen !== null)
  ctrlCheckbox.checked = isTrue(localStorageCtrlPressListen);
else ctrlCheckbox.checked = DEFAULT_CTRL_PRESS_LISTEN;
let ctrlPressListen = ctrlCheckbox.checked;

ctrlCheckbox.addEventListener("change", () => {
  localStorage.setItem("ctrlOnlySwitch", ctrlCheckbox.checked);
  if (ctrlCheckbox.checked) ctrlPressListen = true;
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
sketchpad.addEventListener("mouseleave", () => {
  ctrlPressed = false;
});

// box colour on hover
const localStorageBoxColor = localStorage.getItem("boxColor");
if (localStorageBoxColor !== null) colourPicker.value = localStorageBoxColor;
else colourPicker.value = DEFAULT_BOX_COLOUR_ON_HOVER;

let boxColourHover = colourPicker.value;

// colour picker stuff
const localStorageMultiColor = isTrue(localStorage.getItem("multiColor"));
if (localStorageMultiColor !== null)
  multiColor.checked = localStorageMultiColor;
else multiColor.checked = DEFAULT_MULTI_COLOUR;
let multiColorEnabled = multiColor.checked;

multiColor.addEventListener("click", () => {
  localStorage.setItem("multiColor", multiColor.checked);
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
    localStorage.setItem("boxColor", colour);
    localStorage.setItem("multiColor", multiColor.checked);
    multiColorEnabled = multiColor.checked;
    if (!multiColorEnabled) resetGrid();
    boxColourHover = colour;
  },
});

// initialize grid at page load
makeGrid(optimiseSize(sizeUser));
