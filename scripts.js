const sketchpad = document.querySelector(".sketchpad");
const sizeButton = document.querySelector("#inputSize");

const SIZE = 16;
const MAX_SIZE = 100;
const MAX_SIZE_PX = 30;

function makeGrid(size) {
  const currentWidth = window.innerWidth - 100;
  let size_px = currentWidth / size;
  size_px = size_px > MAX_SIZE_PX ? MAX_SIZE_PX : size_px;

  sketchpad.style.width = `${size * size_px}px`;

  for (let i = 0; i < size; i++) {
    let row = document.createElement("div");
    row.classList.add("row");
    row.style.height = `${size_px}px`;

    for (let j = 0; j < size; j++) {
      let box = document.createElement("div");
      box.classList.add("box");
      box.style.width = `${size_px}px`;
      box.addEventListener(
        "mouseover",
        () => (box.style.background = "#000000")
      );

      row.append(box);
    }
    sketchpad.append(row);
  }
}

makeGrid(SIZE);

sizeButton.addEventListener("click", () => {
  const sizeUser = prompt("Enter the number of squares per side for the grid:");
  if (sizeUser > MAX_SIZE)
    alert(`Please enter a smaller size, maximum is ${MAX_SIZE}.`);
  else {
    Array.from(sketchpad.children).forEach((element) => element.remove());
    makeGrid(sizeUser);
  }
});
