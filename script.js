
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
                Profesor: ${profesor}<br>
                Día: ${dia} <!-- Agregar el día -->
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




document.addEventListener('DOMContentLoaded', cargarAsignaturasDesdeExcel);


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

    // Verificar si la celda ya está ocupada
    if (cell.textContent.trim() !== '') {
        // Si la celda tiene contenido, mostrar una alerta o mensaje de horario ocupado
        alert('Horario ocupado. No se puede agregar la asignatura en este horario.');
    } else {
        // Si la celda está vacía, insertar los datos de la asignatura
        cell.textContent = `${nombre}\n${seccion}\n${sala}`;
    }
}

function limpiarTabla() {
    const celdas = document.querySelectorAll("#horariosTabla tbody td");
    celdas.forEach((celda) => {
        celda.textContent = "";
    });
}

function generarPDF() {
    const header = "Horarios";
    const table = document.getElementById("horariosTabla");

    // Crea un nuevo documento para imprimir
    const printWindow = window.open('', '', 'width=800,height=600');
    printWindow.document.write(`
      <html>
      <head>
        <title>${header}</title>
        <style>
          table {
            border-collapse: collapse;
            width: 100%;
          }
          th, td {
            border: 1px solid black;
            padding: 8px;
            text-align: center;
          }
          th {
            background-color: #f2f2f2;
          }
        </style>
      </head>
      <body>
        <h3 style="text-align: center">${header}</h3>
        ${table.outerHTML}
      </body>
      </html>
    `);

    // Espera a que el contenido se cargue antes de imprimir
    printWindow.document.addEventListener('DOMContentLoaded', () => {
        // Llama a la función window.print() para abrir la ventana de impresión
        printWindow.print();
        printWindow.close();
    });
}



function cargarAsignaturasDesdeExcel() {
    const urlArchivo = 'test horario html.xlsx';

    fetch(urlArchivo)
        .then(response => response.arrayBuffer())
        .then(arrayBuffer => {
            const workbook = XLSX.read(arrayBuffer, { type: 'array' });
            const worksheet = workbook.Sheets[workbook.SheetNames[0]];
            const data = XLSX.utils.sheet_to_json(worksheet);

            // Agrupar las asignaturas por sección
            const asignaturasPorSeccion = {};
            data.forEach(asignatura => {
                const seccion = asignatura['Sección'];
                if (!asignaturasPorSeccion[seccion]) {
                    asignaturasPorSeccion[seccion] = [];
                }
                asignaturasPorSeccion[seccion].push(asignatura);
            });

            // Limpiar el contenedor de asignaturas guardadas
            const asignaturasGuardadasDiv = document.getElementById('asignaturasGuardadas');
            asignaturasGuardadasDiv.innerHTML = '';

            // Iterar sobre las secciones y crear las cards para cada sección
            Object.keys(asignaturasPorSeccion).forEach(seccion => {
                const asignaturasDeSeccion = asignaturasPorSeccion[seccion];
                const card = crearCardSeccion(seccion, asignaturasDeSeccion);
                asignaturasGuardadasDiv.appendChild(card);
            });
        })
        .catch(error => {
            console.error('Error al cargar el archivo Excel:', error);
        });
}

function crearCardSeccion(seccion, asignaturas) {
    const card = document.createElement('div');
    card.classList.add('card');
    card.innerHTML = `
        <div class="card-body">
            <h5 class="card-title">Sección: ${seccion}</h5>
            ${asignaturas.map(asignatura => `
                <p class="card-text">
                    Asignatura: ${asignatura['Asignatura']}<br>
                    Horario: ${asignatura['Horario']}<br>
                    Sala: ${asignatura['Sala']}<br>
                    Docente: ${asignatura['Docente']}
                </p>
            `).join('')}
        </div>            
    `;
    return card;
}


