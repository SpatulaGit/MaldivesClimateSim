const slider = document.getElementById("seaSlider");
const water = document.getElementById("water");

const seaValue = document.getElementById("seaValue");
const coralText = document.getElementById("coralText");
const moneyText = document.getElementById("moneyText");

slider.addEventListener("input", () => {

  let value = slider.value;

  let meters = (value / 100).toFixed(1);

  seaValue.textContent = meters;

  water.style.height = value + "%";

  let coralDeath = Math.floor(value * 0.57);

  coralText.textContent =
    "Coral mortality reaches " + coralDeath + "%.";

  let damage =
    (value * 11000000).toLocaleString();

  moneyText.textContent =
    "Estimated damages: $" + damage;
});