function loadexcel() {
  const fileInput = document.getElementById('fileInput');
  const file = fileInput.files[0];
  const btnDesahilitar = document.getElementById('btnCargarHorario');



  btnDesahilitar.disabled = true;
  fileInput.addEventListener('change', () => {
    btnDesahilitar.disabled = false;
  });

  if (!file) {
      alert('Por favor, seleccione un archivo Excel.');
      return;
  }

  const reader = new FileReader();
  let jsonData = null;
  reader.onload = function (e) {
      const data = e.target.result;
      const workbook = XLSX.read(data, { type: 'binary' });
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      jsonData = XLSX.utils.sheet_to_json(worksheet);
      localStorage.setItem('cargaAsignaturas', JSON.stringify(jsonData));
      let carreras = [];
      jsonData.forEach(element => {
        if (!carreras.includes(element.Carrera)) {
          carreras.push(element.Carrera);
        }
      });

      const contenedorCarreras = document.getElementById("card-filtro");
      const opciones = document.getElementById("opcionesCarreras");
      carreras.forEach(element => {
        let option = document.createElement("option");
        option.text = element;
        option.value = element;
        opciones.add(option);
      });

      opciones.addEventListener('change', (event) => {
        const carrera = event.target.value;
        cargarNiveles(carrera);
      });
  };
  
  reader.readAsBinaryString(file);
}

const diasMap = {
  "Lu": "Lunes",
  "Ma": "Martes",
  "Mi": "Miércoles",
  "Ju": "Jueves",
  "Vi": "Viernes",
  "Sa": "Sábado",
  "On": "Online",
};

function calcularFilaPorHorario(horario) {
  // Agregamos los horarios y sus filas correspondientes en un objeto


  const horariosFilaRango = [
    { inicio: '8:31', fin: '9:10', filaInicio: 1, filaFin: 1 },
    { inicio: '9:11', fin: '9:50', filaInicio: 2, filaFin: 2 },
    { inicio: '9:51', fin: '10:00', filaInicio: 3, filaFin: 3 },
    { inicio: '10:01', fin: '10:40', filaInicio: 4, filaFin: 4 },
    { inicio: '10:41', fin: '11:20', filaInicio: 5, filaFin: 5 },
    { inicio: '11:31', fin: '12:10', filaInicio: 6, filaFin: 6 },
    { inicio: '12:11', fin: '12:50', filaInicio: 7, filaFin: 7 },
    { inicio: '13:01', fin: '13:40', filaInicio: 8, filaFin: 8 },
    { inicio: '13:41', fin: '14:20', filaInicio: 9, filaFin: 9 },
    { inicio: '14:31', fin: '15:10', filaInicio: 10, filaFin: 10 },
    { inicio: '15:11', fin: '15:50', filaInicio: 11, filaFin: 11 },
    { inicio: '16:01', fin: '16:40', filaInicio: 12, filaFin: 12 },
    { inicio: '16:41', fin: '17:20', filaInicio: 13, filaFin: 13 },
    { inicio: '17:31', fin: '18:10', filaInicio: 14, filaFin: 14 },
    { inicio: '18:11', fin: '18:50', filaInicio: 15, filaFin: 15 }
  ];

  if (horario.includes('Online')) {
    console.warn(`Horario ${horario} es Online. Buscando el siguiente horario en la sección agrupada.`);
    
    // Buscar el siguiente horario en la sección agrupada
    // Aquí asumimos que horariosFilaRango es una lista de horarios y buscamos el próximo horario después del actual
    const index = horariosFilaRango.findIndex(rango => rango.horario === horario);
    
    if (index !== -1 && index < horariosFilaRango.length - 1) {
      const siguienteHorario = horariosFilaRango[index + 1].horario;
      console.log(`Siguiente horario encontrado: ${siguienteHorario}`);
      
      // Llamar a la función recursivamente con el siguiente horario
      return calcularFilaPorHorario(siguienteHorario, horariosFilaRango);
    } else {
      console.error(`No se encontró un siguiente horario para ${horario}.`);
      return null;
    }
  }

  // Dividir el horario en hora de inicio y hora de fin
  let [horaInicio, horaFin] = horario.split(' - ').map(h => h.trim().substring(0, 5));

  console.log(`Hora Inicio: ${horaInicio}`);
  console.log(`Hora Fin: ${horaFin}`);

  if (horaInicio.endsWith(':')) {
    horaInicio = horaInicio.slice(0, -1);
  }
  if (horaFin.endsWith(':')) {
    horaFin = horaFin.slice(0, -1);
  }

  console.log(`Hora Inicio: ${horaInicio}`);
  console.log(`Hora Fin: ${horaFin}`);

  // Encontrar la fila de inicio y fin
  let filaInicio = null;
  let filaFin = null;

  for (const rango of horariosFilaRango) {
    const { inicio, fin, filaInicio: filaInicioRango, filaFin: filaFinRango } = rango;

    // Verificar si la hora de inicio está en el rango
    if (horaInicio >= inicio && horaInicio <= fin) {
      filaInicio = filaInicioRango;
    }

    // Verificar si la hora de fin está en el rango
    if (horaFin >= inicio && horaFin <= fin) {
      filaFin = filaFinRango;
    }

    // Si ya tenemos ambos, podemos salir del bucle
    if (filaInicio !== null && filaFin !== null) {
      break;
    }
  }

  // Verificar si se encontró una fila de inicio y una fila de fin
  if (filaInicio === null || filaFin === null) {
    console.error(`No se encontró el rango para el horario: ${horaInicio} - ${horaFin}`);
    return null;
  }

  // Devolver las filas de inicio y fin
  return { inicio: filaInicio, fin: filaFin };
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

function cargarCarreras() {

}

function cargarNiveles(carrera) {
  const jsonData = JSON.parse(localStorage.getItem('cargaAsignaturas'));

  let niveles = [];
  jsonData.forEach(element => {
    if (element.Carrera === carrera && !niveles.includes(element.Nivel)) {
      niveles.push(element.Nivel);
    }
  });

  const contenedorNiveles = document.getElementById("card-filtro-nivel");

  while (contenedorNiveles.firstChild) {
    contenedorNiveles.removeChild(contenedorNiveles.firstChild);
  }
  niveles.forEach(element => {
    const boton = document.createElement("button");
    boton.classList.add("btn", "btn-primary", "m-2");
    boton.textContent = element;
    if (element==undefined) {
      boton.textContent = "No Definido"
    }
    boton.addEventListener("click", () => {
      filterasignatura(carrera, element);
      cargarJornadas(carrera, element);
    })
    contenedorNiveles.appendChild(boton);
  });
}

function cargarJornadas(carrera, nivel) {
  const jsonData = JSON.parse(localStorage.getItem('cargaAsignaturas'));
  let jornadas = [];

  jsonData.forEach(element => {
    if (element.Carrera === carrera && element.Nivel === nivel && !jornadas.includes(element.Jornada)) {
      jornadas.push(element.Jornada);
    }
  });

  const contenedorJornadas = document.getElementById("card-filtro-jornada");
  
  while (contenedorJornadas.firstChild) {
    contenedorJornadas.removeChild(contenedorJornadas.firstChild);
  }

  jornadas.forEach(element => {
    const boton = document.createElement("button");
    boton.classList.add("btn", "btn-primary", "m-2");
    boton.textContent = element;
    if (element==undefined) {
      boton.textContent = "No Definido"
    }
    boton.addEventListener("click", () => filterasignatura(carrera, nivel, element))
    contenedorJornadas.appendChild(boton);
  });
}

function cargarCards(toLoad){
  const container = document.getElementById("asignaturasGuardadas");
  container.innerHTML = '';

  let groupedByAsignatura = {};
  toLoad.forEach(asignatura => {
    if (!groupedByAsignatura[asignatura.Asignatura]) {
      groupedByAsignatura[asignatura.Asignatura] = [];
    }
    groupedByAsignatura[asignatura.Asignatura].push(asignatura);
  });

  Object.keys(groupedByAsignatura).forEach(asignatura => {
    let grouped = {};
    groupedByAsignatura[asignatura].forEach(asignatura => {
      if (!grouped[asignatura.Sección]) {
        grouped[asignatura.Sección] = [];
      }
      grouped[asignatura.Sección].push(asignatura);
    });
  
    const asignaturaDiv = document.createElement("div");
    asignaturaDiv.classList.add('asignatura', 'flex-container');
    container.appendChild(asignaturaDiv);
  
    Object.keys(grouped).sort().forEach(seccion => {
      const section = document.createElement("section");
      asignaturaDiv.appendChild(section);
      section.innerHTML = `<h2 class="titulo-seccion">Sección: ${seccion}</h2>`;
      section.classList.add('section');
  
      const button = document.createElement("button");
      button.type = "button";
      button.className = "btn btn-primary";
      button.textContent = "Insertar en Tabla";
      button.addEventListener("click", () => {
        const insercionExitosa = insertarDatosEnTabla(seccion, grouped);
        if (insercionExitosa) {
          asignaturaDiv.style.display = 'none';
        }
      });
      const buttonsContainer = document.createElement("div");
      buttonsContainer.className = "buttons-container";
      buttonsContainer.appendChild(button);
      section.appendChild(buttonsContainer);

      grouped[seccion].forEach(asignatura => {
        const card = document.createElement("div");
        section.appendChild(card);
        card.classList.add("card", "card-largo", asignatura.Asignatura.replace(/\s/g, ''));

        const horarioSinEspacios = asignatura.Horario !== "Online" ? asignatura.Horario.substring(3) : asignatura.Horario;
        const diaAbreviado = diasMap[asignatura.Horario.substring(0, 2)];
    
        let contenidoTarjeta = `
          <h5 class="card-title">${asignatura.Asignatura}</h5>
          <p class="card-text">
              Horario: ${horarioSinEspacios}<br>
              Sala: ${asignatura.Sala}<br>
              Profesor: ${asignatura.Docente}<br>
              Día: ${diaAbreviado}<br>
          </p>
        `;
        card.innerHTML = contenidoTarjeta;
      });
    });
  });
}

//Insertar los datos en la tabla
function insertarDatosEnTabla(seccion, grouped) {
  const asignaturas = grouped[seccion];

  for (let i = 0; i < asignaturas.length; i++) {
      const asignatura = asignaturas[i];
      const horarioSinEspacios = asignatura.Horario !== "Online" ? asignatura.Horario.substring(3) : asignatura.Horario;
      console.log(`Horario sin espacios: ${horarioSinEspacios}`);
      
      
      const diaAbreviado = diasMap[asignatura.Horario.substring(0, 2)];
      console.log(`Día abreviado: ${diaAbreviado}`);


      const filas = calcularFilaPorHorario(horarioSinEspacios);
      console.log(`Filas calculadas: ${JSON.stringify(filas)}`);



      if (filas === null) {
        console.error(`El horario ${horarioSinEspacios} no se encuentra en el rango de horarios.`);
        continue; // Pasar a la siguiente asignatura
      }

      console.log(asignatura);
      console.log(`Asignatura: ${asignatura.Asignatura}, Horario: ${horarioSinEspacios},Dia: ${diaAbreviado}, Filas: ${JSON.stringify(filas)}`);


      if (filas === null) {
          alert('El horario está fuera del rango especificado. No se puede agregar la asignatura en este horario.');
          return false;
      }

      for (let fila = filas.inicio; fila <= filas.fin; fila++) {
          const cell = document.getElementById(`${diaAbreviado}${fila}`);
          if (cell === null) {
              alert('Error al insertar los datos. La celda no existe.');
              return false;
          }

          if (cell.textContent.trim() !== '') {
              alert('Horario ocupado. No se puede agregar la asignatura en este horario.');
              return false;
          } else {
              cell.textContent = `${asignatura.Asignatura}\n${seccion}\n${asignatura.Sala}`;
              document.querySelectorAll(`.${asignatura.Asignatura.replace(/\s/g, '')}`).forEach(card => {
                  card.style.display = 'none';
              });
              document.querySelectorAll(`.section`).forEach(section => {
                  if (section.querySelector(`h2`).textContent === `Sección: ${seccion}`) {
                      section.style.display = 'none';
                  }
              });
          }
      }
  }
  return true;
}





function filterasignatura(carrera, nivel, jornada){
  const asignaturas = JSON.parse(localStorage.getItem('cargaAsignaturas'));
  let asignaturasfilter = [];
  asignaturas.forEach(element => {
    if (element.Carrera == carrera && element.Nivel == nivel && element.Jornada == jornada) {
      asignaturasfilter.push(element)
    }
  });
  cargarCards(asignaturasfilter);
}