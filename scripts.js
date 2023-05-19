const DEFAULT_GRID_SIZE = 16;
const MAX_GRID_SIZE = 100;
const MAX_PX_PER_BOX = 30; // in px for e.g. 30px;
const BOX_COLOUR_ON_HOVER = "#000000";
const CTRL_PRESS_LISTEN = false;

const sketchpad = document.querySelector(".sketchpad");
const sizeButton = document.querySelector("#inputSize");
const resetButton = document.querySelector("#resetGrid");
const ctrlCheckbox = document.querySelector("#ctrlOnly");

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
          if (ctrlPressed) box.style.background = BOX_COLOUR_ON_HOVER;
        } else box.style.background = BOX_COLOUR_ON_HOVER;
      });

      row.append(box);
    }
    sketchpad.append(row);
  }
}

function resetGrid() {
  if (sizeUser == undefined) sizeUser = DEFAULT_GRID_SIZE;
  makeGrid(sizeUser);
}

resetButton.addEventListener("click", () => resetGrid());
document.addEventListener("keydown", (event) => {
  if (event.key == "r" || event.key == "R") resetGrid();
});

// modify grid size based on user input
let sizeUser;
sizeButton.addEventListener("click", () => {
  try {
    sizeUser = prompt(
      "Enter the number of squares per side for the grid:"
    ).replace(/ /g, "");
  } catch (TypeError) {}
  if (sizeUser == null || sizeUser == "" || isNaN(sizeUser)) {
    sizeUser = DEFAULT_GRID_SIZE;
    alert(
      "Please enter a valid size. For example, to obtain a 16 by 16 grid, enter 16"
    );
  } else if (sizeUser > MAX_GRID_SIZE) {
    sizeUser = DEFAULT_GRID_SIZE;
    alert(`Please enter a smaller size, maximum is ${MAX_GRID_SIZE}.`);
  } else makeGrid(sizeUser);
});

// listen for control key checkbox change
let ctrlPressListen = CTRL_PRESS_LISTEN;
document.querySelector("input[type='checkbox']").checked = true;
ctrlCheckbox.addEventListener("change", (event) => {
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

makeGrid(DEFAULT_GRID_SIZE);
