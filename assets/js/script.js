const citySearch = document.querySelector(".city-search");
const searchButton = document.querySelector(".search-btn");
const locationButton = document.querySelector(".location-btn");
const currentWeather = document.querySelector(".current-weather");
const weatherCard = document.querySelector(".weather-cards");
const searchList = document.querySelector(".search-list");
const maxRecentSearches = 5;
const API_KEY = "5d76e2fe10d0797736029ed7bdd917aa"; 

/*-----------------------------------*\
#RECENT SEARCHES
\*-----------------------------------*/
// Function to add a city to the recent searches list
const addToRecentSearches = (cityName) => {
    let recentSearches = JSON.parse(localStorage.getItem("recentSearches")) || [];
    // Check if city already exists in recent searches
    if (!recentSearches.includes(cityName)) {
        // Add the city to recent searches
        recentSearches.unshift(cityName);
        // Limit recent searches to maxRecentSearches
        recentSearches = recentSearches.slice(0, maxRecentSearches);
        localStorage.setItem("recentSearches", JSON.stringify(recentSearches));
        renderRecentSearches();
    }
}

// Function to capitalize the first letter of each word
function capitalizeWords(str) {
    return str.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
}


// Function to render recent searches as buttons
const renderRecentSearches = () => {
    const recentSearches = JSON.parse(localStorage.getItem("recentSearches")) || [];
    searchList.innerHTML = recentSearches.map(city => {
        const cityNameCapitalized = capitalizeWords(city);
        return `<button class="recent-city">${cityNameCapitalized}</button>`;
    }).join("");

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


/*-----------------------------------*\
#WEATHER CARDS
\*-----------------------------------*/
const createWeatherCard = (cityName, weatherItem, index) => {
    // Function to convert temperature from Kelvin to Celsius
    const kelvinToCelsius = (kelvin) => (kelvin - 273.15).toFixed(2);
    
    // Function to convert temperature from Kelvin to Fahrenheit
    const kelvinToFahrenheit = (kelvin) => ((kelvin - 273.15) * 9/5 + 32).toFixed(2);

    // Function to convert wind speed from meters per second (m/s) to miles per hour (mph)
    const mpsToMph = (mps) => (mps * 2.237).toFixed(2);

   // Function to format date
    const formatDate = (timestamp, short = false) => {
        const date = new Date(timestamp * 1000);
        const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const shortDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const dayOfWeek = short ? shortDays[date.getDay()] : daysOfWeek[date.getDay()];
        const dayOfMonth = date.getDate();
        const month = months[date.getMonth()];
        return `${dayOfWeek} ${dayOfMonth}, ${month}`;
}


    // Check if weatherItem has dt property
    const date = weatherItem.dt ? formatDate(weatherItem.dt, index !== 0) : "";

    if(index === 0) { // HTML for the main weather card
        const tempCelsius = kelvinToCelsius(weatherItem.main.temp);
        const tempFahrenheit = kelvinToFahrenheit(weatherItem.main.temp);
        const windMph = mpsToMph(weatherItem.wind.speed);

        return `
            <h2 class="title-2 card-title">Now</h2>
                <div class="weapper">
                    <p class="heading">${tempFahrenheit}°F <br> ${tempCelsius}°C</p>
                    <img src="https://openweathermap.org/img/wn/${weatherItem.weather[0].icon}@4x.png" alt="weather-icon">
                </div>
                <p class="body-3">${weatherItem.weather[0].description}</p>

                <ul class="meta-list">

                    <li class="meta-item">
                        <span class="m-icon">calendar_today</span>
                        <p class="title-3 meta-text">${date}</p>
                    </li>

                    <li class="meta-item">
                        <span class="m-icon">location_on</span>
                        <p class="title-3 meta-text">${cityName}</p>
                    </li>
                </ul>
            `;
    } else { // HTML for the other five day forecast card
        const tempCelsius = kelvinToCelsius(weatherItem.main.temp);
        const tempFahrenheit = kelvinToFahrenheit(weatherItem.main.temp);
        const windMph = mpsToMph(weatherItem.wind.speed);
    
        return `<li class="card weather-cards slider-card forecast-card">

                
                    <ul class="meta-list">

                        <li class="meta-item">
                            <span class="m-icon">calendar_today</span>
                            <p class="title-3 meta-text">${date}</p>
                        </li>
                    </ul>

                    <div class="weapper">
                    <p class="heading">${tempFahrenheit}°F <br> ${tempCelsius}°C</p>
                    <img src="https://openweathermap.org/img/wn/${weatherItem.weather[0].icon}@4x.png" alt="weather-icon">
                    </div>
          

                </li>`;
    }
}

const sliderContainer = document.querySelector('.slider-container');

sliderContainer.addEventListener('wheel', (e) => {
    e.preventDefault();
    sliderContainer.scrollLeft += e.deltaX;
});


// Function to convert visibility from meters to kilometers
const metersToKilometers = (meters) => (meters / 1000).toFixed(2);

// Function to convert temperature from Kelvin to Celsius
const kelvinToCelsius = (kelvin) => (kelvin - 273.15).toFixed(2);

/*-----------------------------------*\
#TODAY'S HIGHLIGHTS
\*-----------------------------------*/
// Function to display Today's Highlights card
const displayTodaysHighlights = (cityName, currentWeatherData) => {
    // Remove existing highlight-list if it exists
    const existingHighlights = document.querySelector("[data-highlights]");
    if (existingHighlights) {
        existingHighlights.remove();
    }
    
    const todaysHighlightsHTML = `
    <div class="card card-lg data-highlights" data-highlights>
        <div class="highlight-list">
            <h2 class="title-2" id="highlights-label">Today's Highlights</h2>
            <div class="card card-sm highlight-card one">
                <h3 class="title-3">Air Quality Index</h3>
                <div class="wrapper">
                    <span class="m-icon">air</span>
                    <ul class="card-list">
                        <li class="card-item">
                            <div class="highlight-info">
                                <span class="badge">${currentWeatherData.airQuality}</span>
                                <p>${currentWeatherData.aqiLevel}</p>
                            </div>
                        </li>
                    </ul>
                </div>
            </div>

            <div class="card card-sm highlight-card two">
                <h3 class="title-3">Sunrise & Sunset</h3>
                <div class="card-list">
                    <div class="card-item">
                        <span class="m-icon">clear_day</span>
                        <div>
                            <p class="label-1">Sunrise</p>
                            <p class="title-1">${currentWeatherData.sunrise}</p>
                        </div>
                    </div>
                    <div class="card-item">
                        <span class="m-icon">clear_night</span>
                        <div>
                            <p class="label-1">Sunset</p>
                            <p class="title-1">${currentWeatherData.sunset}</p>
                        </div>
                    </div>
                </div>
            </div>

            <div class="card card-sm highlight-card">
                <h3 class="title-3">Humidity</h3>
                <div class="wrapper">
                    <span class="m-icon">humidity_percentage</span>
                    <p class="title-1">${currentWeatherData.humidity}<sub>%</sub></p>
                </div>
            </div>

            <div class="card card-sm highlight-card">
                <h3 class="title-3">Pressure</h3>
                <div class="wrapper">
                    <span class="m-icon">airwave</span>
                    <p class="title-1">${currentWeatherData.pressure}<sub>hPa</sub></p>
                </div>
            </div>

            <div class="card card-sm highlight-card">
                <h3 class="title-3">Visibility</h3>
                <div class="wrapper">
                    <span class="m-icon">visibility</span>
                    <p class="title-1">${metersToKilometers(currentWeatherData.visibility)}<sub>km</sub></p>
                </div>
            </div>

            <div class="card card-sm highlight-card">
                <h3 class="title-3">Feels Like</h3>
                <div class="wrapper">
                    <span class="m-icon">thermostat</span>
                    <p class="title-1">${kelvinToCelsius(currentWeatherData.feelsLike)}&deg;<sup>c</sup></p>
                </div>
            </div>
        </div>
    </div>`;
    
    // Insert highlights HTML after the current weather card
    currentWeather.insertAdjacentHTML("afterend", todaysHighlightsHTML);
}




/*-----------------------------------*\
#WEATHER DETAILS
\*-----------------------------------*/
function formatTime(date) {
    let hours = date.getHours();
    let minutes = date.getMinutes();

    // Pad minutes with zero if less than 10
    minutes = minutes < 10 ? '0' + minutes : minutes;

    return `${hours}:${minutes}`;
}
// Function to get weather details based on city name
const getCityWeather = (cityName) => {
    const WEATHER_API_URL = `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${API_KEY}`;

    // Fetch weather data
    fetch(WEATHER_API_URL)
        .then(response => {
            if (!response.ok) {
                throw new Error("City not found. Please enter a valid city name.");
            }
            return response.json();
        })
        .then(weatherData => {
            const { coord: { lat, lon } } = weatherData; // Extract latitude and longitude from weather data
            const AIR_POLLUTION_API_URL = `https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${API_KEY}`; // Use latitude and longitude

            // Fetch air quality data
            fetch(AIR_POLLUTION_API_URL)
                .then(response => response.json())
                .then(airQualityData => {
                    // Clearing previous weather data
                    citySearch.value = "";
                    currentWeather.innerHTML = "";
                    weatherCard.innerHTML = "";

                    // Creating weather card for the current weather
                    const html = createWeatherCard(cityName, weatherData, 0);
                    currentWeather.insertAdjacentHTML("beforeend", html);
                    
                    // Fetching five-day forecast based on city coordinates
                    getCityCoordinates(cityName, lat, lon);

                    // Display Today's Highlights
                    displayTodaysHighlights(cityName, {
                        airQuality: airQualityData.list[0].components.pm10, // Extract air quality data
                        aqiLevel: airQualityData.list[0].main.aqi, // Extract AQI level
                        sunrise: weatherData.sys.sunrise ? formatTime(new Date(weatherData.sys.sunrise * 1000)) : "N/A",
                        sunset: weatherData.sys.sunset ? formatTime(new Date(weatherData.sys.sunset * 1000)) : "N/A",
                        humidity: weatherData.main.humidity,
                        pressure: weatherData.main.pressure,
                        visibility: weatherData.visibility ? metersToKilometers(weatherData.visibility) : "N/A", // Update visibility retrieval
                        feelsLike: weatherData.main.feels_like
                    });

                    // Add city to recent searches
                    addToRecentSearches(cityName);
                })
                .catch(error => {
                    console.error("Error fetching air quality data:", error);
                    displayTodaysHighlights(cityName, {
                        airQuality: "N/A",
                        aqiLevel: "N/A",
                        sunrise: weatherData.sys.sunrise ? new Date(weatherData.sys.sunrise * 1000).toLocaleTimeString() : "N/A",
                        sunset: weatherData.sys.sunset ? new Date(weatherData.sys.sunset * 1000).toLocaleTimeString() : "N/A",
                        humidity: weatherData.main.humidity,
                        pressure: weatherData.main.pressure,
                        visibility: "N/A", // Update visibility retrieval
                        feelsLike: weatherData.main.feels_like
                    });
                    // Add city to recent searches
                    addToRecentSearches(cityName);
                });
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
                    weatherCard.insertAdjacentHTML("beforeend", html);
                }
            });

            document.querySelector(".weather-data").style.display = "block";
        })
        .catch(() => {
            alert("An error occurred while fetching the weather forecast!");
        });
}

/*-----------------------------------*\
#CURRENT LOCATION
\*-----------------------------------*/
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

/*-----------------------------------*\
#EVENT LISTENERS
\*-----------------------------------*/
locationButton.addEventListener("click", getUserCoordinates);
searchButton.addEventListener("click", () => getCityWeather(citySearch.value.trim()));
citySearch.addEventListener("keyup", e => e.key === "Enter" && getCityWeather(citySearch.value.trim()));
