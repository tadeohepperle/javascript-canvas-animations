const time = 0;

{
  const bg = document.createElement("canvas");
  bg.style = `
  width: 100%;
  height: 100%;
  position: fixed;
  top: 0px;
  left: 0px;
  z-index: -99;
  background: purple;
  `;
  document.body.appendChild(bg);
  document.querySelector("html").style.height = "100%";
  document.querySelector("body").style.height = "100%";
  const ctx = bg.getContext("2d");
  const MSSTEP = 20;
  const STRIPECOUNT = 100;
  const wave = {
    /// returns value between 0 and +1
    fun: (val) => {
      const scale = (val) => val + wave.time / 20000;
      let s = scale(val);
      return (Math.sin(s * 20) + 1 + Math.sin(s * 70 + 0.5) * 0.2 + 1) / 3;
    },
    time: 0,
  };
  setBGSize();

  function setBGSize() {
    bg.width = document.body.clientWidth; //document.width is obsolete
    bg.height = document.body.clientHeight; //document.height is obsolete
    bg.style.width = bg.width + "px";
    bg.style.height = bg.height + "px";

    drawCanvas();
  }

  function drawCanvas() {
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, bg.width, bg.height);

    let h = bg.height / STRIPECOUNT;
    for (let i = 0; i < STRIPECOUNT; i++) {
      let val = wave.fun(i / STRIPECOUNT);
      console.log(val);
      let y = h * i;

      let w = bg.width * val;
      let c = Math.floor((i / STRIPECOUNT) * 255);
      ctx.fillStyle = `rgb(${c},${255 - c},${c})`;
      ctx.fillRect(bg.width / 2 - w / 2, y, w, val * 7);
    }
  }

  function updateWave() {
    wave.time += MSSTEP;
  }

  setInterval(drawCanvas, MSSTEP);
  setInterval(updateWave, MSSTEP);
  window.addEventListener("resize", setBGSize);
}
