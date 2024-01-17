// Definir la lista de días fuera de la función crearCardAsignatura
const diasSemana = ['l', 'm', 'mi', 'j', 'v'];

// Crear un objeto para mapear los días completos del Excel a los días abreviados
const diasMap = {
    "Lunes": "l",
    "Martes": "m",
    "Miércoles": "mi",
    "Jueves": "j",
    "Viernes": "v"
};

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


document.addEventListener('DOMContentLoaded', cargarAsignaturasDesdeExcel);

function calcularFilaPorHorario(horario) {
    // Agregamos los horarios y sus filas correspondientes en un objeto
    const horariosFila = {
        '8:31-9:10': 1,
        '9:11-9:50': 2,
        '10:01-10:40': 3,
        '10:41-11:20': 4,
        '11:31-12:10': 5,
        '12:11-12:50': 6,
        '13:01-13:40': 7,
        '13:41-14:20': 8,
        '14:31-15:10': 9,
        '15:11-15:50': 10,
        '16:01-16:40': 11,
        '16:41-17:20': 12,
        '17:31-18:10': 13,
        '18:11-18:50': 14
    };

    const horariosFilaRango = [
        { inicio: '8:31-9:10', fin: '9:11-9:50', filaInicio: 1, filaFin: 2 },
        { inicio: '10:01-10:40', fin: '10:41-11:20', filaInicio: 3, filaFin: 4 },
        { inicio: '11:31-12:10', fin: '12:11-12:50', filaInicio: 5, filaFin: 6 },
        { inicio: '13:01-13:40', fin: '13:41-14:20', filaInicio: 7, filaFin: 8 },
        { inicio: '14:31-15:10', fin: '15:11-15:50', filaInicio: 9, filaFin: 10 },
        { inicio: '16:01-16:40', fin: '16:41-17:20', filaInicio: 11, filaFin: 12 },
        { inicio: '17:31-18:10', fin: '18:11-18:50', filaInicio: 13, filaFin: 14 }
    ];

    // Verificar si el horario está en horariosFila
    if (horario in horariosFila) {
        return { inicio: horariosFila[horario], fin: horariosFila[horario] };
    }

    // Si el horario no está en horariosFila, buscamos en horariosFilaRango
    for (const rango of horariosFilaRango) {
        const [inicio, fin] = rango.inicio.split('-'); // Obtener solo la hora de inicio y fin

        // Verificar si el horario está dentro del rango
        if (horario >= inicio && horario <= fin) {
            return { inicio: rango.filaInicio, fin: rango.filaFin };
        }
    }

    // Si no se encontró en ningún caso, devolvemos null
    return null;
}













function cargarAsignaturasDesdeExcel() {
    const fileInput = document.getElementById('fileInput');
    const file = fileInput.files[0];

    // if (!file) {
    //     alert('Por favor, seleccione un archivo Excel.');
    //     return;
    // }

    const reader = new FileReader();

    reader.onload = function (e) {
        const data = e.target.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        // Resto del código para procesar los datos del archivo Excel...
        // Puedes mantener el resto del código que agrupa y crea las cards por sección.

        const asignaturasGuardadasDiv = document.getElementById('asignaturasGuardadas');
        asignaturasGuardadasDiv.innerHTML = '';

        const asignaturasPorSeccion = {};

        jsonData.forEach(asignatura => {
            const seccion = asignatura.Sección;
            if (!asignaturasPorSeccion[seccion]) {
                asignaturasPorSeccion[seccion] = [];
            }
            asignaturasPorSeccion[seccion].push(asignatura);
        });

        Object.keys(asignaturasPorSeccion).forEach(seccion => {
            const asignaturas = asignaturasPorSeccion[seccion];
            const card = crearCardAsignatura(asignaturas);
            asignaturasGuardadasDiv.appendChild(card);
        });
    };

    reader.readAsBinaryString(file);
}



function crearCardAsignatura(asignaturas) {
    const card = document.createElement('div');
    card.classList.add('card');

    // Construir el contenido de las asignaturas en la card
    let contenidoTarjeta = '';
    asignaturas.forEach(asignatura => {
        // Aquí obtenemos el valor de diaAbreviado usando el objeto diasMap
        const diaAbreviado = diasMap[asignatura.Día];

        // Eliminar los 3 primeros espacios de asignatura.Horario
        const horarioSinEspacios = asignatura.Horario.substring(3);

        contenidoTarjeta += `
            <h5 class="card-title">${asignatura.Asignatura}</h5>
            <p class="card-text">
                Sección: ${asignatura.Sección}<br>
                Horario: ${horarioSinEspacios}<br>
                Sala: ${asignatura.Sala}<br>
                Profesor: ${asignatura.Docente}<br>
                Día: ${asignatura.Día}<br>
            </p>
            <div class="buttons-container">
                <button type="button" class="btn btn-primary" onclick="insertarDatosEnTabla('${asignatura.Asignatura}', '${asignatura.Sección}', '${horarioSinEspacios}', '${asignatura.Sala}', '${diaAbreviado}', '${asignatura.Horario}')">Insertar en Tabla</button>
            </div>
        `;
    });

    // Agregar el contenido de las asignaturas a la card
    card.innerHTML = `
        <div class="card-body">
            ${contenidoTarjeta}
        </div>
    `;

    return card;
}






