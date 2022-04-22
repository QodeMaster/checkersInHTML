const c0  = document.getElementById("can0");
const ctx = c0.getContext("2d");

/* Canvas specs */
const width  = c0.width;
const height = c0.height;

const board = [
              [null, null, null, null, null, null, null, null],
              [null, null, null, null, null, null, null, null],
              [null, null, null, null, null, null, null, null],
              [null, null, null, null, null, null, null, null],
              [null, null, null, null, null, null, null, null],
              [null, null, null, null, null, null, null, null],
              [null, null, null, null, null, null, null, null],
              [null, null, null, null, null, null, null, null]
];

const sideLengthOfSquare        = width / 8;  // 50px
const halfWaySideLengthOfSquare = width / 16; // 25px
const checkerRadius             = 20;

/* User info */
let lastClickedX = -1;
let lastClickedY = -1;

function initializeConfiguaration() {
  drawBoard();
  for(let i = 0; i < 3; i++) {
    for(let j = (1 + i) % 2; j < 8; j+=2) {
      let checker = new Checker(j, i, false); // Black Checker
      board[i][j] = checker;
      drawChecker(checker);
    }
  }
  for(let i = 5; i < 8; i++) {
    for(let j = (1 + i) % 2; j < 8; j+=2) {
      let checker = new Checker(j, i, true); // Red Checker
      board[i][j] = checker;
      drawChecker(checker);
    }
  }
}

function drawBoard() {
	for(let i = 0; i < height/sideLengthOfSquare; i++) {
    for(let j = 0; j < width/sideLengthOfSquare; j++) {
      ctx.fillStyle = ((i + j) % 2 == 0 ? "Moccasin" : "Tan");
      ctx.fillRect(i * sideLengthOfSquare, j * sideLengthOfSquare, sideLengthOfSquare, sideLengthOfSquare);
    }
  }
}

function drawChecker(checkPiece) {
  ctx.fillStyle = (checkPiece.colorBoolean ? "Red" : "Black");
  ctx.beginPath();
  ctx.arc(halfWaySideLengthOfSquare + checkPiece.i * sideLengthOfSquare,
          halfWaySideLengthOfSquare + checkPiece.j * sideLengthOfSquare,
          checkerRadius,
          0,
          Math.PI*2);
  ctx.fill(); // No need for closePath();
}

function selectedChecker(x, y) {
  ctx.fillStyle = "#fff";
  ctx.beginPath();
  ctx.arc(halfWaySideLengthOfSquare + x * sideLengthOfSquare,
          halfWaySideLengthOfSquare + y * sideLengthOfSquare,
          10,
          0,
          Math.PI*2);
  ctx.fill(); // No need for closePath();
}

class Checker {
  constructor(i, j, colorBoolean) {
    this.i = i;
    this.j = j;
    this.colorBoolean = colorBoolean;
    this.isKing = false;
  }
}

initializeConfiguaration();

c0.addEventListener('mousedown', function(e) {
    const rect = c0.getBoundingClientRect();
    const x    = Math.floor((e.clientX - rect.left) / sideLengthOfSquare);
    const y    = Math.floor((e.clientY - rect.top)  / sideLengthOfSquare);
    if(board[y][x] != null && board[y][x].colorBoolean == true) { // Can check color of coordinate because JS first eval:s the first condition
      if(x == lastClickedX && y == lastClickedY) {
        drawChecker(board[y][x]);
        lastClickedX = -1;
        lastClickedY = -1;
      } else {
        if(lastClickedY != -1) drawChecker(board[lastClickedY][lastClickedX]);
        selectedChecker(x, y);
        lastClickedX = x;
        lastClickedY = y;
      }
      console.log("x: " + x + " y: " + y);
    }
});
