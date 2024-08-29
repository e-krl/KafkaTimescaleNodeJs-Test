const express = require('express');
const { KafkaClient, Producer, Admin } = require('kafka-node');

const app = express();
app.use(express.json());

const kafkaHost = process.env.KAFKA_HOST || 'localhost:9092';
const client = new KafkaClient({ kafkaHost });
const producer = new Producer(client);
const admin = new Admin(client);

producer.on('ready', () => {
    console.log('Kafka Producer is connected and ready.');
});

producer.on('error', (err) => {
    console.error('Kafka Producer encountered an error:', err);
});

app.post('/insert/:topic', (req, res) => {
    const topic = req.params.topic;
    let { message } = req.body;
    
    const payloads = [
        {
            topic,
            messages: JSON.stringify(message),
        },
    ];

    console.log("Payloads: ", payloads)
    producer.send(payloads, (err, data) => {
        if (err) {
            console.error('Error producing message:', err);
            return res.status(500).send('Error producing message');
        }
        res.send('Message sent successfully');
    });
});

app.post('/create-topic', (req, res) => {
    const { topicName, numPartitions, replicationFactor } = req.body;

    if (!topicName || !numPartitions || !replicationFactor) {
        return res.status(400).send('Missing required fields: topicName, numPartitions, or replicationFactor');
    }

    const topics = [{
        topic: topicName,
        partitions: numPartitions,
        replicationFactor,
    }];

    admin.createTopics({ topics }, (err, result) => {
        if (err) {
            console.error('Error creating topic:', err);
            return res.status(500).send('Error creating topic');
        }
        res.send('Topic created successfully');
    });
});

app.get('/topics', (req, res) => {
    admin.listTopics((err, topics) => {
        if (err) {
            console.error('Error listing topics:', err);
            return res.status(500).send('Error listing topics');
        }
        res.json(topics);
    });
});

const PORT = process.env.PORT || 3002;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on port ${PORT}`);
});

/*
const localPort = 3002;
app.listen(localPort, 'localhost', () => {
    console.log(`Server is running on http://localhost:${localPort}`);
});

const networkPort = 3003;
app.listen(networkPort, '0.0.0.0', () => {
    console.log(`Server is accessible on http://0.0.0.0:${networkPort}`);
});
*/