const citySearch = document.querySelector(".city-search");
const searchButton = document.querySelector(".search-btn");
const locationButton = document.querySelector(".location-btn");
const currentWeather = document.querySelector(".current-weather");
const weatherCard = document.querySelector(".weather-cards");
const searchList = document.querySelector(".search-list");
const maxRecentSearches = 5;
const API_KEY = "5d76e2fe10d0797736029ed7bdd917aa"; 


/*-----------------------------------*\
#UTILITY FUNCTIONS
\*-----------------------------------*/

function capitalizeWords(str) {
    return str.replace(/\b\w/g, function(char) {
        return char.toUpperCase();
    });
}
// Function to convert temperature from Kelvin to Celsius
const kelvinToCelsius = (kelvin) => (kelvin - 273.15).toFixed(2);

 // Function to convert temperature from Kelvin to Fahrenheit
const kelvinToFahrenheit = (kelvin) => ((kelvin - 273.15) * 9/5 + 32).toFixed(2);

// Function to convert Unix time to local time
function convertUnixTimeToLocalTime(unixTime, timezoneOffset) {
    return new Date((unixTime + timezoneOffset) * 1000);
}

// Function to format time as HH:MM AM/PM
function formatTime(date) {
    let hours = date.getUTCHours();
    const minutes = date.getUTCMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')} ${ampm}`;
}


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
        
        // Render recent searches
        renderRecentSearches();
    }
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
                <div class="wrapper">
                    <p class="heading">${tempFahrenheit}°F / ${tempCelsius}°C</p>
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
        <div class="wrapper">
            
            <img src="https://openweathermap.org/img/wn/${weatherItem.weather[0].icon}@4x.png"
                alt="weather-icon">

            <p class="heading">${tempFahrenheit}°F / ${tempCelsius}°C</p>
        </div>
   </li>`;
    }
}

// Slider functionality for weather cards
const sliderContainer = document.querySelector('.slider-container');

sliderContainer.addEventListener('wheel', (e) => {
    e.preventDefault();
    sliderContainer.scrollLeft += e.deltaX;
});

/*-----------------------------------*\
#WEATHER HIGHLIGHTS
\*-----------------------------------*/
// Function to display Today's Highlights card with badge for air quality
const displayTodaysHighlights = (cityName, currentWeatherData) => {
    // Remove existing highlight-list if it exists
    const existingHighlights = document.querySelector("[data-highlights]");
    if (existingHighlights) {
        existingHighlights.remove();
    }

    // Function to get AQI text level based on AQI value
    const getAqiText = (aqiValue) => {
        if (aqiValue >= 1 && aqiValue <= 50) {
            return "Good";
        } else if (aqiValue >= 51 && aqiValue <= 100) {
            return "Fair";
        } else if (aqiValue >= 101 && aqiValue <= 150) {
            return "Moderate";
        } else if (aqiValue >= 151 && aqiValue <= 200) {
            return "Poor";
        } else if (aqiValue >= 201 && aqiValue <= 300) {
            return "Very Poor";
        } else {
            return "Hazardous";
        }
    };

    // Function to get badge color based on AQI text level
    const getBadgeColor = (aqiText) => {
        switch (aqiText) {
            case "Good":
                return "badge aqi-1";
            case "Fair":
                return "badge aqi-2";
            case "Moderate":
                return "badge aqi-3";
            case "Poor":
                return "badge aqi-4";
            case "Very Poor":
                return "badge aqi-5";
            case "Hazardous":
                return "badge aqi-5";
            default:
                return "gray";
        }
    };

    // Get AQI text level and badge color
    const aqiLevel = currentWeatherData.aqiLevel;
    const aqiText = getAqiText(aqiLevel);
    const badgeColor = getBadgeColor(aqiText);

    // Format Today's Highlights card HTML with the badge
    const todaysHighlightsHTML = `
   
        <div class="card card-lg highlight-list" data-highlights>
            <h2 class="title-2" id="highlights-label">Today's Highlights</h2>
            <div class="card card-sm highlight-card one">
                <h3 class="title-3">Air Quality Index</h3>
                <span class="${getBadgeColor(aqiText)}">${aqiText}</span>
                <div class="wrapper">
                    <span class="m-icon">air</span>
                    <ul class="card-list">
                        <li class="card-item">
                            <p class="title-1"> ${currentWeatherData.airQuality}</p>
                            
                            <p class="label-1">PM<sub>2.5</sub></p>
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
                <h3 class="title-3">Feels Like</h3>
                <div class="wrapper">
                    <span class="m-icon">thermostat</span>
                    <p class="title-1">${kelvinToFahrenheit(currentWeatherData.feelsLike)}&deg;<sub>F</sub></p>
                </div>
            </div>
        </div>
    `;
    
    // Insert highlights HTML after the current weather card
    currentWeather.insertAdjacentHTML("afterend", todaysHighlightsHTML);
}


/*-----------------------------------*\
#WEATHER DETAILS
\*-----------------------------------*/

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

                    // Adjust sunrise and sunset times by timezone offset
                    const timezoneOffset = weatherData.timezone; // in seconds
                    const sunriseTime = new Date((weatherData.sys.sunrise + timezoneOffset) * 1000);
                    const sunsetTime = new Date((weatherData.sys.sunset + timezoneOffset) * 1000);

                    // Format Date Objects to Time Strings
                    const sunriseTimeString = formatTime(sunriseTime);
                    const sunsetTimeString = formatTime(sunsetTime);

                    // Display Today's Highlights
                    displayTodaysHighlights(cityName, {
                        airQuality: airQualityData.list[0].components.pm10, // Extract air quality data
                        aqiLevel: airQualityData.list[0].main.aqi, // Extract AQI level
                        sunrise: sunriseTimeString,
                        sunset: sunsetTimeString,
                        humidity: weatherData.main.humidity,
                        pressure: weatherData.main.pressure,
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
                        sunrise: "N/A",
                        sunset: "N/A",
                        humidity: "N/A",
                        pressure: "N/A",
                        feelsLike: "N/A"
                    });
                });
        })
        .catch(error => {
            console.error("Error fetching weather data:", error);
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
