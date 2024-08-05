document.addEventListener('DOMContentLoaded', () => {
    const vehicleForm = document.getElementById('vehicleForm');
    const plateInput = document.getElementById('plate');
    const historyCards = document.getElementById('historyCards');
    const toggleHistoryBtn = document.getElementById('toggleHistoryBtn');
    const historyContent = document.getElementById('historyContent');
    const datetimeInput = document.getElementById('datetime');

    const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB

    const toBase64 = (file) => new Promise((resolve, reject) => {
        if (file.size > MAX_FILE_SIZE) {
            reject(new Error("El archivo es demasiado grande"));
            return;
        }

        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
    });

    const loadHistory = () => {
        const records = JSON.parse(localStorage.getItem('vehicleRecords')) || [];
        records.forEach(record => addRecordToCards(record));
    };

    const saveRecord = (record) => {
        const records = JSON.parse(localStorage.getItem('vehicleRecords')) || [];
        records.push(record);
        localStorage.setItem('vehicleRecords', JSON.stringify(records));
    };

    const addRecordToCards = (record) => {
        const card = document.createElement('div');
        card.className = 'history-card';

        card.innerHTML = `
            <div><strong>Fecha y Hora:</strong> ${record.datetime}</div>
            <div><strong>Marca:</strong> ${record.brand}</div>
            <div><strong>Modelo:</strong> ${record.model}</div>
            <div><strong>Clave:</strong> ${record.clave}</div>
            <div><strong>Placa:</strong> ${record.plate}</div>
            <div><strong>Color:</strong> ${record.color}</div>
            <div><strong>Propietario:</strong> ${record.owner}</div>
            <div><strong>Habitación:</strong> ${record.habitacion}</div>
            <div><strong>Garaje:</strong> ${record.garage}</div>
            <div><strong>Observaciones:</strong> ${record.observations}</div>
            <div><strong>Imágenes:</strong></div>
        `;

        const imageContainer = document.createElement('div');
        record.images.forEach(image => {
            const img = document.createElement('img');
            img.src = image;
            img.addEventListener('click', () => openFullscreen(img));
            imageContainer.appendChild(img);
        });
        card.appendChild(imageContainer);

        historyCards.prepend(card);  // Cambiado a prepend para que los registros recientes aparezcan primero
    };

    const handleFormSubmit = async (event) => {
        event.preventDefault();
        console.log("Formulario enviado");

        const formData = new FormData(vehicleForm);
        try {
            const imageFiles = formData.getAll('image');
            console.log("Archivos de imagen: ", imageFiles);

            const images = await Promise.all(Array.from(imageFiles).slice(0, 4).map(file => toBase64(file)));
            console.log("Imágenes convertidas: ", images);

            const record = {
                datetime: formData.get('datetime'),
                brand: formData.get('brand'),
                model: formData.get('model'),
                clave: formData.get('clave'),
                plate: formData.get('plate'),
                color: formData.get('color'),
                owner: formData.get('owner'),
                habitacion: formData.get('habitacion'),
                garage: formData.get('garage'),
                observations: formData.get('observations'),
                images: images
            };

            saveRecord(record);
            addRecordToCards(record);
            vehicleForm.reset();

            alert('Su vehículo ha sido registrado con éxito');
            setCurrentDateTime();
        } catch (error) {
            console.error("Error al registrar el vehículo: ", error);
            alert('Hubo un error al registrar el vehículo. Por favor, inténtelo de nuevo.');
        }
    };

    const handlePlateInput = () => {
        const records = JSON.parse(localStorage.getItem('vehicleRecords')) || [];
        const record = records.find(record => record.plate === plateInput.value);

        if (record) {
            document.getElementById('brand').value = record.brand;
            document.getElementById('model').value = record.model;
            document.getElementById('clave').value = record.clave;
            document.getElementById('color').value = record.color;
            document.getElementById('owner').value = record.owner;
        }
    };

    const toggleHistoryVisibility = () => {
        if (historyContent.style.display === 'none') {
            historyContent.style.display = 'block';
            toggleHistoryBtn.textContent = 'Ocultar Historial';
        } else {
            historyContent.style.display = 'none';
            toggleHistoryBtn.textContent = 'Mostrar Historial';
        }
    };

    const openFullscreen = (img) => {
        const fullscreenImg = document.createElement('img');
        fullscreenImg.src = img.src;
        fullscreenImg.classList.add('fullscreen-img');
        fullscreenImg.addEventListener('click', () => {
            document.body.removeChild(fullscreenImg);
        });
        document.body.appendChild(fullscreenImg);
    };

    const setCurrentDateTime = () => {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const formattedDateTime = `${year}-${month}-${day}T${hours}:${minutes}`;
        datetimeInput.value = formattedDateTime;
    };

    vehicleForm.addEventListener('submit', handleFormSubmit);
    plateInput.addEventListener('input', handlePlateInput);
    toggleHistoryBtn.addEventListener('click', toggleHistoryVisibility);

    setCurrentDateTime();
    loadHistory();
});