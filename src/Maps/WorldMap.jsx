import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { fetchCityData } from "../API/GetAPI";
import citiesData from "../API/cities_list.json";

const limitDecimalPlaces = (value, decimalPlaces) => {
    const pattern = new RegExp(`^-?\\d+(\\.\\d{1,${decimalPlaces}})?`);
    const match = value.toString().match(pattern);
    return match ? parseFloat(match[0]) : value;
};

const WorldMap = () => {
    const [weatherData, setWeatherData] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const weatherPromises = citiesData.map(city => fetchCityData(limitDecimalPlaces(city.lat, 2), limitDecimalPlaces(city.lon, 2)));
                const weatherResults = await Promise.all(weatherPromises);
                const data = {};
                citiesData.forEach((city, index) => {
                    const matchingWeather = weatherResults[index];
                    if (matchingWeather) {
                        const cityName = city.name;
                        data[cityName] = matchingWeather;
                        console.log(`${cityName} weather:`, matchingWeather);
                    } else {
                        console.error(`Weather data not found for city: ${city.name}`);
                    }
                });
                console.log('Weather data:', data);
                setWeatherData(data); 
            } catch (error) {
                console.error('Error fetching weather data:', error);
            }
        };

        fetchData();
    }, []);


    return (
        <MapContainer center={[0, 0]} zoom={2.5} style={{ height: '100vh', width: '100%', boxShadow: '0 0 10px rgba(200, 200, 200, 2' }}>
            <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            {citiesData.map((city) => {
                const roundedLat = limitDecimalPlaces(city.lat, 2);
                const roundedLon = limitDecimalPlaces(city.lon, 2);
                const cityName = city.name;
                const weather = weatherData[cityName];
                return (
                    <Marker key={cityName} position={[roundedLat, roundedLon]}>
                        <Popup>
                            <h2>{cityName}</h2>
                            {weather ? (
                                <div>
                                    <p>Temp: {weather.main.temp}°C</p>
                                    <p>Name: {weather.name}</p>
                                </div>
                            ) : (
                                <p>Loading Weather...</p>
                            )}
                        </Popup>
                    </Marker>
                );
            })}
        </MapContainer>
    );
};

export default WorldMap;