document.getElementById('search-form').addEventListener('submit', function(event) {
    event.preventDefault(); // Prevenir el comportamiento por defecto del formulario de búsqueda

    const name = document.getElementById('search-name').value;
    const lastName = document.getElementById('search-lastName').value;
    const id = document.getElementById('search-id').value;

    fetch(`/BuscarGafete?name=${name}&lastName=${lastName}&id=${id}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Gafete no encontrado');
            }
            return response.json();
        })
        .then(data => {
            const { name: fetchedName, job: fetchedJob, qrCode, photo } = data;

            const canvas = document.getElementById('badgeCanvas');
            const ctx = canvas.getContext('2d');

            // Cargar y dibujar el diseño de fondo
            const designImg = new Image();
            designImg.onload = function() {
                ctx.clearRect(0, 0, canvas.width, canvas.height);

                // Dibujar el diseño del gafete
                ctx.drawImage(designImg, 0, 0, canvas.width, canvas.height);

                // Dibujar la foto si está disponible
                if (photo) {
                    const photoImg = new Image();
                    photoImg.onload = function() {
                        ctx.drawImage(photoImg, 20, 20, 120, 120); // Ajustar la posición y el tamaño de la foto

                        // Después de cargar la foto, dibuja el texto
                        ctx.font = 'bold 26px Arial';
                        ctx.fillStyle = '#000000';
                        ctx.fillText(fetchedName, 200, 100);
                        ctx.fillText('Puesto: ' + fetchedJob, 200, 150); // Ajustar la posición del puesto
                    };
                    photoImg.src = photo;
                }

                // Dibujar el código QR después de que la foto se haya dibujado
                const qrImg = new Image();
                qrImg.onload = function() {
                    ctx.drawImage(qrImg, 200, 300, 100, 100); // Ajustar la posición y el tamaño del código QR
                };
                qrImg.src = qrCode;
            };
            designImg.src = 'Diseño_Gafete/Gafete2.jpg'; // Usa la ruta relativa adecuada
        })
        .catch(error => {
            console.error('Error al buscar el gafete:', error);
        });
});
