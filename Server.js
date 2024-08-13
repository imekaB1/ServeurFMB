const net = require('net');
const fs = require('fs');

function parseAVLData(data) {
  const buffer = Buffer.from(data);
  console.log('Taille du buffer reçu:', buffer.length);

  if (buffer.length < 16) {
    console.log('Buffer incomplet:', buffer.toString('hex'));
    return; // Retour si le buffer ne contient pas suffisamment de données
  }

  const sizeOfOnerecord=67;
  const dataBlock = buffer.slice(0, sizeOfOnerecord);
  console.log('Bloc de données extrait:', dataBlock.toString('hex'));

  // Écriture des données AVL dans un fichier pour archivage
  fs.writeFileSync('outputData.txt', dataBlock.toString('hex'));
  console.log('Données enregistrées avec succès.')
}// Créer le serveur TCP
const server = net.createServer((socket) => {
  console.log('Client connecté');

  socket.on('data', (data) => {
    console.log('Données brutes reçues:', data.toString('hex'));

    // Traiter l'IMEI
    if (data.toString('hex').startsWith('00') && data.length === 17) { // Vérifier la longueur de l'IMEI
      console.log('IMEI reçu:', data.toString('hex'));
      // Envoyer une réponse d'acceptation au module
      const response = Buffer.from([0x01]);
      socket.write(response);
      console.log('Réponse envoyée au module');
    } else {
      // Traitement des données AVL si l'IMEI est déjà accepté
      parseAVLData(data);

      socket.end();
    }
  });

  socket.on('end', () => {
    console.log('Client déconnecté');
  })
});
server.listen(3001, '0.0.0.0', () => {
  console.log('Server listening on port 3001');

});
