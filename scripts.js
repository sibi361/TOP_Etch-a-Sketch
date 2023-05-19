const DEFAULT_GRID_SIZE = 16;
const MAX_GRID_SIZE = 100;
const MAX_PX_PER_BOX = 30; // in px foe e.g. 30px;
const DEFAULT_MULTI_COLOUR = false;
const DEFAULT_CTRL_PRESS_LISTEN = true;
const BOX_COLOUR_ON_HOVER = "#00b4d8";

const sketchpad = document.querySelector(".sketchpad");
const sizeChangeForm = document.querySelector("#sizeChangeForm");
const sizeInput = document.querySelector("#inputSize");
const colourPicker = document.querySelector("#colourPicker");
const multiColor = document.querySelector("#multiColourSwitch");
const resetButton = document.querySelector("#resetGrid");
const ctrlCheckbox = document.querySelector("#ctrlOnlySwitch");

function makeGrid(size) {
  Array.from(sketchpad.children).forEach((element) => element.remove());

  const currentWidth = window.innerWidth - 100;
  let sizePerBox = currentWidth / size;
  sizePerBox = sizePerBox > MAX_PX_PER_BOX ? MAX_PX_PER_BOX : sizePerBox;

  sketchpad.style.width = `${size * sizePerBox}px`;

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
        } else box.style.background = boxColourHover;
      });

      box.addEventListener("click", () => {
        box.style.background = boxColourHover;
      });

      row.append(box);
    }
    sketchpad.append(row);
  }
}

// reset the grid: set all squares to white
function resetGrid() {
  if (sizeUser == undefined) sizeUser = DEFAULT_GRID_SIZE;
  makeGrid(sizeUser);
}
resetButton.addEventListener("click", () => resetGrid());
document.addEventListener("keydown", (event) => {
  if (event.key == "r" || event.key == "R") resetGrid();
});

function isTrue(value) {
  return value === "true";
}

function sizeError(feedback) {
  sizeUser = DEFAULT_GRID_SIZE;
  alert(feedback);
  sizeInput.value = "";
}

// modify grid size based on user input
let sizeUser;
sizeChangeForm.addEventListener("submit", (event) => {
  event.preventDefault();
  sizeUser = sizeInput.value.replace(/ /g, "");
  if (sizeUser == "" || isNaN(sizeUser) || sizeUser < 1)
    sizeError(
      "Please enter a valid size. For example, to obtain a 32 by 32 grid, enter 32"
    );
  else if (sizeUser > MAX_GRID_SIZE)
    sizeError(`Please enter a smaller size, maximum is ${MAX_GRID_SIZE}.`);
  else makeGrid(sizeUser);
});

// listen for control key checkbox change
let localStorageCtrlPressListen = localStorage.getItem("ctrlOnlySwitch");

if (localStorageCtrlPressListen !== null)
  ctrlCheckbox.checked = isTrue(localStorageCtrlPressListen);
else ctrlCheckbox.checked = DEFAULT_CTRL_PRESS_LISTEN;
let ctrlPressListen = ctrlCheckbox.checked;

ctrlCheckbox.addEventListener("change", (event) => {
  localStorage.setItem("ctrlOnlySwitch", event.target.checked);
  if (event.target.checked) ctrlPressListen = true;
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

// colour picker stuff
let localStorageBoxColor = localStorage.getItem("boxColor");
if (localStorageBoxColor !== null) colourPicker.value = localStorageBoxColor;
else colourPicker.value = BOX_COLOUR_ON_HOVER;

let boxColourHover = colourPicker.value;

let localStorageMultiColor = isTrue(localStorage.getItem("multiColor"));
if (localStorageMultiColor !== null)
  multiColor.checked = localStorageMultiColor;
else multiColor.checked = DEFAULT_MULTI_COLOUR;
let multiColorEnabled = multiColor.checked;

multiColor.addEventListener("click", () =>
  localStorage.setItem("multiColor", multiColor.checked)
);
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
makeGrid(DEFAULT_GRID_SIZE);
