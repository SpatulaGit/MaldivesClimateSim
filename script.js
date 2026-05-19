// ================= UI =================
const yearEl = document.getElementById("year");
const seaEl = document.getElementById("sea");
const tempEl = document.getElementById("temp");
const coralEl = document.getElementById("coral");
const costEl = document.getElementById("cost");

const coralImg = document.getElementById("coralLayer");
const water = document.getElementById("water");

let year = 2026;
let running = false;

// ================= SLIDES =================
const images = [
  "images/intro/1.jpg",
  "images/intro/2.jpg",
  "images/intro/3.jpg",
  "images/intro/4.jpg",
  "images/intro/5.jpg",
  "images/intro/6.jpg"
];

const slides = document.querySelectorAll(".slide");
let index = 0;

slides[0].style.backgroundImage = `url('${images[0]}')`;
slides[1].style.backgroundImage = `url('${images[1]}')`;
slides[0].classList.add("active");

function nextSlide() {
  const active = index % 2;
  const next = (index + 1) % 2;

  const img = images[(index + 1) % images.length];

  slides[next].style.backgroundImage = `url('${img}')`;

  slides[next].classList.add("active");
  slides[active].classList.remove("active");

  index++;
}

setInterval(nextSlide, 4000);

// ================= CONSTANTS =================
const SEA_START = 0.55;
const SEA_END = 0.90;

const TEMP_START = 28.0;
const TEMP_END = 31.5;

const YEARS = 74;

// ================= MODELS =================
function visualModel(t) {
  return {
    sea: SEA_START + (SEA_END - SEA_START) * t,
    temp: TEMP_START + (TEMP_END - TEMP_START) * t
  };
}

function graphModel(t) {
  return {
    sea: SEA_START + (SEA_END - SEA_START) * Math.pow(t, 1.7),
    temp: TEMP_START + (TEMP_END - TEMP_START) * Math.pow(t, 1.4)
  };
}

// ================= CORAL MODEL =================
function coralModel(temp) {
  let heatStress = Math.max(0, temp - 28.5);
  let maxStress = 3.0;

  let x = Math.min(1, heatStress / maxStress);
  let normalized = Math.pow(x, 1.6);

  let mortality = normalized * 57;   // Max 57%
  let survival = 100 - mortality;    // Will end ~43%
  let cost = normalized * 1100;      // Economic damage up to $1.1B

  return { mortality, survival, cost, normalized };
}

// ================= WATER =================
function waterHeight(sea) {
  let p = (sea - SEA_START) / (SEA_END - SEA_START);
  return 38 + p * 25;
}

// ================= GRAPHS =================
const seaChart = new Chart(document.getElementById("seaChart"), {
  type: "line",
  data: {
    labels: [],
    datasets: [{
      label: "Sea Level (m)",
      data: [],
      borderColor: "blue",
      tension: 0.3
    }]
  }
});

const tempChart = new Chart(document.getElementById("tempChart"), {
  type: "line",
  data: {
    labels: [],
    datasets: [{
      label: "Temperature (°C)",
      data: [],
      borderColor: "orange",
      tension: 0.3
    }]
  }
});

// ================= LOOP =================
function step() {
  if (year > 2100) return;

  let t = (year - 2026) / YEARS;

  let vis = visualModel(t);
  let graph = graphModel(t);

  let { mortality, survival, cost, normalized } = coralModel(vis.temp);

  // ================= UI =================
  yearEl.textContent = year;
  seaEl.textContent = vis.sea.toFixed(2);
  tempEl.textContent = vis.temp.toFixed(2);
  coralEl.textContent = survival.toFixed(1);
  costEl.textContent = "$" + cost.toFixed(0) + "M";

  // ================= WATER =================
  water.style.height = `${waterHeight(vis.sea)}%`;

  // ================= CORAL VISUAL =================
  let intensity = mortality / 57;
  coralImg.style.filter = `
    saturate(${1 - intensity * 1.4})
    brightness(${1 - intensity * 0.5})
    contrast(${1 - intensity * 0.6})
    grayscale(${intensity * 0.5})
  `;
  coralImg.style.opacity = `${1 - intensity * 0.35}`;

  // ================= GRAPHS =================
  seaChart.data.labels.push(year);
  seaChart.data.datasets[0].data.push(graph.sea);

  tempChart.data.labels.push(year);
  tempChart.data.datasets[0].data.push(graph.temp);

  seaChart.update();
  tempChart.update();

  year++;
  if (running) setTimeout(step, 2000);
}

// ================= INTRO / START =================
document.getElementById("enterBtn").onclick = () => {
  document.getElementById("intro").style.display = "none";
  document.getElementById("app").style.opacity = "1";
};

document.getElementById("startBtn").onclick = () => {
  running = !running;
  if (running) step();
};