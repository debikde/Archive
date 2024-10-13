// *
//  * Reaction-Diffusion system by the Gray-Scott Model.
//  * basic example.
//  * 
//  * @author @deconbatch
//  * @version 0.1
//  * p5.js 1.1.3
//  * license CC0
//  * created 2022.03.26
//  */

const w = 480;
const h = w;
const cSiz = 10;   // cell size
const pCnt = 30; // calculation count
let lab


function setup() {
  createCanvas(windowWidth, windowHeight);
  background(0);
  // noLoop();
  lab = new Labo(cSiz);
  lab.init();
}
function preload (){
  img = loadImage('carp.png')
}
function draw() {
  // r = random(255, 400); 
  // g = random(100,200); // g is a random number betwen 100 
  // b = random(0, 100)
  // let colors = ['black', 'red', 'olive']
  // background(colors[Math.floor(random(0, 3))]);  
  background('black')
  
  lab.proceed();
  lab.observe();
  for (let j = 0; j < lab.matrixH; j++) {
    for (let i = 0; i < lab.matrixW; i++) {
      //     if()>1.9) continue 
      if (noise(i/100,j/100,frameCount/200) < .3) {
        lab.cells[i][j].valV = 0
        lab.cells[i][j].valU = 0
      
      }
    }
  }
}

function mouseDragged() {
  console.log('click')
  for (let j = -2; j < 2; j++) {
    for (let i = -2; i < 2; i++) {
      let mouseI = floor(mouseX / cSiz)
      let mouseJ = floor(mouseY / cSiz)
      if (mouseX + i < 0 || mouseI + i > lab.matrixW) continue
      if (mouseY + j < 0 || mouseJ + j > lab.matrixH) continue
      lab.cells[mouseI + i][mouseJ + j].valV = 0
      lab.cells[mouseI + i][mouseJ + j].valU = 0
    }
  }
}

/*
 * Labo : reaction-diffusion system.
 */
class Labo {

  cellSize;
  matrixW;
  matrixH;
  diffU;
  diffV;
  cells;

  constructor(_cSiz) {
    this.cellSize = _cSiz;
    this.matrixW = floor(width / this.cellSize);
    this.matrixH = floor(height / this.cellSize);
    this.diffU = 0.9;
    this.diffV = 0.1;
    this.cells = new Array();
  }

  /*
   * init : initialize reaction-diffusion system.
   */
  init() {
    for (let x = 0; x < this.matrixW; x++) {
      this.cells[x] = [];
      for (let y = 0; y < this.matrixH; y++) {
        this.cells[x][y] = new Cell(
          map(x, 0.0, this.matrixW, 0.03, 0.12),   // feed
          map(y, 0.0, this.matrixH, 0.045, 0.055), // kill
          1,                         // u
          (random(1) < 0.1) ? 1 : 0  // v
        );
      }
    }
  }

  /*
   * proceed : proceed reaction-diffusion calculation.
   */
  proceed() {

    // calculate Laplacian
    const nD = Array(); // neighbors on diagonal
    const nH = Array(); // neighbors on vertical and horizontal
    for (let x = 0; x < this.matrixW; x++) {
      for (let y = 0; y < this.matrixH; y++) {

        // set neighbors
        nD[0] = this.cells[max(x - 1, 0)][max(y - 1, 0)];
        nD[1] = this.cells[max(x - 1, 0)][min(y + 1, this.matrixH - 1)];
        nD[2] = this.cells[min(x + 1, this.matrixW - 1)][max(y - 1, 0)];
        nD[3] = this.cells[min(x + 1, this.matrixW - 1)][min(y + 1, this.matrixH - 1)];
        nH[0] = this.cells[max(x - 1, 0)][y];
        nH[1] = this.cells[x][max(y - 1, 0)];
        nH[2] = this.cells[x][min(y + 1, this.matrixH - 1)];
        nH[3] = this.cells[min(x + 1, this.matrixW - 1)][y];

        // Laplacian
        let c = this.cells[x][y];
        let sum = 0.0;
        for (let i = 0; i < 4; i++) {
          sum += nD[i].valU * 0.05 + nH[i].valU * 0.2;
        }
        sum -= c.valU;
        c.lapU = sum;

        sum = 0.0;
        for (let i = 0; i < 4; i++) {
          sum += nD[i].valV * 0.05 + nH[i].valV * 0.2;
        }
        sum -= c.valV;
        c.lapV = sum;

      }
    }

    // reaction-diffusion
    for (let x = 0; x < this.matrixW; x++) {
      for (let y = 0; y < this.matrixH; y++) {
        let c = this.cells[x][y];
        let reaction = c.valU * c.valV * c.valV;
        let inflow = c.feed * (1.0 - c.valU);
        let outflow = (c.feed + c.kill) * c.valV;
        c.valU = c.valU + this.diffU * c.lapU - reaction + inflow;
        c.valV = c.valV + this.diffV * c.lapV + reaction - outflow;
        c.standardization();
      }
    }
  }

  /*
   * observe : display the result.
   */
  observe() {
    noStroke();
    for (let x = 0; x < this.matrixW; x++) {
      for (let y = 0; y < this.matrixH; y++) {
        // let r = noise((x/this.matrixW*4),(y/this.matrixH*4),1)*255
        // let g = noise((x/this.matrixW*4),(y/this.matrixH*4),3)*255
        // let b = noise((x/this.matrixW*4),(y/this.matrixH*4),5)*255
        // fill(r,g,b);
        let col = img.get(x/this.matrixW*img.width,y/this.matrixH*img.height)
        fill(col)
        let cx = x * this.cellSize;
        let cy = y * this.cellSize;
        let cs = this.cells[x][y].valU * this.cellSize*2;
        //let cs = this.cellSize * 4
        //fill(colors[floor(this.cells[x][y].valU * 3)])
        // if (x % 4 == 0 && y % 4 == 0) 
        { rect(cx, cy, cs, cs); }
      }
    }
  }
}

/*
 * Cell : holds cell informations.
 */
class Cell {

  feed;
  kill;
  valU;
  valV;
  lapU;
  lapV;

  constructor(_f, _k, _u, _v) {
    this.feed = _f;
    this.kill = _k;
    this.valU = _u;
    this.valV = _v;
    this.lapU = 0;
    this.lapV = 0;
  }

  standardization() {
    this.valU = constrain(this.valU, 0, 1);
    this.valV = constrain(this.valV, 0, 1);
  }

}
