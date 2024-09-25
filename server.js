const express = require('express');
const path = require('path');
const multer = require('multer');
const mysql = require('mysql2');
const QRCode = require('qrcode');

const app = express();
const PORT = process.env.PORT || 3000;

// Configura la carpeta 'public' para servir archivos estáticos
app.use(express.static(path.join(__dirname, 'public')));

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

// Escuchar en el puerto
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
