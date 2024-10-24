const express = require('express');
const path = require('path');
const multer = require('multer');
const mysql = require('mysql2');
const QRCode = require('qrcode');

const app = express();
const PORT = process.env.PORT || 3000;

// Configura la carpeta 'public' para servir archivos estáticos
app.use(express.static(path.join(__dirname, 'public')));


// Middleware para parsear datos
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Ruta para el archivo HTML principal
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Crear la conexión a la base de datos
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Linkinpark12#',
    database: 'gafetes_db'
});

// Conectar a la base de datos
connection.connect((err) => {
    if (err) {
        console.error('Error al conectar a la base de datos:', err);
        return;
    }
    console.log('Conectado a la base de datos MySQL');
});

// Configura multer para almacenar la imagen en memoria
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Manejar el POST a /save-form
app.post('/save-form', upload.single('photo'), (req, res) => {
    const formData = req.body;
    const photoBuffer = req.file ? req.file.buffer : null; // Buffer de la imagen

    const sql = `INSERT INTO gafetes 
    (photo, name, first_name, middle_name, birthdate, telephone, celphone, email, address, alergia, e_contact, parents, e_contact_celphone, job, departament, brigadista)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

    const values = [
        photoBuffer, // Guardar la imagen en binario
        formData.name,
        formData.first_name,
        formData.middle_name,
        formData.birthdate,
        formData.telephone,
        formData.celphone,
        formData.email,
        formData.address,
        formData.alergia,
        formData.e_contact,
        formData.parents,
        formData.e_contact_celphone,
        formData.job,
        formData.departament,
        formData.brigadista
    ];

    connection.query(sql, values, (err, result) => {
        if (err) {
            console.error('Error al insertar en la base de datos:', err);
            return res.status(500).send('Error al guardar los datos');
        }
        const id = result.insertId;

        // Generar el código QR con la URL de redirección a DatosQR.html
        const urlToRedirect = `http://localhost:${PORT}/DatosQR.html?id=${id}`;
        QRCode.toDataURL(urlToRedirect, (err, qrCode) => {
            if (err) {
                console.error('Error al generar el código QR:', err);
                return res.status(500).send('Error al generar el código QR');
            }

            // Responder con el código QR y el ID
            res.json({ qrCode, id });
        });
    });
});

// Ruta para obtener los datos del gafete y la imagen desde la base de datos
app.get('/datosQR/:id', (req, res) => {
    const id = req.params.id;
    const sql = 'SELECT * FROM gafetes WHERE id = ?';

    connection.query(sql, [id], (err, results) => {
        if (err) {
            console.error('Error al consultar la base de datos:', err);
            return res.status(500).send('Error al obtener los datos');
        }
        if (results.length === 0) {
            return res.status(404).send('Gafete no encontrado');
        }

        const formData = results[0];
        
        // Convertir la imagen de binario a base64 para poder mostrarla en el navegador
        const photoBase64 = formData.photo ? formData.photo.toString('base64') : null;
        const photoUrl = photoBase64 ? `data:image/jpeg;base64,${photoBase64}` : null;

        const urlToRedirect = `http://localhost:${PORT}/DatosQR.html?id=${id}`;
        
        // Generar el QR con la URL correcta
        QRCode.toDataURL(urlToRedirect, (err, qrCode) => {
            if (err) {
                console.error('Error al generar el código QR:', err);
                return res.status(500).send('Error al generar el código QR');
            }

            res.json({ ...formData, qrCode, photo: photoUrl });
        });
    });
});

// Ruta para obtener todos los gafetes y mostrar la tabla
app.get('/Tabla', (req, res) => {
    const sql = 'SELECT * FROM gafetes';
    connection.query(sql, (err, results) => {
        if (err) {
            console.error('Error al obtener los datos:', err);
            return res.status(500).send('Error al obtener los datos');
        }

        // Generar el HTML de la tabla
        let tableHTML = `
            <table class="table table-bordered mt-4" id="clientsTable">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Nombre</th>
                        <th>Apellido</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
        `;

        // Iterar sobre los resultados y agregar filas a la tabla
        results.forEach(cliente => {
            tableHTML += `
                <tr>
                    <td>${cliente.id}</td>
                    <td>${cliente.name}</td>
                    <td>${cliente.first_name}</td>
                    <td><button onclick="showQRCode(${cliente.id})">Mostrar QR</button></td>
                </tr>
            `;
        });

        tableHTML += `
                </tbody>
            </table>
        `;

        // Devolver la tabla en formato HTML
        res.send(`
            <!DOCTYPE html>
            <html lang="es">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha3/dist/css/bootstrap.min.css" rel="stylesheet">
                <link rel="stylesheet" href="/Styles.css">
                <title>Tabla de Gafetes</title>
                <script src="https://cdn.jsdelivr.net/npm/qrcode/build/qrcode.min.js"></script> <!-- Añadir esta línea -->
            </head>
            <body>
                <div class="container">
                    <h1>Tabla de Gafetes</h1>
                    ${tableHTML}
                </div>
                <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha3/dist/js/bootstrap.bundle.min.js"></script>
                <script src="https://cdnjs.cloudflare.com/ajax/libs/jquery/3.6.0/jquery.min.js"></script>
                <script src="https://cdnjs.cloudflare.com/ajax/libs/jquery.qrcode/1.0/jquery.qrcode.min.js"></script>
                <script src="/scriptTabla.js"></script>
            </body>
            </html>
        `);
    });
});


// Nueva ruta para buscar un gafete por Nombre, Apellido y ID
app.get('/BuscarGafete', (req, res) => {
    const { name, lastName, id } = req.query;

    const sql = 'SELECT * FROM gafetes WHERE id = ? AND name = ? AND first_name = ?';
    connection.query(sql, [id, name, lastName], (err, results) => {
        if (err) {
            console.error('Error al consultar la base de datos:', err);
            return res.status(500).send('Error al buscar el gafete');
        }
        if (results.length === 0) {
            return res.status(404).send('Gafete no encontrado');
        }

        const formData = results[0];

        const photoBase64 = formData.photo ? formData.photo.toString('base64') : null;
        const photoUrl = photoBase64 ? `data:image/jpeg;base64,${photoBase64}` : null;

        // Generar el código QR basado en la URL con el ID actual
        const urlToRedirect = `http://localhost:${PORT}/DatosQR.html?id=${id}`;

        // Generar el QR
        QRCode.toDataURL(urlToRedirect, (err, qrCode) => {
            if (err) {
                console.error('Error al generar el código QR:', err);
                return res.status(500).send('Error al generar el código QR');
            }

            // Enviar los datos como JSON para usarlos en el frontend
            res.json({ name: formData.name, job: formData.job, qrCode, photo: photoUrl, id: formData.id });
        });
    });
});

// Escuchar en el puerto
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
