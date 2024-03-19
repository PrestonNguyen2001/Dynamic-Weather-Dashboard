const cityInput = document.querySelector(".city-search");
const searchButton = document.querySelector(".search-btn");
const locationButton = document.querySelector(".location-btn");
const currentWeatherDiv = document.querySelector(".current-weather");
const weatherCardsDiv = document.querySelector(".weather-cards");
const searchList = document.querySelector(".search-list");

const API_KEY = "5d76e2fe10d0797736029ed7bdd917aa"; 
const MAX_RECENT_SEARCHES = 5;

// Function to add a city to the recent searches list
const addToRecentSearches = (cityName) => {
    let recentSearches = JSON.parse(localStorage.getItem("recentSearches")) || [];
    // Check if city already exists in recent searches
    if (!recentSearches.includes(cityName)) {
        // Add the city to recent searches
        recentSearches.unshift(cityName);
        // Limit recent searches to MAX_RECENT_SEARCHES
        recentSearches = recentSearches.slice(0, MAX_RECENT_SEARCHES);
        localStorage.setItem("recentSearches", JSON.stringify(recentSearches));
        renderRecentSearches();
    }
}

// Function to render recent searches as buttons
const renderRecentSearches = () => {
    const recentSearches = JSON.parse(localStorage.getItem("recentSearches")) || [];
    searchList.innerHTML = recentSearches.map(city => `<button class="recent-city">${city}</button>`).join("");

    // Add event listeners to each recent city button
    const recentCityButtons = document.querySelectorAll(".recent-city");
    recentCityButtons.forEach(button => {
        button.addEventListener("click", () => {
            const cityName = button.textContent;
            getCityWeather(cityName); // Call getCityWeather with the city name
        });
    });
}

// Render recent searches when the page loads
renderRecentSearches();

// Function to create weather card HTML
const createWeatherCard = (cityName, weatherItem, index) => {
    // Function to convert temperature from Kelvin to Celsius
    const kelvinToCelsius = (kelvin) => (kelvin - 273.15).toFixed(2);
    
    // Function to convert temperature from Kelvin to Fahrenheit
    const kelvinToFahrenheit = (kelvin) => ((kelvin - 273.15) * 9/5 + 32).toFixed(2);

    // Function to convert wind speed from meters per second (m/s) to miles per hour (mph)
    const mpsToMph = (mps) => (mps * 2.237).toFixed(2);

    // Function to format date
    const formatDate = (dateString) => {
        console.log("Date String:", dateString); // Log the date string to check its value
        const date = new Date(dateString);
        const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const dayOfWeek = daysOfWeek[date.getDay()];
        const dayOfMonth = date.getDate();
        const month = months[date.getMonth()];
        return `${dayOfWeek} ${dayOfMonth}, ${month}`;
    }


    // Check if weatherItem has dt_txt property
    const date = weatherItem.dt_txt ? formatDate(weatherItem.dt_txt) : "";

    if(index === 0) { // HTML for the main weather card
        const tempCelsius = kelvinToCelsius(weatherItem.main.temp);
        const tempFahrenheit = kelvinToFahrenheit(weatherItem.main.temp);
        const windMph = mpsToMph(weatherItem.wind.speed);

        return `<div class="details">
                    <h2 class="title-2 card-title"><span class="m-icon">location_on</span>${cityName}</h2>
                    <h3>${date}</h3> <!-- Add the date here -->
                    <h6>Temperature: ${tempFahrenheit}°F, ${tempCelsius}°C </h6>
                    <h6>Wind: ${windMph} mph</h6>
                    <h6>Humidity: ${weatherItem.main.humidity}%</h6>
                </div>
                <div class="icon">
                    <img src="https://openweathermap.org/img/wn/${weatherItem.weather[0].icon}@4x.png" alt="weather-icon">
                    <h6>${weatherItem.weather[0].description}</h6>
                </div>`;
    } else { // HTML for the other five day forecast card
        const tempCelsius = kelvinToCelsius(weatherItem.main.temp);
        const tempFahrenheit = kelvinToFahrenheit(weatherItem.main.temp);
        const windMph = mpsToMph(weatherItem.wind.speed);

        return `<li class="card">
                    <h3><span class="m-icon">calendar_today</span>${date}</h3>
                    <img src="https://openweathermap.org/img/wn/${weatherItem.weather[0].icon}@4x.png" alt="weather-icon">
                    <h6>Temp: ${tempFahrenheit}°F, ${tempCelsius}°C </h6>
                    <h6>Wind: ${windMph} mph</h6>
                    <h6>Humidity: ${weatherItem.main.humidity}%</h6>
                </li>`;
    }
}

// Function to get weather details based on city name
const getCityWeather = (cityName) => {
    const WEATHER_API_URL = `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${API_KEY}`;

    fetch(WEATHER_API_URL)
        .then(response => {
            if (!response.ok) {
                throw new Error("City not found. Please enter a valid city name.");
            }
            return response.json();
        })
        .then(data => {
            // Clearing previous weather data
            cityInput.value = "";
            currentWeatherDiv.innerHTML = "";
            weatherCardsDiv.innerHTML = "";

            // Creating weather card for the current weather
            const html = createWeatherCard(cityName, data, 0);
            currentWeatherDiv.insertAdjacentHTML("beforeend", html);
            
            // Fetching five-day forecast based on city coordinates
            getCityCoordinates(cityName, data.coord.lat, data.coord.lon);

            // Add city to recent searches
            addToRecentSearches(cityName);
        })
        .catch(error => {
            alert(error.message);
        });
}

// Function to get five-day forecast based on city coordinates
const getCityCoordinates = (cityName, latitude, longitude) => {
    const WEATHER_API_URL = `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=${API_KEY}`;

    fetch(WEATHER_API_URL)
        .then(response => response.json())
        .then(data => {
            // Filter the forecasts to get only one forecast per day
            const uniqueForecastDays = [];
            const fiveDaysForecast = data.list.filter(forecast => {
                const forecastDate = new Date(forecast.dt_txt).getDate();
                if (!uniqueForecastDays.includes(forecastDate)) {
                    return uniqueForecastDays.push(forecastDate);
                }
            });

            // Creating weather cards for the five-day forecast
            fiveDaysForecast.forEach((weatherItem, index) => {
                if (index !== 0) { // Exclude the current day
                    const html = createWeatherCard(cityName, weatherItem, index);
                    weatherCardsDiv.insertAdjacentHTML("beforeend", html);
                }
            });

            document.querySelector(".weather-data").style.display = "block";
        })
        .catch(() => {
            alert("An error occurred while fetching the weather forecast!");
        });
}

// Function to get user coordinates and fetch weather details
const getUserCoordinates = () => {
    navigator.geolocation.getCurrentPosition(
        position => {
            const { latitude, longitude } = position.coords; // Get coordinates of user location
            // Get city name from coordinates using reverse geocoding API
            const API_URL = `https://api.openweathermap.org/geo/1.0/reverse?lat=${latitude}&lon=${longitude}&limit=1&appid=${API_KEY}`;
            fetch(API_URL)
                .then(response => response.json())
                .then(data => {
                    const { name } = data[0];
                    getCityWeather(name);
                })
                .catch(() => {
                    alert("An error occurred while fetching the city name!");
                });
        },
        error => { // Show alert if user denied the location permission
            if (error.code === error.PERMISSION_DENIED) {
                alert("Geolocation request denied. Please reset location permission to grant access again.");
            } else {
                alert("Geolocation request error. Please reset location permission.");
            }
        }
    );
}

// Event listeners for buttons and input field
locationButton.addEventListener("click", getUserCoordinates);
searchButton.addEventListener("click", () => getCityWeather(cityInput.value.trim()));
cityInput.addEventListener("keyup", e => e.key === "Enter" && getCityWeather(cityInput.value.trim()));
