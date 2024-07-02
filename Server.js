const net = require('net');

const server = net.createServer((socket) => {
    console.log('Client connected');

    socket.on('data', (data) => {
        console.log('Data received');
        parseAVLData(data);
    });

    socket.on('end', () => {
        console.log('Client disconnected');
    });

    socket.on('error', (err) => {
        console.error('Error:', err);
    });
});

function parseAVLData(data) {
    // Parsing data as per the structure given in the images
    const buffer = Buffer.from(data);

    // Header Part
    const preamble = buffer.slice(0, 4);
    const dataFieldLength = buffer.readUInt32BE(4);
    const codecId = buffer.readUInt8(8);
    const numberOfData1 = buffer.readUInt8(9);

    console.log('Header:');
    console.log('Preamble:', preamble.toString('hex'));
    console.log('Data Field Length:', dataFieldLength);
    console.log('Codec ID:', codecId);
    console.log('Number of Data 1:', numberOfData1);

    // Payload parsing as per specification
    let index = 10; // Start of data after header
    for (let i = 0; i < numberOfData1; i++) {
        // Parse each data set based on your specific structure
        console.log(`Data set ${i+1}:`);
        // Add parsing logic based on your specific data structure here
    }

    // CRC-16 (last 4 bytes of the message)
    const crc16 = buffer.slice(buffer.length - 4);
    console.log('CRC-16:', crc16.toString('hex'));
}

server.listen(3001, '0.0.0.0', () => {
    console.log('Server listening on port 3001');
});
