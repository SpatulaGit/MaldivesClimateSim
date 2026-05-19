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

const TEMP_START = 28;
const TEMP_END = 31.5;

const YEARS = 74;

/* =========================
   🌊 VISUAL MODEL (LINEAR)
========================= */
function visualModel(t){
  return {
    sea: SEA_START + (SEA_END - SEA_START) * t,
    temp: TEMP_START + (TEMP_END - TEMP_START) * t
  };
}

/* =========================
   📈 GRAPH MODEL (NONLINEAR)
   (realistic acceleration)
========================= */
function graphModel(t){
  let curved = t * t * (3 - 2 * t); // smoothstep baseline
  let accel = Math.pow(curved, 1.6);

  return {
    sea: SEA_START + (SEA_END - SEA_START) * accel,
    temp: TEMP_START + (TEMP_END - TEMP_START) * Math.pow(t, 1.8)
  };
}

/* =========================
   🌊 WATER VISUAL
========================= */
function waterHeight(sea){
  let p = (sea - SEA_START) / (SEA_END - SEA_START);
  return 38 + p * 25;
}

/* =========================
   🪸 CORAL MODEL (FASTER + DARK BLEACHING)
========================= */
function coralModel(temp){
  let heatStress = Math.max(0, temp - 29);

  // 🔥 faster bleaching (very visible now)
  let bleaching = Math.min(100, heatStress * 55);

  // 🪸 NEVER BELOW 5%
  let survival = Math.max(5, 100 - bleaching);

  // 💰 economic damage
  let cost = Math.min(1100, (bleaching / 100) * 1100);

  return { bleaching, survival, cost };
}

/* =========================
   💰 FORMAT MONEY
========================= */
function formatMoney(m){
  if(m >= 1000) return "$" + (m/1000).toFixed(2) + "B";
  return "$" + m.toFixed(1) + "M";
}

/* =========================
   📊 CHARTS (NONLINEAR DATA)
========================= */
const seaChart = new Chart(document.getElementById("seaChart"), {
  type:"line",
  data:{ labels:[], datasets:[{
    label:"Sea Level (m)",
    data:[],
    borderColor:"#38bdf8"
  }]}
});

const tempChart = new Chart(document.getElementById("tempChart"), {
  type:"line",
  data:{ labels:[], datasets:[{
    label:"Temperature (°C)",
    data:[],
    borderColor:"#f97316"
  }]}
});

/* =========================
   🔁 MAIN LOOP
========================= */
function step(){

  if(year > 2100) return;

  let t = (year - 2026) / YEARS;

  /* visual + graph split */
  let vis = visualModel(t);
  let graph = graphModel(t);

  let { survival, cost } = coralModel(vis.temp);

  /* UI */
  yearEl.textContent = year;
  seaEl.textContent = vis.sea.toFixed(2);
  tempEl.textContent = vis.temp.toFixed(2);

  coralEl.textContent = survival.toFixed(1);
  costEl.textContent = formatMoney(cost);

  water.style.height = `${waterHeight(vis.sea)}%`;

  /* =========================
     🪸 STRONG BLEACHING VISUAL
  ========================= */
  let intensity = Math.min(1, Math.max(0, (vis.temp - 29) / 1.5));

  coralImg.style.filter = `
    saturate(${1 - intensity})
    brightness(${1 - intensity * 0.4})
    contrast(${1 - intensity * 0.6})
  `;

  coralImg.style.opacity = `${1 - intensity * 0.7}`;

  /* =========================
     📊 GRAPHS (NONLINEAR)
  ========================= */
  seaChart.data.labels.push(year);
  seaChart.data.datasets[0].data.push(graph.sea);

  tempChart.data.labels.push(year);
  tempChart.data.datasets[0].data.push(graph.temp);

  seaChart.update();
  tempChart.update();

  year++;

  if(running){
    setTimeout(step, 500);
  }
}

document.getElementById("startBtn").onclick = () => {
  running = !running;
  if(running) step();
};