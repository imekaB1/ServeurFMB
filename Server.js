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

server.listen(3001,() => {
  console.log('Server listening on port 3001');
})
