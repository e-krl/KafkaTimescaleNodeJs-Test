const { KafkaClient, Consumer } = require('kafka-node');
const { Pool } = require('pg');

const kafkaHost = process.env.KAFKA_HOST || 'localhost:9092';
const topicName = process.env.TOPIC_NAME || 'my-topic';

const client = new KafkaClient({ kafkaHost });
const consumer = new Consumer(
    client,
    [{ topic: topicName, partition: 0 }],
    { autoCommit: true }
);

const pool = new Pool({
    user: process.env.POSTGRES_USER || 'myuser',
    host: process.env.POSTGRES_HOST || 'localhost',
    database: process.env.POSTGRES_DB || 'mydatabase',
    password: process.env.POSTGRES_PASSWORD || 'mypassword',
    port: process.env.POSTGRES_PORT || 5432,
});

consumer.on('message', async (message) => {
    try {
        const data = JSON.parse(message.value);

        const query = `
            INSERT INTO cars_real_time (time, car_id, long, lat)
            VALUES ($1, $2, $3, $4)
        `;

        await pool.query(query, [data.time, data.car_id, data.long, data.lat]);
        console.log('Message inserted into TimescaleDB:', data);
    } catch (err) {
        console.error('Error processing message:', err);
    }
});

consumer.on('error', (err) => {
    console.error('Error in Kafka consumer:', err);
});

process.on('SIGINT', () => {
    pool.end(() => {
        console.log('PostgreSQL client disconnected');
        process.exit(0);
    });
});
