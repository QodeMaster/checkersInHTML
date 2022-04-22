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
let EligbleMove1 = [-1, -1];
let EligbleMove2 = [-1, -1];
let EligbleMove3 = [-1, -1]; // If checker is King
let EligbleMove4 = [-1, -1]; // If checker is King

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
    // Change color and design
    if(board[y][x] != null && board[y][x].colorBoolean == true) { // Can check color of coordinate because JS first eval:s the first condition
      if(x == lastClickedX && y == lastClickedY) {
        drawChecker(board[y][x]);
        lastClickedX = -1;
        lastClickedY = -1;
        if(0 <= y - 1) setResetHighLight(x, y, "Tan", false);
        //EligbleMove1 = [-1, -1];
        //EligbleMove2 = [-1, -1];
      } else {
        if(lastClickedY != -1) {
          drawChecker(board[lastClickedY][lastClickedX]);
          if(0 <= lastClickedY - 1) setResetHighLight(lastClickedX, lastClickedY, "Tan", false);
        }
        selectedChecker(x, y);
        //EligbleMove1 = [-1, -1];
        //EligbleMove2 = [-1, -1];
        if(0 <= y - 1) setResetHighLight(x, y, "#9fd38d", true);
        lastClickedX = x;
        lastClickedY = y;
      }
      //console.log("x: " + x + " y: " + y);
    }

    // Move checker piece uppwards
    if((EligbleMove1[0] == x && EligbleMove1[1] == y) || (EligbleMove2[0] == x && EligbleMove2[1] == y)) {
      drawEmptyTile(lastClickedX, lastClickedY);
      setResetHighLight(lastClickedX, lastClickedY, "Tan", false);

      board[y][x]   = board[lastClickedY][lastClickedX];
      board[y][x].i = x;
      board[y][x].j = y;
      board[lastClickedY][lastClickedX] = null;
      lastClickedX = -1;
      lastClickedY = -1;

      drawChecker(board[y][x]);

    }
});

function setResetHighLight(x, y, color, IsGoingToRecordMove) {
  ctx.fillStyle = color;
  if(0 <= x - 1 && board[y - 1][x - 1] == null) {
    ctx.fillRect((x - 1) * sideLengthOfSquare, (y - 1) * sideLengthOfSquare, sideLengthOfSquare, sideLengthOfSquare);
    EligbleMove1 = [IsGoingToRecordMove ? x - 1 : -1, IsGoingToRecordMove ? y - 1 : -1];
  }
  if(8 >  x + 1 && board[y - 1][x + 1] == null) {
    ctx.fillRect((x + 1) * sideLengthOfSquare, (y - 1) * sideLengthOfSquare, sideLengthOfSquare, sideLengthOfSquare);
    EligbleMove2 = [IsGoingToRecordMove ? x + 1 : -1, IsGoingToRecordMove ? y - 1 : -1];
  }
}

function drawEmptyTile(x, y) {
  ctx.fillStyle = "Tan";
  ctx.fillRect(x * sideLengthOfSquare, y * sideLengthOfSquare, sideLengthOfSquare, sideLengthOfSquare);
}
