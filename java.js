// Obtener elementos del DOM
const agregarTareaBtn = document.getElementById('agregar-tarea');
const tablaTareas = document.getElementById('tabla-tareas').getElementsByTagName('tbody')[0];

// Función para agregar una nueva tarea
function agregarTarea() {
    // Obtener los valores del formulario
    const titulo = document.getElementById('titulo').value.trim();
    const descripcion = document.getElementById('descripcion').value.trim();
    const categoria = document.getElementById('categoria').value;
    const fecha = document.getElementById('fecha').value;
    const hora = document.getElementById('hora').value;

    // Validar que todos los campos estén llenos
    if (!titulo || !descripcion || !fecha || !hora) {
        alert('Por favor, complete todos los campos');
        return;
    }

    // Crear una nueva fila en la tabla
    const nuevaFila = tablaTareas.insertRow();

    // Insertar celdas en la fila
    nuevaFila.insertCell(0).textContent = titulo;
    nuevaFila.insertCell(1).textContent = descripcion;
    nuevaFila.insertCell(2).textContent = categoria;
    nuevaFila.insertCell(3).textContent = fecha;
    nuevaFila.insertCell(4).textContent = hora;

    // Crear el botón de eliminar
    const eliminarBtn = document.createElement('button');
    eliminarBtn.textContent = 'Eliminar';
    eliminarBtn.classList.add('delete');
    eliminarBtn.onclick = () => eliminarTarea(nuevaFila);
    nuevaFila.insertCell(5).appendChild(eliminarBtn);

    // Limpiar el formulario después de agregar la tarea
    document.getElementById('titulo').value = '';
    document.getElementById('descripcion').value = '';
    document.getElementById('categoria').value = 'entrenar';
    document.getElementById('fecha').value = '';
    document.getElementById('hora').value = '';
}

// Función para eliminar una tarea
function eliminarTarea(fila) {
    if (confirm('¿Estás seguro de eliminar esta tarea?')) {
        tablaTareas.deleteRow(fila.rowIndex);
    }
}

// Agregar tarea al hacer clic en el botón
agregarTareaBtn.addEventListener('click', agregarTarea);

