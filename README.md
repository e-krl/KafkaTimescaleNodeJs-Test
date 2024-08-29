# KafkaTimescaleNodeJs-Test

This project demonstrates the integration of Kafka with TimescaleDB and WebSocket in a Node.js environment.

In this example application, a car sends GPS location data, which is then used to track the car on a simple HTML website. The data flow involves sending information to a Kafka topic, then to TimescaleDB, and finally serving it through a WebSocket connection.

## Overview

1. **Producer**:
   - Exposes the endpoint `/insert/:topic`, which accepts JSON data in the following format:
     ```json
     {
         "message": {
             "car_id": "e353ac47-f75f-40ff-9661-f4661230a5b6",
             "time": "2024-08-29 14:46:41.308 +0300",
             "long": 0.1276,
             "lat": 51.5072
         }
     }
     ```
   - The producer posts this data to Kafka.

2. **Consumer**:
   - Listens to Kafka topics and, upon receiving a message, inserts the data into TimescaleDB.

3. **TimescaleDB Integration**:
   - Since TimescaleDB extends PostgreSQL, the application utilizes the `LISTEN` and `NOTIFY` features of PostgreSQL. The app listens to TimescaleDB notifications and starts a WebSocket server.

4. **Client**:
   - The `index.html` file updates the car's location on the map in real-time based on WebSocket updates.