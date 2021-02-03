
//Create Element selectors to write content to the page
var cityFormEl = document.querySelector("#city-form");
var recentCityList = document.querySelector("#city-list")

//Element selectors for the Current Weather
var currentCityName = document.querySelector("#currentcity")
var currentTempurature = document.querySelector("#cur-temp")
var currentHumidity = document.querySelector("#cur-humid")
var currentWindSpeed = document.querySelector("#cur-wndspeed")
var currentUVIndex = document.querySelector("#cur-UV")
var currentDateEl = document.querySelector("#currentdate")
var currentWeatherEl = document.querySelector("#currentweather")
var dateVar = moment().format('L');


//Element selectors for the 5 day forecast
var forecastEl = document.querySelector("#forecast-bar")
var forecastElementTitle = document.querySelector("#forecast-title")

//Variables that will be applied to the whole page
var storageArray = JSON.parse(localStorage.getItem("searchcity")) || []
var apiKey = "86be0edea7b654b425b0a2a7b7fa2fe5"

//Create a function that prints the weather to the page 
function printCurrentWeather(result) {

    currentCityName.textContent = result.name + ": "
    currentTempurature.textContent = "Temperature: " + result.main.temp + "°F"
    currentHumidity.textContent = "Humidity : " + result.main.humidity + "%"
    currentWindSpeed.textContent = "Wind Speed: " + result.wind.speed + " MPH"
    currentDateEl.textContent = dateVar
    var iconLoc = "http://openweathermap.org/img/wn/" + result.weather[0].icon + "@2x.png"
    currentWeatherEl.setAttribute("src", iconLoc)
}
//This function is going to print the UV rating to the page and apply a color associated with the level
function printCurrentUV(result) {
    var uvIndex = result.value
    currentUVIndex.textContent = "UV Index: " + uvIndex
    //Define favorable condition
    if (uvIndex < 3) {
        currentUVIndex.setAttribute("class", "badge bg-success")
    }

    //Define danger condition
    else if (uvIndex > 8) {
        currentUVIndex.setAttribute("class", "badge bg-danger")
    }
    //Define warning condition
    else {
        currentUVIndex.setAttribute("class", "badge bg-warning")
    }
}

// This function is going to print the 5 day forecast to the page
function printForecast(result) {
    forecastElementTitle.textContent = "5-Day Forecast: "
    forecastEl.innerHTML = ""
    //For each 24 hour day the api uses increments of 3 hours, cycling through at 8 increments
    for (var i = 0; i < result.list.length; i += 8) {

        var weatherCard = document.createElement("div")
        weatherCard.setAttribute("class", "card me-3 weathercard")
        weatherCard.setAttribute("style", "width: 150px")
        var forecastBody = document.createElement("div")
        forecastBody.setAttribute("class", "card-body")
        weatherCard.appendChild(forecastBody)
        var forecastDate = document.createElement("h6")
        //Need to write an equation to adapt the date math to the loop
        forecastDate.textContent = moment().add((i / 8) + 1, "day").format("L");
        forecastDate.setAttribute("class", "card-title")
        forecastBody.appendChild(forecastDate)
        var forecastIcon = document.createElement("img")
        var iconLoc = "http://openweathermap.org/img/wn/" + result.list[i].weather[0].icon + "@2x.png"
        forecastIcon.setAttribute("src", iconLoc)
        forecastBody.appendChild(forecastIcon)
        var forecastTemp = document.createElement("p")
        forecastTemp.textContent = "Temp: " + result.list[i].main.temp + "°F"
        forecastTemp.setAttribute("class", "card-text")
        forecastBody.appendChild(forecastTemp)
        var forecastHum = document.createElement("p")
        forecastHum.textContent = "Humidity: " + result.list[i].main.humidity +"%"
        forecastHum.setAttribute("class", "card-text")
        forecastBody.appendChild(forecastHum)
        forecastEl.appendChild(weatherCard)

    }
}

//This function is going to search Open weather for the UV index, uses latitude and longitude as inputs
function searchUVAPI(lat, lon) {
    var locationURL = "http://api.openweathermap.org/data/2.5/uvi?lat=" + lat + "&lon=" + lon + "&appid=" + apiKey
    
    fetch(locationURL)
        // If API does not respond throw up an error
        .then(function (response) {
            if (!response.ok) {
                throw response.json();
            }
            return response.json();
        })
        //Once API repsonds print the conditions
        .then(function (locationres) {
            printCurrentUV(locationres)
        })
        //Catches earlier response to throw up an error
        .catch(function (error) {
            console.error(error);
        });
}

//This function is going to search open weather for the 5 day forecast
function searchForecast(city) {
    var locationURL = "http://api.openweathermap.org/data/2.5/forecast?q=" + city + "&units=imperial" + "&appid=" + apiKey
    fetch(locationURL)
        .then(function (response) {
            // If API does not respond throw up an error
            if (!response.ok) {
                throw response.json();
            }
            return response.json();
        })
        //Once API repsonds print the conditions
        .then(function (locationres) {
            printForecast(locationres)
            // console.log(locationres)
        })
        //Catches earlier response to throw up an error
        .catch(function (error) {
            console.error(error);
        });
}


// This function is going to search the Open Weather API for the fields associated with the city
function searchWeatherApi(query) {
    var cityName = query
    var locationURL = "http://api.openweathermap.org/data/2.5/weather?q=" + cityName + "&units=imperial" + "&appid=" + apiKey

    searchForecast(query)

    fetch(locationURL)
        .then(function (response) {
            // If API does not respond throw up an error
            if (!response.ok) {
                currentCityName.textContent = "No Results Found"
                throw response.json();
            }

            return response.json();
        })
        .then(function (locationres) {

            // If location does not exist throw up a message to the user.
            if (!locationres) {
                currentCityName.textContent = "No Results Found"
                console.log("no results found")
                return
            }
            //Once API repsonds print the conditions
            else {
                searchUVAPI(locationres.coord.lat, locationres.coord.lon)
                printCurrentWeather(locationres) 
            }
        })
        //Catches earlier response to throw up an error
        .catch(function (error) {
            console.error(error);
        });

}
//Function will help me bring strings back into the buttons with capital letters
function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

//This function will create the button elements on the Left side of the page for Recently Searched cities
function createNewButton() {
    recentCityList.innerHTML = ""
    //Prints a button for everything in local storage
    for (var i = 0; i < storageArray.length; i++) {
        var cityVal = capitalizeFirstLetter(storageArray[i])
        var newLineEl = document.createElement("li")
        newLineEl.setAttribute("class", "list-group-item d-grid gap-2")
        var keyEl = document.createElement("button")
        keyEl.setAttribute("class", "btn btn-primary")
        keyEl.textContent = cityVal
        newLineEl.appendChild(keyEl)
        recentCityList.appendChild(newLineEl)
    }
    //Adds an event listener to all of the buttons printed
    recentCityList.addEventListener("click", function (event) {
        var cityName = event.target.textContent
        searchWeatherApi(cityName)
        var arrayLoc = storageArray.indexOf(cityName)
        storageArray.splice(arrayLoc, 1)
        storageArray.unshift(cityName)
        localStorage.setItem("searchcity", JSON.stringify(storageArray))
    })
    //Searches the API for the first index of the Storage Array every time
    searchWeatherApi(storageArray[0])

}

// This function is going to allow the user to submit a city to the page
function citySearchFormSubmit(event) {
    event.preventDefault();
    var cityInputVal = document.querySelector("#city-input").value;
    // If the user does not input anything into the form thow back an error
    cityInputVal = cityInputVal.toLowerCase()
    //If user does not Input a value give them an error
    if (!cityInputVal) {
        currentCityName.textContent = "Please Input a Value"
        console.error("input a value")
        return;
    }
    //If user types in a city that exists in recent search move that search to the top of the array and run it
    if (storageArray.includes(cityInputVal)) {

        var city = storageArray.indexOf(cityInputVal)
        storageArray.splice(city, 1)
        storageArray.unshift(cityInputVal)
    }
    //If user has 7 recent results remove the last one from the list and add the new one
    else if (storageArray.length === 7) {
        storageArray.pop()
        storageArray.unshift(cityInputVal)
    }
    //If the user has less than 8 results and enters a new one add the new input to the array
    else if (storageArray.length < 8 && !storageArray.includes(cityInputVal)) {
        storageArray.unshift(cityInputVal)
    }
    //Set input to local storage
    localStorage.setItem("searchcity", JSON.stringify(storageArray))
    //Run the input to create a new button
    createNewButton(cityInputVal)

}
// This line will listen for city to be submitted in the form.
cityFormEl.addEventListener("submit", citySearchFormSubmit)
//Initialize the page if local storage exists
createNewButton()
