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
    const buffer = Buffer.from(data);

    // Header
    const preamble = buffer.slice(0, 4);
    const dataFieldLength = buffer.readUInt32BE(4);
    const codecId = buffer.readUInt8(8);
    const numberOfData1 = buffer.readUInt8(9);

    console.log('Header:');
    console.log('Preamble:', preamble.toString('hex'));
    console.log('Data Field Length:', dataFieldLength);
    console.log('Codec ID:', codecId);
    console.log('Number of Data 1:', numberOfData1);

    let index = 10; // Starting index for data records
    for (let i = 0; i < numberOfData1; i++) {
        console.log(`Data Record ${i+1}:`);

        // Timestamp (8 bytes)
        const timestamp = buffer.readBigInt64BE(index);
        index += 8;

        // Priority (1 byte)
        const priority = buffer.readUInt8(index);
        index += 1;

        // GPS Element
        const longitude = buffer.readDoubleBE(index);
        index += 8;
        const latitude = buffer.readDoubleBE(index);
        index += 8;
        const altitude = buffer.readDoubleBE(index);
        index += 8;
        const angle = buffer.readUInt32BE(index);
        index += 4;
        const satellites = buffer.readUInt8(index);
        index += 1;
        const speed = buffer.readUInt32BE(index);
        index += 4;

        // IO Elements
        const eventId = buffer.readUInt8(index);
        index += 1;
        const totalIO = buffer.readUInt8(index);
        index += 1;

        // Print parsed data
        console.log(`Timestamp: ${new Date(timestamp)} Priority: ${priority}`);
        console.log(`Longitude: ${longitude} Latitude: ${latitude} Altitude: ${altitude}`);
        console.log(`Angle: ${angle} Satellites: ${satellites} Speed: ${speed}`);
        console.log(`Event ID: ${eventId} Total IO: ${totalIO}`);
    }

    // CRC-16
    const crc16 = buffer.slice(buffer.length - 4);
    console.log('CRC-16:', crc16.toString('hex'));
}


server.listen(3001, '0.0.0.0', () => {
    console.log('Server listening on port 3001');
});
