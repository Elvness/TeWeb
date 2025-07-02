async function getWeather() {
  const city = document.getElementById("cityInput").value;
  if (!city) {
    alert("Please enter a city name");
    return;
  }

  try {
    // 1. Get coordinates using Nominatim
    const geoRes = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(city)}`);
    const geoData = await geoRes.json();

    if (!geoData.length) {
      alert("City not found!");
      return;
    }

    const { lat, lon, display_name } = geoData[0];

    // 2. Fetch current weather + 7-day forecast
    const weatherRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&daily=temperature_2m_max,temperature_2m_min,weathercode&timezone=auto`);
    const weatherData = await weatherRes.json();

    // --- Current weather ---
    const current = weatherData.current_weather;

    // Apply dynamic CSS class based on weather code
    applyWeatherTheme(current.weathercode);

    document.getElementById("location").textContent = `📍 ${display_name}`;
    document.getElementById("temperature").textContent = `${current.temperature}°C`;
    document.getElementById("condition").textContent = `${getWeatherIcon(current.weathercode)} ${getConditionName(current.weathercode)}`;
    document.getElementById("wind").textContent = `Wind: ${current.windspeed} km/h`;

    // --- Forecast ---
    const forecastContainer = document.getElementById("forecast");
    forecastContainer.innerHTML = ""; // Clear old forecast

    const dates = weatherData.daily.time;
    const maxTemps = weatherData.daily.temperature_2m_max;
    const minTemps = weatherData.daily.temperature_2m_min;
    const codes = weatherData.daily.weathercode;

    for (let i = 1; i <= 3; i++) {
      const date = new Date(dates[i]);
      const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });

      const dayEl = document.createElement("div");
      dayEl.className = "forecast-day";
      dayEl.innerHTML = `
        <h4>${dayName}</h4>
        <p>${getWeatherIcon(codes[i])}</p>
        <p>${getConditionName(codes[i])}</p>
        <p>${minTemps[i]}° / ${maxTemps[i]}°</p>
      `;
      forecastContainer.appendChild(dayEl);
    }

  } catch (error) {
    console.error(error);
    alert("Something went wrong. Try again.");
  }
}

function applyWeatherTheme(code) {
  const body = document.body;
  body.classList.remove("clear", "cloudy", "rainy", "snowy", "thunderstorm");

  if ([0, 1].includes(code)) body.classList.add("clear");
  else if ([2, 3, 45, 48].includes(code)) body.classList.add("cloudy");
  else if ([51, 53, 55, 61, 63, 65, 80, 81, 82].includes(code)) body.classList.add("rainy");
  else if ([71, 73, 75, 77].includes(code)) body.classList.add("snowy");
  else if ([95, 96, 99].includes(code)) body.classList.add("thunderstorm");
}

function getWeatherIcon(code) {
  if ([0].includes(code)) return "☀️";
  if ([1, 2].includes(code)) return "🌤️";
  if ([3].includes(code)) return "☁️";
  if ([45, 48].includes(code)) return "🌫️";
  if ([51, 53, 55].includes(code)) return "🌦️";
  if ([61, 63, 65].includes(code)) return "🌧️";
  if ([71, 73, 75, 77].includes(code)) return "❄️";
  if ([80, 81, 82].includes(code)) return "🌧️";
  if ([95, 96, 99].includes(code)) return "⛈️";
  return "🌈";
}

function getConditionName(code) {
  const names = {
    0: "Clear",
    1: "Mainly Clear",
    2: "Partly Cloudy",
    3: "Overcast",
    45: "Fog",
    48: "Freezing Fog",
    51: "Light Drizzle",
    53: "Moderate Drizzle",
    55: "Dense Drizzle",
    61: "Light Rain",
    63: "Moderate Rain",
    65: "Heavy Rain",
    71: "Light Snow",
    73: "Moderate Snow",
    75: "Heavy Snow",
    77: "Snow Grains",
    80: "Rain Showers",
    81: "Moderate Showers",
    82: "Violent Showers",
    95: "Thunderstorm",
    96: "Thunderstorm + Hail",
    99: "Severe Thunderstorm"
  };
  return names[code] || "Unknown";
}
