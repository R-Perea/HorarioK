
// Definir la lista de días fuera de la función crearCardAsignatura
const diasSemana = ['l', 'm', 'mi', 'j', 'v'];

function crearCardAsignatura(id, seccion, nombre, horario, sala, profesor) {
    console.log(id, seccion, nombre, horario, sala, profesor);
    const card = document.createElement('div');
    card.classList.add('card');
    card.setAttribute('data-id', id); // Agregar el id como atributo personalizado
    card.innerHTML = `
        <div class="card-body">
            <h5 class="card-title">${nombre}</h5>
            <p class="card-text">
                Sección: ${seccion}<br>
                Horario: ${horario}<br>
                Sala: ${sala}<br>
                Profesor: ${profesor}
            </p>
        </div>            
        <div class="buttons-container">
        <!-- Botones de los días -->
            ${diasSemana.map(dia => `<button class="btn btn-primary" onclick="asignarDatos('${nombre}', '${seccion}', '${horario}', '${sala}', '${profesor}', '${dia}')">${dia.charAt(0).toUpperCase() + dia.slice(1)}</button>`).join('')}
            <button type="button" class="btn btn-danger" onclick="eliminarAsignatura(${id})">Eliminar</button>
        </div>
        `;
    return card;
}



let asignaturaActual = null;


function agregarAsignatura(event) {
    event.preventDefault();

    const seccion = document.getElementById("seccion").value;
    const nombre = document.getElementById("nombre").value;
    const horario = document.getElementById("horario").value;
    const sala = document.getElementById("sala").value;
    const profesor = document.getElementById("profesor").value;

    // Crear la asignatura
    const asignatura = {
        id: Date.now(),
        seccion: seccion,
        nombre: nombre,
        horario: horario,
        sala: sala,
        profesor: profesor
    };

    // Almacenar la asignatura en la variable global
    asignaturaActual = asignatura;

    // Limpiar los campos del formulario
    document.getElementById("seccion").value = "";
    document.getElementById("nombre").value = "";
    document.getElementById("horario").value = "";
    document.getElementById("sala").value = "";
    document.getElementById("profesor").value = "";

    const card = crearCardAsignatura(asignatura); // Pasamos el objeto 'asignatura' directamente

    // Agregar la card al contenedor de asignaturas guardadas
    const asignaturasGuardadasDiv = document.getElementById('asignaturasGuardadas');
    asignaturasGuardadasDiv.appendChild(card);

    // Guardar la asignatura en el LocalStorage
    guardarAsignatura(asignatura); // Pasamos el objeto 'asignatura' directamente
}



function guardarAsignatura(asignatura) {
    let asignaturasGuardadas = JSON.parse(localStorage.getItem('asignaturas')) || [];
    asignaturasGuardadas.push(asignatura);
    localStorage.setItem('asignaturas', JSON.stringify(asignaturasGuardadas));

    // Cargar las asignaturas guardadas nuevamente
    cargarAsignaturasGuardadas();
}

function cargarAsignaturasGuardadas() {
    const asignaturasGuardadas = JSON.parse(localStorage.getItem('asignaturas')) || [];

    const asignaturasGuardadasDiv = document.getElementById('asignaturasGuardadas');
    asignaturasGuardadasDiv.innerHTML = '';

    for (const asignatura of asignaturasGuardadas) {
        const card = crearCardAsignatura(asignatura.id, asignatura.seccion, asignatura.nombre, asignatura.horario, asignatura.sala, asignatura.profesor);
        asignaturasGuardadasDiv.appendChild(card);
    }
    // Agregar atributo data-dia a los botones de cada card
    const buttonsContainers = asignaturasGuardadasDiv.querySelectorAll('.buttons-container');
    for (const buttonsContainer of buttonsContainers) {
        for (let i = 0; i < buttonsContainer.children.length; i++) {
            const button = buttonsContainer.children[i];
            const dia = diasSemana[i];
            button.setAttribute('data-dia', dia);
        }
    }
}

function eliminarAsignatura(id) {
    // Eliminar la card del DOM
    const asignaturasGuardadasDiv = document.getElementById('asignaturasGuardadas');
    const cardToRemove = asignaturasGuardadasDiv.querySelector(`[data-id="${id}"]`);
    if (cardToRemove) {
        cardToRemove.remove();

        // Eliminar la asignatura del LocalStorage
        let asignaturasGuardadas = JSON.parse(localStorage.getItem('asignaturas')) || [];
        asignaturasGuardadas = asignaturasGuardadas.filter(asignatura => asignatura.id !== id);
        localStorage.setItem('asignaturas', JSON.stringify(asignaturasGuardadas));
    }
}

function asignarDatos(nombre, seccion, horario, sala, profesor, dia) {
    insertarDatosEnTabla(nombre, seccion, horario, sala, profesor, dia);
}
  



// Cargar las asignaturas del LocalStorage al cargar la página
document.addEventListener('DOMContentLoaded', cargarAsignaturasGuardadas);

function calcularFilaPorHorario(horario) {
    // Agregamos los horarios y sus filas correspondientes en un objeto
    const horariosFila = {
        '8:31-9:10': 1,
        '9:11-9:50': 2,
        '10:00-10:40': 3,
        '10:41-11:20': 4,
        '11:31-12:10': 5,
        '12:11-12:50': 6,
        '13:01-13:40': 7,
        '13:41-14:20': 8,
        '14:31-15:10': 9,
        '15:11-15:50': 10,
        '16:01-16:40': 11,
        '16:41-17:20': 12,
    };

    // Buscar el horario en el objeto y obtener el número de fila
    const fila = horariosFila[horario];
    return fila;
}

function insertarDatosEnTabla(nombre, seccion, horario, sala, profesor, dia) {
    // En lugar de buscar las celdas por id, utiliza el día y el número de fila para determinar la celda
    const rowNumber = calcularFilaPorHorario(horario);
    console.log("Dia:", dia, "Row Number:", rowNumber);
    const cell = document.getElementById(`${dia}${rowNumber}`);
    console.log("Cell:", cell);
    cell.textContent = `${nombre}\n${seccion}\n${horario}\n${sala}\n${profesor}`;
}
