var loadedData = JSON.parse(localStorage.getItem("cityHistoryArray"));
var cityHistoryArray = loadedData;

if(!loadedData) {
    var cityHistoryArray = [];
}
else {
  for (var k=0; k < cityHistoryArray.length; k++) {

    var historyEL = document.createElement("a");
        historyEL.classList = "list-item history-item";
        historyEL.setAttribute("href", cityHistoryArray[k] + "/weatherdata");
        historyEL.textContent = cityHistoryArray[k];
        document.querySelector(".list-group").appendChild(historyEL);
  }
}

var searchInputEl = document.querySelector("#citysearch");
var searchBtnEl = document.querySelector("#search-btn");
var forecastContainerEL = document.querySelector("#forecast-container");
var formEl = document.querySelector("#city-search");
var historyListEl = document.querySelector("#history-list");
var historyItem = document.querySelector(".history-item");
var alertBox = document.querySelector("#alert-box");
var weatherImg = document.querySelector(".weatherimg");
var uvItem = document.querySelector("#uv-item");

var getWeatherData = function(city) {
    
    var apiUrl = "https://api.openweathermap.org/data/2.5/weather?q=" + city + "&units=imperial&appid=de073c425cc91c92bd56dfe7488ba727";

    alertBox.classList.add("hide");
    fetch(apiUrl).then(function(response) {
        if(response.ok) {
            response.json().then(function(data) {
                var currentWeatherIconData = data.weather[0].main;
                getUVIndex(data, city);
                getWeatherIcon(currentWeatherIconData);

                
            });
            cityHistory(city);
        } 
        else {

            alertBox.classList.add("alert-danger");
            alertBox.classList.remove("hide")
            alertBox.innerHTML = '<strong>Error:</strong> '+ city + " " + response.statusText + ". Please try your search again."; 
        }
    });
    
}

var getUVIndex = function(data, city) {
    
    var latitude = data.coord.lat;
    var longitude = data.coord.lon;
    var temp = data.main.temp;
    temp = Math.round(temp);
    var humidity = data.main.humidity;
    var windSpeed = data.wind.speed;
    var currentWeather = data.weather[0].main;

    var apiUrl = "https://api.openweathermap.org/data/2.5/onecall?lat=" + latitude + "&lon=" + longitude + "&units=imperial&exclude=minutely,hourly,alerts&appid=de073c425cc91c92bd56dfe7488ba727";

    fetch(apiUrl).then(function(response) {
        if(response.ok) {
            response.json().then(function(forecastData) {
                var uvi = forecastData.current.uvi;  
                
                displayCityWeather(data, city, latitude, longitude, temp, humidity, windSpeed, uvi, currentWeather);
                dailyForeCast(forecastData);
                
            });

            
        }
    })
}
 var dailyForeCast = function(forecastData) {
    
     for(i=0; i < 5; i++) {

        var dailyTemp = forecastData.daily[i].temp.day;
        var weatherForecast = forecastData.daily[i].weather[0].main;
    
        var icon = getWeatherIcon(weatherForecast);
        
        
        
        var dailyHumidity = forecastData.daily[i].humidity;

        dailyTemp = Math.round(dailyTemp);

        var new_date = moment().add(i, "d").format("L");
        var weatherIconUrl = "https://openweathermap.org/img/wn/" + icon + "@2x.png";
        var forecastCol = document.createElement("div");
        forecastCol.classList = "col";
        forecastCol.innerHTML = '<div class="card text-white bg-primary mb-3 forecast"><div class="card-header">' + new_date + '</div><div class="card-body "><img class="weatherimg" src="'+weatherIconUrl+'"><div class="list-group"><span class="list-item">Tempurate: ' + dailyTemp + '</span><span class="list-item"> Humidity: ' + dailyHumidity + '</span></div></div></div>';
                
        document.querySelector("#forecast-container").appendChild(forecastCol);


     }

 }

var formSubmitHandler = function(event) {
    event.preventDefault(); 
    
    var cityInputValue = searchInputEl.value.trim(); 
 
    if(cityInputValue) {
         getWeatherData(cityInputValue);
 
         forecastContainerEL.textContent = "";
         searchInputEl.value = "";

 
    } 
    else {
        alertBox.classList.add("alert-danger");
        alertBox.classList.remove("hide")
        alertBox.textContent = "Unable to locate " + cityInputValue + ". Please try your search again.";
     }
 }

 var displayCityWeather = function(data, city, latitude, longitude, temp, humidity, windSpeed, uvi, currentWeather) {

    document.querySelector("#place-holder").classList.add("hide");
    document.querySelector("#history-container").classList.remove("hide");
    document.querySelector("#current-weather").classList.remove("hide");
    forecastContainerEL.classList.remove("hide");
    var forecastHeaderContainer = document.createElement("div");
    forecastHeaderContainer.classList = "col-12";
    var forecastHeader = document.createElement("h3");
    forecastHeader.textContent = "5-Day ForeCast:";
    forecastHeaderContainer.appendChild(forecastHeader);
    forecastContainerEL.appendChild(forecastHeaderContainer);
    var uvIndex = document.querySelector(".badge");
    if(uvIndex) {
        uvIndex.remove();
    }
    
    var currentDate = moment().format("L");
    city = city.toLowerCase();
    city = city.charAt(0).toUpperCase() + city.slice(1);

    var icon = getWeatherIcon(currentWeather);
    var weatherIconUrl = "https://openweathermap.org/img/wn/" + icon + "@2x.png";
    var iconImg = document.createElement("img");
    iconImg.setAttribute("src", weatherIconUrl);
    document.querySelector("#current-weather .card-title").appendChild(iconImg);

    document.querySelector("#temp-item").innerHTML = "Temperature: " + temp + " &deg; F";
    document.querySelector("#humidity-item").innerHTML = "Humidity: " + humidity + "%";
    document.querySelector("#wind-item").innerHTML = "Wind Speed: " + windSpeed + " MPH";

    var uvBadge = document.createElement("span");
    if(uvi <= 2) {
        uvBadge.classList = "badge bg-success"; 
    }
    else if(uvi > 2 && uvi <= 5) {
        uvBadge.classList = "badge bg-warning"; 
    }
    else if(uvi > 5 && uvi <= 7) {
        uvBadge.classList = "badge bg-danger"; 
    }
    else if(uvi > 7 && uvi <= 10) {
        uvBadge.classList = "badge bg-high"; 
    }
    else if (uvi > 10) {
        uvBadge.classList = "badge bg-extreme"; 
    }
    
    uvBadge.innerHTML = uvi;
    document.querySelector("#uv-item").append(uvBadge);
    
 }

 var cityHistory = function(city) {

        if(cityHistoryArray.indexOf(city) !== -1) {
        }
        else {
        cityHistoryArray.push(city)

        var historyEL = document.createElement("a")
        historyEL.classList = "list-item history-item"
        historyEL.setAttribute("href", city + "/weatherdata")
        city = city.toLowerCase()
        city = city.charAt(0).toUpperCase() + city.slice(1)
        historyEL.textContent = city
    
        document.querySelector(".list-group").appendChild(historyEL);
        
        }

        if(cityHistoryArray.length >= 8) {
            document.querySelector("#history-list .list-item:first-child").remove()
            cityHistoryArray.shift()

        }

    localStorage.setItem("cityHistoryArray", JSON.stringify(cityHistoryArray))

}

var reloadCityHandler = function(event) {
    event.preventDefault()
    var reloadCity = event.target.textContent
    forecastContainerEL.innerHTML = ""

    if(reloadCity) {
        getWeatherData(reloadCity)
    }
}

var getWeatherIcon = function(e) {
    switch (e) {
        case 'Thunderstorm':

            var icon= "11d"
            return icon
        case 'Drizzle':

            var icon= "09d"
            return icon
        case 'Rain':

            var icon= "10d"
            return icon
        case 'Snow':

            var icon= "13d"
            return icon
        case 'Clear':

            var icon= "01d"
            return icon
        case 'Clouds':

            var icon= "02d"
            return icon
        case 'Mist':
        case 'Smoke':
        case 'Haze':
        case 'Dust':
        case 'Fog':
        case 'Sand':
        case 'Ash':
        case 'Squall':
        case 'Tornado':  
           var icon = "50d";
           return icon
    }
}

historyListEl.addEventListener("click", reloadCityHandler)

formEl.addEventListener("submit", formSubmitHandler)