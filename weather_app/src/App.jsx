import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaTemperatureHigh, FaTemperatureLow, FaCloud, FaSun, FaCloudRain, FaWind, FaSnowflake } from 'react-icons/fa';
import './App.css';

const API_KEY = '6a32bc8ae37a3892e4829caf7d05183e';  // Replace with your OpenWeatherMap API key
const BASE_URL = 'https://api.openweathermap.org/data/2.5/weather';
const FORECAST_URL = 'https://api.openweathermap.org/data/2.5/forecast';

function App() {
  const [location, setLocation] = useState('');
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState([]);
  const [unit, setUnit] = useState('metric'); // 'metric' for Celsius, 'imperial' for Fahrenheit
  const [recentLocations, setRecentLocations] = useState([]);

  useEffect(() => {
    if (recentLocations.length > 0) {
      fetchWeather(recentLocations[0]);
      fetchForecast(recentLocations[0]);
    }
  }, [recentLocations]);

  const fetchWeather = async (location) => {
    try {
      const response = await axios.get(BASE_URL, {
        params: {
          q: location,
          units: unit,
          appid: API_KEY
        }
      });
      setWeather(response.data);
      saveRecentLocation(location);
    } catch (error) {
      console.error('Error fetching weather data:', error);
    }
  };

  const fetchForecast = async (location) => {
    try {
      const response = await axios.get(FORECAST_URL, {
        params: {
          q: location,
          units: unit,
          appid: API_KEY
        }
      });
      setForecast(response.data.list.filter((item, index) => index % 8 === 0)); // Taking one forecast per day
    } catch (error) {
      console.error('Error fetching forecast data:', error);
    }
  };

  const saveRecentLocation = (location) => {
    setRecentLocations(prev => {
      const updated = [location, ...prev.filter(loc => loc !== location)];
      if (updated.length > 5) updated.pop();
      return updated;
    });
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchWeather(location);
    fetchForecast(location);
  };

  const toggleUnit = () => {
    setUnit(prev => prev === 'metric' ? 'imperial' : 'metric');
  };

  const getWeatherIcon = (description) => {
    switch (description) {
      case 'clear sky':
        return <FaSun />;
      case 'few clouds':
      case 'scattered clouds':
        return <FaCloud />;
      case 'rain':
        return <FaCloudRain />;
      case 'snow':
        return <FaSnowflake />;
      default:
        return <FaCloud />;
    }
  };

  return (
    <div className="App">
      <h1>Weather App</h1>
      <form onSubmit={handleSearch}>
        <input
          type="text"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="Enter city or zip code"
          required
        />
        <button type="submit">Get Weather</button>
      </form>
      <button onClick={toggleUnit}>
        Switch to {unit === 'metric' ? 'Fahrenheit' : 'Celsius'}
      </button>
      {weather && (
        <div className="weather-info">
          <h2>{weather.name}</h2>
          <div className="weather-icon">{getWeatherIcon(weather.weather[0].description)}</div>
          <p>{weather.weather[0].description}</p>
          <p>Temperature: {Math.round(weather.main.temp)}°{unit === 'metric' ? 'C' : 'F'}</p>
          <p>Humidity: {weather.main.humidity}%</p>
          <p>Wind Speed: {weather.wind.speed} m/s</p>
        </div>
      )}
      {forecast.length > 0 && (
        <div className="forecast">
          <h3>Forecast</h3>
          {forecast.map((item, index) => (
            <div key={index} className="forecast-item">
              <p>{new Date(item.dt_txt).toLocaleDateString()}</p>
              <div className="forecast-icon">{getWeatherIcon(item.weather[0].description)}</div>
              <p>Temperature: {Math.round(item.main.temp)}°{unit === 'metric' ? 'C' : 'F'}</p>
            </div>
          ))}
        </div>
      )}
      {recentLocations.length > 0 && (
        <div className="recent-locations">
          <h3>Recent Searches</h3>
          <ul>
            {recentLocations.map((loc, index) => (
              <li key={index} onClick={() => fetchWeather(loc)}>{loc}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default App;
