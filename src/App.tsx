import { useState, useEffect } from 'react'
import './App.css'
import { app } from './firebase'
import { getDatabase, ref, onValue, set } from 'firebase/database'
import HopPlantSVG from './assets/hop-plant.svg'

const LUNAR_MONTH = 29.530588853

const getJulianDate = (date = new Date()) => {
  const time = date.getTime()
  const tzoffset = date.getTimezoneOffset()
  return (time / 86400000) - (tzoffset / 1440) + 2440587.5
}

const getLunarAgePercent = (date = new Date()) => {
  const normalize = (value: number) => {
    value = value - Math.floor(value)
    if (value < 0) value = value + 1
    return value
  }
  return normalize((getJulianDate(date) - 2451550.1) / LUNAR_MONTH)
}

const getLunarPhase = (date = new Date()) => {
  const age = getLunarAgePercent(date) * LUNAR_MONTH
  if (age < 1.84566) return "🌑 Luna Nueva"
  else if (age < 5.53699) return "🌒 Luna Creciente"
  else if (age < 9.22831) return "🌓 Cuarto Creciente"
  else if (age < 12.91963) return "🌔 Luna Gibosa Creciente"
  else if (age < 16.61096) return "🌕 Luna Llena"
  else if (age < 20.30228) return "🌖 Luna Gibosa Menguante"
  else if (age < 23.99361) return "🌗 Cuarto Menguante"
  else if (age < 27.68493) return "🌘 Luna Menguante"
  return "🌑 Luna Nueva"
}

const getLunarPhaseDescription = (phase: string) => {
  switch (phase) {
    case "🌑 Luna Nueva":
      return "Momento de introspección y planificación. Se cree que es ideal para sembrar cultivos de raíz."
    case "🌒 Luna Creciente":
      return "Energía ascendente, favorable para el crecimiento de hojas y tallos. Buen momento para sembrar cultivos de hoja."
    case "🌓 Cuarto Creciente":
      return "Crecimiento vigoroso. Se recomienda sembrar plantas que den frutos y flores."
    case "🌔 Luna Gibosa Creciente":
      return "Período de gran vitalidad. Las plantas absorben nutrientes con mayor facilidad."
    case "🌕 Luna Llena":
      return "Máxima energía y luminosidad. Ideal para la cosecha de frutos y flores, y para la preparación de infusiones."
    case "🌖 Luna Gibosa Menguante":
      return "Energía descendente. Favorable para el trasplante y el cuidado de las raíces."
    case "🌗 Cuarto Menguante":
      return "Período de descanso. Ideal para podar, desmalezar y preparar el suelo."
    case "🌘 Luna Menguante":
      return "Momento de mínima energía. Se recomienda evitar la siembra y enfocarse en el mantenimiento del suelo."
    default:
      return "Las fases lunares pueden influir en el crecimiento de las plantas, afectando la germinación, el desarrollo de raíces y la floración."
  }
}

const getSeasonForLatitude = (date: Date, latitude: number) => {
  const month = date.getMonth()
  const day = date.getDate()
  const isNorthernHemisphere = latitude > 0

  if (isNorthernHemisphere) {
    if ((month === 2 && day >= 20) || month === 3 || month === 4 || (month === 5 && day < 21)) return "🌸 Primavera"
    if ((month === 5 && day >= 21) || month === 6 || month === 7 || (month === 8 && day < 23)) return "☀️ Verano"
    if ((month === 8 && day >= 23) || month === 9 || month === 10 || (month === 11 && day < 21)) return "🍂 Otoño"
    return "❄️ Invierno"
  } else {
    if ((month === 2 && day >= 20) || month === 3 || month === 4 || (month === 5 && day < 21)) return "🍂 Otoño"
    if ((month === 5 && day >= 21) || month === 6 || month === 7 || (month === 8 && day < 23)) return "❄️ Invierno"
    if ((month === 8 && day >= 23) || month === 9 || month === 10 || (month === 11 && day < 21)) return "🌸 Primavera"
    return "☀️ Verano"
  }
}

function App() {
  const [soilHumidity, setSoilHumidity] = useState<number | null>(null)
  const [ambientHumidity, setAmbientHumidity] = useState<number | null>(null)
  const [temperature, setTemperature] = useState<number | null>(null)
  const [manualSoilHumidity, setManualSoilHumidity] = useState<number | null>(null)
  const [manualAmbientHumidity, setManualAmbientHumidity] = useState<number | null>(null)
  const [manualTemperature, setManualTemperature] = useState<number | null>(null)
  const [relayStatus, setRelayStatus] = useState<boolean>(false)
  const [relayThreshold, setRelayThreshold] = useState<number>(50) // Default threshold
  const [notification, setNotification] = useState<string | null>(null)
  const [latitude, setLatitude] = useState<number>(-39.1) /* Villa Regina, Río Negro */ // Configure latitude to see location-based data
  const [longitude, setLongitude] = useState<number>(-67.06667) /* Villa Regina, Río Negro */ // Configure longitude to see location-based data
  const [isDay, setIsDay] = useState<boolean | null>(null)
  const [windSpeed, setWindSpeed] = useState<number | null>(null)
  const [moonPhase, setMoonPhase] = useState<string>("")
  const [season, setSeason] = useState<string>("")
  const [isRaining, setIsRaining] = useState<boolean>(false) // New state for rain effect
  const [showLunarInfo, setShowLunarInfo] = useState<boolean>(false)
  const [locationName, setLocationName] = useState<string>('Villa Regina') // State for location name input
  const [openWeatherApiKey, setOpenWeatherApiKey] = useState<string>('') // State for OpenWeatherMap API key
  const [showRelayThreshold, setShowRelayThreshold] = useState<boolean>(false);
  const [showLocationConfig, setShowLocationConfig] = useState<boolean>(false);

  const [soilHumidityError, setSoilHumidityError] = useState<string>('');
  const [ambientHumidityError, setAmbientHumidityError] = useState<string>('');
  const [temperatureError, setTemperatureError] = useState<string>('');
  const [relayThresholdError, setRelayThresholdError] = useState<string>('');
  const [latitudeError, setLatitudeError] = useState<string>('');
  const [longitudeError, setLongitudeError] = useState<string>('');

  const toggleLunarInfo = () => {
    setShowLunarInfo(!showLunarInfo)
  }

  useEffect(() => {
    const db = getDatabase(app)
    const soilHumidityRef = ref(db, 'sensorData/soilHumidity')
    const ambientHumidityRef = ref(db, 'sensorData/ambientHumidity')
    const temperatureRef = ref(db, 'sensorData/temperature')
    const relayStatusRef = ref(db, 'relayStatus')
    const relayThresholdRef = ref(db, 'relayThreshold')

    onValue(soilHumidityRef, (snapshot) => {
      const data = snapshot.val()
      setSoilHumidity(data)
    })

    onValue(ambientHumidityRef, (snapshot) => {
      const data = snapshot.val()
      setAmbientHumidity(data)
    })

    onValue(temperatureRef, (snapshot) => {
      const data = snapshot.val()
      setTemperature(data)
      setManualTemperature(data) // Initialize manual input with current value
    })

    // Initialize manual inputs for soil and ambient humidity
    onValue(soilHumidityRef, (snapshot) => {
      const data = snapshot.val()
      setSoilHumidity(data)
      setManualSoilHumidity(data)
    })

    onValue(ambientHumidityRef, (snapshot) => {
      const data = snapshot.val()
      setAmbientHumidity(data)
      setManualAmbientHumidity(data)
    })

    onValue(relayStatusRef, (snapshot) => {
      const data = snapshot.val()
      setRelayStatus(data)
    })

    onValue(relayThresholdRef, (snapshot) => {
      const data = snapshot.val()
      if (typeof data === 'number') {
        setRelayThreshold(data)
      }
    })

  }, [])

  useEffect(() => {
    // Actualizar fase lunar, estación y tema día/noche
    const updateMoonAndSeason = () => {
      // Actualizar clase del body según día/noche
      document.body.className = isDay ? 'day' : 'night'
      const currentDate = new Date()
      setMoonPhase(getLunarPhase(currentDate))
      setSeason(getSeasonForLatitude(currentDate, latitude))
    }

    updateMoonAndSeason()
    const moonInterval = setInterval(updateMoonAndSeason, 3600000) // Actualizar cada hora

    return () => clearInterval(moonInterval)
  }, [latitude])

  useEffect(() => {
    const fetchWeatherData = async () => {
      try {
        const response = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`
        )
        const data = await response.json()
        setIsDay(data.current_weather.is_day === 1)
        setWindSpeed(data.current_weather.windspeed)
        // Simulate rain based on weather condition (e.g., if windspeed is low and not day)
        setIsRaining(data.current_weather.windspeed < 5 && data.current_weather.is_day === 0);
      } catch (error) {
        console.error('Error fetching weather data:', error)
      }
    }

    fetchWeatherData()
    const interval = setInterval(fetchWeatherData, 3600000) // Fetch every hour
    return () => clearInterval(interval)
  }, [latitude, longitude])

  const fetchCoordinates = async () => {
    if (!locationName || !openWeatherApiKey) {
      setNotification('Please enter a location name and your OpenWeatherMap API key.')
      return
    }
    try {
      const response = await fetch(`http://api.openweathermap.org/geo/1.0/direct?q=${locationName}&limit=1&appid=${openWeatherApiKey}`)
      const data = await response.json()
      if (data && data.length > 0) {
        setLatitude(data[0].lat)
        setLongitude(data[0].lon)
        setNotification(`Location updated to ${data[0].name}, ${data[0].country}`)
      } else {
        setNotification('Location not found. Please try a different name.')
      }
    } catch (error) {
      console.error('Error fetching coordinates:', error)
      setNotification('Error fetching location data. Please check your API key and network connection.')
    }
  }

  useEffect(() => {
    // Check for irrigation notification
    if (soilHumidity !== null && soilHumidity < relayThreshold && !relayStatus) {
      setNotification('Soil humidity is low! Irrigation recommended.')
    } else if (notification) {
      setNotification(null)
    }

    // Update SVG elements based on sensor data
    const soilHumidityLevel = document.getElementById('soil-humidity-level')
    if (soilHumidityLevel && soilHumidity !== null) {
      const height = (soilHumidity / 100) * 45 // Max height for soil humidity indicator
      soilHumidityLevel.setAttribute('height', `${height}`)
      soilHumidityLevel.setAttribute('y', `${295 - height}`)
    }

    const ambientHumidityIndicator = document.getElementById('ambient-humidity-indicator')
    if (ambientHumidityIndicator && ambientHumidity !== null) {
      ambientHumidityIndicator.setAttribute('opacity', `${ambientHumidity / 100}`)
    }

    const temperatureBar = document.getElementById('temperature-bar')
    if (temperatureBar && temperature !== null) {
      const height = (temperature / 50) * 50 // Assuming max temp of 50 for scaling
      temperatureBar.setAttribute('height', `${height}`)
      temperatureBar.setAttribute('y', `${150 - height}`)
    }

    // Visual effects based on weather and sensor data
    const frostEffect = document.getElementById('frost-effect')
    if (frostEffect) {
      const showFrost = temperature !== null && temperature < 5;
      frostEffect.setAttribute('opacity', showFrost ? '1' : '0');
    }

    const sunglasses = document.getElementById('sunglasses')
    if (sunglasses) {
      // Example: sunglasses if ideal temperature (e.g., 20-30C) and good humidity (e.g., > 60%)
      const showSunglasses = (temperature !== null && temperature > 20 && temperature < 30 && ambientHumidity !== null && ambientHumidity > 60);
      sunglasses.setAttribute('opacity', showSunglasses ? '1' : '0');
    }

    const windIndicator = document.getElementById('wind-indicator')
    if (windIndicator) {
      const showWind = windSpeed !== null && windSpeed > 10;
      windIndicator.setAttribute('opacity', showWind ? '1' : '0');
    }

  }, [soilHumidity, ambientHumidity, temperature, relayThreshold, relayStatus, notification, isDay, windSpeed])

  const handleThresholdChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newThreshold = Number(event.target.value)
    setRelayThreshold(newThreshold)
    const db = getDatabase(app)
    set(ref(db, 'relayThreshold'), newThreshold)
  }

  const toggleRelay = () => {
    const db = getDatabase(app)
    set(ref(db, 'relayStatus'), !relayStatus)
  }

  const handleManualSoilHumidityChange = () => {
    if (manualSoilHumidity !== null) {
      const db = getDatabase(app)
      set(ref(db, 'sensorData/soilHumidity'), manualSoilHumidity)
    }
  }

  const handleManualAmbientHumidityChange = () => {
    if (manualAmbientHumidity !== null) {
      const db = getDatabase(app)
      set(ref(db, 'sensorData/ambientHumidity'), manualAmbientHumidity)
    }
  }

  const handleManualTemperatureChange = () => {
    if (manualTemperature !== null) {
      const db = getDatabase(app)
      set(ref(db, 'sensorData/temperature'), manualTemperature)
    }
  }



  return (
    <div className={`container ${isDay ? 'day' : 'night'}`}>
      <header className="app-header">

      </header>

      <div className={`field-visualization ${isDay ? 'day' : 'night'} ${season.toLowerCase()}`}>
        {!isDay && <div className="stars"></div>}
        <div className="weather-effects">
          {isDay ? (
            <>
              <div className="sun" />
              <div className="clouds">
                <div className="cloud"></div>
                <div className="cloud"></div>
                <div className="cloud"></div>
                <div className="cloud"></div>
              </div>
            </>
          ) : (
            <div className="moon-container" onClick={toggleLunarInfo}>
              <div className="moon" data-phase={moonPhase.split(' ')[0]} />
              {showLunarInfo && (
                <div className="lunar-info-note">
                  <h4>Fase Lunar: {moonPhase}</h4>
                  <p>{getLunarPhaseDescription(moonPhase)}</p>
                </div>
              )}

            </div>
          )}
          {temperature !== null && temperature < 5 && <div className="frost-effect" />}
          {isRaining && (
            <div className="rain">
              {Array.from({ length: 50 }).map((_, i) => (
                <div
                  key={i}
                  className="drop"
                  style={{
                    left: `${Math.random() * 100}%`,
                    animationDuration: `${0.5 + Math.random() * 0.5}s`,
                    animationDelay: `${Math.random() * 5}s`,
                  }}
                ></div>
              ))}
            </div>
          )}
          {windSpeed !== null && windSpeed > 20 && <div className="wind-effect" />}
        </div>
        <div className="ground">
          <img src={HopPlantSVG} className="plant-on-ground" alt="hop plant" />
          <img src={HopPlantSVG} className="plant-on-ground" alt="hop plant" />
          <img src={HopPlantSVG} className="plant-on-ground" alt="hop plant" />
        </div>
        <div className="irrigation-bar"></div>
        <div className="plants-grid">
        </div>
      </div>
      <div className="data-card-container">
        <div className="data-card sensor-data">
          <h2>Datos del Sensor</h2>
        <div className="data-item">
          <span className="label">Humedad del Suelo:</span>
          <span className="value">{soilHumidity !== null ? `${soilHumidity}%` : 'Cargando...'}</span>
        </div>
        <div className="data-item">
          <span className="label">Humedad Ambiente:</span>
          <span className="value">{ambientHumidity !== null ? `${ambientHumidity}%` : 'Cargando...'}</span>
        </div>
        <div className="data-item">
          <span className="label">Temperatura:</span>
          <span className="value">{temperature !== null ? `${temperature}°C` : 'Cargando...'}</span>
        </div>
        <div className="data-item">
          <span className="label">Día:</span>
          <span className="value">{isDay !== null ? (isDay ? '☀️ Sí' : '🌙 No') : 'Cargando...'}</span>
        </div>
        <div className="data-item">
          <span className="label">Velocidad del Viento:</span>
          <span className="value">{windSpeed !== null ? `${windSpeed} km/h` : 'Cargando...'}</span>
        </div>
        <div className="data-item">
          <span className="label">Fase Lunar:</span>
          <span className="value">{moonPhase || 'Cargando...'}</span>
        </div>
        <div className="data-item">
          <span className="label">Estación:</span>
          <span className="value">{season || 'Cargando...'}</span>
        </div>
      </div>

      <div className="data-card manual-sensor-control">

        <label>
          Humedad del Suelo:
          <input
            type="number"
            value={manualSoilHumidity !== null ? manualSoilHumidity : ''}
            onChange={(e) => {
              const value = Number(e.target.value);
              if (value < 0 || value > 100) {
                setSoilHumidityError('La humedad del suelo debe estar entre 0 y 100.');
              } else {
                setSoilHumidityError('');
                setManualSoilHumidity(value);
              }
            }}
            min="0"
            max="100"
          />
          {soilHumidityError && <span className="error-message">{soilHumidityError}</span>}
          <button onClick={handleManualSoilHumidityChange}>Establecer</button>
        </label>
        <label>
          Humedad Ambiente:
          <input
            type="number"
            value={manualAmbientHumidity !== null ? manualAmbientHumidity : ''}
            onChange={(e) => {
              const value = Number(e.target.value);
              if (value < 0 || value > 100) {
                setAmbientHumidityError('La humedad ambiente debe estar entre 0 y 100.');
              } else {
                setAmbientHumidityError('');
                setManualAmbientHumidity(value);
              }
            }}
            min="0"
            max="100"
          />
          {ambientHumidityError && <span className="error-message">{ambientHumidityError}</span>}
          <button onClick={handleManualAmbientHumidityChange}>Establecer</button>
        </label>
        <label>
          Temperatura:
          <input
            type="number"
            value={manualTemperature !== null ? manualTemperature : ''}
            onChange={(e) => {
              const value = Number(e.target.value);
              // Assuming a reasonable temperature range, e.g., -50 to 50 Celsius
              if (value < -50 || value > 50) {
                setTemperatureError('La temperatura debe estar entre -50 y 50.');
              } else {
                setTemperatureError('');
                setManualTemperature(value);
              }
            }}
            step="0.1"
          />
          {temperatureError && <span className="error-message">{temperatureError}</span>}
          <button onClick={handleManualTemperatureChange}>Establecer</button>
        </label>
      </div>
      </div>

      <div className="relay-control">
        <button onClick={() => setShowRelayThreshold(!showRelayThreshold)} className="collapsible-header">
          Umbral de Riego
        </button>
        {showRelayThreshold && (
          <div className="collapsible-content">
            <label>
              Umbral de Riego (%):
              <input
                type="number"
                value={relayThreshold}
                onChange={(e) => {
                  const value = Number(e.target.value);
                  if (value < 0 || value > 100) {
                    setRelayThresholdError('El umbral de riego debe estar entre 0 y 100.');
                  } else {
                    setRelayThresholdError('');
                    handleThresholdChange(e);
                  }
                }}
                min="0"
                max="100"
              />
              {relayThresholdError && <span className="error-message">{relayThresholdError}</span>}
            </label>
            <button onClick={toggleRelay}>
              {relayStatus ? 'Apagar Riego' : 'Encender Riego'}
            </button>
          </div>
        )}
      </div>

      <div className="irrigation-status-mobile">
        <div className="tap-icon">
          {relayStatus ? '💧' : '🚰'}
          <span className="tap-status">
            {relayStatus ? 'Falta humedad en el suelo (riego activo)' : 'Humedad de suelo adecuada (riego inactivo)'}
          </span>
        </div>
      </div>

      <div className="location-config">
        <button onClick={() => setShowLocationConfig(!showLocationConfig)} className="collapsible-header">
          Configuración de Ubicación
        </button>
        {showLocationConfig && (
          <div className="collapsible-content">
            <label>
              Latitud:
              <input
                type="number"
                value={latitude}
                onChange={(e) => {
                  const value = Number(e.target.value);
                  if (value < -90 || value > 90) {
                    setLatitudeError('La latitud debe estar entre -90 y 90.');
                  } else {
                    setLatitudeError('');
                    setLatitude(value);
                  }
                }}
                step="0.01"
              />
              {latitudeError && <span className="error-message">{latitudeError}</span>}
            </label>
            <label>
              Longitud:
              <input
                type="number"
                value={longitude}
                onChange={(e) => {
                  const value = Number(e.target.value);
                  if (value < -180 || value > 180) {
                    setLongitudeError('La longitud debe estar entre -180 y 180.');
                  } else {
                    setLongitudeError('');
                    setLongitude(value);
                  }
                }}
                step="0.01"
              />
              {longitudeError && <span className="error-message">{longitudeError}</span>}
            </label>
            <label>
              Buscar por Nombre:
              <input
                type="text"
                placeholder="Ej. Chacra Arana"
                value={locationName}
                onChange={(e) => setLocationName(e.target.value)}
              />
            </label>
            <label>
              OpenWeatherMap API Key:
              <input
                type="text"
                placeholder="Tu API Key"
                value={openWeatherApiKey}
                onChange={(e) => setOpenWeatherApiKey(e.target.value)}
              />
            </label>
            <button onClick={fetchCoordinates}>Buscar Ubicación</button>
          </div>
        )}
      </div>

      {notification && <div className="notifications">{notification}</div>}


    </div>
  )
}

export default App
