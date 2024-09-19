    document.getElementById('badge-form').addEventListener('submit', function(event) {
    event.preventDefault(); // Prevenir el comportamiento por defecto del formulario

    const name = document.getElementById('name').value;
    const job = document.getElementById('job').value;
    const photoInput = document.getElementById('photo');
    const photoFile = photoInput.files[0];

    const canvas = document.getElementById('badgeCanvas');
    const ctx = canvas.getContext('2d');

    // Cargar y dibujar el diseño de fondo
    const designImg = new Image();
    designImg.onload = function() {
        // Limpiar el canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
            // Ajustar la imagen de fondo al tamaño del canvas
            const imgWidth = designImg.naturalWidth;
            const imgHeight = designImg.naturalHeight;

            const canvasWidth = canvas.width;
            const canvasHeight = canvas.height;

            // Calcular la relación de aspecto
            const imgAspectRatio = imgWidth / imgHeight;
            const canvasAspectRatio = canvasWidth / canvasHeight;

            let drawWidth, drawHeight;

            if (imgAspectRatio > canvasAspectRatio) {
                drawWidth = canvasWidth;
                drawHeight = canvasWidth / imgAspectRatio;
            } else {
                drawHeight = canvasHeight;
                drawWidth = canvasHeight * imgAspectRatio;
            }

            // Calcular la posición para centrar la imagen
            const x = (canvasWidth - drawWidth) / 2;
            const y = (canvasHeight - drawHeight) / 2;

            ctx.drawImage(designImg, x, y, drawWidth, drawHeight);

        // Dibujar la foto
        if (photoFile) {
            const photoUrl = URL.createObjectURL(photoFile);
            const photoImg = new Image();
            photoImg.onload = function() {
                ctx.drawImage(photoImg, 20, 20, 100, 100); // Ajusta la posición y el tamaño de la foto
                URL.revokeObjectURL(photoUrl); // Liberar el objeto URL después de usarlo
            };
            photoImg.onerror = function() {
                console.error('No se pudo cargar la imagen de la foto.');
            };
            photoImg.src = photoUrl;
        }

        // Configurar fuente y color del texto
        ctx.font = 'bold 26px Arial';
        ctx.fillStyle = '#000000';

        // Dibujar texto
        ctx.fillText( name, 200, 100);
        ctx.fillText('Puesto: ' + job, 140, 60);
    };
    designImg.onerror = function() {
        console.error('No se pudo cargar la imagen de diseño.');
    };
    designImg.src = 'Diseño_Gafete/Gafete2.jpg'; // Usa la ruta relativa adecuada
});