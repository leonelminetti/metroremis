let intervalo;
let puntos = [];

function iniciar() {
    const tiempo = parseInt(document.getElementById('tiempo').value) * 1000;
    document.getElementById('btnFinalizar').disabled = false;
    document.getElementById('tiempo').disabled = true;
    document.getElementById('bajadaBandera').disabled = true;
    document.getElementById('precioMetro').disabled = true;
    document.getElementById('resultadoFinal').style.display = 'none'; // Oculta el total final al iniciar
    
    if (navigator.geolocation) {
        intervalo = setInterval(registrarPunto, tiempo);
        registrarPunto();
    } else {
        alert("Tu dispositivo no soporta geolocalización.");
        document.getElementById('btnFinalizar').disabled = true;
        document.getElementById('tiempo').disabled = false;
        document.getElementById('bajadaBandera').disabled = false;
        document.getElementById('precioMetro').disabled = false;
    }
}

function finalizar() {
    clearInterval(intervalo);
    document.getElementById('btnFinalizar').disabled = true;
    document.getElementById('tiempo').disabled = false;
    document.getElementById('bajadaBandera').disabled = false;
    document.getElementById('precioMetro').disabled = false;
    
    // Calcula y muestra el total al finalizar
    const totalDistancia = puntos.reduce((sum, punto) => sum + parseFloat(punto.distancia), 0).toFixed(2);
    const bajadaBandera = parseFloat(document.getElementById('bajadaBandera').value);
    const precioMetro = parseFloat(document.getElementById('precioMetro').value);
    const costoFinal = (bajadaBandera + (totalDistancia * precioMetro)).toFixed(2);

    document.getElementById('distanciaFinalValor').textContent = totalDistancia;
    document.getElementById('costoFinalValor').textContent = costoFinal;
    document.getElementById('resultadoFinal').style.display = 'block';
    alert(`Viaje finalizado.\nDistancia total: ${totalDistancia} metros\nCosto total: $${costoFinal}`);
}

function reiniciar() {
    clearInterval(intervalo);
    puntos = [];
    actualizarGrilla();
    document.getElementById('totalDistancia').textContent = '0';
    document.getElementById('costoEnCurso').textContent = '0.00';
    document.getElementById('resultadoFinal').style.display = 'none';
    document.getElementById('btnFinalizar').disabled = true;
    document.getElementById('tiempo').disabled = false;
    document.getElementById('bajadaBandera').disabled = false;
    document.getElementById('precioMetro').disabled = false;
}

function registrarPunto() {
    navigator.geolocation.getCurrentPosition(
        (position) => {
            const lat = position.coords.latitude.toFixed(6);
            const lon = position.coords.longitude.toFixed(6);
            
            let distancia = 0;
            if (puntos.length > 0) {
                const ultimoPunto = puntos[puntos.length - 1];
                distancia = calcularDistancia(
                    ultimoPunto.lat, 
                    ultimoPunto.lon, 
                    lat, 
                    lon
                ).toFixed(2);
            }
            
            puntos.push({lat, lon, distancia});
            actualizarGrilla();
            actualizarTotales();
        },
        (error) => {
            console.error("Error obteniendo ubicación:", error);
            alert("No se pudo obtener la ubicación. Verifica el GPS o permisos.");
            finalizar();
        },
        {
            enableHighAccuracy: true,
            timeout: 5000,
            maximumAge: 0
        }
    );
}

function calcularDistancia(lat1, lon1, lat2, lon2) {
    const R = 6371000;
    const φ1 = lat1 * Math.PI/180;
    const φ2 = lat2 * Math.PI/180;
    const Δφ = (lat2-lat1) * Math.PI/180;
    const Δλ = (lon2-lon1) * Math.PI/180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
             Math.cos(φ1) * Math.cos(φ2) *
             Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c;
}

function actualizarGrilla() {
    const grilla = document.getElementById('grilla');
    grilla.innerHTML = '';
    
    puntos.forEach((punto, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${index + 1}</td>
            <td>${punto.lat}</td>
            <td>${punto.lon}</td>
            <td>${punto.distancia}</td>
        `;
        grilla.appendChild(row);
    });
}

function actualizarTotales() {
    const totalDistancia = puntos.reduce((sum, punto) => sum + parseFloat(punto.distancia), 0).toFixed(2);
    const bajadaBandera = parseFloat(document.getElementById('bajadaBandera').value);
    const precioMetro = parseFloat(document.getElementById('precioMetro').value);
    const costoEnCurso = (bajadaBandera + (totalDistancia * precioMetro)).toFixed(2);

    document.getElementById('totalDistancia').textContent = totalDistancia;
    document.getElementById('costoEnCurso').textContent = costoEnCurso;
}