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

server.listen(3001, '0.0.0.0',() => {
  console.log('Server listening on port 3001');
})
function parseAVLData(data, socket) {
  // Suppose we have a buffer containing the AVL data
  // Teltonika AVL data structure:
  // Preamble - 4 bytes
  // Data Field Length - 4 bytes
  // Codec ID - 1 byte
  // Number of Data - 1 byte
  // AVL Data array
  // CRC-16 - 4 bytes

  // Ensure data is in Buffer format
  const buffer = Buffer.from(data);

  // Preamble (4 bytes) and Data Field Length (4 bytes)
  const preamble = buffer.slice(0, 4);
  const dataFieldLength = buffer.slice(4, 8).readUInt32BE(0);

  // Codec ID (1 byte)
  const codecId = buffer.readUInt8(8);

  // Number of Data (1 byte)
  const numberOfData = buffer.readUInt8(9);

  console.log('Preamble:', preamble);
  console.log('Data Field Length:', dataFieldLength);
  console.log('Codec ID:', codecId);
  console.log('Number of Data:', numberOfData);
}
