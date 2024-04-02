# Dynamic-Weather-Dashboard
This repository contains the solution to the Server-Side APIs Weather Dashboard Challenge

## Description
The goal of this challenge is to build a weather dashboard that will run in the browser and feature dynamically updated HTML and CSS. The dashboard allows users to search for cities and view current weather conditions as well as a 5-day forecast.

## Challenge Overview
The challenge involves building a weather dashboard that retrieves weather data from the OpenWeather API. Users can search for cities, view current and future weather conditions, and access recent searches.

## Challenge Elements

### User Story
```markdown
AS A traveler
I WANT to see the weather outlook for multiple cities
SO THAT I can plan a trip accordingly
```

### Acceptance Criteria
```markdown
GIVEN a weather dashboard with form inputs
WHEN I search for a city
THEN I am presented with current and future conditions for that city and that city is added to the search history
WHEN I view current weather conditions for that city
THEN I am presented with the city name, the date, an icon representation of weather conditions, the temperature, the humidity, and the wind speed
WHEN I view future weather conditions for that city
THEN I am presented with a 5-day forecast that displays the date, an icon representation of weather conditions, the temperature, the wind speed, and the humidity
WHEN I click on a city in the search history
THEN I am again presented with current and future conditions for that city
```

## Solution
To address the challenge requirements, the following components were implemented:

### HTML:
- The `index.html` file provides the main structure for the Weather Dashboard web application. 
- It includes a header section with elements for city search and recent searches.
- Within the main section, it features a weather data container where current weather conditions, weather highlights, and 5-day forecast will be displayed.

### CSS:
- The `style.css` file contains styles to layout and visually enhance the Weather Dashboard.
- It provides styling for various elements such as buttons, input fields, cards, and the overall layout of the dashboard.

### JavaScript
- The `script.js` file handles the dynamic behavior of the Weather Dashboard.
- It interacts with the OpenWeather API to fetch weather data based on user input.
- Functions are implemented to process the retrieved data and update the HTML content accordingly.
- Event listeners are used to respond to user actions such as city searches and clicks on recent search history.

### External APIs:
- The Weather Dashboard interacts with the OpenWeather API to fetch weather data.
- The API responses are used to extract relevant weather information for display on the dashboard.
- The usage of APIs allows for real-time weather updates and enhances the functionality of the dashboard.

## Features:
- City Search: Users can input a city name and search for weather information.
- Recent Searches: Users can view their recent searches and click on them to quickly access weather information for those cities. This feature enhances user experience by allowing quick access to frequently searched cities.
- Current Weather Display: The dashboard shows the current weather conditions including temperature, weather description, and weather icon.
- Weather Highlights: Additionally, weather highlights are provided, including the air quality index, sunrise and sunset times, humidity, pressure, and feels like temperature.
- 5-Day-Forecast: A forecast for the next 5 days is displayed, providing users with a glimpse of future weather conditions.
- Dynamic Updates: The dashboard features dynamically updated HTML and CSS, ensuring that users always have access to the latest weather information without needing to refresh the page.

## Mockup
![Weather Dashboard Mockup](assets/images/weatherMockup.png)


## License
This project is licensed under the [MIT License](LICENSE).

