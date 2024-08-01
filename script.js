// Adicione aqui os scripts necessários

var mqttClient = null;

document.addEventListener('DOMContentLoaded', () => {
    showSection('identification');
    setupMQTT();
    loadStoredValues();
});

function showSection(sectionId) {
    const sections = document.querySelectorAll('.content-section');
    sections.forEach(section => {
        section.style.display = 'none';
    });

    const activeSection = document.getElementById(sectionId);
    if (activeSection) {
        activeSection.style.display = 'block';

        // Initialize the map if the production data section is selected
        if (sectionId === 'productiondata') {
            initMap();
        }
    }
}

// Function to initialize the map
function initMap() {
    // Check if the map is already initialized
    if (typeof L === 'undefined' || !document.getElementById('map')) {
        return;
    }

    // Create the map
    var map = L.map('map').setView([41.79639893424446, -6.767871439606526], 14);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    L.marker([41.79639893424446, -6.767871439606526]).addTo(map)
        .bindPopup('Instituto Politécnico de Bragança')
        .openPopup();
}

function toggleList(listId, element) {
    const activeList = document.getElementById(listId);
    const arrow = element.querySelector('.arrow');

    if (activeList) {
        const isHidden = activeList.classList.contains('hidden');
        activeList.classList.toggle('hidden', !isHidden);
        arrow.classList.toggle('active', isHidden);
    }
}

function setupMQTT() {
    if (!mqttClient) {
        const mqttBroker = 'wss://test.mosquitto.org:8081/mqtt'; // WebSocket URL for the broker
        const topic = 'conveyor/operational_data/#'; // Use o seu tópico
        mqttClient = mqtt.connect(mqttBroker);

        mqttClient.on('connect', () => {
            console.log(`Connected to broker: ${mqttBroker}`);
            mqttClient.subscribe(topic, (err) => {
                if (err) {
                    console.error(`Failed to subscribe to topic: ${topic}`, err);
                } else {
                    console.log(`Subscribed to topic: ${topic}`);
                }
            });
        });

        mqttClient.on('error', (err) => {
            console.error(`Failed to connect with the MQTT broker: ${mqttBroker}`, err);
        });

        mqttClient.on('offline', () => {
            console.log('MQTT Client offline');
        });

        mqttClient.on('reconnect', () => {
            console.log('Reconnecting to the broker MQTT...');
        });

        mqttClient.on('message', (topic, message) => {
            const msg = message.toString();
            console.log(`MSG received at topic: ${topic} -> ${msg}`);
            updateOperationalData(topic, msg);
        });
    }
}

function updateOperationalData(topic, message) {
    console.log(`Atualizando dados para o tópico: ${topic} com a mensagem: ${message}`);
    const elementId = getElementIdByTopic(topic);
    if (elementId) {
        document.getElementById(elementId).innerText = message;
        localStorage.setItem(elementId, message);

        const updateDate = new Date().toString();
        document.getElementById('update_date').innerText = updateDate;
        localStorage.setItem('update_date', updateDate);
    }
}

function getElementIdByTopic(topic) {
    switch (topic) {
        case 'conveyor/operational_data/conveyorCount':
            return 'conveyorCount';
        case 'conveyor/operational_data/position_in_sequence':
            return 'position_in_sequence';
        case 'conveyor/operational_data/motor_status':
            return 'motor_status';
        case 'conveyor/operational_data/input_sensor_status':
            return 'input_sensor_status';
        case 'conveyor/operational_data/output_sensor_status':
            return 'output_sensor_status';
        case 'conveyor/operational_data/number_of_pieces':
            return 'number_of_pieces';
        case 'conveyor/operational_data/last_piece_time':
            return 'last_piece_time';
        case 'conveyor/operational_data/motor_operating_time':
            return 'motor_operating_time';
        case 'conveyor/operational_data/vibration':
            return 'vibration';
        case 'conveyor/operational_data/current':
            return 'current';
        case 'conveyor/operational_data/battery_level':
            return 'battery_level';
        default:
            console.log(`Tópico desconhecido: ${topic}`);
            return null;
    }
}

function loadStoredValues() {
    // Carrega valores armazenados no localStorage
    const elementIds = [
        'conveyorCount',
        'position_in_sequence',
        'motor_status',
        'input_sensor_status',
        'output_sensor_status',
        'number_of_pieces',
        'last_piece_time',
        'motor_operating_time',
        'vibration',
        'current',
        'battery_level'
    ];

    elementIds.forEach(id => {
        const value = localStorage.getItem(id);
        if (value !== null) {
            document.getElementById(id).innerText = value;
        }
    });

    const updateDate = localStorage.getItem('update_date');
    if (updateDate !== null) {
        document.getElementById('update_date').innerText = updateDate;
    }
}
