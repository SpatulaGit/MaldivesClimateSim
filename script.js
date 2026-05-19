// script.js

const yearEl = document.getElementById("year");
const seaEl = document.getElementById("sea");
const tempEl = document.getElementById("temp");
const coralEl = document.getElementById("coral");
const costEl = document.getElementById("cost");

const coralImg = document.getElementById("coralLayer");
const water = document.getElementById("water");

let year = 2026;
let running = false;

const SEA_START = 0.55;
const SEA_END = 0.90;

const TEMP_START = 28.0;
const TEMP_END = 31.5;

const YEARS = 74;

/* VISUAL MODEL */
function visualModel(t){

  return {

    sea:
      SEA_START +
      (SEA_END - SEA_START) * t,

    temp:
      TEMP_START +
      (TEMP_END - TEMP_START) * t
  };
}

/* GRAPH MODEL */
function graphModel(t){

  return {

    sea:
      SEA_START +
      (SEA_END - SEA_START) *
      Math.pow(t, 1.6),

    temp:
      TEMP_START +
      (TEMP_END - TEMP_START) *
      Math.pow(t, 1.8)
  };
}

/* WATER HEIGHT */
function waterHeight(sea){

  let p =
    (sea - SEA_START) /
    (SEA_END - SEA_START);

  return 38 + p * 25;
}

/* CORAL MODEL */
function coralModel(temp){

  /* bleaching begins earlier */
  let heatStress =
    Math.max(0, temp - 28.5);

  /*
    Evidence target:
    ~57% mortality
    at ~31.5°C
  */

  let mortality =
    Math.min(
      57,
      Math.pow(heatStress / 3.0, 1.9) * 57
    );

  /* survival directly tied */
  let survival =
    100 - mortality;

  /* economic damage scaling */
  let cost =
    (mortality / 57) * 1100;

  return {
    mortality,
    survival,
    cost
  };
}

/* MONEY */
function formatMoney(m){

  return "$" +
    m.toFixed(0) +
    "M";
}

/* CHARTS */

const seaChart =
new Chart(
  document.getElementById("seaChart"),
  {
    type:"line",

    data:{
      labels:[],

      datasets:[{
        label:"Sea Level Rise (m)",
        data:[],
        borderColor:"#38bdf8",
        tension:0.3
      }]
    }
  }
);

const tempChart =
new Chart(
  document.getElementById("tempChart"),
  {
    type:"line",

    data:{
      labels:[],

      datasets:[{
        label:"Ocean Temperature (°C)",
        data:[],
        borderColor:"#f97316",
        tension:0.3
      }]
    }
  }
);

/* MAIN LOOP */

function step(){

  if(year > 2100) return;

  let t =
    (year - 2026) / YEARS;

  let vis =
    visualModel(t);

  let graph =
    graphModel(t);

  let {
    mortality,
    survival,
    cost
  } = coralModel(vis.temp);

  /* UI */

  yearEl.textContent =
    year;

  seaEl.textContent =
    vis.sea.toFixed(2);

  tempEl.textContent =
    vis.temp.toFixed(2);

  coralEl.textContent =
    survival.toFixed(1);

  costEl.textContent =
    formatMoney(cost);

  /* WATER */

  water.style.height =
    `${waterHeight(vis.sea)}%`;

  /* =========================
     IMPROVED END BLEACHING
  ========================= */

  let intensity =
    mortality / 100;

  coralImg.style.filter = `
    saturate(${1 - intensity * 1.4})
    brightness(${1 - intensity * 0.45})
    contrast(${1 - intensity * 0.55})
    grayscale(${intensity * 0.45})
  `;

  /* keeps some coral visible */
  coralImg.style.opacity =
    `${1 - intensity * 0.35}`;

  /* GRAPHS */

  seaChart.data.labels.push(year);

  seaChart.data.datasets[0]
    .data.push(graph.sea);

  tempChart.data.labels.push(year);

  tempChart.data.datasets[0]
    .data.push(graph.temp);

  seaChart.update();
  tempChart.update();

  year++;

  if(running){

    setTimeout(step, 500);
  }
}

document
  .getElementById("startBtn")
  .onclick = () => {

    running = !running;

    if(running){
      step();
    }
};