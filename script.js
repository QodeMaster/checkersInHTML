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
  if(checkPiece.isKing) ctx.drawImage(crown, halfWaySideLengthOfSquare + checkPiece.i * sideLengthOfSquare - 15, halfWaySideLengthOfSquare + checkPiece.j * sideLengthOfSquare - 15, 30, 30);
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
  if(board[y][x].isKing) ctx.drawImage(crown, halfWaySideLengthOfSquare + x * sideLengthOfSquare - 15, halfWaySideLengthOfSquare + y * sideLengthOfSquare - 15, 30, 30);
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

    // Double click and single click for own checker piece for Red&Black
    if(!killStreakOn && (board[y][x] != null && board[y][x].colorBoolean == redsTurn)) {
      if(x == lastClickedX && y == lastClickedY) {
        drawChecker(board[y][x]);
        lastClickedX = -1;
        lastClickedY = -1;
        setResetHighLight(x, y, "Tan", false, redsTurn ? 1 : -1);
        if(potentialKillCoords.length != 0) potentialKillCoords = resetPotentialKillMarkerAndCasualty(potentialKillCoords);
        //EligbleMove1 = [-1, -1];
        //EligbleMove2 = [-1, -1];
      } else if(!killStreakOn) {
        if(lastClickedY != -1) {
          drawChecker(board[lastClickedY][lastClickedX]);
          setResetHighLight(lastClickedX, lastClickedY, "Tan", false, redsTurn ? 1 : -1);
          if(potentialKillCoords.length != 0) potentialKillCoords = resetPotentialKillMarkerAndCasualty(potentialKillCoords);
        }
        selectedChecker(x, y);
        //EligbleMove1 = [-1, -1];
        //EligbleMove2 = [-1, -1];
        setResetHighLight(x, y, "#9fd38d", true, redsTurn ? 1 : -1);
        potentialKill(x, y, redsTurn ? 1 : -1, board[y][x].isKing, false);
        lastClickedX = x;
        lastClickedY = y;
      }
    }

    // Move checker piece for Red&Black
    if(!killStreakOn 
      &&((EligbleMove1[0] == x && EligbleMove1[1] == y) 
      || (EligbleMove2[0] == x && EligbleMove2[1] == y)
      || (EligbleMove3[0] == x && EligbleMove3[1] == y)
      || (EligbleMove4[0] == x && EligbleMove4[1] == y))) {
      drawEmptyTile(lastClickedX, lastClickedY);
      setResetHighLight(lastClickedX, lastClickedY, "Tan", false, redsTurn ? 1 : -1);

      board[y][x]   = board[lastClickedY][lastClickedX];
      board[y][x].i = x;
      board[y][x].j = y;
      board[lastClickedY][lastClickedX] = null;
      lastClickedX = -1;
      lastClickedY = -1;
      if(potentialKillCoords.length != 0) potentialKillCoords = resetPotentialKillMarkerAndCasualty(potentialKillCoords);
      drawChecker(board[y][x]);
      redsTurn = !redsTurn;

      if(!board[y][x].isKing && (y == 0 || y == 7)) {
        board[y][x].isKing = true;
        ctx.drawImage(crown, halfWaySideLengthOfSquare + x * sideLengthOfSquare - 15, halfWaySideLengthOfSquare + y * sideLengthOfSquare - 15, 30, 30);
        console.log("Draw crown");
      }
      return;
    }

    if(potentialKillCoords.includes((x * 10) + y)) {
      eliminateChecker(x, y, potentialKillCoords);
      drawEmptyTile(lastClickedX, lastClickedY);
      potentialKillCoords = [];

      setResetHighLight(lastClickedX, lastClickedY, "Tan", false, redsTurn ? 1 : -1);

      board[y][x]   = board[lastClickedY][lastClickedX];
      board[y][x].i = x;
      board[y][x].j = y;
      board[lastClickedY][lastClickedX] = null;
      lastClickedX = -1;
      lastClickedY = -1;

      drawChecker(board[y][x]);
      potentialKill(x, y, (redsTurn ? 1 : -1), board[y][x].isKing, true);
      if(killStreakOn) {
        lastClickedX = x;
        lastClickedY = y;
      }
      redsTurn = (killStreakOn ? redsTurn : !redsTurn);
      console.log("-><-");
      if(!board[y][x].isKing && (y == 0 || y == 7)) {
        board[y][x].isKing = true;
        ctx.drawImage(crown, halfWaySideLengthOfSquare + x * sideLengthOfSquare - 15, halfWaySideLengthOfSquare + y * sideLengthOfSquare - 15, 30, 30);
        console.log("Draw crown");
      }
    }
});

function setResetHighLight(x, y, color, IsGoingToRecordMove, dy) {
  ctx.fillStyle = color;
  // Going Upwards
  console.log(y - 1 * dy);
  if(0 <= y - 1 * dy && y - 1 * dy < 8) {

    if(0 <= x - 1 && board[y - 1 * dy][x - 1] == null) {
      ctx.fillRect((x - 1) * sideLengthOfSquare, (y - 1 * dy) * sideLengthOfSquare, sideLengthOfSquare, sideLengthOfSquare);
      EligbleMove1 = [IsGoingToRecordMove ? x - 1 : -1, IsGoingToRecordMove ? y - 1 * dy : -1];
    }

    if(8 >  x + 1 && board[y - 1 * dy][x + 1] == null) {
      ctx.fillRect((x + 1) * sideLengthOfSquare, (y - 1 * dy) * sideLengthOfSquare, sideLengthOfSquare, sideLengthOfSquare);
      EligbleMove2 = [IsGoingToRecordMove ? x + 1 : -1, IsGoingToRecordMove ? y - 1 * dy : -1];
    }
  } 

  if(board[y][x].isKing && (0 <= y + 1 * dy && y + 1 * dy < 8)) { // Kings can move forwards and backwards
    console.log("backwards");
    if(0 <= x - 1 && board[y + 1 * dy][x - 1] == null) {
      ctx.fillRect((x - 1) * sideLengthOfSquare, (y + 1 * dy) * sideLengthOfSquare, sideLengthOfSquare, sideLengthOfSquare);
      EligbleMove3 = [IsGoingToRecordMove ? x - 1 : -1, IsGoingToRecordMove ? y + 1 * dy : -1];
    }

    if(8 >  x + 1 && board[y + 1 * dy][x + 1] == null) {
      ctx.fillRect((x + 1) * sideLengthOfSquare, (y + 1 * dy) * sideLengthOfSquare, sideLengthOfSquare, sideLengthOfSquare);
      EligbleMove4 = [IsGoingToRecordMove ? x + 1 : -1, IsGoingToRecordMove ? y + 1 * dy : -1];
    }
  }
}

/*function potentialKill(x, y, dy, isKing) {
  ctx.fillStyle = "#d38d8d";
  if(0 <= x - 2 && 0 <= y - 2 * dy && y - 2 * dy < 8 && board[y - 1 * dy][x - 1] != null && board[y - 1 * dy][x - 1].colorBoolean == (dy == -1) && board[y - 2 * dy][x - 2] == null) {
    
    ctx.fillRect((x - 2) * sideLengthOfSquare, (y - 2 * dy) * sideLengthOfSquare, sideLengthOfSquare, sideLengthOfSquare);
    potentialKillCoords.push(10 * (x - 2) + (y - 2 * dy));
    potentialCasualty.push(board[y - 1 * dy][x - 1]);
  }
  // Upper right kill
  if(x + 2 < 8 && 0 <= y - 2 * dy && y - 2 * dy < 8 && board[y - 1 * dy][x + 1] != null && board[y - 1 * dy][x + 1].colorBoolean == (dy == -1) && board[y - 2 * dy][x + 2] == null) {
    ctx.fillRect((x + 2) * sideLengthOfSquare, (y - 2 * dy) * sideLengthOfSquare, sideLengthOfSquare, sideLengthOfSquare);
    potentialKillCoords.push(10 * (x + 2) + (y - 2 * dy));
    potentialCasualty.push(board[y - 1 * dy][x + 1]);
  }

  if(isKing) {
    if(0 <= x - 2 && 0 <= y + 2 * dy && y + 2 * dy < 8 && board[y + 1 * dy][x - 1] != null && board[y + 1 * dy][x - 1].colorBoolean == (dy == -1) && board[y + 2 * dy][x - 2] == null) {
      ctx.fillRect((x - 2) * sideLengthOfSquare, (y + 2 * dy) * sideLengthOfSquare, sideLengthOfSquare, sideLengthOfSquare);
      potentialKillCoords.push(10 * (x - 2) + (y + 2 * dy));
      potentialCasualty.push(board[y + 1 * dy][x - 1]);
    }
    // Upper right kill
    if(x + 2 < 8 && 0 <= y + 2 * dy && y + 2 * dy < 8 && board[y + 1 * dy][x + 1] != null && board[y + 1 * dy][x + 1].colorBoolean == (dy == -1) && board[y + 2 * dy][x + 2] == null) {
      ctx.fillRect((x + 2) * sideLengthOfSquare, (y + 2 * dy) * sideLengthOfSquare, sideLengthOfSquare, sideLengthOfSquare);
      potentialKillCoords.push(10 * (x + 2) + (y + 2 * dy));
      potentialCasualty.push(board[y + 1 * dy][x + 1]);
    }
  }
}*/

function potentialKill(x, y, dy, isKing, isCheckingForMultiKill) {
  ctx.fillStyle = "#d38d8d";
  if(isCheckingForMultiKill) killStreakOn = false;

  for(let i = -2; i <= 2; i+=4) {
    for(let j = -2; j <= (isKing ? 2 : 0); j+=4) {
      if(0 <= x + i && x + i < 8                                   // Is the x-cord within its bounds?
        && 0 <= y + j * dy && y + j * dy < 8                       // Is the y-cord within its bounds?
        && board[y + j/2 * dy][x + i/2] != null                    // Is there a checker piece to the spot adjacent to you?
        && board[y + j/2 * dy][x + i/2].colorBoolean == (dy == -1) // Is that checker piece an enemy?
        && board[y + j * dy][x + i] == null) {                     // Is the spot behind the enemy checker empty?
      
        ctx.fillRect((x + i) * sideLengthOfSquare, (y + j * dy) * sideLengthOfSquare, sideLengthOfSquare, sideLengthOfSquare);
        potentialKillCoords.push(10 * (x + i) + (y + j * dy));
        potentialCasualty.push(board[y + j/2 * dy][x + i/2]);
        if(isCheckingForMultiKill) killStreakOn = true;
      }
    }
  }

  /*if(isKing) {
    if(0 <= x - 2 && 0 <= y + 2 * dy && y + 2 * dy < 8 && board[y + 1 * dy][x - 1] != null && board[y + 1 * dy][x - 1].colorBoolean == (dy == -1) && board[y + 2 * dy][x - 2] == null) {
      ctx.fillRect((x - 2) * sideLengthOfSquare, (y + 2 * dy) * sideLengthOfSquare, sideLengthOfSquare, sideLengthOfSquare);
      potentialKillCoords.push(10 * (x - 2) + (y + 2 * dy));
      potentialCasualty.push(board[y + 1 * dy][x - 1]);
    }
    // Upper right kill
    if(x + 2 < 8 && 0 <= y + 2 * dy && y + 2 * dy < 8 && board[y + 1 * dy][x + 1] != null && board[y + 1 * dy][x + 1].colorBoolean == (dy == -1) && board[y + 2 * dy][x + 2] == null) {
      ctx.fillRect((x + 2) * sideLengthOfSquare, (y + 2 * dy) * sideLengthOfSquare, sideLengthOfSquare, sideLengthOfSquare);
      potentialKillCoords.push(10 * (x + 2) + (y + 2 * dy));
      potentialCasualty.push(board[y + 1 * dy][x + 1]);
    }
  }*/
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
  ctx.fillStyle = "#d38d8d";
  if(0 <= x - 2 && 0 <= y - 2 * dy && y - 2 * dy < 8 && board[y - 1 * dy][x - 1] != null && board[y - 1 * dy][x - 1].colorBoolean == (dy == -1) && board[y - 2 * dy][x - 2] == null) {
    ctx.fillRect((x - 2) * sideLengthOfSquare, (y - 2 * dy) * sideLengthOfSquare, sideLengthOfSquare, sideLengthOfSquare);
    potentialKillCoords.push(10 * (x - 2) + (y - 2 * dy));
    potentialCasualty.push(board[y - 1 * dy][x - 1]);
    killStreakOn = true;
    console.log("x-");
  }
  if(x + 2 < 8 && 0 <= y - 2 * dy && y - 2 * dy < 8 && board[y - 1 * dy][x + 1] != null && board[y - 1 * dy][x + 1].colorBoolean == (dy == -1) && board[y - 2 * dy][x + 2] == null) {
    ctx.fillRect((x + 2) * sideLengthOfSquare, (y - 2 * dy) * sideLengthOfSquare, sideLengthOfSquare, sideLengthOfSquare);
    potentialKillCoords.push(10 * (x + 2) + (y - 2 * dy));
    potentialCasualty.push(board[y - 1 * dy][x + 1]);
    killStreakOn = true;
    console.log("-x");
  }

  if(isKing) {
    if(0 <= x - 2 && 0 <= y + 2 * dy && y + 2 * dy < 8 && board[y + 1 * dy][x - 1] != null && board[y + 1 * dy][x - 1].colorBoolean == (dy == -1) && board[y + 2 * dy][x - 2] == null) {
      ctx.fillRect((x - 2) * sideLengthOfSquare, (y + 2 * dy) * sideLengthOfSquare, sideLengthOfSquare, sideLengthOfSquare);
      potentialKillCoords.push(10 * (x - 2) + (y + 2 * dy));
      potentialCasualty.push(board[y + 1 * dy][x - 1]);
      killStreakOn = true;
      console.log("x-");
    }
    if(x + 2 < 8 && 0 <= y + 2 * dy && y + 2 * dy < 8 && board[y + 1 * dy][x + 1] != null && board[y + 1 * dy][x + 1].colorBoolean == (dy == -1) && board[y + 2 * dy][x + 2] == null) {
      ctx.fillRect((x + 2) * sideLengthOfSquare, (y + 2 * dy) * sideLengthOfSquare, sideLengthOfSquare, sideLengthOfSquare);
      potentialKillCoords.push(10 * (x + 2) + (y + 2 * dy));
      potentialCasualty.push(board[y + 1 * dy][x + 1]);
      killStreakOn = true;
      console.log("-x");
    }
  }
  console.log("makhmadim");
}

function drawEmptyTile(x, y) {
  ctx.fillStyle = "Tan";
  ctx.fillRect(x * sideLengthOfSquare, y * sideLengthOfSquare, sideLengthOfSquare, sideLengthOfSquare);
}
