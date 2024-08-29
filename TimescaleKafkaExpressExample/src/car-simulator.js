const endpoint = 'http://localhost:3002/insert/my-topic/';

function getRandomLocation() {
    const lat = 51.509865 + (Math.random() - 0.5) * 0.01;
    const lon = -0.118092 + (Math.random() - 0.5) * 0.01;
    return { lat, lon };
}

async function sendCarData() {
    const location = getRandomLocation();
    const carData = {
        message: {        
            car_id: 'e353ac47-f75f-40ff-9661-f4661230a5b6',
            time: new Date().toISOString(),
            lat: location.lat,
            long: location.lon
        }
    };

    try {
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(carData),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        console.log('Data sent:', carData);
    } catch (error) {
        console.error('Error sending data:', error);
    }
}

setInterval(sendCarData, 1000);