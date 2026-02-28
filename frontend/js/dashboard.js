// ============================================
// FINANZAPP - DASHBOARD COMPLETO Y FUNCIONAL
// ============================================

// Variables globales
let grafico = null;
let transaccionesGlobales = [];
let confirmCallback = null;

// ============================================
// INICIALIZACIÓN
// ============================================
document.addEventListener('DOMContentLoaded', function() {
    console.log('✅ Dashboard cargado');
    verificarLogin();
    cargarTransacciones();
    configurarModal();
    cargarCategoriasEnSelect();
    configurarModalConfirmacion();
    
    // Verificar que el botón existe
    const btn = document.getElementById('btnNuevaTransaccion');
    if (btn) {
        console.log('✅ Botón + Nueva transacción encontrado');
    } else {
        console.error('❌ Botón NO encontrado');
    }
});

// ============================================
// FUNCIONES DE AUTENTICACIÓN
// ============================================
function verificarLogin() {
    const usuario = localStorage.getItem('usuario');
    if (!usuario && window.location.pathname.includes('dashboard.html')) {
        window.location.href = 'login.html';
    }
}

function cerrarSesion() {
    localStorage.removeItem('usuario');
    window.location.href = 'index.html';
}

// ============================================
// FUNCIONES DE NOTIFICACIÓN
// ============================================
function mostrarToast(mensaje, tipo = 'success') {
    // Crear elemento
    const toast = document.createElement('div');
    toast.className = `toast-notification ${tipo}`;
    
    // Icono según tipo
    let icono = '✅';
    if (tipo === 'error') icono = '❌';
    if (tipo === 'info') icono = 'ℹ️';
    
    toast.innerHTML = `
        <span class="toast-icon">${icono}</span>
        <span class="toast-message">${mensaje}</span>
        <button class="toast-close" onclick="this.parentElement.remove()">&times;</button>
    `;
    
    // Agregar al body
    document.body.appendChild(toast);
    
    // Auto-cerrar después de 3 segundos
    setTimeout(() => {
        if (toast.parentElement) {
            toast.remove();
        }
    }, 3000);
}

// ============================================
// FUNCIONES DE CONFIRMACIÓN
// ============================================
function configurarModalConfirmacion() {
    const modal = document.getElementById('modalConfirmacion');
    if (!modal) {
        console.log('⚠️ Modal de confirmación no encontrado (lo crearemos después)');
        return;
    }
    
    const btnAceptar = document.getElementById('confirmAceptar');
    const btnCancelar = document.getElementById('confirmCancelar');
    
    btnAceptar.onclick = function() {
        modal.style.display = 'none';
        if (confirmCallback) {
            confirmCallback();
        }
    };
    
    btnCancelar.onclick = function() {
        modal.style.display = 'none';
    };
    
    window.onclick = function(event) {
        if (event.target == modal) {
            modal.style.display = 'none';
        }
    };
}

function mostrarConfirmacion(mensaje, onAceptar) {
    const modal = document.getElementById('modalConfirmacion');
    
    // Si no existe el modal, usamos confirm tradicional
    if (!modal) {
        if (confirm(mensaje)) {
            onAceptar();
        }
        return;
    }
    
    const mensajeEl = document.getElementById('confirmMensaje');
    const btnAceptar = document.getElementById('confirmAceptar');
    
    // Guardar callback
    confirmCallback = onAceptar;
    
    // Mostrar mensaje
    mensajeEl.textContent = mensaje;
    
    // Cambiar texto del botón según contexto
    if (mensaje.toLowerCase().includes('eliminar')) {
        btnAceptar.textContent = 'Eliminar';
        btnAceptar.className = 'btn btn-danger';
    } else {
        btnAceptar.textContent = 'Aceptar';
        btnAceptar.className = 'btn btn-primary';
    }
    
    // Mostrar modal
    modal.style.display = 'block';
}

// ============================================
// FUNCIONES DE TRANSACCIONES
// ============================================
async function cargarTransacciones() {
    console.log('Cargando transacciones...');
    const transacciones = await obtenerTransacciones();
    
    if (transacciones) {
        console.log('Transacciones cargadas:', transacciones.length);
        transaccionesGlobales = transacciones;
        actualizarResumen(transacciones);
        actualizarTabla(transacciones);
        actualizarGrafico(transacciones);
    }
}

function actualizarResumen(transacciones) {
    let totalIngresos = 0;
    let totalGastos = 0;
    
    transacciones.forEach(t => {
        if (t.tipo === 'ingreso') {
            totalIngresos += t.cantidad;
        } else {
            totalGastos += t.cantidad;
        }
    });
    
    const balance = totalIngresos - totalGastos;
    
    document.getElementById('totalIngresos').textContent = `$${totalIngresos.toFixed(2)}`;
    document.getElementById('totalGastos').textContent = `$${totalGastos.toFixed(2)}`;
    document.getElementById('balance').textContent = `$${balance.toFixed(2)}`;
}

function actualizarTabla(transacciones) {
    const tbody = document.getElementById('tablaTransaccionesBody');
    if (!tbody) {
        console.error('❌ Tabla no encontrada');
        return;
    }
    
    tbody.innerHTML = '';
    
    // Mostrar últimas 10 transacciones
    transacciones.slice().reverse().slice(0, 10).forEach(t => {
        const fila = document.createElement('tr');
        fila.innerHTML = `
            <td>${new Date(t.fecha).toLocaleDateString()}</td>
            <td>${t.descripcion || 'Sin descripción'}</td>
            <td>${obtenerNombreCategoria(t.categoria_id)}</td>
            <td class="${t.tipo}">${t.tipo === 'ingreso' ? '💰 Ingreso' : '💸 Gasto'}</td>
            <td class="${t.tipo}">$${t.cantidad.toFixed(2)}</td>
            <td>
                <button onclick="editarTransaccion(${t.id})" class="btn-icon" title="Editar">✏️</button>
                <button onclick="eliminarTransaccion(${t.id})" class="btn-icon" title="Eliminar">🗑️</button>
            </td>
        `;
        tbody.appendChild(fila);
    });
}

function obtenerNombreCategoria(id) {
    const nombres = {
        1: 'Salario',
        2: 'Freelance',
        3: 'Alimentación',
        4: 'Transporte',
        5: 'Entretenimiento',
        6: 'Servicios'
    };
    return nombres[id] || `Categoría ${id}`;
}

// ============================================
// FUNCIONES CRUD (CREAR, LEER, ACTUALIZAR, ELIMINAR)
// ============================================
function editarTransaccion(id) {
    console.log('Editando transacción ID:', id);
    
    const transaccion = transaccionesGlobales.find(t => t.id === id);
    if (transaccion) {
        // Llenar formulario
        document.getElementById('tipo').value = transaccion.tipo;
        document.getElementById('cantidad').value = transaccion.cantidad;
        document.getElementById('descripcion').value = transaccion.descripcion;
        document.getElementById('categoria').value = transaccion.categoria_id;
        
        // Cambiar título y botón
        document.querySelector('#modalTransaccion h3').textContent = 'Editar transacción';
        document.querySelector('#formTransaccion button[type="submit"]').textContent = 'Actualizar';
        
        // Guardar ID en modal
        const modal = document.getElementById('modalTransaccion');
        modal.dataset.editando = id;
        
        // Mostrar modal
        modal.style.display = 'block';
    }
}

async function eliminarTransaccion(id) {
    console.log('Eliminando transacción ID:', id);
    
    mostrarConfirmacion('¿Estás seguro de eliminar esta transacción? Esta acción no se puede deshacer.', async function() {
        try {
            const resultado = await eliminarTransaccionAPI(id);
            
            if (resultado && resultado.mensaje) {
                mostrarToast('✅ Transacción eliminada correctamente', 'success');
                await cargarTransacciones();
            } else {
                mostrarToast('❌ Error al eliminar la transacción', 'error');
            }
        } catch (error) {
            console.error('Error:', error);
            mostrarToast('❌ Error de conexión con el servidor', 'error');
        }
    });
}

// ============================================
// CONFIGURACIÓN DEL MODAL DE TRANSACCIONES
// ============================================
function configurarModal() {
    console.log('Configurando modal de transacciones...');
    
    const modal = document.getElementById('modalTransaccion');
    const btn = document.getElementById('btnNuevaTransaccion');
    const span = document.getElementsByClassName('close')[0];
    const form = document.getElementById('formTransaccion');
    
    // Verificar que todos los elementos existen
    if (!modal) {
        console.error('❌ Modal no encontrado');
        return;
    }
    if (!btn) {
        console.error('❌ Botón no encontrado');
        return;
    }
    if (!span) {
        console.error('❌ Botón cerrar no encontrado');
        return;
    }
    if (!form) {
        console.error('❌ Formulario no encontrado');
        return;
    }
    
    console.log('✅ Todos los elementos del modal encontrados');
    
    // ========================================
    // EVENTO: Click en + Nueva transacción
    // ========================================
    btn.onclick = function() {
        console.log('🖱️ Click en + Nueva transacción');
        
        // Limpiar formulario
        form.reset();
        
        // Valores por defecto
        document.getElementById('tipo').value = 'gasto';
        document.getElementById('categoria').value = '3';
        
        // Configurar para nueva transacción
        delete modal.dataset.editando;
        document.querySelector('#modalTransaccion h3').textContent = 'Nueva transacción';
        document.querySelector('#formTransaccion button[type="submit"]').textContent = 'Guardar';
        
        // Mostrar modal
        modal.style.display = 'block';
    };
    
    // ========================================
    // EVENTO: Cerrar modal (X)
    // ========================================
    span.onclick = function() {
        console.log('Cerrando modal');
        modal.style.display = 'none';
    };
    
    // ========================================
    // EVENTO: Cerrar modal (click fuera)
    // ========================================
    window.onclick = function(event) {
        if (event.target == modal) {
            console.log('Cerrando modal (click fuera)');
            modal.style.display = 'none';
        }
    };
    
    // ========================================
    // EVENTO: Enviar formulario
    // ========================================
    form.onsubmit = async function(e) {
        e.preventDefault();
        console.log('📤 Formulario enviado');
        
        // Obtener datos
        const transaccion = {
            cantidad: parseFloat(document.getElementById('cantidad').value),
            descripcion: document.getElementById('descripcion').value,
            tipo: document.getElementById('tipo').value,
            usuario_id: 1,
            categoria_id: parseInt(document.getElementById('categoria').value)
        };
        
        console.log('Datos:', transaccion);
        
        // Deshabilitar botón
        const boton = document.querySelector('#formTransaccion button[type="submit"]');
        const textoOriginal = boton.textContent;
        boton.textContent = 'Guardando...';
        boton.disabled = true;
        
        try {
            let resultado;
            
            if (modal.dataset.editando) {
                // ===== MODO EDICIÓN =====
                const id = parseInt(modal.dataset.editando);
                console.log('Actualizando ID:', id);
                resultado = await actualizarTransaccion(id, transaccion);
                
                if (resultado && resultado.mensaje) {
                    mostrarToast('✅ Transacción actualizada', 'success');
                }
            } else {
                // ===== MODO CREACIÓN =====
                console.log('Creando nueva transacción');
                resultado = await crearTransaccion(transaccion);
                
                if (resultado && resultado.mensaje) {
                    mostrarToast('✅ Transacción creada', 'success');
                }
            }
            
            // Cerrar modal y limpiar
            modal.style.display = 'none';
            form.reset();
            
            // Restaurar modal para nueva transacción
            delete modal.dataset.editando;
            document.querySelector('#modalTransaccion h3').textContent = 'Nueva transacción';
            boton.textContent = 'Guardar';
            
            // Recargar transacciones
            await cargarTransacciones();
            
        } catch (error) {
            console.error('Error:', error);
            mostrarToast('❌ Error al guardar la transacción', 'error');
        } finally {
            boton.textContent = textoOriginal;
            boton.disabled = false;
        }
    };
}

// ============================================
// CARGAR CATEGORÍAS
// ============================================
async function cargarCategoriasEnSelect() {
    console.log('Cargando categorías...');
    const categorias = await obtenerCategorias();
    const select = document.getElementById('categoria');
    
    if (categorias && categorias.length > 0) {
        select.innerHTML = '';
        categorias.forEach(c => {
            const option = document.createElement('option');
            option.value = c.id;
            option.textContent = c.nombre;
            select.appendChild(option);
        });
        console.log('✅ Categorías cargadas:', categorias.length);
    }
}

// ============================================
// ACTUALIZAR GRÁFICO
// ============================================
function actualizarGrafico(transacciones) {
    const canvas = document.getElementById('graficoGastos');
    if (!canvas) {
        console.error('❌ Canvas no encontrado');
        return;
    }
    
    const ctx = canvas.getContext('2d');
    
    // Filtrar solo gastos
    const gastos = transacciones.filter(t => t.tipo === 'gasto');
    const gastosPorCategoria = {};
    
    gastos.forEach(g => {
        const catId = g.categoria_id;
        gastosPorCategoria[catId] = (gastosPorCategoria[catId] || 0) + g.cantidad;
    });
    
    // Destruir gráfico anterior si existe
    if (grafico) {
        grafico.destroy();
    }
    
    // Si no hay datos, no crear gráfico
    if (Object.keys(gastosPorCategoria).length === 0) {
        console.log('No hay datos para el gráfico');
        return;
    }
    
    // Crear nuevo gráfico
    grafico = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: Object.keys(gastosPorCategoria).map(id => obtenerNombreCategoria(parseInt(id))),
            datasets: [{
                data: Object.values(gastosPorCategoria),
                backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40']
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                title: {
                    display: true,
                    text: 'Gastos por Categoría',
                    font: { size: 14 }
                },
                legend: {
                    position: 'bottom',
                    labels: {
                        boxWidth: 12,
                        font: { size: 11 }
                    }
                }
            }
        }
    });
}

// ============================================
// EVENTO CERRAR SESIÓN
// ============================================
document.addEventListener('DOMContentLoaded', function() {
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            cerrarSesion();
        });
    }
});