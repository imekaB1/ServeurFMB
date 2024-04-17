const net = require('net');
const binascii = require('binascii'); // Assurez-vous d'installer ce package avec `npm install binascii`

const server = net.createServer((socket) => {
    console.log(`[NEW CONNECTION] ${socket.remoteAddress}:${socket.remotePort} connected.`);

    socket.once('data', (imei) => {
        console.log(imei.toString());

        try {
            let message = '\x01';
            socket.write(message, 'utf-8', (error) => {
                if (error) {
                    console.log(`Error sending reply. Maybe it's not our device ${socket.remoteAddress}:${socket.remotePort}: ${error}`);
                }
            });

            socket.once('data', (data) => {
                let received = binascii.hexlify(data);
                console.log(data.toString());
                console.log(received);

                // Supposons que decodethis et getrecord sont des fonctions que vous avez définies
                decodethis(received);
                let record = getrecord(received);
                console.log(record);

                message = "0000" + String(record).padStart(4, '0');
                socket.write(message, 'utf-8', (error) => {
                    if (error) {
                        console.log(`Error sending final reply to ${socket.remoteAddress}:${socket.remotePort}: ${error}`);
                    }
                });

                socket.end();
            });
        } catch (error) {
            console.log(`Error receiving data from ${socket.remoteAddress}:${socket.remotePort}: ${error}`);
            socket.end();
        }
    });
});

server.listen(3000, () => {
    console.log('Server listening on port 3000');
});

function decodethis(data) {
    // Implémentez votre logique de décodage ici
    console.log('Decoding data:', data);
}

function getrecord(data) {
    // Implémentez votre logique pour obtenir un enregistrement ici
    // Retourne un exemple de nombre pour cet exemple
    return 1234;
}
