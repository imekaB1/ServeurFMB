const net = require('net');

const server = net.createServer((socket) => {
  console.log('Client connected');

  socket.on('data', (data) => {
    console.log('Data received:', data);
    parseAVLData(data, socket);
  });

  socket.on('end', () => {
    console.log('Client disconnected');
  });

  socket.on('error', (err) => {
    console.error('Error:', err);
  });
});

server.listen(3001, () => {
  console.log('Server listening on port 3001');
});

function parseAVLData(data, socket) {
  const buffer = Buffer.from(data);

  // Preamble (4 bytes) and Data Field Length (4 bytes)
  const preamble = buffer.slice(0, 4);
  const dataFieldLength = buffer.readUInt32BE(4);

  // Codec ID (1 byte) and Number of Data (1 byte)
  const codecId = buffer.readUInt8(8);
  const numberOfData = buffer.readUInt8(9);

  let offset = 10;

  console.log('Preamble:', preamble.toString('hex'));
  console.log('Data Field Length:', dataFieldLength);
  console.log('Codec ID:', codecId);
  console.log('Number of Data:', numberOfData);

  // Parse AVL Data Array
  for (let i = 0; i < numberOfData; i++) {
    // Timestamp (8 bytes)
    const timestamp = new Date(buffer.readBigUInt64BE(offset));
    offset += 8;

    // Priority (1 byte)
    const priority = buffer.readUInt8(offset);
    offset += 1;

    // GPS Element (15 bytes)
    const longitude = buffer.readInt32BE(offset);
    offset += 4;
    const latitude = buffer.readInt32BE(offset);
    offset += 4;
    const altitude = buffer.readInt16BE(offset);
    offset += 2;
    const angle = buffer.readUInt16BE(offset);
    offset += 2;
    const satellites = buffer.readUInt8(offset);
    offset += 1;
    const speed = buffer.readUInt16BE(offset);
    offset += 2;

    // IO Element
    const eventId = buffer.readUInt8(offset);
    offset += 1;
    const elementCount = buffer.readUInt8(offset);
    offset += 1;

    const ioElements = {};
    for (let j = 0; j < elementCount; j++) {
      const ioId = buffer.readUInt8(offset);
      offset += 1;
      const ioValue = buffer.readUInt8(offset); // Assuming 1-byte values for simplicity
      offset += 1;
      ioElements[ioId] = ioValue;
    }

    console.log(Record ${i + 1}:);
    console.log('  Timestamp:', timestamp);
    console.log('  Priority:', priority);
    console.log('  GPS Data:', { longitude, latitude, altitude, angle, satellites, speed });
    console.log('  IO Data:', ioElements);
  }

  // CRC-16 (4 bytes)
  const crc = buffer.readUInt32BE(offset);
  offset += 4;
  console.log('CRC:', crc);

  // Send ACK
  socket.write(Buffer.from([0x01]));
