// Configuración
const API_URL = 'http://localhost:5000/api';

// Función genérica para hacer peticiones
async function peticionAPI(endpoint, metodo = 'GET', datos = null) {
    const opciones = {
        method: metodo,
        headers: {
            'Content-Type': 'application/json',
        }
    };

    if (datos) {
        opciones.body = JSON.stringify(datos);
    }

    try {
        const respuesta = await fetch(`${API_URL}${endpoint}`, opciones);
        return await respuesta.json();
    } catch (error) {
        console.error('Error en la petición:', error);
        return null;
    }
}

// Funciones específicas
async function obtenerTransacciones() {
    return await peticionAPI('/transacciones');
}

async function crearTransaccion(transaccion) {
    return await peticionAPI('/transacciones', 'POST', transaccion);
}

async function obtenerCategorias() {
    return await peticionAPI('/categorias');
}

async function obtenerUsuarios() {
    return await peticionAPI('/usuarios');
}

// Función para ACTUALIZAR una transacción (EDITAR)
async function actualizarTransaccion(id, transaccion) {
    const opciones = {
        method: 'PUT',  // PUT = actualizar
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(transaccion)
    };

    try {
        const respuesta = await fetch(`${API_URL}/transacciones/${id}`, opciones);
        return await respuesta.json();
    } catch (error) {
        console.error('Error al actualizar:', error);
        return null;
    }
}

// Función para ELIMINAR una transacción
async function eliminarTransaccionAPI(id) {
    const opciones = {
        method: 'DELETE',  // DELETE = eliminar
        headers: {
            'Content-Type': 'application/json',
        }
    };

    try {
        const respuesta = await fetch(`${API_URL}/transacciones/${id}`, opciones);
        return await respuesta.json();
    } catch (error) {
        console.error('Error al eliminar:', error);
        return null;
    }
}