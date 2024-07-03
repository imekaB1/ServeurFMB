const net = require('net');
const config = require('./config');
const codec8EHandler = require('./codec8EHandler');

const server = net.createServer(socket => {
    console.log('Teltonika device connected.');

    socket.on('data', data => {
        console.log('Data received from the device.');
        const parsedData = codec8EHandler.parseData(Buffer.from(data));
        console.log('Parsed Data:', parsedData);
    });

    socket.on('error', error => {
        console.error('Error:', error);
    });

    socket.on('close', () => {
        console.log('Connection with device closed.');
    });
});

server.listen(config.PORT, config.HOST, () => {
    console.log(`Server listening at ${config.HOST}:${config.PORT}`);
});
