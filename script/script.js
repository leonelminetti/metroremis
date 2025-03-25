let intervalo;
let puntos = [];
let tiempoEspera = 0;
let tiempoViaje = 0;
let intervaloCronometroEspera;
let intervaloCronometroViaje;
let estaPausado = false;
let configuracionGuardada = false;

// Función para obtener los decimales de un número
function getDecimals(num) {
    return Math.abs(num) - Math.floor(Math.abs(num));
}

function guardarConfig() {
    const tiempo = parseInt(document.getElementById('tiempo').value);
    const bajadaBandera = parseFloat(document.getElementById('bajadaBandera').value);
    const precioMetro = parseFloat(document.getElementById('precioMetro').value);
    const precioEspera = parseFloat(document.getElementById('precioEspera').value);

    const configMessage = document.getElementById('configMessage');

    if (isNaN(tiempo) || tiempo <= 0 || isNaN(bajadaBandera) || isNaN(precioMetro) || isNaN(precioEspera)) {
        configMessage.textContent = "Por favor, ingresa valores válidos.";
        configMessage.style.color = "red";
        configuracionGuardada = false;
        return;
    }

    configMessage.textContent = "Configuraciones guardadas. Haz clic en el ícono para continuar.";
    configMessage.style.color = "#006600";
    configuracionGuardada = true;
}

function irAPantallaPrincipal() {
    if (!configuracionGuardada) {
        const configMessage = document.getElementById('configMessage');
        configMessage.textContent = "Por favor, guarda las configuraciones primero.";
        configMessage.style.color = "red";
        return;
    }

    document.getElementById('configPage').classList.remove('active');
    document.getElementById('mainPage').classList.add('active');
}

function iniciar() {
    const tiempo = parseInt(document.getElementById('tiempo').value) * 1000;
    document.getElementById('btnPlay').disabled = true;
    document.getElementById('btnPause').disabled = false;
    document.getElementById('btnStop').disabled = false;

    if (navigator.geolocation) {
        intervalo = setInterval(registrarPunto, tiempo);
        intervaloCronometroViaje = setInterval(actualizarCronometroViaje, 1000);
        registrarPunto();
    } else {
        alert("Tu dispositivo no soporta geolocalización.");
        reiniciar();
    }
}

function pausar() {
    if (!estaPausado) {
        clearInterval(intervalo);
        clearInterval(intervaloCronometroViaje);
        intervaloCronometroEspera = setInterval(actualizarCronometroEspera, 1000);
        document.getElementById('btnPlay').disabled = false;
        document.getElementById('btnPause').innerHTML = `
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M5 3L19 12L5 21V3Z" fill="white"/>
            </svg>`;
        estaPausado = true;
    } else {
        clearInterval(intervaloCronometroEspera);
        const tiempo = parseInt(document.getElementById('tiempo').value) * 1000;
        intervalo = setInterval(registrarPunto, tiempo);
        intervaloCronometroViaje = setInterval(actualizarCronometroViaje, 1000);
        document.getElementById('btnPlay').disabled = true;
        document.getElementById('btnPause').innerHTML = `
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M6 4H10V20H6V4Z" fill="white"/>
                <path d="M14 4H18V20H14V4Z" fill="white"/>
            </svg>`;
        estaPausado = false;
    }
}

function finalizar() {
    if (confirm("¿Estás seguro de que quieres finalizar el viaje?")) {
        clearInterval(intervalo);
        clearInterval(intervaloCronometroEspera);
        clearInterval(intervaloCronometroViaje);
        document.getElementById('btnPlay').disabled = false;
        document.getElementById('btnPause').disabled = true;
        document.getElementById('btnStop').disabled = true;
        document.getElementById('btnPause').innerHTML = `
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M6 4H10V20H6V4Z" fill="white"/>
                <path d="M14 4H18V20H14V4Z" fill="white"/>
            </svg>`;
        estaPausado = false;
    }
}

function reiniciar() {
    clearInterval(intervalo);
    clearInterval(intervaloCronometroEspera);
    clearInterval(intervaloCronometroViaje);
    puntos = [];
    tiempoEspera = 0;
    tiempoViaje = 0;
    estaPausado = false;
    configuracionGuardada = false;
    actualizarGrilla();
    document.getElementById('totalDistancia').textContent = '0';
    document.getElementById('costoEnCurso').textContent = '0.00';
    document.getElementById('tiempoEspera').textContent = '00:00';
    document.getElementById('tiempoViaje').textContent = '00:00';
    document.getElementById('btnPlay').disabled = false;
    document.getElementById('btnPause').disabled = true;
    document.getElementById('btnStop').disabled = true;
    document.getElementById('btnPause').innerHTML = `
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M6 4H10V20H6V4Z" fill="white"/>
            <path d="M14 4H18V20H14V4Z" fill="white"/>
        </svg>`;
    document.getElementById('configMessage').textContent = "";
    document.getElementById('mainPage').classList.remove('active');
    document.getElementById('configPage').classList.add('active');
}

function volverAConfig() {
    clearInterval(intervalo);
    clearInterval(intervaloCronometroEspera);
    clearInterval(intervaloCronometroViaje);
    puntos = [];
    tiempoEspera = 0;
    tiempoViaje = 0;
    estaPausado = false;
    document.getElementById('totalDistancia').textContent = '0';
    document.getElementById('costoEnCurso').textContent = '0.00';
    document.getElementById('tiempoEspera').textContent = '00:00';
    document.getElementById('tiempoViaje').textContent = '00:00';
    document.getElementById('btnPlay').disabled = false;
    document.getElementById('btnPause').disabled = true;
    document.getElementById('btnStop').disabled = true;
    document.getElementById('btnPause').innerHTML = `
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M6 4H10V20H6V4Z" fill="white"/>
            <path d="M14 4H18V20H14V4Z" fill="white"/>
        </svg>`;
    document.getElementById('mainPage').classList.remove('active');
    document.getElementById('configPage').classList.add('active');
}

function registrarPunto() {
    navigator.geolocation.getCurrentPosition(
        (position) => {
            const lat = position.coords.latitude.toFixed(6);
            const lon = position.coords.longitude.toFixed(6);
            let distancia = 0;
            if (puntos.length > 0) {
                const ultimoPunto = puntos[puntos.length - 1];
                distancia = calcularDistancia(ultimoPunto.lat, ultimoPunto.lon, lat, lon).toFixed(2);
            }
            puntos.push({ lat, lon, distancia });
            actualizarGrilla();
            actualizarTotales();
        },
        (error) => {
            console.error("Error obteniendo ubicación:", error);
            alert("No se pudo obtener la ubicación.");
            finalizar();
        },
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
    );
}

function calcularDistancia(lat1, lon1, lat2, lon2) {
    const R = 6371000;
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

function actualizarGrilla() {
    // Función mantenida pero sin efecto visible
}

function actualizarTotales() {
    const totalDistancia = puntos.reduce((sum, punto) => sum + parseFloat(punto.distancia), 0).toFixed(2);
    const bajadaBandera = parseFloat(document.getElementById('bajadaBandera').value);
    const precioCuadra = parseFloat(document.getElementById('precioMetro').value); // Precio por cuadra
    const precioEspera = parseFloat(document.getElementById('precioEspera').value);

    // Calcular las cuadras completas y el resto
    const metrosPorCuadra = 100;
    const multiplicar = totalDistancia / metrosPorCuadra;
    let costoCuadras = Math.trunc(multiplicar) * precioCuadra;

    // Si el decimal es mayor a 0.3, sumamos una cuadra adicional
    if (getDecimals(multiplicar) > 0.3) {
        costoCuadras += precioCuadra;
    }

    // Calcular el costo por tiempo de espera
    const costoEspera = (tiempoEspera / 3600) * precioEspera;

    // Calcular el costo total
    const costoEnCurso = (bajadaBandera + costoCuadras + costoEspera).toFixed(2);

    // Actualizar los valores en la interfaz
    document.getElementById('totalDistancia').textContent = totalDistancia;
    document.getElementById('costoEnCurso').textContent = costoEnCurso;
}

function actualizarCronometroEspera() {
    tiempoEspera++;
    document.getElementById('tiempoEspera').textContent = formatTiempo(tiempoEspera);
    actualizarTotales();
}

function actualizarCronometroViaje() {
    tiempoViaje++;
    document.getElementById('tiempoViaje').textContent = formatTiempo(tiempoViaje);
}

function formatTiempo(segundos) {
    const mins = Math.floor(segundos / 60).toString().padStart(2, '0');
    const secs = (segundos % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
}