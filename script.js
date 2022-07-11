const c0  = document.getElementById("can0");
const ctx = c0.getContext("2d");

let crown = new Image();
crown.src = "crown.png"; // Crown icon

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
let killStreakOn = false;

let redsTurn = true;
let potentialKillCoords = []; // Double digit form
let potentialCasualty   = [];

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
    if(!killStreakOn && redsTurn && (board[y][x] != null && board[y][x].colorBoolean == true)) { // Can check color of coordinate because JS first eval:s the first condition
      if(x == lastClickedX && y == lastClickedY) {
        drawChecker(board[y][x]);
        lastClickedX = -1;
        lastClickedY = -1;
        if(0 <= y - 1) setResetHighLight(x, y, "Tan", false);
        if(potentialKillCoords.length != 0) potentialKillCoords = resetPotentialKillMarkerAndCasualty(potentialKillCoords);
        //EligbleMove1 = [-1, -1];
        //EligbleMove2 = [-1, -1];
      } else if(!killStreakOn) {
        if(lastClickedY != -1) {
          drawChecker(board[lastClickedY][lastClickedX]);
          if(0 <= lastClickedY - 1) setResetHighLight(lastClickedX, lastClickedY, "Tan", false);
          if(potentialKillCoords.length != 0) potentialKillCoords = resetPotentialKillMarkerAndCasualty(potentialKillCoords);
        }
        selectedChecker(x, y);
        //EligbleMove1 = [-1, -1];
        //EligbleMove2 = [-1, -1];
        if(0 <= y - 1) setResetHighLight(x, y, "#9fd38d", true);
        if(0 <= y - 2) potentialKill(x, y, 1, false);
        lastClickedX = x;
        lastClickedY = y;
      }
      //console.log("x: " + x + " y: " + y);
    }

    // Move checker piece uppwards
    if(!killStreakOn && redsTurn && ((EligbleMove1[0] == x && EligbleMove1[1] == y) || (EligbleMove2[0] == x && EligbleMove2[1] == y))) {
      drawEmptyTile(lastClickedX, lastClickedY);
      setResetHighLight(lastClickedX, lastClickedY, "Tan", false);

      board[y][x]   = board[lastClickedY][lastClickedX];
      board[y][x].i = x;
      board[y][x].j = y;
      board[lastClickedY][lastClickedX] = null;
      lastClickedX = -1;
      lastClickedY = -1;
      if(potentialKillCoords.length != 0) potentialKillCoords = resetPotentialKillMarkerAndCasualty(potentialKillCoords);
      drawChecker(board[y][x]);
      redsTurn = false;

      if(y == 0 || y == 8) {
        board[y][x].isKing = true;
        ctx.drawImage(crown, halfWaySideLengthOfSquare + x * sideLengthOfSquare - 15, halfWaySideLengthOfSquare + y * sideLengthOfSquare - 15, 30, 30);
        console.log("Draw crown");
      }
      return;
    }

    // Change color and design for BLACK CHECKER
    if(!killStreakOn && !redsTurn && (board[y][x] != null && board[y][x].colorBoolean == false)) { // Can check color of coordinate because JS first eval:s the first condition
      console.log(2);
      if(x == lastClickedX && y == lastClickedY) {
        drawChecker(board[y][x]);
        lastClickedX = -1;
        lastClickedY = -1;
        if(y + 1 < 8) setResetHighLightForBlack(x, y, "Tan", false);
        if(potentialKillCoords.length != 0) potentialKillCoords = resetPotentialKillMarkerAndCasualty(potentialKillCoords);
        //EligbleMove1 = [-1, -1];
        //EligbleMove2 = [-1, -1];
      } else {
        if(lastClickedY != -1) {
          drawChecker(board[lastClickedY][lastClickedX]);
          if(lastClickedY + 1 < 8) setResetHighLightForBlack(lastClickedX, lastClickedY, "Tan", false);
          if(potentialKillCoords.length != 0) potentialKillCoords = resetPotentialKillMarkerAndCasualty(potentialKillCoords);
        }
        selectedChecker(x, y);
        //EligbleMove1 = [-1, -1];
        //EligbleMove2 = [-1, -1];
        if(y + 1 < 8) setResetHighLightForBlack(x, y, "#9fd38d", true);
        if(y + 2 < 8) potentialKill(x, y, -1, false);
        lastClickedX = x;
        lastClickedY = y;
      }
      //console.log("x: " + x + " y: " + y);
    }
    if(!killStreakOn && !redsTurn && ((EligbleMove1[0] == x && EligbleMove1[1] == y) || (EligbleMove2[0] == x && EligbleMove2[1] == y))) {
      drawEmptyTile(lastClickedX, lastClickedY);
      setResetHighLightForBlack(lastClickedX, lastClickedY, "Tan", false);

      board[y][x]   = board[lastClickedY][lastClickedX];
      board[y][x].i = x;
      board[y][x].j = y;
      board[lastClickedY][lastClickedX] = null;
      lastClickedX = -1;
      lastClickedY = -1;
      if(potentialKillCoords.length != 0) potentialKillCoords = resetPotentialKillMarkerAndCasualty(potentialKillCoords);
      drawChecker(board[y][x]);
      redsTurn = true;
      return;
    }

    if(potentialKillCoords.includes((x * 10) + y)) {
      eliminateChecker(x, y, potentialKillCoords);
      drawEmptyTile(lastClickedX, lastClickedY);
      potentialKillCoords = [];

      if(redsTurn) setResetHighLight(lastClickedX, lastClickedY);
      else setResetHighLightForBlack(lastClickedX, lastClickedY);

      board[y][x]   = board[lastClickedY][lastClickedX];
      board[y][x].i = x;
      board[y][x].j = y;
      board[lastClickedY][lastClickedX] = null;
      lastClickedX = -1;
      lastClickedY = -1;

      drawChecker(board[y][x]);
      checkForMultiKill(x, y, (redsTurn ? 1 : -1), false);
      if(killStreakOn) {
        lastClickedX = x;
        lastClickedY = y;
      }
      redsTurn = (killStreakOn ? redsTurn : !redsTurn);
      console.log("-><-");
      if(y == 0 || y == 8) {
        board[y][x].isKing = true;
        ctx.drawImage(crown, halfWaySideLengthOfSquare + x * sideLengthOfSquare - 15, halfWaySideLengthOfSquare + y * sideLengthOfSquare - 15, 30, 30);
        console.log("Draw crown");
      }
    }
});

function setResetHighLight(x, y, color, IsGoingToRecordMove) {
  ctx.fillStyle = color;
  // Going Upwards
  if(0 <= x - 1 && board[y - 1][x - 1] == null) {
    ctx.fillRect((x - 1) * sideLengthOfSquare, (y - 1) * sideLengthOfSquare, sideLengthOfSquare, sideLengthOfSquare);
    EligbleMove1 = [IsGoingToRecordMove ? x - 1 : -1, IsGoingToRecordMove ? y - 1 : -1];
  }

  if(8 >  x + 1 && board[y - 1][x + 1] == null) {
    ctx.fillRect((x + 1) * sideLengthOfSquare, (y - 1) * sideLengthOfSquare, sideLengthOfSquare, sideLengthOfSquare);
    EligbleMove2 = [IsGoingToRecordMove ? x + 1 : -1, IsGoingToRecordMove ? y - 1 : -1];
  }
}

function setResetHighLightForBlack(x, y, color, IsGoingToRecordMove) {
  ctx.fillStyle = color;
  // Going downwards
  if(0 <= x - 1 && board[y + 1][x - 1] == null) {
    ctx.fillRect((x - 1) * sideLengthOfSquare, (y + 1) * sideLengthOfSquare, sideLengthOfSquare, sideLengthOfSquare);
    EligbleMove1 = [IsGoingToRecordMove ? x - 1 : -1, IsGoingToRecordMove ? y + 1 : -1];
  }
  if(8 >  x + 1 && board[y + 1][x + 1] == null) {
    ctx.fillRect((x + 1) * sideLengthOfSquare, (y + 1) * sideLengthOfSquare, sideLengthOfSquare, sideLengthOfSquare);
    EligbleMove2 = [IsGoingToRecordMove ? x + 1 : -1, IsGoingToRecordMove ? y + 1 : -1];
  }

}

function potentialKill(x, y, dy, isKing) {
  if(0 <= x - 2 && 0 <= y - 2 * dy && y - 2 * dy < 8 && board[y - 1 * dy][x - 1] != null && board[y - 1 * dy][x - 1].colorBoolean == (dy == -1) && board[y - 2 * dy][x - 2] == null) {
    ctx.fillStyle = "#d38d8d";
    ctx.fillRect((x - 2) * sideLengthOfSquare, (y - 2 * dy) * sideLengthOfSquare, sideLengthOfSquare, sideLengthOfSquare);
    potentialKillCoords.push(10 * (x - 2) + (y - 2 * dy));
    potentialCasualty.push(board[y - 1 * dy][x - 1]);
    killStreakOn = true;
  }
  // Upper right kill
  if(0 <= x + 2 && 0 <= y - 2 * dy && y - 2 * dy < 8 && board[y - 1 * dy][x + 1] != null && board[y - 1 * dy][x + 1].colorBoolean == (dy == -1) && board[y - 2 * dy][x + 2] == null) {
    ctx.fillStyle = "#d38d8d";
    ctx.fillRect((x + 2) * sideLengthOfSquare, (y - 2 * dy) * sideLengthOfSquare, sideLengthOfSquare, sideLengthOfSquare);
    potentialKillCoords.push(10 * (x + 2) + (y - 2 * dy));
    potentialCasualty.push(board[y - 1 * dy][x + 1]);
    killStreakOn = true;
  }
}

function potentialKillForBlack(x, y) {
  // Lower left kill
  if(0 <= x - 2 && board[y + 1][x - 1] != null && board[y + 1][x - 1].colorBoolean == true && board[y + 2][x - 2] == null) {
    ctx.fillStyle = "#d38d8d";
    ctx.fillRect((x - 2) * sideLengthOfSquare, (y + 2) * sideLengthOfSquare, sideLengthOfSquare, sideLengthOfSquare);
    potentialKillCoords.push(10 * (x - 2) + (y + 2));
    potentialCasualty.push(board[y + 1][x - 1]);
  }
  // Lower right kill
  if(0 <= x + 2 && board[y + 1][x + 1] != null && board[y + 1][x + 1].colorBoolean == true && board[y + 2][x + 2] == null) {
    ctx.fillStyle = "#d38d8d";
    ctx.fillRect((x + 2) * sideLengthOfSquare, (y + 2) * sideLengthOfSquare, sideLengthOfSquare, sideLengthOfSquare);
    potentialKillCoords.push(10 * (x + 2) + (y + 2));
    potentialCasualty.push(board[y + 1][x + 1]);
  }
}

function resetPotentialKillMarkerAndCasualty(arr) {
  for(let i = 0; i < arr.length; i++) {
    drawEmptyTile(Math.floor(arr[i] / 10), arr[i] % 10);
  }
  potentialCasualty = [];
  return [];
}

function eliminateChecker(x, y, arr) {
  let indx = arr.indexOf((x * 10) + y);
  if(indx != -1) {
    let recentlyEliminatedChecker = potentialCasualty[indx];
    board[recentlyEliminatedChecker.j][recentlyEliminatedChecker.i] = null;
    resetPotentialKillMarkerAndCasualty(arr);
    drawEmptyTile(recentlyEliminatedChecker.i, recentlyEliminatedChecker.j);
  }
}

function checkForMultiKill(x, y, dy, isKing) {
  killStreakOn = false;
  if(0 <= x - 2 && 0 <= y - 2 * dy && y - 2 * dy < 8 && board[y - 1 * dy][x - 1] != null && board[y - 1 * dy][x - 1].colorBoolean == (dy == -1) && board[y - 2 * dy][x - 2] == null) {
    ctx.fillStyle = "#d38d8d";
    ctx.fillRect((x - 2) * sideLengthOfSquare, (y - 2 * dy) * sideLengthOfSquare, sideLengthOfSquare, sideLengthOfSquare);
    potentialKillCoords.push(10 * (x - 2) + (y - 2 * dy));
    potentialCasualty.push(board[y - 1 * dy][x - 1]);
    killStreakOn = true;
  }
  if(0 <= x + 2 && 0 <= y - 2 * dy && y - 2 * dy < 8 && board[y - 1 * dy][x + 1] != null && board[y - 1 * dy][x + 1].colorBoolean == (dy == -1) && board[y - 2 * dy][x + 2] == null) {
    ctx.fillStyle = "#d38d8d";
    ctx.fillRect((x + 2) * sideLengthOfSquare, (y - 2 * dy) * sideLengthOfSquare, sideLengthOfSquare, sideLengthOfSquare);
    potentialKillCoords.push(10 * (x + 2) + (y - 2 * dy));
    potentialCasualty.push(board[y - 1 * dy][x + 1]);
    killStreakOn = true;
  }
  console.log("makhmadim");
}

function drawEmptyTile(x, y) {
  ctx.fillStyle = "Tan";
  ctx.fillRect(x * sideLengthOfSquare, y * sideLengthOfSquare, sideLengthOfSquare, sideLengthOfSquare);
}

// Fix: King icon shouldn't be painted over
//      Something wrong with black checker when reaching kings row, killStreakOn should be false 
