import React, { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import MarkerClusterGroup from "react-leaflet-markercluster";
import "react-leaflet-markercluster/dist/styles.min.css";
import '../App.css';

const limitDecimalPlaces = (value, decimalPlaces) => {
    const pattern = new RegExp(`^-?\\d+(\\.\\d{1,${decimalPlaces}})?`);
    const match = value.toString().match(pattern);
    return match ? parseFloat(match[0]) : value;
};

const cityIcon = (cityName, temperature) => {
    const iconColor = getIconColor(temperature);
    return L.divIcon({
        className: "custom-icon",
        html: `<div class="custom-marker">
                    <div class="marker-dot"></div>
                    <div class="temperature-city-block">
                    <div class="temperature">${temperature !== undefined ? temperature : ''}</div>
                    <div class="city-name" style="background-color: ${iconColor};">${cityName}</div>
                    </div>
                    </div>`,
                    iconAnchor: [5, 5],
        iconSize: [170, 40],
    });
};

  const getIconColor = (temperature) => {
    if (temperature <= 0) return '#0090f7'; // Blue
    else if (temperature < 10) return '#87CEEB'; // Light blue
    else if (temperature <= 20) return '#f2da4e'; // Yellow
    else if (temperature < 30) return '#edb232'; // Orange
    else return '#FF6347' // Red
};

const WorldMap = ({ citiesData, weatherData, fetchCompleted }) => {
    const kelvinToCelsius = (kelvin) => {
        return Math.round(kelvin - 273.15);
    };

    const maxBounds = [
    [-110, -200], // Southwest coordinates
    [110, 200],   // Northeast coordinates
  ];

    useEffect(() => {
        // This effect will re-run whenever fetchCompleted changes
        console.log("Fetch completed:", fetchCompleted);
      }, [fetchCompleted]);

    return (
        <MapContainer center={[0, 0]} zoom={2.5} style={{ height: '100vh', width: '100%', boxShadow: '0 0 10px rgba(200, 200, 200, 2' }} maxBounds={maxBounds} maxBoundsViscosity={5.0}>
            <TileLayer
                url="https://services.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}"
                attribution='&copy; Esri'
            />
            <TileLayer
                url="https://tile.openweathermap.org/map/temp_new/{z}/{x}/{y}.png?appid=a82f301e4fe13da3d06942a9363cc05b"
                attribution='&copy; OpenWeatherMap'
                />
                
            <MarkerClusterGroup>
            {fetchCompleted && citiesData.map((city) => {
                const roundedLat = limitDecimalPlaces(city.lat, 2);
                const roundedLon = limitDecimalPlaces(city.lon, 2);
                const cityName = city.name;
                const weather = weatherData[cityName];
                const temperature = kelvinToCelsius(weather[0]?.main?.temp);
                return (
                    <Marker key={cityName} position={[roundedLat, roundedLon]} icon={cityIcon(cityName, temperature)}>
                        
                        <Popup>
                            <h2>{cityName}, {city.country}</h2>
                            {weather && weather[0]?.weather ? (
                                <div>
                                    
                                    <p>Temp: {temperature}°C</p>
                                    <p>Description: {weather[0]?.weather[0]?.description}</p>
                                </div>
                            ) : (
                                <p>Loading Weather...</p>
                            )}
                        </Popup>
                    </Marker>
                );
            })}
            </MarkerClusterGroup>
        </MapContainer>
    );
};

export default WorldMap;