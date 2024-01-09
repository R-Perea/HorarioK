function loadexcel() {
  const fileInput = document.getElementById('fileInput');
  const file = fileInput.files[0];

  if (!file) {
      alert('Por favor, seleccione un archivo Excel.');
      return;
  }

  const reader = new FileReader();

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
  //Consigue el container donde deben ir todas las cards
  const container = document.getElementById("asignaturasGuardadas");
  container.innerHTML = '';
  //Crea una fila
  const row = document.createElement("div");
  container.appendChild(row);
  row.classList.add('row');
  toLoad.forEach(asignatura => {
    const col = document.createElement("div");
    row.appendChild(col);
    const card = document.createElement("div");
    card.classList.add("card");
    col.appendChild(card);
    col.classList.add('col-4');
    const horarioSinEspacios = asignatura.Horario.substring(3);
    const diaAbreviado = diasMap[asignatura.Día];
    contenidoTarjeta = `
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
    card.innerHTML = contenidoTarjeta;
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