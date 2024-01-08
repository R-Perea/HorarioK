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

function filterasignatura(carrera){
  const asignaturas = JSON.parse(localStorage.getItem('cargaAsignaturas'));
  let asignaturasfilter = [];
  asignaturas.forEach(element => {
    if (element.Carrera==carrera) {
      asignaturasfilter.push(element)
    }
  });

}