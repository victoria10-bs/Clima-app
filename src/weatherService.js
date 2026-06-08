const API_KEY = '5cdad481530bec71caef555a2ace3ec8';
const BASE_URL = 'https://api.openweathermap.org/data/2.5';

// 1. Obtener clima actual
export const obtenerClima = async (ciudad) => {
    try {
        const response = await fetch(
            `${BASE_URL}/weather?q=${ciudad}&appid=${API_KEY}&units=metric&lang=es`
        );
        if (!response.ok) throw new Error('Ciudad no encontrada');
        return await response.json();
    } catch (error) {
        console.error("Error en obtenerClima:", error);
        throw error;
    }
};

// 2. Obtener pronóstico extendido
export const obtenerPronostico = async (ciudad) => {
    try {
        const response = await fetch(
            `${BASE_URL}/forecast?q=${ciudad}&appid=${API_KEY}&units=metric&lang=es`
        );
        if (!response.ok) throw new Error('No se pudo obtener el pronóstico');
        const data = await response.json();
        
        // Filtramos para obtener una lectura por día (OpenWeather devuelve cada 3 horas)
        // Agrupamos tomando la medida de las 12:00 del mediodía de cada día
        const pronosticoFiltrado = data.list.filter(item => item.dt_txt.includes("12:00:00"));
        return pronosticoFiltrado;
    } catch (error) {
        console.error("Error en obtenerPronostico:", error);
        throw error;
    }
};