/////////////////////////////////////////////////////////
/// STATE
/////////////////////////////////////////////////////////

let time = 0;
const bg = setUpBackgroundAndContext();
let activeDrawingFunction = DRAWSTRIPES;
let activeDrawingFunctionState = null;
setBGSize();
bg.clear();

window.addEventListener("resize", setBGSize);

const MSSTEP = 20;
setInterval(loop, MSSTEP);
function loop() {
  time += MSSTEP;
  bg.clear();
  activeDrawingFunctionState = activeDrawingFunction(
    bg,
    time,
    activeDrawingFunctionState
  );
}

const functionMap = {
  DRAWSQUARES: DRAWSQUARES,
  DRAWSTRIPES: DRAWSTRIPES,
};

Object.keys(functionMap).forEach((id) => {
  document.getElementById(id).addEventListener("click", () => {
    activeDrawingFunctionState = null;
    activeDrawingFunction = functionMap[id];
  });
});

/////////////////////////////////////////////////////////
/// SETUP
/////////////////////////////////////////////////////////

function setUpBackgroundAndContext() {
  const bg = document.createElement("canvas");
  bg.style = `
    width: 100%;
    height: 100%;
    position: fixed;
    top: 0px;
    left: 0px;
    z-index: -99;
    background: white;
    `;
  document.body.appendChild(bg);
  document.querySelector("html").style.height = "100%";
  document.querySelector("body").style.height = "100%";
  const ctx = bg.getContext("2d");
  bg.ctx = ctx;
  bg.clear = () => {
    bg.ctx.fillStyle = "black";
    bg.ctx.fillRect(0, 0, bg.width, bg.height);
  };

  return bg;
}

function setBGSize() {
  bg.width = document.body.clientWidth;
  bg.height = document.body.clientHeight;
  bg.style.width = bg.width + "px";
  bg.style.height = bg.height + "px";
  activeDrawingFunctionState = null;
  activeDrawingFunctionState = activeDrawingFunction(
    bg,
    time,
    activeDrawingFunctionState
  );
}

/////////////////////////////////////////////////////////
/// DRAWING FUNCTIONS, take bg, time, and old state, return new state
/////////////////////////////////////////////////////////

// deterministic, state not used
function DRAWSTRIPES(bg, time, state) {
  DRAWSTRIPES.STRIPECOUNT = 100;
  let h = bg.height / DRAWSTRIPES.STRIPECOUNT;

  wavefun = (val) => {
    const scale = (val) => val + time / 20000;
    let s = scale(val);
    return (Math.sin(s * 20) + 1 + Math.sin(s * 70 + 0.5) * 0.2 + 1) / 3;
  };

  for (let i = 0; i < DRAWSTRIPES.STRIPECOUNT; i++) {
    let val = wavefun(i / DRAWSTRIPES.STRIPECOUNT);
    let y = h * i;
    let w = bg.width * val;
    let c = Math.floor((i / DRAWSTRIPES.STRIPECOUNT) * 255);
    bg.ctx.fillStyle = `rgb(${c},${255 - c},${c})`;
    bg.ctx.fillRect(bg.width / 2 - w / 2, y, w, val * 7);
  }
  return null;
}

function DRAWSQUARES(bg, time, state) {
  DRAWSQUARES.LERPFACTOR = 0.01;
  DRAWSQUARES.TARGET_SWITCH_CHANCE = 0.05;
  if (!state) {
    const squaresize = 50;
    let dim = [
      Math.ceil(bg.height / squaresize),
      Math.ceil(bg.width / squaresize),
    ];
    let grid = Array(dim[0])
      .fill(null)
      .map((r) =>
        Array(dim[1])
          .fill(0)
          .map((e) => Math.random())
      );
    let targetGrid = grid.map((r) => r.map((e) => Math.round(e)));
    state = { grid, dim, targetGrid };
  }

  function lerp(origin, goal, factor) {
    return origin + (goal - origin) * factor;
  }

  let { grid, dim, targetGrid } = state;

  targetGrid = targetGrid.map((r) =>
    r.map((e) => (Math.random() < DRAWSQUARES.TARGET_SWITCH_CHANCE ? 1 - e : e))
  );
  // lerp grid to targetgrid
  grid = grid.map((r, i) =>
    r.map((e, j) => lerp(e, targetGrid[i][j], DRAWSQUARES.LERPFACTOR))
  );

  let h = bg.height / dim[0];
  let w = bg.width / dim[1];
  for (let i = 0; i < dim[0]; i++) {
    for (let j = 0; j < dim[1]; j++) {
      let val = grid[i][j];
      let greyVal = Math.ceil(val * 255);
      bg.ctx.fillStyle = `rgb(${greyVal},${255 - greyVal},${255 - greyVal})`;
      bg.ctx.fillRect(j * w, i * h, w, h);
    }
  }

  return { grid, dim, targetGrid };
}

// {
//
//   const STRIPECOUNT = 100;
//   const wave = {
//     /// returns value between 0 and +1
//     fun: (val) => {
//       const scale = (val) => val + wave.time / 20000;
//       let s = scale(val);
//       return (Math.sin(s * 20) + 1 + Math.sin(s * 70 + 0.5) * 0.2 + 1) / 3;
//     },
//     time: 0,
//   };
//   setBGSize();

//   function setBGSize() {
//     bg.width = document.body.clientWidth; //document.width is obsolete
//     bg.height = document.body.clientHeight; //document.height is obsolete
//     bg.style.width = bg.width + "px";
//     bg.style.height = bg.height + "px";

//     drawCanvas();
//   }

//   function drawCanvas() {
//     let h = bg.height / STRIPECOUNT;
//     for (let i = 0; i < STRIPECOUNT; i++) {
//       let val = wave.fun(i / STRIPECOUNT);

//       let y = h * i;

//       let w = bg.width * val;
//       let c = Math.floor((i / STRIPECOUNT) * 255);
//       bg.ctx.fillStyle = `rgb(${c},${255 - c},${c})`;
//       bg.ctx.fillRect(bg.width / 2 - w / 2, y, w, val * 7);
//     }
//   }

//   function updateWave() {
//     wave.time += MSSTEP;
//   }

//   setInterval(drawCanvas, MSSTEP);
//   setInterval(updateWave, MSSTEP);
//   window.addEventListener("resize", setBGSize);
// }
