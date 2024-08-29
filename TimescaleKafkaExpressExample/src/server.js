const express = require('express');
const WebSocket = require('ws');
const { Pool } = require('pg');

const app = express();
app.use(express.static('../public'));
const port = 3009;

const pool = new Pool({
    user: process.env.POSTGRES_USER || 'myuser',
    host: process.env.POSTGRES_HOST || 'localhost',
    database: process.env.POSTGRES_DB || 'mydatabase',
    password: process.env.POSTGRES_PASSWORD || 'mypassword',
    port: process.env.POSTGRES_PORT || 5432,
});

app.get('/data/:car_id', async (req, res) => {
    const carId = req.params.car_id;
    try {
        const result = await pool.query('SELECT * FROM cars_real_time WHERE car_id = $1', [carId]);
        res.json(result.rows);
    } catch (err) {
        console.error('Error executing query', err.stack);
        res.status(500).send('Error retrieving data');
    }
});


const wss = new WebSocket.Server({ noServer: true });

wss.on('connection', (ws) => {
    console.log('Client connected');

    ws.on('message', (message) => {
        console.log('Received:', message);
    });

    ws.on('close', () => {
        console.log('Client disconnected');
    });
});

const server = app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}/`);
});

server.on('upgrade', (request, socket, head) => {
    wss.handleUpgrade(request, socket, head, (ws) => {
        wss.emit('connection', ws, request);
    });
});

pool.connect((err, client, release) => {
    if (err) {
        console.error('Error acquiring client', err.stack);
        return;
    }

    client.on('notification', (msg) => {
        console.log('Notification received:', msg.payload);
        wss.clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(msg.payload);
            }
        });
    });

    client.query('LISTEN cars_real_time_channel');
});