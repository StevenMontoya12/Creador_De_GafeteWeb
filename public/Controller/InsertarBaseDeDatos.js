document.getElementById('badge-form').addEventListener('submit', function(event) {
    event.preventDefault(); // Evita el envío del formulario por defecto

    const formData = new FormData(this);
    for (const [key, value] of formData.entries()) {
        console.log(`${key}: ${value}`);
    }

    // Enviar el formulario manualmente
    fetch('/save-form', {
        method: 'POST',
        body: formData
    }).then(response => response.json())
      .then(data => console.log(data))
      .catch(error => console.error('Error:', error));
});