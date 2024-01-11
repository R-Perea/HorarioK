function loadexcel() {
  const fileInput = document.getElementById('fileInput');
  const file = fileInput.files[0];

  if (!file) {
      alert('Por favor, seleccione un archivo Excel.');
      return;
  }

  const reader = new FileReader();
  let grouped = {};
  reader.onload = function (e) {
      const data = e.target.result;
      const workbook = XLSX.read(data, { type: 'binary' });
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);
      localStorage.setItem('cargaAsignaturas', JSON.stringify(jsonData));
      // jsonData.forEach(element => {
      //   console.log(element.Carrera);
      // });

      let carreras = [];
      jsonData.forEach(element => {
        if (!carreras.includes(element.Carrera)) {
          carreras.push(element.Carrera);
        }
      });
      console.log(carreras);
      const contenedorCarreras = document.getElementById("card-filtro");
      carreras.forEach(element => {
        const boton = document.createElement("button");
        boton.classList.add("btn", "btn-primary", "m-2");
        boton.textContent = element;
        if (element==undefined) {
          boton.textContent = "No Definido"
        }
        boton.addEventListener("click", () => filterasignatura(element))
        contenedorCarreras.appendChild(boton);

      });

      // Resto del código para procesar los datos del archivo Excel...
      // Puedes mantener el resto del código que agrupa y crea las cards por sección.


      cargarCards(jsonData)

  };

  reader.readAsBinaryString(file);
}

function cargarCards(toLoad){
  const container = document.getElementById("asignaturasGuardadas");
  container.innerHTML = '';

  let grouped = {};
  toLoad.forEach(asignatura => {
    if (!grouped[asignatura.Sección]) {
      grouped[asignatura.Sección] = [];
    }
    grouped[asignatura.Sección].push(asignatura);
  });

  Object.keys(grouped).forEach(seccion => {
    const section = document.createElement("section");
    container.appendChild(section);
    section.innerHTML = `<h2>Sección: ${seccion}</h2>`;
    section.classList.add('section');

    grouped[seccion].forEach(asignatura => {
      const card = document.createElement("div");
      section.appendChild(card);
      card.classList.add("card");

      const horarioSinEspacios = asignatura.Horario.substring(3);
      const diaAbreviado = diasMap[asignatura.Día];
      const button = document.createElement("button");
      button.type = "button";
      button.className = "btn btn-primary";
      button.textContent = "Insertar en Tabla";
      button.addEventListener("click", () => insertarDatosEnTabla(seccion, grouped));
      const buttonsContainer = document.createElement("div");
      buttonsContainer.className = "buttons-container";
      buttonsContainer.appendChild(button);
  
      let contenidoTarjeta = `
        <h5 class="card-title">${asignatura.Asignatura}</h5>
        <p class="card-text">
            Horario: ${horarioSinEspacios}<br>
            Sala: ${asignatura.Sala}<br>
            Profesor: ${asignatura.Docente}<br>
            Día: ${asignatura.Día}<br>
        </p>
      `;
      card.innerHTML = contenidoTarjeta;
      card.appendChild(buttonsContainer);
    });
  });
}


function insertarDatosEnTabla(seccion, grouped) {
  const asignaturas = grouped[seccion];
  asignaturas.forEach(asignatura => {
      const horarioSinEspacios = asignatura.Horario.substring(3).replace(/\s/g, '');
      const diaAbreviado = diasMap[asignatura.Día];
      const filas = calcularFilaPorHorario(horarioSinEspacios);

      if (filas.inicio === 0 && filas.fin === 0) {
          const fila = calcularFilaPorHorario(horarioSinEspacios);
          if (fila === 0) {
              alert('El horario está fuera del rango especificado. No se puede agregar la asignatura en este horario.');
              return;
          }

          const cell = document.getElementById(`${diaAbreviado}${fila}`);
          if (cell === null) {
              alert('Error al insertar los datos. La celda no existe.');
              return;
          }

          if (cell.textContent.trim() !== '') {
              alert('Horario ocupado. No se puede agregar la asignatura en este horario.');
          } else {
              cell.textContent = `${asignatura.Asignatura}\n${seccion}\n${asignatura.Sala}`;
          }
      } else {
          for (let fila = filas.inicio; fila <= filas.fin; fila++) {
              const cell = document.getElementById(`${diaAbreviado}${fila}`);
              if (cell === null) {
                  alert('Error al insertar los datos. La celda no existe.');
                  return;
              }

              if (cell.textContent.trim() !== '') {
                  alert('Horario ocupado. No se puede agregar la asignatura en este horario.');
                  return;
              } else {
                  cell.textContent = `${asignatura.Asignatura}\n${seccion}\n${asignatura.Sala}`;
              }
          }
      }
  });
}


function filterasignatura(carrera){
  const asignaturas = JSON.parse(localStorage.getItem('cargaAsignaturas'));
  let asignaturasfilter = [];
  asignaturas.forEach(element => {
    if (element.Carrera==carrera) {
      asignaturasfilter.push(element)
    }
  });
  cargarCards(asignaturasfilter);
}