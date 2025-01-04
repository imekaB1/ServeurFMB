const net = require('net');
const fs = require('fs');
const { DateTime } = require('luxon');
const util = require('util') ;
const mongoose = require('mongoose')

// Connexion à MongoDB Atlas
mongoose.connect('mongodb+srv://BREENDIMEKA:Botoko12345@cluster0.bg0bo.mongodb.net/TeltonikaDB?retryWrites=true&w=majority&appName=Cluster0', {

}).then(() => {
    console.log('Connecté à MongoDB Atlas');
}).catch(err => {
    console.error('Erreur de connexion à MongoDB Atlas:', err);
});
// Define GPS schema
const GPSSchema = new mongoose.Schema({
  longitude: Number,
  latitude: Number,
  altitude: Number,
  angle: Number,
  satellites: Number,
  speed: Number

});
// Define Record schema
const RecordSchema = new mongoose.Schema({
  timestamp: String, // You might want to change this to Date if you prefer
  priority: String,
  gps: GPSSchema
});

// Define Main schema
const DataSchema = new mongoose.Schema({
  preambule: String,
  data_length: Number,
  codec_id: String,
  num_records1: Number,
  records: [RecordSchema],
  num_records2: Number,
  crc16: String,

});

// Créer un modèle basé sur le schéma
const DataModel = mongoose.model('TeltonikaData', DataSchema);

function saveData(dataFrmTtnk) {
    const data = new DataModel(dataFrmTtnk);

    try {
      const result = data.save();
      console.log('Data saved successfully:', result);
    } catch (error) {
      console.error('Error saving data:', error.message);
    }
  }

// Fonction pour convertir un horodatage hexadécimal en format lisible
function convertTimestamp(hexTimestamp) {
  const timestampInt = parseInt(hexTimestamp, 16); // Convertir l'hexadécimal en entier
  const timestampSeconds = timestampInt / 1000; // Convertir l'entier en temps UNIX en millisecondes
  const timestampReadable = DateTime.fromMillis(timestampSeconds * 1000, { zone: 'utc' })
    .toFormat('EEEE dd MMMM yyyy HH:mm:ss'); // Convertir en date et heure lisibles
  return timestampReadable;
}

// Fonction pour convertir une valeur hexadécimale signée en degrés
function convertSignedInt(hexString) {
  const intVal = parseInt(hexString, 16); // Convertir l'hexadécimal en entier
  const maxInt = Math.pow(2, 32); // Calculer la valeur maximale possible pour un entier non signé de 4 octets
  return intVal > maxInt / 2 ? (intVal - maxInt) / 10000000 : intVal / 10000000; // Gérer les valeurs signées
}


// Fonction pour découper les données Teltonika selon le Codec 8
function parseTeltonikaData(data) {
  let index = 0;
  const records = [];
  let flsData = {};

  // 1. Préambule (4 octets)
  const preambule = data.slice(index, index + 8);
  index += 8;

  // 2. Longueur du Champ de Données (4 octets)
  const dataLength = parseInt(data.slice(index, index + 8), 16); // Décodage en décimal
  index += 8;

  // 3. ID du Codec (1 octet)
  const codecId = data.slice(index, index + 2);
  index += 2;
 // 4. Nombre de Données 1 (1 octet)
  const numRecords1 = parseInt(data.slice(index, index + 2), 16);
  index += 2;

  // Découpage des enregistrements AVL
  for (let i = 0; i < numRecords1; i++) {
    const record = {};

    // 5. Horodatage (8 octets)
    const timestampHex = data.slice(index, index + 16);
    const timestamp = convertTimestamp(timestampHex); // Convertir en date lisible
    record['timestamp'] = timestamp;
    index += 16;

    // 6. Priorité (1 octet)
    record['priority'] = data.slice(index, index + 2);
    index += 2;

    // 7. Élément GPS (15 octets)
    const longitude = convertSignedInt(data.slice(index, index + 8));  // Convertir en degrés
    const latitude = convertSignedInt(data.slice(index + 8, index + 16)); // Convertir en degrés
    const altitude = parseInt(data.slice(index + 16, index + 20), 16);  // 2 octets
    const angle = parseInt(data.slice(index + 20, index + 24), 16);     // 2 octets
    const satellites = parseInt(data.slice(index + 24, index + 26), 16); // 1 octet
    const speed = parseInt(data.slice(index + 26, index + 30), 16);      // 2 octets

    record['gps'] = {
      longitude: longitude,
      latitude: latitude,
      altitude: altitude,
      angle: angle,
      satellites: satellites,
      speed: speed
    };
    index += 30;
   // 8. Padding de Zéros (8 octets) avant Horodatage
     const paddingZeros = data.slice(index, index + 12);
     index += 12;

    // Ajouter l'enregistrement à la liste des enregistrements
    records.push(record);
  }

  // 8. Nombre de Données 2 (1 octet)
  const numRecords2 = parseInt(data.slice(index, index + 2), 16);
  index += 2;

  // 9. CRC-16 (4 octets)
  const crc16 = data.slice(index, index + 8);
 return {
    preambule: preambule,
    data_length: dataLength,
    codec_id: codecId,
    num_records1: numRecords1,
    records: records,
    num_records2: numRecords2,
    crc16: crc16,
    //flsData:flsData     
  };
}

function parseAVLData(data) {
  const buffer = Buffer.from(data); // Correction : utiliser 'Buffer' au lieu de 'buffer'
  console.log('Taieille du buffer reçu:', buffer.length);

  if (buffer.length < 16) {
    console.log('Buffer incomplet:', buffer.toString('hex'));
    return; // Retour si le buffer ne contient pas suffisamment de données
// Écriture des données AVL dans un fichier pour archivage
  fs.writeFileSync('outputData.txt', buffer.toString('hex'));
  console.log('Données enregistrées avec succès.')


// Appeler le décodeur de données Teltonika
  const parsedData = parseTeltonikaData(buffer.toString('hex'));


   saveData(parsedData)

  console.log('Données AVL décodées:', util.inspect(parsedData, { depth: null }));

}
// Créer le serveur TCP
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
