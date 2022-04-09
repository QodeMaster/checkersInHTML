const c0 = document.getElementById("can0");
const ctx = c0.getContext("2d");

/* Canvas specs */
const width  = c0.width;
const height = c0.height;

const sideLengthOfSquare = width / 8;

for(let i = 0; i < height/sideLengthOfSquare; i++) {
  for(let j = 0; j < width/sideLengthOfSquare; j++) {
    ctx.fillStyle = ((i + j) % 2 == 0 ? "Moccasin" : "Tan");
    ctx.fillRect(i * sideLengthOfSquare, j * sideLengthOfSquare, sideLengthOfSquare, sideLengthOfSquare);
  }
}
