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

    // Parse the header
    const preamble = buffer.slice(0, 4);
    const dataFieldLength = buffer.readUInt32BE(4);
    const codecId = buffer.readUInt8(8);
    const numberOfData1 = buffer.readUInt8(9);

    console.log('Header:');
    console.log('Preamble:', preamble.toString('hex'));
    console.log('Data Field Length:', dataFieldLength);
    console.log('Codec ID:', codecId);
    console.log('Number of Data 1:', numberOfData1);

    let index = 10; // Start index for the data records
    for (let i = 0; i < numberOfData1; i++) {
        console.log(`Data Record ${i+1}:`);

        // Parsing GPS Element
        const timestamp = buffer.readBigInt64BE(index);
        const priority = buffer.readUInt8(index + 8);
        const longitude = buffer.readInt32BE(index + 9);
        const latitude = buffer.readInt32BE(index + 13);
        const altitude = buffer.readInt16BE(index + 17);
        const angle = buffer.readUInt16BE(index + 19);
        const satellites = buffer.readUInt8(index + 21);
        const speed = buffer.readUInt16BE(index + 22);

        index += 24; // Move index past the GPS element

        console.log(`Timestamp: ${new Date(timestamp)} Priority: ${priority}`);
        console.log(`Longitude: ${longitude} Latitude: ${latitude} Altitude: ${altitude}`);
        console.log(`Angle: ${angle} Satellites: ${satellites} Speed: ${speed}`);

        // Parsing IO Elements dynamically
        const eventIoId = buffer.readUInt8(index);
        const totalIoCount = buffer.readUInt8(index + 1);
        index += 2;

        for (let j = 0; j < totalIoCount; j++) {
            const ioId = buffer.readUInt8(index);
            const ioType = determineIoType(ioId);
            let ioValue;
            switch (ioType) {
                case 1:
                    ioValue = buffer.readUInt8(index + 1);
                    index += 2;
                    break;
                case 2:
                    ioValue = buffer.readUInt16BE(index + 1);
                    index += 3;
                    break;
                case 4:
                    ioValue = buffer.readUInt32BE(index + 1);
                    index += 5;
                    break;
                default:
                    ioValue = buffer.readUInt8(index + 1); // Default to 1 byte if unknown
                    index += 2;
            }
            console.log(`IO ID: ${ioId} Value: ${ioValue}`);
        }
    }

    const crc16 = buffer.slice(-4); // Last 4 bytes for CRC-16
    console.log('CRC-16:', crc16.toString('hex'));
}

function determineIoType(ioId) {
    // Define IO types based on your configuration or specification
    switch (ioId) {
        case 1: // Example IO IDs
        case 2:
            return 1; // 1 byte
        case 3:
        case 4:
            return 2; // 2 bytes
        case 5:
            return 4; // 4 bytes
        default:
            return 1; // Default to 1 byte
    }
}

server.listen(3001, '0.0.0.0', () => {
    console.log('Server listening on port 3001');
});
