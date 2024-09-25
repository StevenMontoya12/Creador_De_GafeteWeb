        // Función para obtener los parámetros de la URL
        function getQueryParams() {
            const urlParams = new URLSearchParams(window.location.search);
            const params = {};
            for (const [key, value] of urlParams.entries()) {
                params[key] = value;
            }
            return params;
        }

        const params = getQueryParams();
        const id = params.id;

        // Hacer una petición para obtener los datos del gafete por ID
        fetch(`/datosQR/${id}`)
            .then(response => response.json())
            .then(data => {
                if (data && Object.keys(data).length > 0) {
                    // Formatear la fecha de nacimiento
                    const birthdate = new Date(data.birthdate).toISOString().split('T')[0];

                    // Mostrar la tarjeta de datos
                    document.getElementById('badge-container').style.display = 'block';
                    document.getElementById('title').textContent = "Datos del Gafete";

                    // Actualizar los elementos HTML con los datos obtenidos
                    document.getElementById('photo').src = data.photo || 'ruta_a_imagen_por_defecto.jpg'; // Usar la imagen en Base64 o una imagen por defecto
                    document.getElementById('name').textContent = `Nombre: ${data.name}`;
                    document.getElementById('first-name').textContent = `Primer Nombre: ${data.first_name}`;
                    document.getElementById('middle-name').textContent = `Segundo Nombre: ${data.middle_name}`;
                    document.getElementById('birthdate').textContent = `Fecha de Nacimiento: ${birthdate}`;
                    document.getElementById('telephone').textContent = `Teléfono: ${data.telephone}`;
                    document.getElementById('celphone').textContent = `Celular: ${data.celphone}`;
                    document.getElementById('email').textContent = `Correo Electrónico: ${data.email}`;
                    document.getElementById('address').textContent = `Dirección: ${data.address}`;
                    document.getElementById('alergia').textContent = `Alergias: ${data.alergia}`;
                    document.getElementById('e_contact').textContent = `Contacto de Emergencia: ${data.e_contact}`;
                    document.getElementById('parents').textContent = `Padres: ${data.parents}`;
                    document.getElementById('e_contact_celphone').textContent = `Celular de Contacto de Emergencia: ${data.e_contact_celphone}`;
                    document.getElementById('job').textContent = `Puesto: ${data.job}`;
                    document.getElementById('departament').textContent = `Departamento: ${data.departament}`;
                    document.getElementById('brigadista').textContent = `Brigadista: ${data.brigadista}`;
                    
                    // Mostrar la imagen subida anteriormente
                    document.getElementById('photo').src = data.photo || 'ruta_a_imagen_por_defecto.jpg'; // Usar una imagen por defecto si no hay foto
                } else {
                    // Si no se encuentra el gafete, mostrar solo el mensaje
                    document.getElementById('title').textContent = "Gafete no existente";
                }
            })
            .catch(error => {
                console.error('Error al cargar los datos del gafete:', error);
                document.getElementById('title').textContent = "Error al cargar el gafete";
            });