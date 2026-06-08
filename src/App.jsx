import React, { useState, useEffect } from 'react';
import { obtenerClima, obtenerPronostico } from './weatherService';
import './App.css';
import MapaClima from '../src/components/MapaClima';

function App() {
  const [busqueda, setBusqueda] = useState('');
  const [climaActual, setClimaActual] = useState(null); // Guardamos la respuesta original del día de hoy
  const [climaSeleccionado, setClimaSeleccionado] = useState(null); // Controla lo que se muestra en pantalla
  const [pronostico, setPronostico] = useState([]);
  const [error, setError] = useState(null);
  const [cargando, setCargando] = useState(false);

  useEffect(() => {
    ejecutarBusqueda('Argentina');
  }, []);

  const ejecutarBusqueda = async (ciudadALaborar) => {
    if (!ciudadALaborar.trim()) return;
    
    setCargando(true);
    setError(null);
    try {
      const datosClima = await obtenerClima(ciudadALaborar);
      const datosPronostico = await obtenerPronostico(ciudadALaborar);
      
     const diasVistos = new Set();
      const pronostico6Dias = datosPronostico.filter(item => {
        const fecha = item.dt_txt.split(' ')[0]; // Toma solo 'YYYY-MM-DD'
        if (!diasVistos.has(fecha)) {
          diasVistos.add(fecha);
          return true;
        }
        return false;
      }).slice(0, 6); // Aseguramos que entren hasta 6 días si están disponibles

      setClimaActual(datosClima);
      setClimaSeleccionado(datosClima); 
      setPronostico(pronostico6Dias); // Guardamos los 6 días completos
    } catch (err) {
      setError('No se encontró la ciudad. Intenta de nuevo.');
      setClimaActual(null);
      setClimaSeleccionado(null);
      setPronostico([]);
    } finally {
      setCargando(false);
    }
  };

  const manejarSubmit = (e) => {
    e.preventDefault();
    ejecutarBusqueda(busqueda);
  };

  // Función para transformar el formato del pronóstico al formato que lee la tarjeta principal
  const seleccionarDiaPronostico = (dia) => {
    const estructuraFormateada = {
      name: climaActual.name,
      sys: { country: climaActual.sys.country },
      dt_txt: dia.dt_txt, // <- ¡Asegúrate de agregar esta línea exacta!
      main: {
        temp: dia.main.temp,
        feels_like: dia.main.feels_like,
        humidity: dia.main.humidity,
      },
      weather: [{ icon: dia.weather[0].icon, description: dia.weather[0].description }],
      wind: { speed: dia.wind.speed }
    };
    setClimaSeleccionado(estructuraFormateada);
  };

  const obtenerColorFondo = () => {
    if (!climaSeleccionado) return '#4a90e2';
    const temp = climaSeleccionado.main.temp;
    if (temp > 25) return '#e67e22'; 
    if (temp < 10) return '#34495e'; 
    return '#2c3e50'; 
  };

  const formatearDia = (txt) => {
    const fecha = new Date(txt);
    return fecha.toLocaleDateString('es-ES', { weekday: 'long' });
  };

return (
    <div className="contenedor-padre" style={{ backgroundColor: obtenerColorFondo() }}>
      <div className="mapa-fondo-contenedor">
        <MapaClima 
        lat={climaActual?.coord?.lat} 
          lon={climaActual?.coord?.lon}
        />
      </div>
      <div className="tarjeta-principal">
        
        <h1 className="titulo-app">Aplicación del tiempo 🌤️</h1>
        
        <form onSubmit={manejarSubmit} className="formulario-busqueda">
          <input
            type="text"
            placeholder="Introduce una ciudad..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="input-busqueda"
          />
          <button type="submit" className="boton-buscar">Buscar</button>
        </form>

        {cargando && <p className="mensaje-estado">Buscando datos del clima...</p>}
        {error && <p className="mensaje-error">{error}</p>}

        {climaSeleccionado && !cargando && (
          <div>
            {/* Texto del día arriba de la ciudad */}
            <p className="dia_actual_texto">
              {climaSeleccionado.dt_txt ? formatearDia(climaSeleccionado.dt_txt) : 'Hoy'}
            </p>
            
            <h2 className="ciudad-titulo">{climaSeleccionado.name}, {climaSeleccionado.sys.country}</h2>
            
            <div className="bloque-central">
              <img 
                src={`https://openweathermap.org/img/wn/${climaSeleccionado.weather[0].icon}@2x.png`} 
                alt={climaSeleccionado.weather[0].description} 
              />
              <span className="temperatura-principal">{Math.round(climaSeleccionado.main.temp)}°C</span>
            </div>

            <p className="descripcion-clima">{climaSeleccionado.weather[0].description}</p>

            {/* Grid de detalles extra */}
            <div className="detalles-grid">
              <div className="detalle-item">
                <span>Sensación</span>
                <strong>{Math.round(climaSeleccionado.main.feels_like)}°C</strong>
              </div>
              <div className="detalle-item">
                <span>Humedad</span>
                <strong>{climaSeleccionado.main.humidity}%</strong>
              </div>
              <div className="detalle-item">
                <span>Viento</span>
                <strong>{climaSeleccionado.wind.speed} m/s</strong>
              </div>
            </div>

            {/* Botón para volver al día de hoy */}
            {climaSeleccionado.main.temp !== climaActual.main.temp && (
              <button onClick={() => setClimaSeleccionado(climaActual)} className="boton-volver-hoy">
                Volver a Hoy
              </button>
            )}

            {/* Pronóstico extendido con Scroll Horizontal */}
            {pronostico.length > 0 && (
              <div className="seccion-pronostico">
                <h3 className="subtitulo-pronostico">Ver detalles de los próximos días:</h3>
                <div className="pronostico-grid">
                  {pronostico.map((dia, index) => (
                    <div key={index} onClick={() => seleccionarDiaPronostico(dia)} className="tarjeta-mini">
                      <span className="mini-dia">{formatearDia(dia.dt_txt)}</span>
                      <img 
                        src={`https://openweathermap.org/img/wn/${dia.weather[0].icon}.png`} 
                        alt="clima" 
                        className="mini-icono"
                      />
                      <span className="mini-temp">{Math.round(dia.main.temp)}°C</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        )}
      </div>
    </div>
  );
}


export default App;