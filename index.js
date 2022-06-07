/////////////////////////////////////////////////////////
/// STATE
/////////////////////////////////////////////////////////

let time = 0;
const bg = setUpBackgroundAndContext();

let functionGetParam = findGetParameter("f") ?? "DRAWSTRIPES";

const functionMap = {
  DRAWSQUARES: DRAWSQUARES,
  DRAWSTRIPES: DRAWSTRIPES,
  DRAWORBITS: DRAWORBITS,
  DRAWPYRAMIDS: DRAWPYRAMIDS,
};
let activeDrawingFunction = functionMap[functionGetParam];
let activeDrawingFunctionState = null;
setBGSize();
bg.clear();

window.addEventListener("resize", setBGSize);

const MSSTEP = 20;
setInterval(loop, MSSTEP);
function loop() {
  time += MSSTEP;

  activeDrawingFunctionState = activeDrawingFunction(
    bg,
    time,
    activeDrawingFunctionState
  );
}

Object.keys(functionMap).forEach((id) => {
  document.getElementById(id).addEventListener("click", () => {
    window.history.pushState("id", "id", "?f=" + id);
    // window.location.assign();
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
  bg.clear = (color) => {
    bg.ctx.fillStyle = color ?? "black";
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

function DRAWPYRAMIDS(bg, time, state) {
  bg.clear();
  DRAWPYRAMIDS.NOBJECTS = 40;
  DRAWPYRAMIDS.COL1 = "grey";
  DRAWPYRAMIDS.COL2 = "white";
  for (let i = DRAWPYRAMIDS.NOBJECTS; i > 0; i--) {
    let h = (bg.height * i) / DRAWPYRAMIDS.NOBJECTS;
    let w = (bg.width * i) / DRAWPYRAMIDS.NOBJECTS;
    let shift = Math.cos(i / 10 + time / 800) * 5;
    let shiftx = Math.sin(i / 40 + time / 1000) * 5;
    let shifty = Math.cos(i / 40 + time / 1000) * 5;
    h += shift;
    w += shift;
    bg.ctx.fillStyle = i % 2 == 0 ? DRAWPYRAMIDS.COL1 : DRAWPYRAMIDS.COL2;

    bg.ctx.fillRect(
      (bg.width - w) / 2 + shiftx,
      (bg.height - h) / 2 + shifty,
      w,
      h
    );
  }

  return null;
}

function DRAWORBITS(bg, time, state) {
  function randomPos() {
    return { x: Math.random() * bg.width, y: Math.random() * bg.height };
  }

  DRAWORBITS.NOBJECTS = 30;
  if (!state) {
    state = Array(DRAWORBITS.NOBJECTS)
      .fill(0)
      .map((e) => {
        let angle = Math.random() * 2 * Math.PI;
        return {
          center: randomPos(),
          angle: angle,
          oldAngle: angle,
          radius: Math.random() * 100,
          dir: { x: Math.random() * 20 - 10, y: Math.random() * 20 - 10 },
          col: randomHslColor(null, 100, 50),
        };
      });
    bg.clear("white");
  }

  function calcPos(center, radius, angle) {
    x = Math.sin(angle) * radius;
    y = Math.cos(angle) * radius;
    return { x: center.x + x, y: center.y + y };
  }

  function modoloPos(center) {
    return { x: center.x % bg.width, y: center.y % bg.height };
  }
  bg.clear("rgba(255,255,255,0.00)");
  bg.ctx.lineWidth = 2;

  for (let i = 0; i < state.length; i++) {
    const element = state[i];
    let { center, angle, oldAngle, radius, dir, col } = element;
    // update values:

    center.x += dir.x;
    center.y += dir.y;
    center = center = modoloPos(center);
    oldAngle = angle;
    angle += 0.1;
    state[i] = { center, angle, oldAngle, radius, dir, col };

    // draw:
    let timeRadius = radius * (Math.sin(time / 1000) + 1);
    let oldPos = calcPos(center, timeRadius, oldAngle);
    let newPos = calcPos(center, timeRadius, angle);
    bg.ctx.beginPath();
    bg.ctx.strokeStyle = col;
    bg.ctx.moveTo(oldPos.x, oldPos.y);
    bg.ctx.lineTo(newPos.x, newPos.y);
    bg.ctx.stroke();
  }

  return state;
}

// deterministic, state not used
function DRAWSTRIPES(bg, time, state) {
  DRAWSTRIPES.STRIPECOUNT = 100;
  let h = bg.height / DRAWSTRIPES.STRIPECOUNT;

  wavefun = (val) => {
    const scale = (val) => val + time / 20000;
    let s = scale(val);
    return (Math.sin(s * 20) + 1 + Math.sin(s * 70 + 0.5) * 0.2 + 1) / 3;
  };

  bg.clear();
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

  bg.clear();
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

function positiveInteger(max) {
  return Math.floor(Math.random() * (max + 1));
}

function randomHslColor(hh, ss, ll) {
  let h = hh ?? positiveInteger(360);
  let s = ss ?? positiveInteger(100);
  let l = ll ?? positiveInteger(100);

  return `hsl(${h},${s}%,${l}%)`;
}

function findGetParameter(parameterName) {
  var result = null,
    tmp = [];
  location.search
    .substr(1)
    .split("&")
    .forEach(function (item) {
      tmp = item.split("=");
      if (tmp[0] === parameterName) result = decodeURIComponent(tmp[1]);
    });
  return result;
}
