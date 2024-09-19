const express = require('express');
const path = require('path');
const multer = require('multer');
const mysql = require('mysql2');
const QRCode = require('qrcode'); // Asegúrate de instalar qrcode con npm install qrcode

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

// Configura multer para manejar la carga de archivos
const storage = multer.memoryStorage(); // Usamos memoria en lugar de disco
const upload = multer({ storage: storage });

// Manejar el POST a /save-form
app.post('/save-form', upload.single('photo'), (req, res) => {
    console.log('Form Data:', req.body);
    console.log('File Data:', req.file);

    const formData = req.body;
    const photoPath = req.file ? req.file.originalname : null; // Ajusta esto si usas almacenamiento en disco

    const sql = `INSERT INTO gafetes 
    (photo, name, first_name, middle_name, birthdate, telephone, celphone, email, address, alergia, e_contact, parents, e_contact_celphone, job, departament, brigadista)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

    const values = [
        photoPath,
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

        // Generar el código QR con los datos del usuario
        const qrData = JSON.stringify({ ...formData, id });
        QRCode.toDataURL(qrData, (err, qrCode) => {
            if (err) {
                console.error('Error al generar el código QR:', err);
                return res.status(500).send('Error al generar el código QR');
            }

            // Responder con el código QR
            res.json({ qrCode, id });
        });
    });
});



// Ruta para obtener los datos del gafete y el código QR
app.get('/get-badge/:id', (req, res) => {
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
        const qrData = JSON.stringify({ ...formData, id });

        QRCode.toDataURL(qrData, (err, qrCode) => {
            if (err) {
                console.error('Error al generar el código QR:', err);
                return res.status(500).send('Error al generar el código QR');
            }

            res.json({ ...formData, qrCode });
        });
    });
});



// Escuchar en el puerto
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
