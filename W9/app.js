const cityInput = document.getElementById("cityInput");
const searchBtn = document.getElementById("searchBtn");
const result = document.getElementById("result");

async function getWeather(city) {
  const response = await fetch("data.json");
  const data = await response.json();
  return data[city.toLowerCase()];
}

searchBtn.addEventListener("click", async () => {
  const city = cityInput.value.trim();
  if (!city) return;

  result.textContent = "Loading...";
  const info = await getWeather(city);

  if (!info) {
    result.textContent = "City not found.";
    return;
  }

  result.innerHTML = `
    <h3>${city.toUpperCase()}</h3>
    <p>Temperature: ${info.temp} C</p>
    <p>Humidity: ${info.humidity}%</p>
    <p>Condition: ${info.condition}</p>
  `;
});
