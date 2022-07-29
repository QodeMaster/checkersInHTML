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
let EligbleMoves = [[-1, -1], [-1, -1], [-1, -1], [-1, -1]]; // x:y coordinates of each of the four directions
let killStreakOn = false;

let redsTurn = true;
let potentialKillCoords = []; // Double digit form
let potentialCasualty   = [];

let reds   = [];
let blacks = [];

/* AI info */
let simulatedArr = []

let simulateLastClickedX = -1;
let simulateLastClickedY = -1;
let bestSimulatedMove    = [[], []]; // Move from to destination 

function initializeConfiguaration() {
  drawBoard();
  for(let i = 0; i < 3; i++) {
    for(let j = (1 + i) % 2; j < 8; j+=2) {
      let checker = new Checker(j, i, false); // Black Checker
      board[i][j] = checker;
      drawChecker(checker);
      //blacks.push(checker);
    }
  }
  for(let i = 5; i < 8; i++) {
    for(let j = (1 + i) % 2; j < 8; j+=2) {
      let checker = new Checker(j, i, true); // Red Checker
      board[i][j] = checker;
      drawChecker(checker);
      //reds.push(checker);
    }
  }
}

function countScore(arr) {
  let count = 0;

  for(let row of arr) {
    for(let tile of row) {
      if(tile != null) {
        if(tile.colorBoolean) {
          count += 2;
          count += (tile.isKing ? 1 : 0);
        } else {
          count -= 2;
          count -= (tile.isKing ? 1 : 0);
        }
      }
    }
  }
  return count;
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
    this.point  = null;
  }
}

initializeConfiguaration();

c0.addEventListener('mousedown', function(e) {
  const rect = c0.getBoundingClientRect();
  const x    = Math.floor((e.clientX - rect.left) / sideLengthOfSquare);
  const y    = Math.floor((e.clientY - rect.top)  / sideLengthOfSquare);
  // Change color and design
  actHandler(x, y);
});

function actHandler(x, y) {
  // Double click and single click for own checker piece for Red&Black to highlight all non-aggresive possible moves
  //console.log(x + ", " + y)
  if(!killStreakOn && (board[y][x] != null && board[y][x].colorBoolean == redsTurn)) {
    if(x == lastClickedX && y == lastClickedY) {
      drawChecker(board[y][x]);
      lastClickedX = -1;
      lastClickedY = -1;
      setResetHighLight(x, y, "Tan", false, redsTurn ? 1 : -1, true, board);
      if(potentialKillCoords.length != 0) potentialKillCoords = resetPotentialKillMarkerAndCasualty(potentialKillCoords);
    } else if(!killStreakOn) {
      if(lastClickedY != -1) {
        drawChecker(board[lastClickedY][lastClickedX]);
        setResetHighLight(lastClickedX, lastClickedY, "Tan", false, redsTurn ? 1 : -1, true, board);
        if(potentialKillCoords.length != 0) potentialKillCoords = resetPotentialKillMarkerAndCasualty(potentialKillCoords);
      }
      selectedChecker(x, y);
      setResetHighLight(x, y, "#9fd38d", true, redsTurn ? 1 : -1, true, board);
      potentialKill(x, y, redsTurn ? 1 : -1, board[y][x].isKing, false, true);
      lastClickedX = x;
      lastClickedY = y;
    }
  }

  // Move checker piece for Red&Black
  if(!killStreakOn 
    &&((EligbleMoves[0][0] == x && EligbleMoves[0][1] == y) 
    || (EligbleMoves[1][0] == x && EligbleMoves[1][1] == y)
    || (EligbleMoves[2][0] == x && EligbleMoves[2][1] == y)
    || (EligbleMoves[3][0] == x && EligbleMoves[3][1] == y))) {
    drawEmptyTile(lastClickedX, lastClickedY);
    setResetHighLight(lastClickedX, lastClickedY, "Tan", false, redsTurn ? 1 : -1, true, board);

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
    if(!redsTurn) {
      heuristics();
    }
    return;
  }

  if(potentialKillCoords.includes((x * 10) + y)) {
    eliminateChecker(x, y, potentialKillCoords);
    drawEmptyTile(lastClickedX, lastClickedY);
    potentialKillCoords = [];

    setResetHighLight(lastClickedX, lastClickedY, "Tan", false, redsTurn ? 1 : -1, true, board);

    board[y][x]   = board[lastClickedY][lastClickedX];
    board[y][x].i = x;
    board[y][x].j = y;
    board[lastClickedY][lastClickedX] = null;
    lastClickedX = -1;
    lastClickedY = -1;

    drawChecker(board[y][x]);
    potentialKill(x, y, (redsTurn ? 1 : -1), board[y][x].isKing, true, true);
    if(killStreakOn) {
      lastClickedX = x;
      lastClickedY = y;
      bestSimulatedMove = [[], []];
    }
    redsTurn = (killStreakOn ? redsTurn : !redsTurn);
    if(!board[y][x].isKing && (y == 0 || y == 7)) {
      board[y][x].isKing = true;
      ctx.drawImage(crown, halfWaySideLengthOfSquare + x * sideLengthOfSquare - 15, halfWaySideLengthOfSquare + y * sideLengthOfSquare - 15, 30, 30);
      console.log("Draw crown");
    }
  }
}

///////////////////////////////////////////
/*----------HEURISTIC FUNCTIONS----------*/
///////////////////////////////////////////

function heuristics() { // WORK HERE !!!
  // Copy board
  simulatedArr = deepCopy(board);
  let minPointMove = 30;
  let points;
  
  for(let i = 0; i < board.length; i++) {
    for(let j = 0; j < board[0].length; j++) {
      if(board[i][j] != null && !board[i][j].colorBoolean) {

        select(j, i);
        // Exmaine kills, potential kills are not stored in EligbleMoves array
        let simulatedPotentialKillCoords = potentialKillCoords.slice();

        for(let kill of simulatedPotentialKillCoords) {

          //console.log("SpineKill" + simulatedPotentialKillCoords);
          simulateKill(~~(kill / 10), kill % 10);
          points = countScore(simulatedArr);
          console.log(simulatedArr);
          console.log(points + ", " + minPointMove);
          if(points < minPointMove) {
            minPointMove = points;
            bestSimulatedMove[0] = [i, j];
            bestSimulatedMove[1] = [kill % 10, ~~(kill / 10)];
            console.log(bestSimulatedMove);
          }
          simulatedArr = deepCopy(board); // Reset board
        }

        // Examine each of the four moves
        //console.log(EligbleMoves);
        for(let move of EligbleMoves) {
          
          if(move[0] != -1) {
            
            simulateMove(move[0], move[1]);
            points = countScore(simulatedArr);
            if(points < minPointMove) {
              //console.log(`${i}, ${j} -> ${move[1]}, ${move[0]}`);
              minPointMove = points;
              bestSimulatedMove[0] = [i, j];
              bestSimulatedMove[1] = [move[1], move[0]];
              console.log(bestSimulatedMove);
            }
            simulatedArr = deepCopy(board); // Reset board
          }
        }
      }
    }
  }
  //console.log(bestSimulatedMove);
  setTimeout(actHandler, 1  , bestSimulatedMove[0][1], bestSimulatedMove[0][0]);
  setTimeout(actHandler, 200, bestSimulatedMove[1][1], bestSimulatedMove[1][0]);
}  
// Heuristic without graphics to reduce lag

function select(x, y) {
  //console.log(arr[y][x]);
  simulatePotentialKill(x, y, simulatedArr[y][x].isKing, false, simulatedArr);
  // Find a way to fill EligbleMoves array
  setResetHighLight(x, y, "Tan", true, -1, false, simulatedArr);
  simulateLastClickedX = x;
  simulateLastClickedY = y;
}

function deepCopy(array) {
  let arr = [];
  for(let row of array) arr.push(row.slice());
  return arr;
}

function simulateMove(x, y) {
  // setResetHighLight(lastClickedX, lastClickedY, "Tan", false, redsTurn ? 1 : -1, true, board); Is reduntant?
  simulatedArr[y][x]   = simulatedArr[simulateLastClickedY][simulateLastClickedX];
  simulatedArr[y][x].i = x;
  simulatedArr[y][x].j = y;
  simulatedArr[simulateLastClickedY][simulateLastClickedX] = null;
  //simulateLastClickedX = -1;
  //simulateLastClickedY = -1;

  if(!simulatedArr[y][x].isKing && (y == 0 || y == 7)) {
    simulatedArr[y][x].isKing = true;
    console.log("Draw crown");
  }
  return;
}

function simulateKill(x, y) {
  //console.log(potentialKillCoords);
  //console.log(x + ", " + y);
  //simulateCheckerElimination(potentialKillCoords.indexOf(10 * x + y));
  //simulateCheckerElimination(x, y); IS REDUNDANT?
  potentialKillCoords = [];

  simulatedArr[y][x]   = simulatedArr[simulateLastClickedY][simulateLastClickedX];
  simulatedArr[y][x].i = x;
  simulatedArr[y][x].j = y;
  simulatedArr[simulateLastClickedY][simulateLastClickedX] = null;
  console.log("-----------------------------");
  console.log(simulatedArr[y][x]);
  console.log(simulatedArr[simulateLastClickedY][simulateLastClickedX]);
  console.log("-----------------------------");
  //simulateLastClickedX = -1;
  //simulateLastClickedY = -1;

  simulatePotentialKill(x, y, simulatedArr[y][x].isKing, true, simulatedArr);
  if(killStreakOn) {
    simulateLastClickedX = x;
    simulateLastClickedY = y;
  }
  //redsTurn = (killStreakOn ? redsTurn : !redsTurn);
  if(!simulatedArr[y][x].isKing && (y == 0 || y == 7)) {
    simulatedArr[y][x].isKing = true;
    killStreakOn = false;
  }
  if(killStreakOn) { // Exploring all multikill options
    for(let a of potentialKillCoords) {
      simulateKill(~~(a / 10), a % 10);
    }
  }

}

function simulateCheckerElimination(x, y) {
  //console.log(potentialKillCoords[index] % 10 + ", " + ~~(potentialKillCoords[index] / 10));
  simulatedArr[y][x] = null;
  //simulatedArr[potentialKillCoords[index] % 10][~~(potentialKillCoords[index] / 10)] = null;
}

function simulatePotentialKill(x, y, isKing, isCheckingForMultiKill, arr) {
  if(isCheckingForMultiKill) killStreakOn = false;

  for(let i = -2; i <= 2; i+=4) {
    for(let j = -2; j <= (isKing ? 2 : 0); j+=4) {
      if(0 <= x + i && x + i < 8              // Is the x-cord within its bounds?
        && 0 <= y - j && y - j < 8            // Is the y-cord within its bounds?
        && arr[y - j/2][x + i/2] != null      // Is there a checker piece to the spot adjacent to you?
        && arr[y - j/2][x + i/2].colorBoolean // Is that checker piece red?
        && arr[y - j][x + i] == null) {       // Is the spot behind the red checker empty?
      
        potentialKillCoords.push(10 * (x + i) + (y - j));
        if(isCheckingForMultiKill) killStreakOn = true;
      }
    }
  }
}

///////////////////////////////////////////
/*------END HEURISTIC FUNCTIONS----------*/
///////////////////////////////////////////

function setResetHighLight(x, y, color, IsGoingToRecordMove, dy, trueForColor, arr) {
  if(trueForColor) ctx.fillStyle = color;
  // Going Upwards
  let k = 0;
  for(let i = -1; i <= 1; i+=2) {
    if(0 <= x + i && x + i < 8) {
      for(let j = -1; j <= (arr[y][x].isKing ? 1 : 0); j+=2)  {
        //console.log(`x:${x + i} y:${y + j * dy}`);
        if(0 <= y + j * dy && y + j * dy < 8 && arr[y + j * dy][x + i] == null) {
          if(trueForColor) ctx.fillRect((x + i) * sideLengthOfSquare, (y + j * dy) * sideLengthOfSquare, sideLengthOfSquare, sideLengthOfSquare);
          EligbleMoves[k] = [IsGoingToRecordMove ? x + i : -1, IsGoingToRecordMove ? y + j * dy : -1];
        }
        k++;
      }
    }
  }
}

function potentialKill(x, y, dy, isKing, isCheckingForMultiKill, trueForColor) {
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

function drawEmptyTile(x, y) {
  ctx.fillStyle = "Tan";
  ctx.fillRect(x * sideLengthOfSquare, y * sideLengthOfSquare, sideLengthOfSquare, sideLengthOfSquare);
}
